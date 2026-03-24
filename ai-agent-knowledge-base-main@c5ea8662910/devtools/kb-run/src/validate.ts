/**
 * Validation module for kb-run
 * 
 * This module will handle validation of skill directories before building:
 * - Check for required files (SKILL.md, ai.package.yaml)
 * - Validate ai.package.yaml structure and fields
 * - Check for valid skill naming conventions
 * - Verify references and dependencies exist
 * - Validate markdown syntax and structure
 */

import { execSync } from 'child_process';
import { pathExists } from 'fs-extra';
import { readFile } from 'fs/promises';
import chalk from 'chalk';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { BuildOptions, DEFAULT_BASE_PROMPT, LAUNCH_MODES, RUNTIME_NAMES, TARGET_IDES, UPDATE_MODES } from './types.js';
import type { LaunchMode, RuntimeName, TargetIDE, UpdateMode } from './types.js';
import type { RuntimeConfigFile, RuntimeValue } from './runtime/types.js';

// Get the directory of this module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function isRuntimeValue(value: unknown): value is RuntimeValue {
  if (value === null) return true;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.every((entry) => isRuntimeValue(entry));
  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every((entry) => isRuntimeValue(entry));
  }
  return false;
}

export interface DtctlContextInfo {
  name: string;
  current: boolean;
  environment: string;
}

interface DtctlContextJsonEntry {
  Current?: string | boolean;
  Name?: string;
  Environment?: string;
}

export interface ResolvedCommandOptions {
  context: string;
  agent: string;
  target: TargetIDE;
  runtime: RuntimeName;
  updateMode: UpdateMode;
  mode?: LaunchMode;
  options: Record<string, unknown>;
  usedInteractive: boolean;
  kbRoot: string;
}

interface ResolveCommandOptionsInput {
  rawOptions: Record<string, unknown>;
  needsInteractive: boolean;
  runInteractive: (kbRoot: string) => Promise<Record<string, unknown>>;
  modeRequired?: boolean;
}

export function validateOptionValue<T extends string>(
  value: unknown,
  validValues: readonly T[],
  flagName: string,
): T {
  const normalized = String(value).toLowerCase() as T;
  if (!validValues.includes(normalized)) {
    throw new Error(`Invalid ${flagName} value: "${normalized}". Must be one of: ${validValues.join(', ')}`);
  }
  return normalized;
}

export function validateExplicitCommonFlags(options: Record<string, unknown>): void {
  if (options.target) {
    validateOptionValue(options.target, TARGET_IDES, '--target');
  }

  if (options.runtime) {
    validateOptionValue(options.runtime, RUNTIME_NAMES, '--runtime');
  }

  if (options.updateMode) {
    validateOptionValue(options.updateMode, UPDATE_MODES, '--update-mode');
  }

  if (options.pyBash && options.runtime && String(options.runtime).toLowerCase() !== 'py-bash') {
    throw new Error('--py-bash can only be used with --runtime=py-bash');
  }
}

export function validateExplicitStartFlags(options: Record<string, unknown>): void {
  validateExplicitCommonFlags(options);

  if (options.mode) {
    validateOptionValue(options.mode, LAUNCH_MODES, '--mode');
  }
}

export async function resolveKbRoot(rawOptions: Record<string, unknown>): Promise<string> {
  if (!rawOptions.kbRoot) {
    console.log(chalk.cyan('🔍 Auto-detecting knowledge base root...'));
    const detection = await detectKnowledgeBaseRoot();
    if (!detection.found) {
      throw new Error(detection.error);
    }
    const kbRoot = detection.path!;
    console.log(chalk.green(`✓ Found knowledge base: ${kbRoot}\n`));
    return kbRoot;
  }

  console.log(chalk.cyan('🔍 Validating knowledge base root...'));
  const validation = await validateKnowledgeBaseRoot(rawOptions.kbRoot as string);
  if (!validation.valid) {
    throw new Error(
      `${validation.error}\n\n` +
      `Please provide a valid knowledge base root using the --kb-root parameter.\n` +
      `The path should point to the knowledge-base directory containing:\n` +
      `  - system-prompt/\n` +
      `  - dynatrace/\n` +
      `  - dynatrace-dev/\n` +
      `  - dynatrace-internal-dev/\n` +
      `  - dynatrace-internal-sfm/`,
    );
  }

  const kbRoot = validation.kbPath;
  console.log(chalk.green(`✓ Valid knowledge base: ${kbRoot}\n`));
  return kbRoot;
}

