/**
 * Runtime contract types for kb-run.
 *
 * This module defines:
 * - Canonical runtime config file schema (`devtools/kb-run/runtime/<runtime>.yaml`)
 * - Environment interpolation rules for runtime YAML string values
 * - Runtime module API (resolve + target rendering boundary)
 *
 * Runtime modules should consume generic resolved runtime data and return
 * target-specific render fragments so scaffold logic can stay generic.
 */

import type { RuntimeName, TargetIDE } from '../types.js';

/**
 * Primitive-compatible JSON-like value used by runtime config sections.
 */
export type RuntimeScalar = string | number | boolean | null;

/**
 * Recursive runtime value used for runtime-specific YAML sections.
 */
export type RuntimeValue = RuntimeScalar | RuntimeValue[] | { [key: string]: RuntimeValue };

/**
 * Allowed placeholder formats for runtime string interpolation.
 *
 * Supported syntax:
 * - `${VAR_NAME}`: required env var, throws when missing/unset
 * - `${VAR_NAME:-default}`: optional env var with default fallback
 *
 * Unsupported syntax (must be treated as literal text):
 * - `$VAR_NAME`
 * - `${VAR_NAME-default}`
 * - `${VAR_NAME:?error}`
 */
export interface RuntimeInterpolationContract {
  /** Full syntax reference for user-facing docs and errors. */
  syntax: {
    required: '${VAR_NAME}';
    optionalWithDefault: '${VAR_NAME:-default}';
  };
  /**
   * Interpolation is applied to all YAML string scalar values (including inside
   * arrays and nested objects) but never to object keys.
   */
  appliesTo: 'all-string-values';
  /**
   * Missing required variables fail fast with a named interpolation error that
   * includes runtime, variable name, and YAML path.
   */
  onMissingRequired: 'throw';
  /**
   * Missing optional variables using `${VAR:-default}` resolve to `default`.
   */
  onMissingWithDefault: 'use-default';
}

/**
 * Shared runtime YAML schema loaded from `runtime/<runtime>.yaml`.
 *
 * Notes:
 * - `resources` is generic and may contain any aimgr resource identifiers.
 * - Runtime-specific data stays under dedicated optional sections.
 * - Schema is intentionally client-agnostic (no OpenCode-only fields here).
 */
export interface RuntimeConfigFile {
  /**
   * Runtime identity is derived from the filename (`runtime/<runtime>.yaml`),
   * not from a YAML field.
   */
  /** Arbitrary aimgr resources injected by this runtime. */
  resources: string[];
  /** Optional section for py-bash runtime-specific settings. */
  'py-bash'?: RuntimeValue;
  /** Optional section for dt-mcp-server runtime-specific settings. */
  'dt-mcp-server'?: RuntimeValue;
}

/**
 * Generic MCP server definition for runtime-owned MCP configurations.
 *
 * This shape is client-agnostic and can represent local stdio servers and
 * remote HTTP-based servers. Runtime modules own rendering this generic model
 * into client-specific output (OpenCode, etc.).
 */
export interface RuntimeMcpServerDefinition {
  transport: 'stdio' | 'http';
  command?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
}

/**
 * Generic MCP config shared by runtime schema.
 */
export interface RuntimeMcpConfig {
  servers: Record<string, RuntimeMcpServerDefinition>;
}

/**
 * Runtime-specific config shape for `dt-mcp-server`.
 */
export interface DtMcpServerRuntimeConfig {
  mcp: RuntimeMcpConfig;
}

/**
 * Resolved runtime model after interpolation and runtime-owned validation.
 * This remains target-agnostic and is safe to reuse across clients.
 */
export interface ResolvedRuntimeModel {
  runtime: RuntimeName;
  resources: string[];
  /** Runtime-specific resolved data owned by the runtime implementation. */
  config: RuntimeValue;
}

/**
 * Input provided when resolving runtime config.
 */
export interface ResolveRuntimeContext {
  runtime: RuntimeName;
  runtimeConfigPath: string;
  rawConfig: RuntimeConfigFile;
  env: NodeJS.ProcessEnv;
}

/**
 * Represents a generated target artifact fragment.
 *
 * The scaffold layer decides where/how to persist this artifact.
 */
export interface RuntimeRenderedFile {
  /** Relative path from output root (e.g. `opencode.json`). */
  path: string;
  /** Serialization format used by scaffold writing logic. */
  format: 'json' | 'yaml' | 'text';
  /** Structured or plain output payload. */
  content: unknown;
  /**
   * Persistence strategy consumed by scaffold.
   *
   * - `merge-json`: deep-merge object payload into an existing JSON file
   * - `replace`: overwrite/create file with rendered payload
   *
   * Runtime modules should set this explicitly for design clarity. When omitted,
   * scaffold treats it as `replace` for backward compatibility.
   */
  persistence?: RuntimeRenderedFilePersistence;
}

