/**
 * system-bash runtime module.
 *
 * This runtime keeps native bash enabled and only injects runtime-declared
 * resources from `runtime/system-bash.yaml`.
 */

import type {
  RenderRuntimeTargetContext,
  ResolvedRuntimeModel,
  ResolveRuntimeContext,
  RuntimeModule,
  RuntimeRenderResult,
} from './types.js';

/**
 * Resolves system-bash runtime config.
 *
 * @param context - Runtime resolve context.
 * @returns Resolved runtime model.
 */
async function resolveRuntime(context: ResolveRuntimeContext): Promise<ResolvedRuntimeModel> {
  return {
    runtime: 'system-bash',
    resources: context.rawConfig.resources,
    config: {},
  };
}

/**
 * Renders target-specific files for system-bash.
 *
 * system-bash does not modify target configs; native bash remains enabled.
 *
 * @param context - Runtime render context.
 * @returns Empty render result for all targets.
 */
async function renderTarget(context: RenderRuntimeTargetContext): Promise<RuntimeRenderResult> {
  return {
    target: context.target,
    files: [],
  };
}

/**
 * Runtime module instance for system-bash.
 */
export const systemBashRuntimeModule: RuntimeModule = {
  name: 'system-bash',
  resolveRuntime,
  renderTarget,
};
