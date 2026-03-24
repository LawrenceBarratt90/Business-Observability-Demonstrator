/**
 * Runtime contract entrypoints for kb-run.
 *
 * This module provides runtime discovery conventions and registry utilities
 * used by scaffold/build flows to load runtime config and call runtime modules.
 */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import type { RuntimeName } from '../types.js';
import type { RuntimeConfigFile, RuntimeModule } from './types.js';

/**
 * Canonical runtime names in a deterministic order.
 */
export const RUNTIME_NAMES: readonly RuntimeName[] = ['system-bash', 'py-bash', 'dt-mcp-server'];

/**
 * Runtime config file layout contract, relative to the kb-run root.
 */
export const RUNTIME_CONFIG_LAYOUT = 'runtime/<runtime>.yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Absolute path to the runtime config directory.
 */
export const RUNTIME_CONFIG_DIRECTORY = join(__dirname, '..', '..', 'runtime');

/**
 * Resolves runtime YAML path according to `runtime/<runtime>.yaml` contract.
 *
 * @param runtime - Runtime name to resolve.
 * @returns Absolute path to runtime config file.
 */
export function getRuntimeConfigPath(runtime: RuntimeName): string {
  return join(RUNTIME_CONFIG_DIRECTORY, `${runtime}.yaml`);
}

/**
 * Reads a runtime config YAML file as UTF-8 text.
 *
 * Parsing/validation is intentionally delegated to runtime-loading logic in
 * follow-up tasks; this function enforces only file discovery semantics.
 *
 * @param runtime - Runtime name to load.
 * @returns Raw YAML content.
 */
export async function readRuntimeConfigYaml(runtime: RuntimeName): Promise<string> {
  const configPath = getRuntimeConfigPath(runtime);
  return readFile(configPath, 'utf-8');
}

/**
 * Runtime module registry keyed by canonical runtime name.
 */
export type RuntimeModuleRegistry = Record<RuntimeName, RuntimeModule>;

/**
 * Creates a runtime registry and validates duplicate names.
 *
 * Completeness (all runtimes present) is validated so scaffold integration can
 * fail fast with a clear error when a runtime implementation is missing.
 *
 * @param modules - Runtime modules to register.
 * @returns Runtime registry keyed by runtime name.
 * @throws Error if duplicate or missing runtimes are detected.
 */
export function createRuntimeRegistry(modules: RuntimeModule[]): RuntimeModuleRegistry {
  const entries = new Map<RuntimeName, RuntimeModule>();

  for (const module of modules) {
    if (entries.has(module.name)) {
      throw new Error(`Duplicate runtime module registration for "${module.name}"`);
    }
    entries.set(module.name, module);
  }

  const missing = RUNTIME_NAMES.filter((name) => !entries.has(name));
  if (missing.length > 0) {
    throw new Error(`Missing runtime module implementation(s): ${missing.join(', ')}`);
  }

  return {
    'system-bash': entries.get('system-bash')!,
    'py-bash': entries.get('py-bash')!,
    'dt-mcp-server': entries.get('dt-mcp-server')!,
  };
}

/**
 * Gets a runtime module from a validated registry.
 *
 * @param registry - Registered runtime modules.
 * @param runtime - Selected runtime.
 * @returns Runtime module implementation.
 */
export function getRuntimeModule(
  registry: RuntimeModuleRegistry,
  runtime: RuntimeName,
): RuntimeModule {
  return registry[runtime];
}

export type {
  RenderRuntimeTargetContext,
  ResolveRuntimeContext,
  ResolvedRuntimeModel,
  RuntimeConfigFile,
  RuntimeInterpolationContract,
  RuntimeModule,
  RuntimeRenderResult,
  RuntimeRenderedFile,
  RuntimeScalar,
  RuntimeValue,
} from './types.js';
export {
  RuntimeInterpolationError,
  RUNTIME_INTERPOLATION_CONTRACT,
} from './types.js';
