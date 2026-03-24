/**
 * Scaffolding module for kb-run
 * 
 * This module handles:
 * - Building agent context directories from ai.package.yaml
 * - Copying skills and resources to output directory
 * - Generating context-specific documentation
 * - Creating directory structure for agent deployment
 */

import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ensureDir, remove, pathExists } from 'fs-extra';
import { readFile, writeFile } from 'fs/promises';
import { execSync, spawnSync } from 'child_process';
import chalk from 'chalk';
import { confirm } from '@inquirer/prompts';
import type { BuildOptions, RuntimeName } from './types.js';
import {
  validateInputFiles,
  validateDtctlContext,
  detectKnowledgeBaseRoot,
  loadRuntimeConfig,
} from './validate.js';
import { resolveAgentLocation, getResolvedAimgrConfig } from './aimgr.js';
import { createRuntimeRegistry, getRuntimeConfigPath, getRuntimeModule, readRuntimeConfigYaml } from './runtime/index.js';
import { pyBashRuntimeModule } from './runtime/py-bash.js';
import { systemBashRuntimeModule } from './runtime/system-bash.js';
import { dtMcpServerRuntimeModule } from './runtime/dt-mcp-server.js';
import type { RuntimeActivationInstruction, RuntimeRenderedFile } from './runtime/types.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface RuntimePlan {
  runtime: RuntimeName;
  runtimeConfigPath: string;
  runtimeResources: string[];
  /**
   * Runtime-rendered artifacts returned by runtime modules.
   *
   * Persistence contract (implementation task):
   * - iterate these files generically regardless of target
   * - honor `file.persistence.mode` (`merge-json` vs `replace`)
   * - keep OpenCode-specific bootstrap generation separate (default agent), then
   *   merge runtime patches through the same generic pathway.
   */
  runtimeRenderedFiles: RuntimeRenderedFile[];
  /** Optional user-facing activation instructions emitted by runtime modules. */
  runtimeActivation?: RuntimeActivationInstruction[];
  pyBashPath?: string;
  pyBashCredentials?: { tenantUrl: string; token: string };
}

const runtimeRegistry = createRuntimeRegistry([
  systemBashRuntimeModule,
  pyBashRuntimeModule,
  dtMcpServerRuntimeModule,
]);

async function resolveRuntimePlan(options: BuildOptions): Promise<RuntimePlan> {
  const runtimeConfigPath = getRuntimeConfigPath(options.runtime);
  const runtimeYaml = await readRuntimeConfigYaml(options.runtime);
  const rawConfig = loadRuntimeConfig(options.runtime, runtimeYaml, runtimeConfigPath);
  const runtimeModule = getRuntimeModule(runtimeRegistry, options.runtime);
  const env = {
    ...process.env,
    KB_RUN_DTCTL_CONTEXT: options.context,
    KB_RUN_PY_BASH_PATH: options.pyBashPath,
  };

  if (options.runtime === 'py-bash') {
    console.log(chalk.cyan('⚙️  Configuring py-bash runtime setup...'));
  }

  const resolved = await runtimeModule.resolveRuntime({
    runtime: options.runtime,
    runtimeConfigPath,
    rawConfig,
    env,
  });
  const rendered = await runtimeModule.renderTarget({
    target: options.target || 'opencode',
    resolvedRuntime: resolved,
  });

  const plan: RuntimePlan = {
    runtime: options.runtime,
    runtimeConfigPath,
    runtimeResources: resolved.resources,
    runtimeRenderedFiles: rendered.files,
    runtimeActivation: rendered.activation,
  };

  if (options.runtime === 'py-bash') {
    const runtimeConfig = resolved.config as { repoPath?: string; tenantUrl?: string; token?: string };
    if (!runtimeConfig.repoPath || !runtimeConfig.tenantUrl || !runtimeConfig.token) {
      throw new Error('py-bash runtime resolved an incomplete configuration.');
    }

    console.log(chalk.green(`✓ py-bash path: ${runtimeConfig.repoPath}`));
    console.log(chalk.green(`✓ Tenant URL: ${runtimeConfig.tenantUrl} (from dtctl context)`));

    plan.pyBashPath = runtimeConfig.repoPath;
    plan.pyBashCredentials = {
      tenantUrl: runtimeConfig.tenantUrl,
      token: runtimeConfig.token,
    };
  }

  return plan;
}