export async function resolveCommandOptions({
  rawOptions,
  needsInteractive,
  runInteractive,
  modeRequired = false,
}: ResolveCommandOptionsInput): Promise<ResolvedCommandOptions> {
  const kbRoot = await resolveKbRoot(rawOptions);

  let options = rawOptions;
  let usedInteractive = false;
  if (needsInteractive) {
    usedInteractive = true;
    options = {
      ...rawOptions,
      ...(await runInteractive(kbRoot)),
      pyBash: rawOptions.pyBash as string | undefined,
    };
  }

  const target = validateOptionValue(options.target || 'opencode', TARGET_IDES, '--target');
  const runtime = validateOptionValue(options.runtime || 'system-bash', RUNTIME_NAMES, '--runtime');
  const updateMode = validateOptionValue(options.updateMode || 'replace', UPDATE_MODES, '--update-mode');

  if (options.pyBash && runtime !== 'py-bash') {
    throw new Error('--py-bash can only be used with --runtime=py-bash');
  }

  const resolved: ResolvedCommandOptions = {
    context: options.context as string,
    agent: options.agent as string,
    target,
    runtime,
    updateMode,
    options,
    usedInteractive,
    kbRoot,
  };

  if (modeRequired) {
    resolved.mode = validateOptionValue(options.mode || 'tui', LAUNCH_MODES, '--mode');
  }

  return resolved;
}

export function resolveUserBasePrompt(options: Record<string, unknown>): string | undefined {
  const basePrompt = options.basePrompt as string | undefined;
  if (!basePrompt || basePrompt === DEFAULT_BASE_PROMPT) {
    return undefined;
  }

  return resolve(basePrompt);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseDtctlContextJsonEntry(entry: unknown): DtctlContextInfo | undefined {
  if (!isRecord(entry)) {
    return undefined;
  }

  const name = typeof entry.Name === 'string' ? entry.Name : undefined;
  const environment = typeof entry.Environment === 'string' ? entry.Environment : 'Unknown';
  const currentValue = entry.Current;

  if (!name || name.trim().length === 0) {
    return undefined;
  }

  return {
    name,
    current: currentValue === true || currentValue === '*',
    environment,
  };
}

function parseDtctlContextsJson(output: string): DtctlContextInfo[] | undefined {
  try {
    const parsed = JSON.parse(output) as unknown;

    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => parseDtctlContextJsonEntry(entry as DtctlContextJsonEntry))
        .filter((entry): entry is DtctlContextInfo => Boolean(entry));
    }

    if (isRecord(parsed) && Array.isArray(parsed.result)) {
      return parsed.result
        .map((entry) => parseDtctlContextJsonEntry(entry as DtctlContextJsonEntry))
        .filter((entry): entry is DtctlContextInfo => Boolean(entry));
    }
  } catch {
    // Fall back to legacy table parsing below.
  }

  return undefined;
}

export function parseDtctlContextsOutput(output: string): DtctlContextInfo[] {
  const jsonContexts = parseDtctlContextsJson(output);
  if (jsonContexts) {
    return jsonContexts;
  }

  const lines = output.split('\n');
  const contexts: DtctlContextInfo[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.includes('CURRENT') || trimmed.includes('---')) {
      continue;
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) {
      continue;
    }

    const isCurrent = parts[0] === '*';
    const contextName = isCurrent ? parts[1] : parts[0];
    const environment = isCurrent ? parts[2] : parts[1];

    if (contextName && contextName !== '*') {
      contexts.push({
        name: contextName,
        current: isCurrent,
        environment: environment || 'Unknown',
      });
    }
  }

  return contexts;
}

/**
 * Parses runtime YAML using Python's PyYAML and returns JSON-compatible data.
 *
 * @param runtimeYaml - YAML content to parse.
 * @param runtimeConfigPath - Source path used in error messages.
 * @returns Parsed runtime config object.
 * @throws Error if YAML parsing fails.
 */
