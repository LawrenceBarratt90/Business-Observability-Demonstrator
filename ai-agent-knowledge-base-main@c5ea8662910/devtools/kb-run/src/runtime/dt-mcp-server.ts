/**
 * dt-mcp-server runtime implementation.
 *
 * This runtime keeps its YAML schema client-agnostic (`dt-mcp-server.mcp`) and
 * renders target-specific output only in `renderTarget`.
 *
 * Target rendering contract (design-level):
 * - opencode -> `opencode.json` top-level `mcp` + `permission` patch (`merge-json`)
 * - vscode -> `.vscode/mcp.json` top-level `servers` (`replace`)
 * - claude -> `.mcp.json` top-level `mcpServers` (`replace`)
 * - copilot -> `.kb-run/copilot/mcp-config.json` handoff artifact (`replace`) +
 *   activation instructions for `~/.copilot/mcp-config.json`
 *
 * Copilot decision rationale:
 * current public docs emphasize user-scoped MCP configuration and `/mcp add`.
 * This runtime therefore does not assume a project-scoped Copilot MCP config.
 * Instead, kb-run will generate a deterministic handoff artifact and explicit
 * activation steps in scaffold output.
 *
 * Out of scope:
 * GitHub repository coding-agent MCP configuration is not the same surface and
 * must not be conflated with Copilot CLI runtime rendering in this module.
 */

import type {
  DtMcpServerRuntimeConfig,
  RenderRuntimeTargetContext,
  ResolveRuntimeContext,
  ResolvedRuntimeModel,
  RuntimeMcpConfig,
  RuntimeMcpServerDefinition,
  RuntimeModule,
  RuntimeRenderResult,
  RuntimeValue,
} from './types.js';
import { interpolateRuntimeValue } from './types.js';
import { getDtctlContextDetails, resolveDtctlContextToken } from './dtctl.js';

function parseResolvedDtMcpConfig(config: RuntimeValue): DtMcpServerRuntimeConfig {
  const candidate = config as unknown as DtMcpServerRuntimeConfig;
  if (!candidate?.mcp?.servers || typeof candidate.mcp.servers !== 'object') {
    throw new Error('dt-mcp-server runtime resolved invalid MCP config payload.');
  }
  return candidate;
}

function preferExplicitEnv(currentValue: string | undefined, fallbackValue: string): string {
  return currentValue && currentValue.length > 0 ? currentValue : fallbackValue;
}

