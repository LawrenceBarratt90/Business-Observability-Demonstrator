/**
 * aimgr integration utilities
 * 
 * This module provides functions to interact with aimgr CLI for:
 * - Resolving agent markdown file locations
 * - Querying installed resources
 * - Handling aimgr availability and errors
 */

import { spawnSync } from 'child_process';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Response structure from `aimgr repo describe` command
 */
interface AimgrDescribeResponse {
  type: string;
  name: string;
  description: string;
  metadata: {
    name: string;
    type: string;
    source_type: string;
    source_url: string;
    first_installed: string;
    last_updated: string;
  };
  location: string;
}

/**
 * Result type for resolveAgentLocation function
 */
export interface ResolveAgentResult {
  success: boolean;
  location?: string;
  error?: string;
}

/**
 * Gets the absolute path to kb-run's built-in aimgr config and resolves all paths.
 * Writes a runtime-resolved YAML config to .aimgr-config-resolved.yaml with the
 * correct absolute paths for the local knowledge-base source only (no GitHub, no
 * global config).
 *
 * @param kbRoot - The resolved knowledge base root directory
 * @returns Absolute path to the written config file
 */
export async function getResolvedAimgrConfig(kbRoot: string): Promise<string> {
  const kbRunRoot = join(__dirname, '..');
  const resolvedRepoPath = join(kbRunRoot, '.aimgr-repo');

  // aimgr (Go binary) reads these paths from YAML — always use forward slashes
  // so the paths are valid on Windows too.
  const toYamlPath = (p: string) => p.replace(/\\/g, '/');

  const tempConfigPath = join(kbRunRoot, '.aimgr-config-resolved.yaml');
  const configContent = `# Auto-generated resolved config for kb-run
install:
    targets:
        - claude
        - opencode
sync:
    sources:
        - path: ${toYamlPath(kbRoot)}
repo:
    path: ${toYamlPath(resolvedRepoPath)}
`;

  await writeFile(tempConfigPath, configContent, 'utf-8');
  return tempConfigPath;
}

/**
 * Resolves the file system location of an agent's markdown file using aimgr
 * 
 * @param agentName - The name of the agent (e.g., "dt-sre-agent")
 * @param kbRoot    - The resolved knowledge base root directory (used to build isolated config)
 * @returns Result object with success status and location or error message
 * 
 * @example
 * const result = await resolveAgentLocation('dt-sre-agent', kbRoot);
 * if (result.success) {
 *   console.log('Agent location:', result.location);
 * } else {
 *   console.error('Error:', result.error);
 * }
 */
export async function resolveAgentLocation(agentName: string, kbRoot: string): Promise<ResolveAgentResult> {
  try {
    // Check if aimgr is installed
    const versionCheck = spawnSync('aimgr', ['--version'], { stdio: 'pipe' });
    if (versionCheck.error) {
      return {
        success: false,
        error: 'aimgr not installed or not in PATH'
      };
    }

    const configPath = await getResolvedAimgrConfig(kbRoot);

    // Execute aimgr repo describe command using isolated config
    const result = spawnSync(
      'aimgr',
      ['--config', configPath, 'repo', 'describe', `agent/${agentName}`, '--format', 'json'],
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    );

    if (result.error) throw result.error;

    if (result.status !== 0) {
      const stderr = result.stderr || '';
      if (stderr.includes('not found') || stderr.includes('does not exist')) {
        return {
          success: false,
          error: `agent '${agentName}' not found in aimgr repository`
        };
      }
      return {
        success: false,
        error: stderr.trim() || `aimgr exited with status ${result.status}`
      };
    }

    // Parse JSON response
    const response: AimgrDescribeResponse = JSON.parse(result.stdout.trim());

    // Validate response structure
    if (!response.location) {
      return {
        success: false,
        error: 'aimgr response missing location field'
      };
    }

    return {
      success: true,
      location: response.location
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'unknown error querying aimgr'
    };
  }
}