function parseRuntimeYaml(runtimeYaml: string, runtimeConfigPath: string): unknown {
  const script = [
    'import json, sys, yaml',
    'data = yaml.safe_load(sys.stdin.read())',
    'print(json.dumps(data))',
  ].join('; ');

  const result = execSync(`python3 -c "${script}"`, {
    input: runtimeYaml,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  return JSON.parse(result) as unknown;
}

/**
 * Validates parsed runtime YAML shape against the shared runtime contract.
 *
 * @param runtime - Runtime name selected by caller.
 * @param rawConfig - Parsed runtime config object.
 * @param runtimeConfigPath - Source path used in error messages.
 * @returns Validated runtime config.
 * @throws Error if runtime config shape is invalid.
 */
export function validateRuntimeConfigShape(
  runtime: RuntimeName,
  rawConfig: unknown,
  runtimeConfigPath: string,
): RuntimeConfigFile {
  if (!rawConfig || typeof rawConfig !== 'object' || Array.isArray(rawConfig)) {
    throw new Error(`Invalid runtime config at ${runtimeConfigPath}: expected a YAML object at document root.`);
  }

  const candidate = rawConfig as Record<string, unknown>;
  const resourcesValue = candidate.resources;
  if (!Array.isArray(resourcesValue) || !resourcesValue.every((entry) => typeof entry === 'string')) {
    throw new Error(
      `Invalid runtime config at ${runtimeConfigPath}: "resources" must be an array of strings.`,
    );
  }

  const sectionValue = candidate[runtime];
  if (sectionValue !== undefined && !isRuntimeValue(sectionValue)) {
    throw new Error(
      `Invalid runtime config at ${runtimeConfigPath}: section "${runtime}" must be a valid runtime value tree.`,
    );
  }

  return {
    resources: resourcesValue,
    'py-bash': isRuntimeValue(candidate['py-bash']) ? candidate['py-bash'] : undefined,
    'dt-mcp-server': isRuntimeValue(candidate['dt-mcp-server']) ? candidate['dt-mcp-server'] : undefined,
  };
}

/**
 * Loads and validates runtime YAML according to the shared runtime contract.
 *
 * @param runtime - Selected runtime.
 * @param runtimeYaml - Runtime YAML content.
 * @param runtimeConfigPath - Source path used in error messages.
 * @returns Parsed and validated runtime config.
 */
export function loadRuntimeConfig(
  runtime: RuntimeName,
  runtimeYaml: string,
  runtimeConfigPath: string,
): RuntimeConfigFile {
  let parsed: unknown;
  try {
    parsed = parseRuntimeYaml(runtimeYaml, runtimeConfigPath);
  } catch (error: any) {
    throw new Error(`Failed to parse runtime config ${runtimeConfigPath}: ${error.message}`);
  }

  return validateRuntimeConfigShape(runtime, parsed, runtimeConfigPath);
}

/**
 * Resolves package path from either --package (built-in) or --package-file (custom)
 * 
 * @param packageName - Built-in package name (e.g., "dt-knowledge-base-all")
 * @param packageFile - Custom package file path
 * @returns Resolved absolute path to package file
 * @throws Error if both or neither are provided, or if package doesn't exist
 */
export async function resolvePackagePath(
  packageName?: string,
  packageFile?: string
): Promise<string> {
  // Validation: Cannot provide both
  if (packageName && packageFile) {
    throw new Error('Cannot specify both --package and --package-file. Use one or the other.');
  }
  
  // Case 1: Custom package file provided
  if (packageFile) {
    const resolvedPath = resolve(packageFile);
    if (!(await pathExists(resolvedPath))) {
      throw new Error(`Package file not found: ${resolvedPath}`);
    }
    return resolvedPath;
  }
  
  // Case 2: Built-in package name (or default)
  const name = packageName || 'dt-knowledge-base-all';
  // Look in same dir as compiled JS (dist/packages/) first, then fall back to source layout (../packages/)
  const compiledPath = join(__dirname, 'packages', `${name}.yaml`);
  const sourcePath = join(__dirname, '..', 'packages', `${name}.yaml`);
  const builtInPath = (await pathExists(compiledPath)) ? compiledPath : sourcePath;
  
  if (!(await pathExists(builtInPath))) {
    throw new Error(
      `Built-in package '${name}' not found at: ${builtInPath}\n` +
      `Use --package-file to specify a custom package file path.`
    );
  }
  
  return builtInPath;
}

/**
 * Validates that required input files exist and are accessible
 * 
 * @param options - Build options containing file paths
 * @throws Error if package file or base prompt file is missing or unreadable
 */
export async function validateInputFiles(options: BuildOptions): Promise<void> {
  // Step 1: Check ai.package.yaml file
  const packagePath = options.packageFile;
  
  if (!(await pathExists(packagePath))) {
    throw new Error(`Package file not found: ${packagePath}`);
  }
  
  try {
    await readFile(packagePath, 'utf8');
    console.log(chalk.green('✓') + ` Package file validated: ${packagePath}`);
  } catch (error) {
    throw new Error(`Cannot read package file: ${packagePath}`);
  }
  
  // Step 2: Check base prompt file
  // If basePrompt is specified, use it directly. Otherwise, resolve from kbRoot
  let basePromptPath: string;
  if (options.basePrompt) {
    basePromptPath = options.basePrompt;
  } else if (options.kbRoot) {
    basePromptPath = join(options.kbRoot, 'system-prompt', 'SingleTenantPrompt.md');
  } else {
    throw new Error('Either basePrompt or kbRoot must be specified');
  }
  
  if (!(await pathExists(basePromptPath))) {
    throw new Error(`Base prompt file not found: ${basePromptPath}`);
  }
  
  console.log(chalk.green('✓') + ` Base prompt file validated: ${basePromptPath}`);
}

/**
 * Validates a skill directory before building
 * 
 * @param sourcePath - Path to the skill directory to validate
 * @returns Validation result with errors/warnings
 * 
 * TODO: Implement validation logic:
 * - Check ai.package.yaml exists and is valid YAML
 * - Check SKILL.md exists
 * - Validate metadata fields (name, version, description)
 * - Check file references are valid
 * - Verify skill naming convention (dt-<domain>-<name>)
 */
export async function validateSkill(sourcePath: string): Promise<void> {
  // Stub: Will be implemented in future tasks
  console.log(`Validating skill at: ${sourcePath}`);
  throw new Error('Validation not yet implemented');
}

/**
 * Checks if a directory contains a valid skill structure
 * 
 * @param sourcePath - Path to check
 * @returns true if valid skill directory
 * 
 * TODO: Implement basic structure check
 */
export async function isValidSkillDirectory(sourcePath: string): Promise<boolean> {
  // Stub: Will be implemented in future tasks
  return false;
}

/**
 * Validates that a path points to a valid knowledge base root
 * 
 * A valid knowledge base root must directly contain these subdirectories:
 * - system-prompt/
 * - dynatrace/
 * - dynatrace-dev/
 * - dynatrace-internal-dev/
 * - dynatrace-internal-sfm/
 * 
 * And must contain this file:
 * - system-prompt/SingleTenantPrompt.md
 * 
 * @param kbRootPath - Path to validate (can be relative or absolute)
 * @returns Validation result with success flag, error message, and absolute KB path
 * 
 * @example
 * // Valid KB root
 * const result = await validateKnowledgeBaseRoot('/path/to/knowledge-base');
 * // Returns: { valid: true, kbPath: '/path/to/knowledge-base' }
 * 
 * @example
 * // Invalid path
 * const result = await validateKnowledgeBaseRoot('/invalid/path');
 * // Returns: { valid: false, error: 'Path does not exist: /invalid/path', kbPath: '/invalid/path' }
 */
export async function validateKnowledgeBaseRoot(
  kbRootPath: string
): Promise<{ valid: boolean; error?: string; kbPath: string }> {
  // Resolve to absolute path
  const absolutePath = resolve(kbRootPath);
  
  // Check 1: Path exists
  if (!(await pathExists(absolutePath))) {
    return {
      valid: false,
      error: `Path does not exist: ${absolutePath}`,
      kbPath: absolutePath
    };
  }
  
  // Check 2: Path is a directory (pathExists returns true for files too)
  try {
    const { lstat } = await import('fs/promises');
    const stats = await lstat(absolutePath);
    if (!stats.isDirectory()) {
      return {
        valid: false,
        error: `Path is not a directory: ${absolutePath}`,
        kbPath: absolutePath
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: `Cannot access path: ${absolutePath}`,
      kbPath: absolutePath
    };
  }
  
  // Check 3: Required subdirectories exist
  const requiredDirs = [
    'system-prompt',
    'dynatrace',
    'dynatrace-dev',
    'dynatrace-internal-dev',
    'dynatrace-internal-sfm'
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = join(absolutePath, dir);
    if (!(await pathExists(dirPath))) {
      return {
        valid: false,
        error: `Invalid knowledge base structure: missing ${dir}/ subdirectory`,
        kbPath: absolutePath
      };
    }
  }
  
  // Check 4: SingleTenantPrompt.md exists
  const promptFile = join(absolutePath, 'system-prompt', 'SingleTenantPrompt.md');
  if (!(await pathExists(promptFile))) {
    return {
      valid: false,
      error: 'Invalid knowledge base structure: missing system-prompt/SingleTenantPrompt.md',
      kbPath: absolutePath
    };
  }
  
  // All checks passed
  return {
    valid: true,
    kbPath: absolutePath
  };
}

/**
 * Auto-detects knowledge base root from current working directory
 * 
 * Detection strategy (per ai-plf6 decision):
 * 1. Check if CWD is a valid KB root (contains system-prompt/, dynatrace/, etc.)
 * 2. Check if CWD/knowledge-base/ exists and is a valid KB root
 * 3. If neither found, fail with clear error
 * 
 * @param startPath - Starting directory (defaults to process.cwd())
 * @returns Detection result with path or error
 * 
 * @example
 * const result = await detectKnowledgeBaseRoot();
 * if (result.found) {
 *   console.log(`KB root: ${result.path}`);
 * } else {
 *   console.error(result.error);
 * }
 */
export async function detectKnowledgeBaseRoot(
  startPath?: string
): Promise<{ found: boolean; path?: string; error?: string }> {
  const cwd = startPath || process.cwd();
  const attemptedPaths: string[] = [];
  
  // Step 1: Check if CWD is the KB root
  console.log(chalk.dim(`   Checking if CWD is KB root: ${cwd}`));
  attemptedPaths.push(cwd);
  
  const cwdResult = await validateKnowledgeBaseRoot(cwd);
  if (cwdResult.valid) {
    console.log(chalk.green('✓') + ` Auto-detected KB root: ${cwdResult.kbPath}`);
    return {
      found: true,
      path: cwdResult.kbPath
    };
  }
  
  // Step 2: Check if CWD/knowledge-base is KB root
  const kbSubdir = join(cwd, 'knowledge-base');
  console.log(chalk.dim(`   Checking if CWD/knowledge-base is KB root: ${kbSubdir}`));
  attemptedPaths.push(kbSubdir);
  
  const subdirResult = await validateKnowledgeBaseRoot(kbSubdir);
  if (subdirResult.valid) {
    console.log(chalk.green('✓') + ` Auto-detected KB root: ${subdirResult.kbPath}`);
    return {
      found: true,
      path: subdirResult.kbPath
    };
  }
  
  // Step 3: Fail with clear error
  console.log(chalk.dim(`   Attempted paths: ${attemptedPaths.join(', ')}`));
  
  return {
    found: false,
    error: `Could not auto-detect knowledge base root. Please use --kb-root parameter to specify the path to your knowledge-base directory.\n\nTried:\n  - ${attemptedPaths.join('\n  - ')}`
  };
}

/**
 * Validates that the specified dtctl context exists and can connect to a Dynatrace tenant
 * 
 * @param context - The dtctl context name to validate
 * @throws Error if dtctl is not installed, context doesn't exist, or connectivity fails
 * 
 * @example
 * await validateDtctlContext('my-tenant');
 */
export async function validateDtctlContext(context: string): Promise<void> {
  // Step 1: Check if dtctl is installed
  try {
    execSync('dtctl version', { stdio: 'pipe', timeout: 5000 });
  } catch (error) {
    throw new Error('dtctl not found. Please install dtctl first.');
  }

  // Step 2: Check if context exists
  try {
    const output = execSync('dtctl config get-contexts -o json --plain', {
      encoding: 'utf-8', 
      stdio: 'pipe',
      timeout: 5000 
    });
    const contexts = parseDtctlContextsOutput(output).map((entry) => entry.name);
    
    if (!contexts.includes(context)) {
      throw new Error(
        `Context '${context}' not found in dtctl. Available contexts: ${contexts.join(', ')}. Run: dtctl auth login --context=${context}`
      );
    }
  } catch (error: any) {
    // If error is already our custom error, re-throw it
    if (error.message.includes('not found in dtctl')) {
      throw error;
    }
    // Otherwise, it's an execution error
    throw new Error(`Failed to get dtctl contexts: ${error.message}`);
  }

  // Step 3: Test connectivity with a minimal DQL query
  console.log(chalk.cyan('🔌 Testing connection to Dynatrace tenant...'));
  try {
    execSync(`dtctl query "data record()" --context=${context}`, {
      stdio: 'pipe',
      timeout: 30000 // 30 second timeout for connectivity
    });
    
    // Success - print colored message
    console.log(chalk.green(`✓ Context '${context}' validated`));
  } catch (error: any) {
    // Handle different types of connectivity failures
    if (error.killed || error.signal === 'SIGTERM') {
      throw new Error(
        `Connection timeout for context '${context}'. Check network connectivity.`
      );
    }
    
    throw new Error(
      `Cannot connect to tenant using context '${context}'. Check authentication.`
    );
  }
}