async function withDtctlInterpolationEnv(env: NodeJS.ProcessEnv): Promise<NodeJS.ProcessEnv> {
  const dtctlContext = env.KB_RUN_DTCTL_CONTEXT;
  if (!dtctlContext) {
    throw new Error(
      'Missing kb-run dtctl context for dt-mcp-server runtime setup (KB_RUN_DTCTL_CONTEXT).',
    );
  }

  const details = getDtctlContextDetails(dtctlContext);
  const token = await resolveDtctlContextToken(dtctlContext, env.TOKEN);

  return {
    ...env,
    KB_RUN_DTCTL_TENANT_URL: preferExplicitEnv(env.KB_RUN_DTCTL_TENANT_URL, details.tenantUrl),
    KB_RUN_DTCTL_TENANT_HOST: preferExplicitEnv(env.KB_RUN_DTCTL_TENANT_HOST, details.tenantHost),
    KB_RUN_DTCTL_TENANT: preferExplicitEnv(env.KB_RUN_DTCTL_TENANT, details.tenant),
    DT_TENANT_URL: preferExplicitEnv(env.DT_TENANT_URL, details.tenantUrl),
    TENANT: preferExplicitEnv(env.TENANT, details.tenant),
    TOKEN: preferExplicitEnv(env.TOKEN, token),
  };
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every((entry) => typeof entry === 'string');
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function validateMcpServer(
  serverName: string,
  definition: unknown,
  runtimeConfigPath: string,
): RuntimeMcpServerDefinition {
  if (!definition || typeof definition !== 'object' || Array.isArray(definition)) {
    throw new Error(
      `Invalid dt-mcp-server config in ${runtimeConfigPath}: mcp.servers.${serverName} must be an object.`,
    );
  }

  const candidate = definition as Record<string, unknown>;
  const transport = candidate.transport;
  if (transport !== 'stdio' && transport !== 'http') {
    throw new Error(
      `Invalid dt-mcp-server config in ${runtimeConfigPath}: mcp.servers.${serverName}.transport must be "stdio" or "http".`,
    );
  }

  if (transport === 'stdio') {
    if (!isStringArray(candidate.command) || candidate.command.length === 0) {
      throw new Error(
        `Invalid dt-mcp-server config in ${runtimeConfigPath}: mcp.servers.${serverName}.command must be a non-empty string array for stdio transport.`,
      );
    }

    if (candidate.env !== undefined && !isStringRecord(candidate.env)) {
      throw new Error(
        `Invalid dt-mcp-server config in ${runtimeConfigPath}: mcp.servers.${serverName}.env must be a string map when provided.`,
      );
    }

    return {
      transport,
      command: candidate.command,
      env: candidate.env as Record<string, string> | undefined,
    };
  }

  if (typeof candidate.url !== 'string' || candidate.url.trim().length === 0) {
    throw new Error(
      `Invalid dt-mcp-server config in ${runtimeConfigPath}: mcp.servers.${serverName}.url must be a non-empty string for http transport.`,
    );
  }

  if (candidate.headers !== undefined && !isStringRecord(candidate.headers)) {
    throw new Error(
      `Invalid dt-mcp-server config in ${runtimeConfigPath}: mcp.servers.${serverName}.headers must be a string map when provided.`,
    );
  }

  return {
    transport,
    url: candidate.url,
    headers: candidate.headers as Record<string, string> | undefined,
  };
}

function validateDtMcpRuntimeConfig(
  config: RuntimeValue,
  runtimeConfigPath: string,
): DtMcpServerRuntimeConfig {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error(
      `Invalid dt-mcp-server config in ${runtimeConfigPath}: section "dt-mcp-server" must be an object.`,
    );
  }

  const candidate = config as Record<string, unknown>;
  const mcp = candidate.mcp;
  if (!mcp || typeof mcp !== 'object' || Array.isArray(mcp)) {
    throw new Error(
      `Invalid dt-mcp-server config in ${runtimeConfigPath}: "dt-mcp-server.mcp" must be an object.`,
    );
  }

  const mcpCandidate = mcp as Record<string, unknown>;
  const servers = mcpCandidate.servers;
  if (!servers || typeof servers !== 'object' || Array.isArray(servers)) {
    throw new Error(
      `Invalid dt-mcp-server config in ${runtimeConfigPath}: "dt-mcp-server.mcp.servers" must be an object.`,
    );
  }

  const serverEntries = Object.entries(servers as Record<string, unknown>);
  if (serverEntries.length === 0) {
    throw new Error(
      `Invalid dt-mcp-server config in ${runtimeConfigPath}: "dt-mcp-server.mcp.servers" must contain at least one server.`,
    );
  }

  const validatedServers: RuntimeMcpConfig['servers'] = {};
  for (const [name, definition] of serverEntries) {
    validatedServers[name] = validateMcpServer(name, definition, runtimeConfigPath);
  }

  return {
    mcp: {
      servers: validatedServers,
    },
  };
}

async function resolveRuntime(context: ResolveRuntimeContext): Promise<ResolvedRuntimeModel> {
  const section = context.rawConfig['dt-mcp-server'];
  if (section === undefined) {
    throw new Error(
      `Invalid runtime config at ${context.runtimeConfigPath}: missing required section "dt-mcp-server".`,
    );
  }

  const interpolationEnv = await withDtctlInterpolationEnv(context.env);

  const interpolated = interpolateRuntimeValue(
    section,
    context.runtime,
    interpolationEnv,
    'dt-mcp-server',
  );

  const validated = validateDtMcpRuntimeConfig(interpolated, context.runtimeConfigPath);

  return {
    runtime: context.runtime,
    resources: context.rawConfig.resources,
    config: validated as unknown as RuntimeValue,
  };
}

function renderOpenCodeMcp(config: DtMcpServerRuntimeConfig): Record<string, unknown> {
  const mcp: Record<string, unknown> = {};

  for (const [name, server] of Object.entries(config.mcp.servers)) {
    if (server.transport === 'stdio') {
      mcp[name] = {
        type: 'local',
        command: server.command,
        environment: server.env,
      };
      continue;
    }

    mcp[name] = {
      type: 'remote',
      url: server.url,
      headers: server.headers,
    };
  }

  return {
    mcp,
    permission: {
      bash: 'deny',
    },
  };
}

function renderVsCodeMcp(config: DtMcpServerRuntimeConfig): Record<string, unknown> {
  const servers: Record<string, unknown> = {};

  for (const [name, server] of Object.entries(config.mcp.servers)) {
    if (server.transport === 'stdio') {
      const [command, ...args] = server.command ?? [];
      servers[name] = {
        type: 'stdio',
        command,
        args,
        env: server.env,
      };
      continue;
    }

    servers[name] = {
      url: server.url,
      headers: server.headers,
    };
  }

  return { servers };
}