/**
 * Syncs aimgr repository to ensure latest resources are available
 * 
 * @param kbRoot - The resolved knowledge base root directory
 */
async function syncAimgrRepository(kbRoot: string): Promise<boolean> {
  try {
    execSync('aimgr --version', { stdio: 'pipe' });
  } catch (error) {
    console.log(chalk.yellow('⚠️  aimgr not found - repository not synced'));
    return false;
  }
  
  try {
    console.log(chalk.cyan('🔄 Syncing aimgr repository (using kb-run config)...'));
    const configPath = await getResolvedAimgrConfig(kbRoot);
    
    // Always start with a fresh repo to avoid stale symlink conflicts
    // (e.g. renamed or deleted resources leave behind symlinks that
    //  aimgr --force cannot overwrite)
    const repoPath = join(__dirname, '..', '.aimgr-repo');
    if (await pathExists(repoPath)) {
      await remove(repoPath);
    }
    try {
      execSync(`aimgr --config "${configPath}" repo init`, {
        stdio: 'pipe',
        encoding: 'utf-8'
      });
    } catch (error: any) {
      const details = error.stderr?.toString().trim() || error.stdout?.toString().trim() || error.message || String(error);
      console.log(chalk.red('✗ aimgr repo init failed'));
      console.log(chalk.red(`  ${details}`));
      console.log(chalk.yellow('  Hint: Run "aimgr repo sync" manually to diagnose'));
      return false;
    }
    
    // Add (or re-add) resources from the knowledge base source
    // aimgr requires "local:" prefix for local filesystem paths
    execSync(`aimgr --config "${configPath}" repo add "local:${kbRoot}" --force`, {
      stdio: 'pipe',
      encoding: 'utf-8'
    });
    console.log(chalk.green('✓ Repository synced from knowledge base'));
    return true;
  } catch (error: any) {
    const details = error.stderr?.toString().trim() || error.stdout?.toString().trim() || error.message || String(error);
    console.log(chalk.red('✗ aimgr repo sync failed'));
    console.log(chalk.red(`  ${details}`));
    console.log(chalk.yellow('  Hint: Run "aimgr repo sync" manually to diagnose'));
    return false;
  }
}

/**
 * Installs resources using aimgr with kb-run's isolated config
 * 
 * @param outputDir - The output directory where resources will be installed
 * @param kbRoot - The resolved knowledge base root directory
 */
async function installResources(outputDir: string, kbRoot: string): Promise<void> {
  console.log(chalk.cyan('📦 Installing resources with aimgr...'));
  
  try {
    execSync('aimgr --version', { stdio: 'pipe' });
  } catch (error) {
    console.log(chalk.yellow('⚠️  aimgr not found - resources not installed'));
    return;
  }
  
  try {
    const configPath = await getResolvedAimgrConfig(kbRoot);
    // Use spawnSync to capture exit code without throwing
    const result = spawnSync(
      'aimgr',
      ['--config', configPath, 'install'],
      {
        cwd: outputDir,
        stdio: 'inherit',   // still stream output live to console
        shell: false,
        encoding: 'utf-8',
      }
    );
    
    if (result.status === 0) {
      console.log(chalk.green('✓ Resources installed successfully'));
    } else {
      // Partial failure - aimgr already printed summary line (e.g. "22 installed, 1 failed")
      console.log(chalk.yellow('⚠️  Some resources failed to install (see above)'));
      console.log(chalk.yellow('   The environment may still be usable. Check failures above.'));
    }
  } catch (error: any) {
    const details = error.stderr?.toString().trim() || error.message || String(error);
    console.log(chalk.red('✗ aimgr install failed'));
    console.log(chalk.red(`  ${details}`));
  }
}

