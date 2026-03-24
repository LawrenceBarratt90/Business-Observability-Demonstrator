/**
 * Type definitions for kb-run CLI tool
 * 
 * This file contains TypeScript types and interfaces for:
 * - Package metadata (ai.package.yaml structure)
 * - Build options and configuration
 * - Skill structure and validation rules
 * - CLI command options
 */

/**
 * Default base prompt relative to the knowledge-base root.
 */
export const DEFAULT_BASE_PROMPT = 'system-prompt/SingleTenantPrompt.md';

/**
 * Target IDE types.
 */
export const TARGET_IDES = ['opencode', 'copilot', 'claude', 'vscode', 'windsurf'] as const;
export type TargetIDE = typeof TARGET_IDES[number];

/**
 * Canonical runtime identifiers supported by kb-run.
 *
 * Runtimes are selected explicitly by name. Runtime modules and runtime YAML
 * files are keyed by this exact string union.
 */
export const RUNTIME_NAMES = ['system-bash', 'py-bash', 'dt-mcp-server'] as const;
export type RuntimeName = typeof RUNTIME_NAMES[number];

/**
 * Launch mode types for how IDE should be started
 */
export const LAUNCH_MODES = ['tui', 'web', 'detached'] as const;
export type LaunchMode = typeof LAUNCH_MODES[number];

/**
 * Update mode strategies for handling existing directories
 */
export const UPDATE_MODES = ['replace', 'prompt', 'skip', 'fail'] as const;
export type UpdateMode = typeof UPDATE_MODES[number];

/**
 * Options for the build command
 */
export interface BuildOptions {
  /** dtctl context name (required) */
  context: string;
  /** Agent identifier (required) */
  agent: string;
  /** Resolved path to package file - internal use after validation (required) */
  packageFile: string;
  /** Output directory (optional, default computed from context/agent) */
  output?: string;
  /** Update mode strategy (optional, default: "replace") */
  updateMode?: UpdateMode;
  /** Base prompt file path (optional, default: DEFAULT_BASE_PROMPT) */
  basePrompt?: string;
  /** Target IDE (optional, default: "opencode") */
  target?: TargetIDE;
  /** Runtime selection (explicit, defaults to `system-bash` at CLI layer). */
  runtime: RuntimeName;
  /**
   * Optional py-bash repo path override used only when runtime is `py-bash`.
   *
   * Migration path: `--py-bash <path>` remains supported as the explicit
   * source for this value. If omitted, runtime config (`runtime/py-bash.yaml`)
   * provides the default/env-backed source.
   */
  pyBashPath?: string;
  /** Explicit knowledge base root directory path (optional, auto-detected by default) */
  kbRoot?: string;
}

// TODO: Add PackageMetadata interface for ai.package.yaml structure
// TODO: Add SkillStructure interface for validation
// TODO: Add ValidationResult interface for validation output

export {};