function renderClaudeMcp(config: DtMcpServerRuntimeConfig): Record<string, unknown> {
  const mcpServers: Record<string, unknown> = {};

  for (const [name, server] of Object.entries(config.mcp.servers)) {
    if (server.transport === 'stdio') {
      mcpServers[name] = {
        type: 'stdio',
        command: server.command?.[0],
        args: server.command?.slice(1),
        env: server.env,
      };
      continue;
    }

    mcpServers[name] = {
      type: 'http',
      url: server.url,
      headers: server.headers,
    };
  }

  return { mcpServers };
}

function renderCopilotMcp(config: DtMcpServerRuntimeConfig): Record<string, unknown> {
  const mcpServers: Record<string, unknown> = {};

  for (const [name, server] of Object.entries(config.mcp.servers)) {
    if (server.transport === 'stdio') {
      mcpServers[name] = {
        type: 'stdio',
        command: server.command?.[0],
        args: server.command?.slice(1),
        env: server.env,
      };
      continue;
    }

    mcpServers[name] = {
      type: 'http',
      url: server.url,
      headers: server.headers,
    };
  }

  return { mcpServers };
}

/**
 * Design reference examples for follow-up implementation tasks.
 *
 * These JSON shapes are intentionally concrete so implementation can map the
 * generic runtime model without additional product-API research.
 */
const dtMcpServerTargetJsonExamples = {
  opencode: {
    path: 'opencode.json',
    json: {
      mcp: {
        'dt-mcp': {
          type: 'remote',
          url: 'https://<tenant>/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp',
          headers: {
            Authorization: 'Bearer <token>',
          },
        },
      },
      permission: {
        bash: 'deny',
      },
    },
  },
  vscode: {
    path: '.vscode/mcp.json',
    json: {
      servers: {
        'dt-mcp': {
          url: 'https://<tenant>/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp',
          headers: {
            Authorization: 'Bearer <token>',
          },
        },
      },
    },
  },
  claude: {
    path: '.mcp.json',
    json: {
      mcpServers: {
        'dt-mcp': {
          type: 'http',
          url: 'https://<tenant>/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp',
          headers: {
            Authorization: 'Bearer <token>',
          },
        },
      },
    },
  },
  copilot: {
    path: '.kb-run/copilot/mcp-config.json',
    json: {
      mcpServers: {
        'dt-mcp': {
          type: 'http',
          url: 'https://<tenant>/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp',
          headers: {
            Authorization: 'Bearer <token>',
          },
        },
      },
    },
    activation: [
      'Merge/copy this JSON into ~/.copilot/mcp-config.json under top-level mcpServers.',
      'Or run `/mcp add` in Copilot CLI and provide the same URL/header values.',
    ],
  },
} as const;

async function renderTarget(context: RenderRuntimeTargetContext): Promise<RuntimeRenderResult> {
  const config = parseResolvedDtMcpConfig(context.resolvedRuntime.config);

  if (context.target === 'opencode') {
    return {
      target: context.target,
      files: [
        {
          path: 'opencode.json',
          format: 'json',
          persistence: { mode: 'merge-json' },
          content: renderOpenCodeMcp(config),
        },
      ],
    };
  }

  if (context.target === 'vscode') {
    return {
      target: context.target,
      files: [
        {
          path: '.vscode/mcp.json',
          format: 'json',
          persistence: { mode: 'replace' },
          content: renderVsCodeMcp(config),
        },
      ],
    };
  }

  if (context.target === 'claude') {
    return {
      target: context.target,
      files: [
        {
          path: '.mcp.json',
          format: 'json',
          persistence: { mode: 'replace' },
          content: renderClaudeMcp(config),
        },
      ],
    };
  }

  if (context.target === 'copilot') {
    return {
      target: context.target,
      files: [
        {
          path: '.kb-run/copilot/mcp-config.json',
          format: 'json',
          persistence: { mode: 'replace' },
          content: renderCopilotMcp(config),
        },
      ],
      activation: [
        {
          target: 'copilot',
          title: 'Copilot CLI MCP activation (user-scoped)',
          steps: [
            'mkdir -p ~/.copilot',
            'Copy/merge .kb-run/copilot/mcp-config.json into ~/.copilot/mcp-config.json under top-level mcpServers.',
            'Start copilot and run /mcp list to verify the server is available.',
            'Alternative: use /mcp add in Copilot CLI with the same URL/headers from the generated handoff file.',
          ],
        },
      ],
    };
  }

  return {
    target: context.target,
    files: [],
  };
}

export const dtMcpServerRuntimeModule: RuntimeModule = {
  name: 'dt-mcp-server',
  resolveRuntime,
  renderTarget,
};
