/**
 * Command builder utility
 * 
 * Builds equivalent non-interactive command strings from options.
 */

import { DEFAULT_BASE_PROMPT } from './types.js';
import type { TargetIDE, LaunchMode, UpdateMode, RuntimeName } from './types.js';

export interface CommandOptions {
  command: 'build' | 'start';
  context: string;
  agent: string;
  package?: string;
  packageFile?: string;
  output?: string;
  target?: TargetIDE;
  mode?: LaunchMode;
  updateMode?: UpdateMode;
  basePrompt?: string;
  runtime?: RuntimeName;
  pyBashPath?: string;
}

/**
 * Build a non-interactive command string from options
 * 
 * @param options - Command options
 * @returns Formatted command string
 */
export function buildCommandString(options: CommandOptions): string {
  const parts = ['kb-run', options.command];
  
  // Required arguments
  parts.push(`--context=${options.context}`);
  parts.push(`--agent=${options.agent}`);
  
  // Package selection
  if (options.packageFile) {
    parts.push(`--package-file=${options.packageFile}`);
  } else if (options.package) {
    parts.push(`--package=${options.package}`);
  }
  
  // Optional arguments (only include if non-default)
  if (options.target && options.target !== 'opencode') {
    parts.push(`--target=${options.target}`);
  }
  
  if (options.mode && options.mode !== 'tui') {
    parts.push(`--mode=${options.mode}`);
  }
  
  if (options.output) {
    parts.push(`--output=${options.output}`);
  }
  
  // Include update-mode only if not default (replace)
  if (options.updateMode && options.updateMode !== 'replace') {
    parts.push(`--update-mode=${options.updateMode}`);
  }
  
  if (options.basePrompt && options.basePrompt !== DEFAULT_BASE_PROMPT) {
    parts.push(`--base-prompt=${options.basePrompt}`);
  }

  if (options.runtime && options.runtime !== 'system-bash') {
    parts.push(`--runtime=${options.runtime}`);
  }
  
  if (options.pyBashPath) {
    parts.push(`--py-bash=${options.pyBashPath}`);
  }
  
  return parts.join(' ');
}
