/**
 * py-bash runtime module.
 *
 * This runtime owns:
 * - Path resolution from runtime config/CLI override
 * - Environment interpolation for runtime values
 * - py-bash validation (poetry + dependency checks)
 * - DT_TENANT_URL / DT_TOKEN resolution for MCP execution
 * - OpenCode MCP replacement rendering (deny native bash)
 */

import { execSync } from 'child_process';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { pathExists } from 'fs-extra';
import { readFile } from 'fs/promises';
import chalk from 'chalk';
import type {
  RenderRuntimeTargetContext,
  ResolvedRuntimeModel,
  ResolveRuntimeContext,
  RuntimeModule,
  RuntimeRenderResult,
  RuntimeValue,
} from './types.js';
import { interpolateRuntimeStringValue } from './types.js';
import { getDtctlContextDetails, resolveDtctlContextToken } from './dtctl.js';

interface PyBashResolvedConfig {
  repoPath: string;
  tenantUrl: string;
  token: string;
}

interface PyBashConfigInput {
  repoPath?: string;
}

function stripYamlScalarQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function expandHomePath(value: string): string {
  if (value === '~') {
    return homedir();
  }
  if (value.startsWith('~/')) {
    return join(homedir(), value.slice(2));
  }
  return value;
}

/**
 * Validates py-bash setup and resolves credentials.
 */
async function validatePyBashRuntime(
  pyBashPath: string,
  context: string,
  env: NodeJS.ProcessEnv,
): Promise<{ tenantUrl: string; token: string }> {
  const absolutePyBashPath = resolve(pyBashPath);

  if (!(await pathExists(absolutePyBashPath))) {
    throw new Error(
      `py-bash repo path does not exist: ${absolutePyBashPath}\n` +
        `Expected: path to a directory containing pyproject.toml with bash-mcp`,
    );
  }

  try {
    const { lstat } = await import('fs/promises');
    const stats = await lstat(absolutePyBashPath);
    if (!stats.isDirectory()) {
      throw new Error(
        `py-bash repo path is not a directory: ${absolutePyBashPath}\n` +
          `Expected: path to a directory containing pyproject.toml with bash-mcp`,
      );
    }
  } catch (error: any) {
    if (error.message.includes('py-bash repo path')) throw error;
    throw new Error(`Cannot access py-bash repo path: ${absolutePyBashPath}`);
  }

  const pyprojectPath = join(absolutePyBashPath, 'pyproject.toml');
  if (!(await pathExists(pyprojectPath))) {
    throw new Error(
      `py-bash repo path is missing pyproject.toml: ${absolutePyBashPath}\n` +
        `Expected: a poetry project directory containing a pyproject.toml with bash-mcp`,
    );
  }

  const pyprojectContent = await readFile(pyprojectPath, 'utf-8');
  if (!pyprojectContent.includes('bash-mcp')) {
    throw new Error(
      `pyproject.toml in ${absolutePyBashPath} does not mention 'bash-mcp'.\n` +
        `Expected: the dt-mcp-servers repo that provides the bash-mcp tool`,
    );
  }

  console.log(chalk.green('✓') + ` py-bash path validated: ${absolutePyBashPath}`);

  try {
    execSync('poetry --version', { stdio: 'pipe', timeout: 5000 });
  } catch {
    throw new Error(
      'poetry not found. poetry is required for --runtime=py-bash mode.\n' +
        'Install it with: curl -sSL https://install.python-poetry.org | python3 -',
    );
  }

  console.log(chalk.green('✓') + ' poetry is available');

  try {
    execSync(`poetry -C "${absolutePyBashPath}" run which bash-mcp`, {
      stdio: 'pipe',
      timeout: 15000,
    });
  } catch {
    throw new Error(
      `py-bash dependencies not installed. Run: cd "${absolutePyBashPath}" && poetry install`,
    );
  }

  console.log(chalk.green('✓') + ' py-bash dependencies are installed');

  const dtctlDetails = getDtctlContextDetails(context);
  const tenantUrl = dtctlDetails.tenantUrl;
  const tokenRef = dtctlDetails.tokenRef;

  console.log(chalk.green('✓') + ` DT_TENANT_URL extracted: ${tenantUrl}`);

  const token = await resolveDtctlContextToken(context, env.DT_TOKEN);
  if (env.DT_TOKEN) {
    console.log(chalk.green('✓') + ' DT_TOKEN: set (from environment variable)');
  } else {
    console.log(chalk.green('✓') + ` DT_TOKEN: set (from OS keyring, token-ref: ${tokenRef})`);
  }

  return { tenantUrl, token };
}