/**
 * File persistence instructions passed from runtime modules to scaffold.
 */
export interface RuntimeRenderedFilePersistence {
  mode: 'merge-json' | 'replace';
}

/**
 * Optional post-build instructions emitted by runtime modules.
 *
 * This is used when a target requires user-scoped activation steps (for
 * example, Copilot CLI MCP config under `~/.copilot/`).
 */
export interface RuntimeActivationInstruction {
  target: TargetIDE;
  title: string;
  steps: string[];
}

/**
 * Target render output for runtime modules.
 *
 * This keeps runtime setup generic while allowing per-target output.
 */
export interface RuntimeRenderResult {
  target: TargetIDE;
  files: RuntimeRenderedFile[];
  /** Optional human-facing steps scaffold should print after generation. */
  activation?: RuntimeActivationInstruction[];
}

/**
 * Input for runtime target rendering.
 */
export interface RenderRuntimeTargetContext {
  target: TargetIDE;
  resolvedRuntime: ResolvedRuntimeModel;
}

/**
 * Runtime module contract implemented by each runtime implementation.
 *
 * Concrete flow:
 * 1. `resolveRuntime` validates and resolves generic runtime data.
 * 2. `renderTarget` transforms generic runtime data into target-specific files.
 */
export interface RuntimeModule {
  name: RuntimeName;
  resolveRuntime(context: ResolveRuntimeContext): Promise<ResolvedRuntimeModel>;
  renderTarget(context: RenderRuntimeTargetContext): Promise<RuntimeRenderResult>;
}

/**
 * Runtime interpolation failure.
 */
export class RuntimeInterpolationError extends Error {
  constructor(
    public readonly runtime: RuntimeName,
    public readonly variable: string,
    public readonly yamlPath: string,
  ) {
    super(
      `Missing required environment variable "${variable}" while resolving runtime ` +
      `"${runtime}" at "${yamlPath}". Supported syntax: ${'${VAR_NAME}'} or ${'${VAR_NAME:-default}'}.`,
    );
    this.name = 'RuntimeInterpolationError';
  }
}

/**
 * Static interpolation contract constant.
 */
export const RUNTIME_INTERPOLATION_CONTRACT: RuntimeInterpolationContract = {
  syntax: {
    required: '${VAR_NAME}',
    optionalWithDefault: '${VAR_NAME:-default}',
  },
  appliesTo: 'all-string-values',
  onMissingRequired: 'throw',
  onMissingWithDefault: 'use-default',
};

const RUNTIME_ENV_PLACEHOLDER = /\$\{([A-Za-z_][A-Za-z0-9_]*)(?::-(.*?))?\}/g;

/**
 * Interpolates runtime env placeholders in a single string value.
 *
 * @param template - String template that may contain `${VAR}` placeholders.
 * @param runtime - Runtime name used in error context.
 * @param yamlPath - Dot/index path to the string in runtime YAML.
 * @param env - Environment lookup source.
 * @returns Interpolated string.
 * @throws RuntimeInterpolationError when required variables are missing.
 */
export function interpolateRuntimeStringValue(
  template: string,
  runtime: RuntimeName,
  yamlPath: string,
  env: NodeJS.ProcessEnv,
): string {
  return template.replace(
    RUNTIME_ENV_PLACEHOLDER,
    (_match, variable: string, fallback?: string) => {
      const value = env[variable];
      if (value && value.length > 0) {
        return value;
      }
      if (fallback !== undefined) {
        return fallback;
      }
      throw new RuntimeInterpolationError(runtime, variable, yamlPath);
    },
  );
}

/**
 * Recursively interpolates all string scalar values in a runtime config value.
 * Object keys are never interpolated.
 *
 * @param value - Runtime value to interpolate.
 * @param runtime - Runtime name used in error context.
 * @param env - Environment lookup source.
 * @param yamlPath - Path prefix for detailed interpolation errors.
 * @returns Deeply interpolated runtime value.
 */
export function interpolateRuntimeValue(
  value: RuntimeValue,
  runtime: RuntimeName,
  env: NodeJS.ProcessEnv,
  yamlPath: string,
): RuntimeValue {
  if (typeof value === 'string') {
    return interpolateRuntimeStringValue(value, runtime, yamlPath, env);
  }

  if (Array.isArray(value)) {
    return value.map((entry, index) =>
      interpolateRuntimeValue(entry, runtime, env, `${yamlPath}[${index}]`),
    );
  }

  if (value && typeof value === 'object') {
    const output: Record<string, RuntimeValue> = {};
    for (const [key, child] of Object.entries(value)) {
      const childPath = yamlPath ? `${yamlPath}.${key}` : key;
      output[key] = interpolateRuntimeValue(child, runtime, env, childPath);
    }
    return output;
  }

  return value;
}