/**
 * Generates an OpenCode configuration file with default agent setting
 * 
 * @param outputDir - The output directory path
 * @param agentName - The agent name to set as default
 * @param runtimePlan - Resolved runtime plan for resource/setup behavior
 * @param runtimeSetup - Runtime setup outputs (credentials, resolved values)
 * @throws Error if config file cannot be written
 * 
 * @example
 * await generateOpencodeConfig('/path/to/output', 'plan', runtimePlan, runtimeSetup);
 */
async function generateOpencodeConfig(
  outputDir: string,
  agentName: string,
  runtimePlan: RuntimePlan,
): Promise<void> {
  console.log(chalk.cyan('⚙️  Generating OpenCode configuration...'));
  
  const config: Record<string, any> = {
    "$schema": "https://opencode.ai/config.json",
    "default_agent": agentName
  };

  const configPath = join(outputDir, 'opencode.json');
  await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  
  if (runtimePlan.runtime === 'py-bash' && runtimePlan.pyBashCredentials) {
    console.log(chalk.green(`✓ Generated opencode.json (default agent: ${agentName}, py-bash MCP enabled, bash denied)`));
  } else if (runtimePlan.runtime === 'dt-mcp-server') {
    console.log(chalk.green(`✓ Generated opencode.json (default agent: ${agentName}, dt-mcp-server MCP enabled, bash denied)`));
  } else {
    console.log(chalk.green(`✓ Generated opencode.json (default agent: ${agentName})`));
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function deepMergeJson(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
  const output: Record<string, unknown> = { ...base };

  for (const [key, patchValue] of Object.entries(patch)) {
    const baseValue = output[key];

    if (isPlainObject(baseValue) && isPlainObject(patchValue)) {
      output[key] = deepMergeJson(baseValue, patchValue);
      continue;
    }

    output[key] = patchValue;
  }

  return output;
}

function stringifyRenderedFile(file: RuntimeRenderedFile): string {
  if (file.format === 'json') {
    return `${JSON.stringify(file.content, null, 2)}\n`;
  }

  if (file.format === 'text' || file.format === 'yaml') {
    if (typeof file.content !== 'string') {
      throw new Error(
        `Invalid runtime rendered file payload for ${file.path}: format ${file.format} expects string content.`,
      );
    }
    return file.content.endsWith('\n') ? file.content : `${file.content}\n`;
  }

  throw new Error(`Unsupported runtime rendered file format for ${file.path}: ${(file as any).format}`);
}

async function persistRuntimeRenderedFiles(outputDir: string, files: RuntimeRenderedFile[]): Promise<void> {
  for (const file of files) {
    const targetPath = join(outputDir, file.path);
    await ensureDir(dirname(targetPath));

    const mode = file.persistence?.mode ?? 'replace';

    if (mode === 'merge-json') {
      if (file.format !== 'json') {
        throw new Error(
          `Invalid runtime persistence mode for ${file.path}: merge-json requires json format.`,
        );
      }
      if (!isPlainObject(file.content)) {
        throw new Error(
          `Invalid runtime rendered JSON patch for ${file.path}: expected an object for merge-json mode.`,
        );
      }

      let existing: Record<string, unknown> = {};
      if (await pathExists(targetPath)) {
        const raw = await readFile(targetPath, 'utf-8');
        const parsed = JSON.parse(raw) as unknown;
        if (!isPlainObject(parsed)) {
          throw new Error(
            `Cannot merge runtime JSON into ${file.path}: existing file is not a JSON object.`,
          );
        }
        existing = parsed;
      }

      const merged = deepMergeJson(existing, file.content);
      await writeFile(targetPath, `${JSON.stringify(merged, null, 2)}\n`, 'utf-8');
      console.log(chalk.green('✓') + ` Generated ${file.path} (runtime patch)`);
      continue;
    }

    await writeFile(targetPath, stringifyRenderedFile(file), 'utf-8');
    console.log(chalk.green('✓') + ` Generated ${file.path} (runtime)`);
  }
}

/**
 * Generates VS Code settings.json with tool-specific auto-approve configuration
 * 
 * @param outputDir - The output directory path
 * @throws Error if config file cannot be written
 */
async function generateVSCodeSettings(outputDir: string): Promise<void> {
  console.log(chalk.cyan('⚙️  Generating VS Code settings...'));
  
  const settings = {
    "chat.tools.terminal.autoApprove": {
      "dtctl": true,
      "grep": true,
      "rg": true,
      "cat": true,
      "ls": true,
      "jq": true
    }
  };
  
  const vscodeDir = join(outputDir, '.vscode');
  await ensureDir(vscodeDir);
  
  const settingsPath = join(vscodeDir, 'settings.json');
  await writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
  
  console.log(chalk.green('✓ Generated .vscode/settings.json (auto-approve for dtctl, grep, rg, cat, ls, jq)'));
}

/**
 * Scaffold an agent context directory
 * 
 * Orchestrates the complete build process:
 * 1. Validates input files and dtctl context
 * 2. Syncs aimgr repository to get latest resources
 * 3. Creates directory structure
 * 4. Generates all required files
 * 5. Installs resources via aimgr
 * 6. Displays success message with next steps
 * 
 * @param options - Build options
 * @throws Error if any validation or generation step fails
 */
export async function scaffold(options: BuildOptions): Promise<void> {
  console.log(chalk.bold('\n🚀 Building evaluation environment...\n'));
  
  try {
    // Step 0: Auto-detect KB root if not specified
    if (!options.kbRoot) {
      console.log(chalk.cyan('🔍 Auto-detecting knowledge base root...'));
      const detection = await detectKnowledgeBaseRoot();
      
      if (!detection.found) {
        throw new Error(detection.error || 'Failed to detect knowledge base root');
      }
      
      // Update options with detected KB root
      options.kbRoot = detection.path;
    } else {
      console.log(chalk.green('✓') + ` Using specified KB root: ${options.kbRoot}`);
    }
    
    // Step 1: Validate inputs
    await validateInputFiles(options);
    await validateDtctlContext(options.context);

    // Step 1a: Resolve runtime plan from explicit runtime selection
    const runtimePlan = await resolveRuntimePlan(options);
    console.log(chalk.green('✓') + ` Runtime selected: ${runtimePlan.runtime}`);
    console.log(chalk.green('✓') + ` Runtime config: ${runtimePlan.runtimeConfigPath}`);
    
    // Step 2: Sync aimgr repository to ensure latest resources available
    const syncOk = await syncAimgrRepository(options.kbRoot!);
    if (!syncOk) {
      throw new Error(
        'aimgr repository sync failed. Cannot install resources.\n' +
        'Please ensure aimgr is installed and the knowledge base path is correct.\n' +
        `KB root: ${options.kbRoot}`
      );
    }
    
    // Step 3: Create directory structure
    const outputDir = await createDirectoryStructure(options);
    
    // Step 4: Generate files
    await copyPackageFile(outputDir, options, runtimePlan);
    await generateAgentPrompt(outputDir, options);
    
    // Generate OpenCode config if target is opencode
    if (options.target === 'opencode') {
      await generateOpencodeConfig(outputDir, options.agent, runtimePlan);
    }
    
    // Generate VS Code settings if target is vscode
    if (options.target === 'vscode') {
      await generateVSCodeSettings(outputDir);
    }

    // Persist target-specific runtime-rendered artifacts for all targets.
    await persistRuntimeRenderedFiles(outputDir, runtimePlan.runtimeRenderedFiles);
    
    // Step 5: Install resources (skills, agents, commands, packages)
    await installResources(outputDir, options.kbRoot!);
    
    // Step 6: Success message with next steps
    if (runtimePlan.runtime === 'py-bash' && runtimePlan.pyBashCredentials) {
      console.log(chalk.green.bold('\n✅ Environment ready! (py-bash MCP mode)\n'));
      console.log(chalk.cyan(`  py-bash:  ${runtimePlan.pyBashPath}`));
      console.log(chalk.cyan(`  Tenant:   ${runtimePlan.pyBashCredentials.tenantUrl}`));
      console.log(chalk.cyan('  DT_TOKEN: set (written to opencode.json)'));
      console.log(chalk.cyan('  Bash:     denied (forced through py-bash MCP)\n'));
    } else if (runtimePlan.runtime === 'dt-mcp-server') {
      console.log(chalk.green.bold('\n✅ Environment ready! (dt-mcp-server MCP mode)\n'));
      if (options.target === 'opencode') {
        console.log(chalk.cyan('  Bash:     denied (forced through dt-mcp-server MCP)'));
      }
      if (options.target === 'vscode') {
        console.log(chalk.cyan('  MCP:      generated .vscode/mcp.json for VS Code'));
      }
      if (options.target === 'claude') {
        console.log(chalk.cyan('  MCP:      generated .mcp.json for Claude'));
      }
      if (options.target === 'copilot') {
        console.log(chalk.cyan('  MCP:      generated .kb-run/copilot/mcp-config.json handoff for Copilot CLI'));
        console.log(chalk.cyan('  Note:     Copilot CLI MCP config is user-scoped (~/.copilot/mcp-config.json)'));
      }
      console.log('');
    } else {
      console.log(chalk.green.bold('\n✅ Environment ready!\n'));
    }
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.cyan(`  1. cd ${outputDir}`));
    
    // Target-specific launch instructions
    if (options.target === 'opencode') {
      console.log(chalk.cyan('  2. opencode\n'));
    } else if (options.target === 'copilot') {
      console.log(chalk.cyan('  2. copilot\n'));
    } else if (options.target === 'claude') {
      console.log(chalk.cyan('  2. claude (or launch Claude Code/Desktop)\n'));
    } else if (options.target === 'vscode') {
      console.log(chalk.cyan('  2. code .\n'));
    } else if (options.target === 'windsurf') {
      console.log(chalk.cyan('  2. surf (or launch Windsurf)\n'));
    }

    if (runtimePlan.runtimeActivation && runtimePlan.runtimeActivation.length > 0) {
      for (const instruction of runtimePlan.runtimeActivation) {
        console.log(chalk.cyan(`${instruction.title}:`));
        instruction.steps.forEach((step, index) => {
          console.log(chalk.cyan(`  ${index + 1}. ${step}`));
        });
        console.log('');
      }
    }
  } catch (error: any) {
    // Re-throw with context for better error messages
    throw new Error(`Build failed: ${error.message}`);
  }
}

/**
 * Creates a new skill directory from templates
 * 
 * @param skillName - Name of the skill to create (e.g., "dt-app-dashboard")
 * @param options - Scaffolding options (domain, description, etc.)
 * 
 * TODO: Implement scaffolding logic:
 * - Validate skill name format
 * - Create directory structure
 * - Generate ai.package.yaml with metadata
 * - Generate SKILL.md from template
 * - Create references/ and templates/ directories
 */
export async function scaffoldSkill(
  skillName: string,
  options?: Record<string, unknown>
): Promise<void> {
  // Stub: Will be implemented in future tasks
  console.log(`Scaffolding new skill: ${skillName}`);
  throw new Error('Scaffolding not yet implemented');
}

/**
 * Generates a README.md from template
 * 
 * @param skillName - Name of the skill
 * @param description - Description to include
 * @returns Generated README content
 * 
 * TODO: Implement README generation from template
 */
export function generateReadme(skillName: string, description: string): string {
  // Stub: Will be implemented in future tasks
  return `# ${skillName}\n\n${description}\n`;
}

/**
 * Checks if the current environment supports interactive prompts
 * 
 * @returns true if interactive mode is available (has TTY)
 */
function isInteractive(): boolean {
  return process.stdin.isTTY === true && process.stdout.isTTY === true;
}

/**
 * Creates the output directory structure for the evaluation environment
 * 
 * @param options - Build options containing context, agent, output path, and update mode
 * @returns Absolute path to the created directory
 * @throws Error if directory exists and update mode prevents overwrite
 * 
 * @example
 * const outputPath = await createDirectoryStructure({
 *   context: 'my-tenant',
 *   agent: 'copilot',
 *   packageFile: './ai.package.yaml',
 *   updateMode: 'replace'
 * });
 */
export async function createDirectoryStructure(options: BuildOptions): Promise<string> {
  // Step 1: Determine output path (now defaults to /tmp/kb-run/<context>/<agent>)
  const outputPath = options.output || join('/tmp', 'kb-run', options.context, options.agent);
  const absolutePath = resolve(outputPath);
  
  // Step 2: Check if directory exists
  const exists = await pathExists(absolutePath);
  
  // Step 3: Determine update mode (default: replace)
  const updateMode = options.updateMode || 'replace';
  
  if (exists) {
    switch (updateMode) {
      case 'replace':
        // Delete existing directory without prompting (new default behavior)
        console.log(chalk.yellow(`⚠️  Directory exists, replacing: ${absolutePath}`));
        await remove(absolutePath);
        break;
        
      case 'prompt':
        // Interactive mode: prompt user for confirmation
        if (isInteractive()) {
          const shouldOverwrite = await confirm({
            message: 'Output directory exists. Overwrite?',
            default: true,
          });
          
          if (shouldOverwrite) {
            await remove(absolutePath);
          } else {
            throw new Error('Build cancelled by user.');
          }
        } else {
          // Non-interactive mode with prompt mode: fail with helpful message
          throw new Error(
            'Output directory already exists. Cannot prompt in non-interactive mode. ' +
            'Use --update-mode=replace to overwrite, or --update-mode=skip to reuse.'
          );
        }
        break;
        
      case 'skip':
        // Skip build, reuse existing directory
        console.log(chalk.green(`✓ Using existing directory: ${absolutePath}`));
        return absolutePath;
        
      case 'fail':
        // Strict mode: error if directory exists
        throw new Error(
          `Output directory already exists: ${absolutePath}\n` +
          'Use --update-mode=replace to overwrite, or --update-mode=skip to reuse.'
        );
        
      default:
        throw new Error(`Invalid update mode: ${updateMode}. Must be one of: replace, prompt, skip, fail`);
    }
  }
  
  // Step 4: Create directory structure based on target IDE
  if (options.target === 'opencode') {
    await ensureDir(join(absolutePath, '.opencode'));
  } else if (options.target === 'copilot') {
    // Copilot only supports skills in .github/skills (no commands or agents)
    await ensureDir(join(absolutePath, '.github', 'skills'));
  } else if (options.target === 'claude') {
    await ensureDir(join(absolutePath, '.claude'));
  } else if (options.target === 'vscode') {
    // VSCode with Copilot extension uses .github/skills
    await ensureDir(join(absolutePath, '.github', 'skills'));
    // Also create .vscode directory for settings
    await ensureDir(join(absolutePath, '.vscode'));
  } else if (options.target === 'windsurf') {
    // Windsurf uses .windsurf/skills (similar to VSCode)
    await ensureDir(join(absolutePath, '.windsurf', 'skills'));
  }
  // NOTE: Removed agents/ directory creation - it was unused
  
  // Step 5: Print success message
  console.log(chalk.green('✓') + ` Created directory: ${absolutePath}`);
  
  return absolutePath;
}

/**
 * Generates the AGENTS.md system prompt file by concatenating base prompt with agent-specific instructions
 * 
 * @param outputDir - The output directory path
 * @param options - Build options containing basePrompt path and agent name
 * @throws Error if base prompt file cannot be read
 * 
 * @example
 * await generateAgentPrompt('/path/to/output', options);
 */
export async function generateAgentPrompt(outputDir: string, options: BuildOptions): Promise<void> {
  // Read base prompt file
  // If basePrompt is specified, use it directly. Otherwise, resolve from kbRoot
  let basePromptPath: string;
  if (options.basePrompt) {
    basePromptPath = options.basePrompt;
  } else if (options.kbRoot) {
    basePromptPath = join(options.kbRoot, 'system-prompt', 'SingleTenantPrompt.md');
  } else {
    throw new Error('Either basePrompt or kbRoot must be specified');
  }
  
  try {
    let content = await readFile(basePromptPath, 'utf-8');
    
    // OpenCode has native agent discovery via .opencode/agents/ — don't duplicate in AGENTS.md
    const hasNativeAgentSupport = options.target === 'opencode';

    if (options.agent && !hasNativeAgentSupport) {
      // If agent is specified and target doesn't have native agent support,
      // resolve and concatenate agent instructions into AGENTS.md
      const result = await resolveAgentLocation(options.agent, options.kbRoot!);
      
      if (result.success && result.location) {
        try {
          const agentContent = await readFile(result.location, 'utf-8');
          
          // Concatenate base prompt with agent instructions
          content = content + '\n\n---\n\n# Agent Instructions\n\n' + agentContent;
          
          console.log(chalk.green('✓') + ` Generated AGENTS.md (with agent: ${options.agent})`);
        } catch (error: any) {
          // Agent file couldn't be read - log warning and use base prompt only
          console.log(chalk.yellow('⚠️  Could not read agent file: ' + error.message));
          console.log(chalk.yellow('   Using base prompt only'));
          console.log(chalk.green('✓') + ' Generated AGENTS.md (base prompt only)');
        }
      } else {
        // Agent not found or aimgr error - log warning and use base prompt only
        console.log(chalk.yellow('⚠️  ' + result.error));
        console.log(chalk.yellow('   Using base prompt only'));
        console.log(chalk.green('✓') + ' Generated AGENTS.md (base prompt only)');
      }
    } else if (hasNativeAgentSupport) {
      // Target loads agents natively — AGENTS.md gets base prompt only
      console.log(chalk.green('✓') + ' Generated AGENTS.md (base prompt only — agent loaded natively by IDE)');
    } else {
      // No agent specified - use base prompt only
      console.log(chalk.green('✓') + ' Generated AGENTS.md (base prompt only)');
    }
    
    // Write final content to AGENTS.md
    await writeFile(join(outputDir, 'AGENTS.md'), content, 'utf-8');
    
  } catch (error: any) {
    throw new Error(`Failed to generate AGENTS.md: ${error.message}`);
  }
}

/**
 * Copies the package YAML to the output directory and prepends runtime resources.
 *
 * The source YAML contains content resources (e.g. `package/dynatrace-candidate`).
 * This function injects runtime-provided `resources:` entries so `aimgr install`
 * sees both runtime and content resources from a single package file.
 *
 * @param outputDir - The output directory path
 * @param options - Build options
 * @param runtimePlan - Resolved runtime resources and setup inputs
 * @throws Error if package file cannot be read or written
 */
export async function copyPackageFile(outputDir: string, options: BuildOptions, runtimePlan: RuntimePlan): Promise<void> {
  try {
    const sourcePath = options.packageFile;
    const destPath = join(outputDir, 'ai.package.yaml');

    // Read the source package YAML
    const sourceContent = await readFile(sourcePath, 'utf-8');

    // Runtime-provided resources are prepended to the package resources.
    const runtimeResources = runtimePlan.runtimeResources;

    // Build merged YAML: runtime resources first, then original content resources
    const runtimeLines = runtimeResources.map(s => `    - ${s}`).join('\n');
    const runtimeBlock = runtimeLines
      ? `\n    # runtime resources (managed by kb-run, runtime: ${runtimePlan.runtime})\n${runtimeLines}\n\n    # content packages`
      : `\n    # content packages`;
    // Insert infra skills right after the "resources:" line
    const merged = sourceContent.replace(
      /^(resources:\s*)$/m,
      `$1${runtimeBlock}`,
    );

    await writeFile(destPath, merged, 'utf-8');

    console.log(chalk.green('✓') + ` Generated ai.package.yaml (runtime: ${runtimePlan.runtime})`);
  } catch (error: any) {
    throw new Error(`Failed to generate ai.package.yaml: ${error.message}`);
  }
}

/**
 * Generates a README.md file in the output directory with usage instructions
 * 
 * @param outputDir - The output directory path
 * @param options - Build options containing context and agent information
 * @throws Error if template cannot be read or README cannot be written
 * 
 * @example
 * await generateReadmeFromTemplate('/path/to/output', options);
 */