function isRecord(value: RuntimeValue): value is { [key: string]: RuntimeValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getPyBashConfigInput(raw: RuntimeValue): PyBashConfigInput {
  if (!isRecord(raw)) {
    return {};
  }

  const repoPathValue = raw.repoPath;
  if (typeof repoPathValue === 'string') {
    return { repoPath: repoPathValue };
  }

  return {};
}

function parseResolvedPyBashConfig(config: RuntimeValue): PyBashResolvedConfig {
  if (!isRecord(config)) {
    throw new Error('py-bash runtime resolved invalid config payload.');
  }

  const repoPath = config.repoPath;
  const tenantUrl = config.tenantUrl;
  const token = config.token;

  if (typeof repoPath !== 'string' || typeof tenantUrl !== 'string' || typeof token !== 'string') {
    throw new Error('py-bash runtime resolved incomplete OpenCode configuration values.');
  }

  return { repoPath, tenantUrl, token };
}

/**
 * Resolves py-bash runtime config and validates runtime dependencies.
 */
async function resolveRuntime(context: ResolveRuntimeContext): Promise<ResolvedRuntimeModel> {
  const pyBashSection = (context.rawConfig['py-bash'] ?? {}) as RuntimeValue;
  const pyBashConfig = getPyBashConfigInput(pyBashSection);

  const repoPathInput = context.env.KB_RUN_PY_BASH_PATH || pyBashConfig.repoPath;
  if (!repoPathInput) {
    throw new Error(
      'py-bash runtime requires a repo path. Provide --py-bash or set py-bash.repoPath in runtime/py-bash.yaml.',
    );
  }

  const repoPath = expandHomePath(
    interpolateRuntimeStringValue(
      stripYamlScalarQuotes(repoPathInput),
      'py-bash',
      'py-bash.repoPath',
      context.env,
    ),
  );

  if (!repoPath || repoPath.trim().length === 0) {
    throw new Error(
      'py-bash runtime resolved an empty repo path. Set py-bash.repoPath or pass --py-bash.',
    );
  }

  const dtctlContext = context.env.KB_RUN_DTCTL_CONTEXT;
  if (!dtctlContext) {
    throw new Error('Missing kb-run dtctl context for py-bash runtime setup (KB_RUN_DTCTL_CONTEXT).');
  }

  const setup = await validatePyBashRuntime(repoPath, dtctlContext, context.env);

  const resolvedConfig: PyBashResolvedConfig = {
    repoPath,
    tenantUrl: setup.tenantUrl,
    token: setup.token,
  };

  return {
    runtime: 'py-bash',
    resources: context.rawConfig.resources,
    config: resolvedConfig as unknown as RuntimeValue,
  };
}

/**
 * Renders OpenCode py-bash configuration.
 */
async function renderTarget(context: RenderRuntimeTargetContext): Promise<RuntimeRenderResult> {
  if (context.target !== 'opencode') {
    return { target: context.target, files: [] };
  }

  const config = parseResolvedPyBashConfig(context.resolvedRuntime.config);

  return {
    target: 'opencode',
    files: [
      {
        path: 'opencode.json',
        format: 'json',
        persistence: { mode: 'merge-json' },
        content: {
          mcp: {
            bash: {
              type: 'local',
              command: ['poetry', '-C', config.repoPath, 'run', 'bash-mcp'],
              environment: {
                DT_TENANT_URL: config.tenantUrl,
                DT_TOKEN: config.token,
              },
            },
          },
          permission: {
            bash: 'deny',
          },
        },
      },
    ],
  };
}

/**
 * Runtime module instance for py-bash.
 */
export const pyBashRuntimeModule: RuntimeModule = {
  name: 'py-bash',
  resolveRuntime,
  renderTarget,
};
