# kb-run

CLI tool for building and managing AI agent evaluation environments from the knowledge base.

## Purpose

`kb-run` is a development tool for creating IDE-ready evaluation environments from the knowledge base repository. It helps with:

- **Building environments**: Create ready-to-use agent directories with skills, prompts, and IDE configurations
- **Multi-IDE support**: Generate configurations for OpenCode, GitHub Copilot CLI, Claude, or VSCode
- **Agent integration**: Automatically embed agent-specific instructions via aimgr
- **Quick launch**: Build and launch your IDE in a single command

## Prerequisites

Before using kb-run, ensure you have the following tools installed:

### Required

1. **Node.js** (v20 or later)
   ```bash
   node --version  # Should be v20+
   ```

2. **aimgr** - AI resource manager for installing skills and agents
   ```bash
   # Installation via mise (recommended)
   mise use -g github:dynatrace-oss/ai-config-manager
   
   # Or download from GitHub releases:
   # https://github.com/dynatrace-oss/ai-config-manager/releases
   
   # Verify installation
   aimgr --version
   ```

3. **dtctl** - Dynatrace CLI for environment management
   ```bash
   # Installation via mise (recommended)
   mise use -g github:dynatrace-oss/dtctl
   
   # Or download from GitHub releases:
   # https://github.com/dynatrace-oss/dtctl/releases
   
   # Verify installation
   dtctl version
   ```
   
   Must have at least one configured context:
   ```bash
   dtctl auth login --context=my-tenant
   dtctl config get-contexts  # Verify contexts
   ```

### Optional

- **OpenCode** (if using `--target=opencode`)
- **GitHub Copilot CLI** (if using `--target=copilot`)
- **Claude Desktop / Claude Code** (if using `--target=claude`)
- **Visual Studio Code** (if using `--target=vscode`)
- **Windsurf** (if using `--target=windsurf`)

## Isolated Configuration

**Important**: kb-run uses its own **isolated aimgr configuration** and does NOT interfere with your global aimgr setup.

- **Global config**: `~/.config/aimgr/aimgr.yaml` (untouched)
- **Global repo**: `~/.local/share/ai-config/repo/` (untouched)
- **kb-run config**: `devtools/kb-run/config/aimgr.yaml` (isolated)
- **kb-run repo**: `devtools/kb-run/.aimgr-repo/` (isolated)

This means:
- ✅ kb-run syncs **only from this knowledge base repository**
- ✅ Your global aimgr configuration remains unchanged
- ✅ Builds are reproducible (same resources every time)
- ✅ Safe to share - others get the same isolated environment

## Installation

### Global Installation (Recommended)

Install kb-run globally to use it from anywhere:

```bash
npm install -g @devtools/kb-run
```

After installation, the `kb-run` command will be available globally.

**Important**: When installed globally via npm, you must explicitly specify the knowledge base location using the `--kb-root` parameter because auto-detection cannot find the repository structure. See [npm Install Documentation](docs/npm-install.md) for details.

```bash
# Global install requires --kb-root parameter
kb-run build --kb-root /path/to/ai-agent-knowledge-base --context=dev --agent=dt-sre-agent
```

### Local Development Installation

For development or testing locally:

```bash
cd devtools/kb-run
npm install
npm run build
npm link
```

The `npm link` command creates a global symlink, making `kb-run` available from any directory.

**Benefit**: Auto-detection works with local development installation, so you don't need to specify `--kb-root`:

```bash
# Local development: auto-detection works!
cd /path/to/ai-agent-knowledge-base
kb-run build --context=dev --agent=dt-sre-agent
```

### Uninstallation

To uninstall the global package:

```bash
npm uninstall -g @devtools/kb-run
```

Or to unlink a local development version:

```bash
npm unlink -g @devtools/kb-run
```

### Installation Comparison

| Aspect | Global Install | Local Development |
|--------|---------------|-------------------|
| **Auto-detection** | ❌ Requires --kb-root | ✅ Works automatically |
| **Convenience** | Available anywhere | Only in repo |
| **Use case** | Production usage | Development & testing |

For detailed information, see [npm Install Documentation](docs/npm-install.md).

## Quick Start

The simplest way to get started is with interactive mode - just run the command without arguments:

```bash
# Interactive mode - prompts for all required options
kb-run build

# Or to build and launch in one step
kb-run start
```

Interactive mode will guide you through:
1. **Package selection** - Choose from built-in packages (default: dt-knowledge-base-all)
2. **Tenant selection** - Select your Dynatrace environment (dtctl context)
3. **Agent selection** - Pick an AI agent from aimgr repository
4. **Target selection** - Choose your IDE (opencode, copilot, claude, or vscode)

**Example interactive session:**
```
$ kb-run build

🔧 Interactive Mode

? Select a knowledge base package: dt-knowledge-base-all
? Select a Dynatrace tenant (dtctl context): nrg77339 (current) - https://...
? Select an AI agent: dt-sre-agent - SRE automation agent
? Select target IDE: opencode (default) - Open in OpenCode

✓ Configuration complete

Building agent context with options:
  Context: nrg77339
  Agent: dt-sre-agent
  Target: opencode
  Package: /path/to/packages/dt-knowledge-base-all.yaml
  Output: /tmp/kb-run/nrg77339/dt-sre-agent
...
```

For non-interactive usage with explicit parameters, see the command reference below.

## Usage

## Runtime Model

kb-run now uses an explicit runtime model.

Available runtimes:

- `system-bash` — default runtime; native bash remains enabled
- `py-bash` — disables native bash in OpenCode and replaces it with the py-bash MCP backend
- `dt-mcp-server` — disables native bash in OpenCode and configures a Dynatrace MCP server from runtime YAML

Runtime selection is explicit:

```bash
kb-run build --runtime=system-bash ...
kb-run build --runtime=py-bash ...
kb-run build --runtime=dt-mcp-server ...
```

### Runtime File Layout

Runtime conventions live under:

```text
devtools/kb-run/runtime/
  system-bash.yaml
  py-bash.yaml
  dt-mcp-server.yaml
```

Each runtime file can inject arbitrary aimgr resources via top-level `resources:`:

```yaml
resources:
  - skill/self-reflection
  - skill/dynatrace-control
  - agent/example-agent
```

Runtime-specific sections are optional and should only be present when a runtime has real configuration.

- `system-bash.yaml` normally contains only `resources:`
- `py-bash.yaml` may contain a `py-bash:` section
- `dt-mcp-server.yaml` may contain a `dt-mcp-server:` section

The runtime name comes from the filename, not from a YAML field.

### Runtime YAML Environment Variables

All runtime YAML string values support environment-variable interpolation:

- `${VAR_NAME}` — required, fails if unset or empty
- `${VAR_NAME:-default}` — optional, uses `default` when unset

For `dt-mcp-server`, kb-run also injects dtctl-derived values before interpolation
using the selected `--context`:

- `${TENANT}` or `${KB_RUN_DTCTL_TENANT}` — tenant identifier derived from the dtctl Environment hostname
- `${DT_TENANT_URL}` or `${KB_RUN_DTCTL_TENANT_URL}` — full Environment URL from dtctl
- `${KB_RUN_DTCTL_TENANT_HOST}` — Environment hostname from dtctl
- `${TOKEN}` — bearer token from explicit env var or resolved via dtctl token-ref in the OS credential store

When both an explicit environment variable and a dtctl-derived value exist, the
explicit environment variable wins.

For token resolution, kb-run uses this precedence:

1. `TOKEN`
2. dtctl context `TokenRef` resolved from the OS credential store

Currently supported credential backends:

- Linux — Secret Service / gnome-keyring
- macOS — Keychain

Examples:

```yaml
py-bash:
  repoPath: ${DT_MCP_SERVERS_PATH:-~/dev/dt-mcp-servers}
```

```yaml
dt-mcp-server:
  mcp:
    servers:
      dre63214-mcp:
        transport: http
        url: ${DT_TENANT_URL}/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp
        headers:
          Authorization: Bearer ${TOKEN}
```

This means a dtctl context like:

```text
nrg77339 -> https://nrg77339.dev.apps.dynatracelabs.com
```

automatically resolves to:

```text
https://nrg77339.dev.apps.dynatracelabs.com/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp
```

### Runtime Behavior

#### `system-bash`

- keeps native bash enabled
- injects resources from `runtime/system-bash.yaml`
- typically includes `skill/dynatrace-control`

#### `py-bash`

- disables native bash in OpenCode
- configures the `bash` MCP replacement in `opencode.json`
- does **not** inject `dynatrace-control` unless explicitly listed in `resources:`
- gets the py-bash repo path from:
  1. `--py-bash <path>` if provided
  2. otherwise `runtime/py-bash.yaml` → `py-bash.repoPath`

#### `dt-mcp-server`

- disables native bash in OpenCode
- reads generic MCP server configuration from `runtime/dt-mcp-server.yaml`
- injects dtctl-derived tenant values from the selected `--context` before runtime interpolation
- resolves `${TOKEN}` from the environment or dtctl credentials for the selected context
- use `${DT_TENANT_URL}` when you want the MCP gateway URL to inherit the exact dtctl environment domain
- renders that generic MCP config into target-specific MCP artifacts
- does **not** inject `dynatrace-control` unless explicitly listed in `resources:`

### `dt-mcp-server` Target Artifact Contract (Design)

Runtime YAML remains client-agnostic. Rendering is target-specific.

Resolved Dynatrace HTTP MCP server inputs (example):

- server name: `dt-mcp`
- URL: `https://<tenant>/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp`
- header: `Authorization: Bearer <token>`

#### OpenCode (`opencode.json`, top-level `mcp` + `permission`)

```json
{
  "mcp": {
    "dt-mcp": {
      "type": "remote",
      "url": "https://<tenant>/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp",
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  },
  "permission": {
    "bash": "deny"
  }
}
```

#### VS Code (`.vscode/mcp.json`, top-level `servers`)

```json
{
  "servers": {
    "dt-mcp": {
      "url": "https://<tenant>/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp",
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  }
}
```

#### Claude (`.mcp.json`, top-level `mcpServers`)

```json
{
  "mcpServers": {
    "dt-mcp": {
      "type": "http",
      "url": "https://<tenant>/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp",
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  }
}
```

#### Copilot CLI (handoff artifact + user-scoped activation)

Official Copilot CLI docs currently emphasize user-scoped MCP config
(`~/.copilot/mcp-config.json`) and interactive `/mcp add`. Therefore kb-run's
design contract is:

- Generate deterministic handoff artifact at `.kb-run/copilot/mcp-config.json`
- Use top-level `mcpServers` schema in that artifact
- Print exact activation steps for copying/merging into `~/.copilot/mcp-config.json`
  or adding via `/mcp add`

Handoff artifact example:

```json
{
  "mcpServers": {
    "dt-mcp": {
      "type": "http",
      "url": "https://<tenant>/platform-reserved/mcp-gateway/v0.1/servers/dynatrace-mcp/mcp",
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  }
}
```

#### Scope boundaries

- GitHub repository coding-agent MCP configuration is **out of scope** for this
  kb-run runtime contract. It is a different configuration surface and schema.

### Runtime Render/Persistence Boundary (Design)

`src/runtime/dt-mcp-server.ts` returns target render output as `files[]` with
file path, payload format, and persistence mode (`merge-json` or `replace`).
`src/scaffold.ts` is responsible for generic persistence of those rendered
runtime files independent of target:

1. Iterate `runtimeRenderedFiles`
2. Create parent directories as needed
3. Apply persistence mode:
   - `merge-json` for patching existing files (OpenCode)
   - `replace` for target-owned files (`.vscode/mcp.json`, `.mcp.json`, Copilot handoff)
4. Print runtime-provided activation instructions when present (Copilot)

### Available Commands

```bash
kb-run <command> [options]

Commands:
  build             Build an evaluation environment for testing skills
  start             Build and launch IDE in agent context directory
  
Options:
  -h, --help        Display help for command
  -V, --version     Display version
```

### Build Command

The `build` command creates a complete evaluation environment with:
- IDE-specific configuration (OpenCode, Copilot CLI, Claude, VSCode, or Windsurf)
- All skills and resources from a package file installed via aimgr
- AGENTS.md based on the base prompt, with agent behavior added where the target does not load agents natively
- Target-specific configuration files and prompts

**Usage:**
```bash
# Interactive mode (recommended for first-time use)
kb-run build

# Non-interactive with all options specified
kb-run build --context=<name> --agent=<name> [package options] [options]
```

**Required Arguments** (automatically prompted in interactive mode):
- `--context <name>` - dtctl context name (identifies the Dynatrace environment)
- `--agent <name>` - agent identifier from aimgr repository (e.g., `dt-sre-agent`)

**Package Selection** (choose one, defaults to dt-knowledge-base-all):
- `--package <name>` - Use a built-in package from the `packages/` directory (e.g., `dt-knowledge-base-all`)
- `--package-file <path>` - Use a custom ai.package.yaml file from a specific path

**Optional Arguments:**
- `--output <path>` - output directory (defaults to `/tmp/kb-run/<context>/<agent>`)
- `--target <type>` - target IDE: `opencode`, `copilot`, `claude`, `vscode`, or `windsurf` (defaults to `opencode`)
- `--runtime <name>` - runtime: `system-bash`, `py-bash`, or `dt-mcp-server`
- `--update-mode <mode>` - existing dir handling: `replace`, `prompt`, `skip`, or `fail`
- `--base-prompt <path>` - base prompt file (defaults to `knowledge-base/system-prompt/SingleTenantPrompt.md`)

**Examples:**
```bash
# Interactive mode - easiest way to get started
kb-run build

# Use default built-in package (dt-knowledge-base-all)
kb-run build --context=abc12345 --agent=dt-sre-agent

# Use specific built-in package
kb-run build --context=abc12345 --agent=dt-sre-agent --package=dt-knowledge-base-all

# Use custom package file
kb-run build --context=abc12345 --agent=dt-sre-agent --package-file=./monitoring.yaml

# Build for GitHub Copilot
kb-run build --context=prod-eu --agent=dt-dt-main-agent --package=dt-knowledge-base-all --target=copilot

# Build for Claude with custom output
kb-run build --context=dev --agent=dt-critical-incident-agent --package=dt-knowledge-base-all --target=claude --output=./my-agents

# Explicit runtime selection (default is system-bash)
kb-run build --context=test --agent=dt-sre-agent --package=dt-knowledge-base-all --runtime=system-bash
```

**Generated Structure:**

The structure varies by `--target`:

**OpenCode (`--target=opencode`):**
```
/tmp/kb-run/<context>/<agent>/
├── .opencode/
│   └── skills/             # Installed skills (via aimgr)
├── AGENTS.md               # Base prompt only (agent loaded natively by OpenCode)
├── ai.package.yaml
├── opencode.json
```

**Copilot (`--target=copilot`):**
```
/tmp/kb-run/<context>/<agent>/
├── .github/
│   └── skills/             # Installed skills (via aimgr)
├── .kb-run/
│   └── copilot/
│       └── mcp-config.json # dt-mcp-server runtime handoff artifact
├── AGENTS.md               # Base prompt + agent instructions
├── ai.package.yaml
```

**Claude (`--target=claude`):**
```
/tmp/kb-run/<context>/<agent>/
├── .claude/
│   └── skills/             # Installed skills (via aimgr)
├── .mcp.json               # dt-mcp-server runtime MCP config
├── AGENTS.md               # Base prompt + agent instructions
├── ai.package.yaml
```

**VSCode (`--target=vscode`):**
```
/tmp/kb-run/<context>/<agent>/
├── .github/
│   └── skills/             # Installed skills (via aimgr)
├── .vscode/
│   ├── mcp.json            # dt-mcp-server runtime MCP config
│   └── settings.json       # VS Code settings generated by kb-run
├── AGENTS.md               # Base prompt + agent instructions
├── ai.package.yaml
```

**Windsurf (`--target=windsurf`):**
```
/tmp/kb-run/<context>/<agent>/
├── .windsurf/
│   └── skills/             # Installed skills (via aimgr)
├── AGENTS.md               # Base prompt + agent instructions
├── ai.package.yaml
```

**Note on Agent Instructions:**
When `--agent` is provided, kb-run applies agent behavior differently depending on the target:
1. **OpenCode** loads the selected agent natively, so `AGENTS.md` contains the base prompt only.
2. **Other targets** use aimgr to locate the agent markdown file and concatenate it with the base prompt in `AGENTS.md`.

If the agent is not found in aimgr for a target that embeds agent instructions, only the base prompt is used (with a warning).

### Start Command

The `start` command builds the environment (if needed) and launches the IDE in one step.

**Usage:**
```bash
# Interactive mode (recommended)
kb-run start

# Non-interactive with explicit parameters
kb-run start --context=<name> --agent=<name> [package options] [options]
```

**Required Arguments** (automatically prompted in interactive mode):
- `--context <name>` - dtctl context name (identifies the Dynatrace environment)
- `--agent <name>` - agent identifier from aimgr repository

**Package Selection** (choose one, defaults to dt-knowledge-base-all):
- `--package <name>` - Use a built-in package (e.g., `dt-knowledge-base-all`)
- `--package-file <path>` - Use a custom ai.package.yaml file

**Optional Arguments:**
- `--output <path>` - output directory (defaults to `/tmp/kb-run/<context>/<agent>`)
- `--target <type>` - target IDE: `opencode`, `copilot`, `claude`, `vscode`, or `windsurf` (defaults to `opencode`)
- `--runtime <name>` - runtime: `system-bash`, `py-bash`, or `dt-mcp-server`
- `--update-mode <mode>` - existing dir handling: `replace`, `prompt`, `skip`, or `fail`
- `--base-prompt <path>` - base prompt file (defaults to `knowledge-base/system-prompt/SingleTenantPrompt.md`)
- `--non-interactive` - disable interactive mode (requires all arguments)

**Behavior:**
1. If required arguments are missing and `--non-interactive` is NOT set: enters interactive mode
2. Checks if output directory exists
3. Applies `--update-mode` rules to decide whether to rebuild or reuse the directory
4. If needed, builds the environment before launch
5. **Automatically switches dtctl context** to match the selected tenant (ensures dtctl commands target correct environment)
6. Launches appropriate IDE command based on `--target`

**Important Note on dtctl Context:**
The `start` command automatically switches your dtctl context to match the `--context` parameter before launching the IDE. This ensures that any dtctl commands you run within the IDE target the correct Dynatrace environment. If dtctl is not installed, a warning is displayed but the IDE still launches.

**Examples:**
```bash
# Interactive mode - easiest way to get started
kb-run start

# Build and launch OpenCode with built-in package
kb-run start --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all

# Reuse existing directory if it exists
kb-run start --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all --update-mode=skip

# Rebuild and launch
kb-run start --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all --update-mode=replace

# Use custom package file
kb-run start --context=dev --agent=dt-sre-agent --package-file=./monitoring.yaml

# Launch GitHub Copilot
kb-run start --context=prod --agent=dt-dt-main-agent --package=dt-knowledge-base-all --target=copilot

# Launch Claude
kb-run start --context=test --agent=dt-critical-incident-agent --package=dt-knowledge-base-all --target=claude

# Non-interactive mode (requires all arguments)
kb-run start --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all --non-interactive
```

**IDE Launch Commands:**
- **OpenCode**: `opencode` (launched in output directory)
- **Copilot CLI**: `copilot` (launched in output directory)
- **Claude**: `claude` or manual launch instructions if CLI not available
- **VSCode**: `code` (launched in output directory)

## Package Management

kb-run uses package files to define which skills and resources to install in your agent environment. You can use built-in packages or create custom ones.

### Built-in Packages

Built-in packages are located in the `packages/` directory and can be used by name:

**Available packages:**
- **dt-knowledge-base-all** (default) - Dynatrace knowledge base with candidate and planned public resources
  - Includes: `package/dynatrace-candidate`, `package/dynatrace-planned`
  - Best for: Full public Dynatrace knowledge-base install
- **dt-knowledge-base-planned** - Only planned public Dynatrace resources
  - Includes: `package/dynatrace-planned`
  - Best for: Planned-only installs
- **dt-knowledge-base-and-self-monitoring** - Full public Dynatrace knowledge base plus self-monitoring
  - Includes: `package/dynatrace-candidate`, `package/dynatrace-planned`, `package/dynatrace-self-monitoring`
  - Best for: Full install plus internal self-monitoring workflows

### Using Packages

**Option 1: Use a built-in package (recommended)**
```bash
# Use the default built-in package (dt-knowledge-base-all)
kb-run build --context=dev --agent=dt-sre-agent

# Explicitly specify a built-in package
kb-run build --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all
```

**Option 2: Use a custom package file**
```bash
# Use a custom ai.package.yaml file
kb-run build --context=dev --agent=dt-sre-agent --package-file=./my-custom.yaml
```

**Important:** You cannot use both `--package` and `--package-file` at the same time. Choose one approach.

### Creating Custom Packages

Custom packages are YAML files that define resources to install:

**Example custom package:**
```yaml
# my-custom.yaml
resources:
  - skill/dt-dql-essentials
  - skill/dt-app-dashboard
  - skill/dt-infra-kubernetes
  - package/dynatrace-candidate
  - package/dynatrace-planned
```

**Resource types:**
- `skill/<name>` - Individual skill from aimgr repository
- `package/<name>` - Package of multiple skills/resources from aimgr
- `command/<name>` - Custom command from aimgr

**Usage:**
```bash
kb-run build --context=dev --agent=my-agent --package-file=./my-custom.yaml
```

### Package vs Package-File

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `--package <name>` | Use built-in package by name | `--package=dt-knowledge-base-all` |
| `--package-file <path>` | Use custom package file | `--package-file=./custom.yaml` |
| (neither) | Interactive mode or defaults to dt-knowledge-base-all | - |

## Interactive Mode

Interactive mode makes kb-run easier to use by prompting for required parameters instead of requiring them on the command line.

### When Interactive Mode Triggers

Interactive mode automatically activates when:
- The `start` command is used without `--context` or `--agent` arguments
- The `build` command is used without `--context` or `--agent` arguments

To disable interactive mode and require all arguments, use the `--non-interactive` flag.

### Interactive Prompt Flow

Interactive mode guides you through four selections:

**1. Package Selection**
```
? Select a knowledge base package:
  ❯ dt-knowledge-base-all
    dt-knowledge-base-planned
    dt-knowledge-base-and-self-monitoring
    (shows all .yaml files from packages/ directory)
```
- Lists all built-in packages from the `packages/` directory
- Default: `dt-knowledge-base-all`
- Skipped if `--package` or `--package-file` is already specified

**2. Tenant Selection**
```
? Select a Dynatrace tenant (dtctl context):
  ❯ nrg77339 (current) - https://nrg77339.apps.dynatrace.com
    xyz98765 - https://xyz98765.apps.dynatrace.com
```
- Lists all configured dtctl contexts
- Shows environment URL for each context
- Highlights the current context
- Requires dtctl to be installed and authenticated

**3. Agent Selection**
```
? Select an AI agent:
  ❯ dt-sre-agent - SRE automation agent
    dt-dt-main-agent - Dynatrace Platform Orchestrator
    dt-critical-incident-agent - Critical incident response agent
    (shows all agents from aimgr repository)
```
- Lists all available agents from aimgr repository
- Shows agent descriptions
- Requires aimgr to be installed and configured

**4. Target Selection**
```
? Select target IDE:
  ❯ opencode (default) - Open in OpenCode
    copilot - Open in GitHub Copilot CLI
    claude - Open in Claude Code
    vscode - Open in Visual Studio Code (uses GitHub Copilot extension)
```
- Choose which IDE to configure for
- Default: `opencode`

**5. Runtime Selection**
- Choose runtime: `system-bash`, `py-bash`, or `dt-mcp-server`
- Default: `system-bash`

### Interactive Mode Examples

**Full interactive session:**
```bash
$ kb-run start

🔧 Interactive Mode

? Select a knowledge base package: dt-knowledge-base-all
? Select a Dynatrace tenant (dtctl context): nrg77339 (current) - https://...
? Select an AI agent: dt-sre-agent - SRE automation agent
? Select target IDE: opencode (default) - Open in OpenCode

✓ Configuration complete

Building agent context with options:
  Context: nrg77339
  Agent: dt-sre-agent
  Target: opencode
  Package: /path/to/packages/dt-knowledge-base-all.yaml
  Output: /tmp/kb-run/nrg77339/dt-sre-agent
...
✓ Build complete!
Launching opencode in /tmp/kb-run/nrg77339/dt-sre-agent...
```

**Partial interactive (some args provided):**
```bash
$ kb-run start --context=dev --package=dt-knowledge-base-all

🔧 Interactive Mode

? Select an AI agent: dt-sre-agent - SRE automation agent
? Select target IDE: opencode (default) - Open in OpenCode

✓ Configuration complete
...
```

**Disable interactive mode:**
```bash
$ kb-run start --non-interactive

Error: Missing required arguments: --context and --agent are required in non-interactive mode

$ kb-run start --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all --non-interactive
✓ Build complete!
```

### Interactive Mode Requirements

For interactive mode to work properly, ensure these tools are installed and configured:

- **dtctl** - For tenant/context selection
  ```bash
  # Install and authenticate
  dtctl auth login --context=mycontext
  ```

- **aimgr** - For agent selection and skill installation
  ```bash
  # Install globally
  mise use -g github:dynatrace-oss/ai-config-manager
  
  # Sync repository
  aimgr sync
  ```

If these tools are not available, you can still use non-interactive mode with explicit arguments.

## IDE Support

kb-run supports five IDE/agent platforms with different configuration approaches:

### OpenCode

**Configuration:**
- Skills installed to `.opencode/skills/` via aimgr
- `AGENTS.md` contains the base prompt only; OpenCode loads the selected agent natively
- `opencode.json` generated for default agent selection and runtime-specific OpenCode config

**How it works:**
- OpenCode discovers skills from `.opencode/skills/` directory
- OpenCode uses `opencode.json` plus native agent loading; `AGENTS.md` contains the base prompt only
- Skills are automatically available in the IDE

**Launch:**
```bash
# Interactive mode
kb-run start
# (select opencode as target)

# Non-interactive
kb-run start --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all --target=opencode

# Or manually: cd /tmp/kb-run/dev/dt-sre-agent && opencode
```

### GitHub Copilot CLI

> **Note:** The `copilot` target refers to the [GitHub Copilot CLI](https://github.com/github/copilot-cli) command-line tool (`copilot` command), NOT the GitHub Copilot IDE extension or VSCode. The CLI provides a terminal-based chat interface for AI assistance.

**Configuration:**
- Skills installed to `.github/skills/` via aimgr
- Agent instructions embedded directly in `AGENTS.md`
- For `--runtime=dt-mcp-server`: generates `.kb-run/copilot/mcp-config.json` as a deterministic handoff artifact
- Copilot CLI MCP remains user-scoped (`~/.copilot/mcp-config.json`), so kb-run prints activation steps

**How it works:**
- Copilot CLI reads `AGENTS.md` for all instructions
- The concatenated prompt provides both base system prompt and agent-specific behavior
- Skills are discovered from the standard `.github/skills/` location
- `dt-mcp-server` runtime uses generated handoff JSON (`.kb-run/copilot/mcp-config.json`) with top-level `mcpServers`
- You must copy/merge that handoff JSON into `~/.copilot/mcp-config.json` (or use `/mcp add` with equivalent values)
- This is distinct from GitHub repository coding-agent MCP configuration (`.github/*`), which is a different schema and workflow

**Launch:**
```bash
# Interactive mode
kb-run start
# (select copilot as target)

# Non-interactive
kb-run start --context=prod --agent=dt-dt-main-agent --package=dt-knowledge-base-all --target=copilot

# Or manually: cd /tmp/kb-run/prod/dt-dt-main-agent && copilot
```

### Claude

**Configuration:**
- Skills installed to `.claude/skills/` via aimgr
- Agent instructions embedded directly in `AGENTS.md`
- For `--runtime=dt-mcp-server`: generates `.mcp.json` with top-level `mcpServers`

**How it works:**
- Claude reads `AGENTS.md` for all instructions
- The concatenated prompt provides both base system prompt and agent-specific behavior
- Skills are discovered from the `.claude/skills/` location
- Claude Desktop/Code can read `.mcp.json` for MCP server configuration

**Launch:**
```bash
# Interactive mode
kb-run start
# (select claude as target)

# Non-interactive
kb-run start --context=test --agent=dt-critical-incident-agent --package=dt-knowledge-base-all --target=claude

# Or manually: cd /tmp/kb-run/test/dt-critical-incident-agent && claude
```

**Note:** Claude's command-line launcher may vary depending on your installation. If `claude` is not available, manually open Claude in the output directory.

### VSCode (with GitHub Copilot Extension)

> **Note:** The `vscode` target launches Visual Studio Code with the GitHub Copilot **extension**, NOT the Copilot CLI. This provides an IDE-based experience with Copilot assistance, unlike the terminal-based Copilot CLI.

**Configuration:**
- Skills installed to `.github/skills/` via aimgr (same as Copilot CLI skill layout)
- Agent instructions embedded directly in `AGENTS.md`
- Uses the GitHub Copilot extension inside VSCode
- Generates `.vscode/settings.json`
- For `--runtime=dt-mcp-server`: generates `.vscode/mcp.json` with top-level `servers`

**How it works:**
- VSCode launches with the GitHub Copilot extension active
- The extension discovers skills from `.github/skills/`
- Agent reads `AGENTS.md` for instructions
- Users interact with Copilot through VSCode's chat interface

**Launch:**
```bash
# Interactive mode
kb-run start
# (select vscode as target)

# Non-interactive
kb-run start --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all --target=vscode

# Or manually: cd /tmp/kb-run/dev/dt-sre-agent && code .
```

**Requirements:**
- Visual Studio Code installed with `code` command available
- GitHub Copilot extension installed and authenticated

### Windsurf

**Configuration:**
- Skills installed to `.windsurf/skills/` via aimgr
- Agent instructions embedded directly in `AGENTS.md`
- No IDE-specific config file needed today

**How it works:**
- Windsurf discovers skills from `.windsurf/skills/`
- Agent reads `AGENTS.md` for instructions
- Users launch Windsurf in the generated directory

**Launch:**
```bash
# Interactive mode
kb-run start
# (select windsurf as target)

# Non-interactive
kb-run start --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all --target=windsurf

# Or manually: cd /tmp/kb-run/dev/dt-sre-agent && surf
```

### Choosing an IDE

**Use OpenCode when:**
- You prefer a VSCode-like experience
- You want a terminal-based AI coding assistant
- You're working primarily with code projects

**Use GitHub Copilot CLI when:**
- You prefer a terminal-based workflow with the `copilot` command-line tool
- You want quick, command-line interactions for questions and tasks
- You need GitHub integration
- Note: This is the terminal-based Copilot CLI, not the VSCode extension

**Use Claude when:**
- You prefer Claude's conversational style
- You want advanced reasoning capabilities
- You're doing complex analysis or planning

**Use VSCode (with Copilot extension) when:**
- You prefer working in Visual Studio Code
- You want IDE integration with GitHub Copilot
- You need full IDE features (debugging, extensions, etc.)
- You want a visual interface vs terminal-based tools
- Note: This uses the VSCode extension, different from the terminal-based Copilot CLI

## Knowledge Base Path Resolution

kb-run needs to locate the knowledge base directory to access skills, prompts, and resources. It can automatically detect the location or use an explicit path.

### What is the "KB Root"?

The **KB root** is the `knowledge-base/` directory itself (not the repository root). This directory contains:
- `system-prompt/` - Base system prompts
- `dynatrace/` - Dynatrace platform documentation
- `dynatrace-dev/` - Development resources
- `dynatrace-internal-dev/` - Internal development resources
- `dynatrace-internal-sfm/` - SFM-specific resources

### Auto-Detection (Default)

When `--kb-root` is not specified, kb-run automatically attempts to find the knowledge base using a two-step process:

**Step 1: Check if current directory is the KB root**
```bash
# Running from inside the knowledge-base directory itself
cd /path/to/ai-agent-knowledge-base/knowledge-base
kb-run build --context=dev --agent=dt-sre-agent
# ✓ Auto-detected KB root: /path/to/ai-agent-knowledge-base/knowledge-base
```

**Step 2: Check if current directory contains knowledge-base/ subdirectory**
```bash
# Running from repository root
cd /path/to/ai-agent-knowledge-base
kb-run build --context=dev --agent=dt-sre-agent
# ✓ Auto-detected KB root: /path/to/ai-agent-knowledge-base/knowledge-base
```

**Auto-detection works when running from:**
- The knowledge-base directory itself
- The repository root (parent of knowledge-base/)
- Any directory that has a knowledge-base/ subdirectory

**Auto-detection fails when:**
- Running from nested subdirectories (e.g., `devtools/kb-run/`)
- Running from unrelated directories
- kb-run is installed globally via npm (see troubleshooting below)

### Explicit Path with --kb-root

Use `--kb-root` to explicitly specify the knowledge base location:

```bash
# Specify absolute path
kb-run build --kb-root /path/to/ai-agent-knowledge-base/knowledge-base \
  --context=prod --agent=monitor

# Specify relative path
kb-run build --kb-root ../../knowledge-base \
  --context=dev --agent=dt-sre-agent
```

**When to use --kb-root:**
- Running from nested subdirectories where auto-detection fails
- Running kb-run installed via `npm install -g` (required)
- Running from outside the repository
- Being explicit about which knowledge base to use

### Validation Requirements

For a path to be considered a valid KB root, it must contain:

**Required directories:**
- `system-prompt/`
- `dynatrace/`
- `dynatrace-dev/`
- `dynatrace-internal-dev/`
- `dynatrace-internal-sfm/`

**Required files:**
- `system-prompt/SingleTenantPrompt.md`

If any of these are missing, the path is not considered a valid KB root.

### Examples

**Example 1: Running from repository root (auto-detection)**
```bash
cd /path/to/ai-agent-knowledge-base
kb-run build --context=dev --agent=dt-sre-agent

# Output:
#    Checking if CWD is KB root: /path/to/ai-agent-knowledge-base
#    Checking if CWD/knowledge-base is KB root: /path/to/ai-agent-knowledge-base/knowledge-base
# ✓ Auto-detected KB root: /path/to/ai-agent-knowledge-base/knowledge-base
```

**Example 2: Running from knowledge-base directory (auto-detection)**
```bash
cd /path/to/ai-agent-knowledge-base/knowledge-base
kb-run build --context=dev --agent=dt-sre-agent

# Output:
#    Checking if CWD is KB root: /path/to/ai-agent-knowledge-base/knowledge-base
# ✓ Auto-detected KB root: /path/to/ai-agent-knowledge-base/knowledge-base
```

**Example 3: Running from nested directory (requires --kb-root)**
```bash
cd /path/to/ai-agent-knowledge-base/devtools/kb-run
kb-run build --context=dev --agent=dt-sre-agent

# Output:
#    Checking if CWD is KB root: /path/to/ai-agent-knowledge-base/devtools/kb-run
#    Checking if CWD/knowledge-base is KB root: /path/to/ai-agent-knowledge-base/devtools/kb-run/knowledge-base
#    Attempted paths: ...
# Error: Could not auto-detect knowledge base root. Please use --kb-root parameter.

# Solution: Use --kb-root
kb-run build --kb-root ../../knowledge-base --context=dev --agent=dt-sre-agent
```

**Example 4: Global npm install (requires --kb-root)**
```bash
# After: npm install -g kb-run
kb-run build --context=dev --agent=dt-sre-agent

# Error: Auto-detection fails with global installs

# Solution: Always use --kb-root
kb-run build --kb-root /path/to/ai-agent-knowledge-base/knowledge-base \
  --context=dev --agent=dt-sre-agent
```

### Troubleshooting KB Path Issues

**Problem: "Could not auto-detect knowledge base root"**

This means kb-run checked both the current directory and `./knowledge-base/` subdirectory, but neither was a valid KB root.

**Solutions:**
1. Navigate to the repository root or knowledge-base directory:
   ```bash
   cd /path/to/ai-agent-knowledge-base
   kb-run build --context=dev --agent=dt-sre-agent
   ```

2. Use `--kb-root` to specify the path explicitly:
   ```bash
   kb-run build --kb-root /path/to/ai-agent-knowledge-base/knowledge-base \
     --context=dev --agent=dt-sre-agent
   ```

**Problem: "Invalid knowledge base structure: missing system-prompt/ subdirectory"**

You specified a path that doesn't contain the required knowledge base structure.

**Solution:** Make sure you're pointing to the `knowledge-base/` directory itself, not the repository root:
```bash
# ❌ Wrong - pointing to repository root
kb-run build --kb-root /path/to/ai-agent-knowledge-base --context=dev --agent=dt-sre-agent

# ✅ Correct - pointing to knowledge-base directory
kb-run build --kb-root /path/to/ai-agent-knowledge-base/knowledge-base --context=dev --agent=dt-sre-agent
```

## Troubleshooting

### Global npm Install: Auto-Detection Doesn't Work

**Problem:** After running `npm install -g kb-run`, commands fail with "Cannot find knowledge base" or "Cannot find package file"

**Cause:** Global npm installation breaks auto-detection because the tool is installed separately from the knowledge base repository.

**Solution:** Always use the `--kb-root` parameter with global installations:
```bash
# Global install requires --kb-root
kb-run build --kb-root /path/to/ai-agent-knowledge-base --context=dev --agent=dt-sre-agent
```

**Alternative:** Use local development installation for auto-detection:
```bash
cd /path/to/ai-agent-knowledge-base/devtools/kb-run
npm install && npm run build && npm link

# Now auto-detection works
cd /path/to/ai-agent-knowledge-base
kb-run build --context=dev --agent=dt-sre-agent  # No --kb-root needed!
```

**Important:** This is a known limitation of global npm installations, not a bug. See [npm Install Documentation](docs/npm-install.md) for detailed explanation.

### Interactive Mode: dtctl Not Found

**Problem:** Interactive mode fails with "Failed to get dtctl contexts"

**Solution:**
```bash
# Install dtctl (check Dynatrace documentation for latest installation)

# Authenticate with your Dynatrace environment
dtctl auth login --context=mycontext

# Verify it works
dtctl config get-contexts

# Or use non-interactive mode
kb-run build --context=mycontext --agent=dt-sre-agent --package=dt-knowledge-base-all --non-interactive
```

### Interactive Mode: aimgr Not Found

**Problem:** Interactive mode fails with "Failed to get agent list from aimgr"

**Solution:**
```bash
# Install aimgr
mise use -g github:dynatrace-oss/ai-config-manager

# Sync repository
aimgr sync

# Verify agents are available
aimgr repo list 'agent/*'

# Or use non-interactive mode
kb-run build --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all --non-interactive
```

### Package Not Found

**Problem:** "Built-in package not found: xyz"

**Solution:**
```bash
# List available built-in packages
ls devtools/kb-run/packages/

# Use a valid built-in package name
kb-run build --context=dev --agent=test --package=dt-knowledge-base-all

# Or use a custom package file instead
kb-run build --context=dev --agent=test --package-file=./my-package.yaml
```

### Conflicting Package Arguments

**Problem:** "Cannot specify both --package and --package-file"

**Solution:**
Choose one approach:
```bash
# Built-in package
kb-run build --context=dev --agent=test --package=dt-knowledge-base-all

# OR custom package file
kb-run build --context=dev --agent=test --package-file=./custom.yaml

# NOT BOTH
```

### IDE Command Not Found

**Problem:** `kb-run start` fails with "command not found: opencode/copilot/claude"

**Solution:**
- Ensure the IDE CLI is installed and in your PATH
- For OpenCode: Install from [OpenCode website]
- For GitHub Copilot CLI: Install from https://github.com/github/copilot-cli (this is the command-line tool, not the IDE extension)
- For Claude: Check Claude's installation documentation for CLI availability
- Alternatively, use `kb-run build` and manually launch the IDE

### aimgr Version Mismatch

**Problem:** Skills fail to install or agent instructions not found

**Solution:**
```bash
# Check aimgr version
aimgr --version

# Update aimgr to latest version
mise up aimgr

# Verify agent exists in repository
aimgr list agents
```

### Agent Not Found in aimgr Repository

**Problem:** "Warning: Agent not found, using base prompt only"

**Solution:**
```bash
# List available agents
aimgr list agents

# Update aimgr repository
aimgr sync

# Verify agent name spelling (e.g., dt-sre-agent not sre-agent)
```

### Output Directory Permission Issues

**Problem:** Cannot create `/tmp/kb-run/` directory

**Solution:**
```bash
# Check /tmp permissions
ls -la /tmp

# Use custom output directory
kb-run build --context=dev --agent=test --package=./monitoring.yaml --output=~/my-agents
```

### Skills Not Loading in IDE

**Problem:** IDE doesn't recognize installed skills

**Solution:**
- Verify skills were installed: `ls -la <output-dir>/.opencode/skills/` (or `.github/skills/`, `.claude/skills/`, `.windsurf/skills/`)
- Check aimgr installation: `aimgr --version`
- Rebuild with `--update-mode=replace`
- Check IDE-specific skill discovery documentation

## Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build
```

## Project Structure

```
devtools/kb-run/
├── src/
│   ├── index.ts              # CLI entry point with commander setup
│   ├── commands/
│   │   └── build.ts          # Build command implementation
│   ├── scaffold.ts           # Scaffolding utilities
│   ├── validate.ts           # Validation logic
│   └── types.ts              # TypeScript type definitions
├── templates/
│   └── README.md.template    # Template for skill README files
├── package.json
├── tsconfig.json
└── README.md
```

## Example Packages

### Built-in Packages

**dt-knowledge-base-all** (located in `packages/dt-knowledge-base-all.yaml`)

The default package with essential Dynatrace skills and tooling:

```yaml
resources:
  - skill/self-reflection
  - skill/dynatrace-control
  - package/dynatrace-candidate
  - package/dynatrace-planned
```

**Example usage:**
```bash
# Use with interactive mode
kb-run build
# (select dt-knowledge-base-all when prompted)

# Use with explicit parameter (default)
kb-run build --context=dev --agent=dt-sre-agent

# Use with explicit parameter (explicit)
kb-run build --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all

# Build and launch
kb-run start --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all
```

This creates a full-featured agent with:
- **Self-reflection**: analysis tools for agent introspection
- **Dynatrace control**: dynatrace-control skill for dtctl operations
- **Public Dynatrace coverage**: dynatrace-candidate plus dynatrace-planned packages

### Custom Package Examples

The `examples/` directory contains sample custom `ai.package.yaml` files:

**minimal.package.yaml** - Minimal package with core Dynatrace skills:

```yaml
resources:
  - skill/dt-dql-essentials
  - skill/dt-app-dashboard
```

**Example usage:**
```bash
# Build for OpenCode (default)
kb-run build --context=mycontext --agent=minimal-agent --package-file=./examples/minimal.package.yaml

# Build and launch
kb-run start --context=mycontext --agent=minimal-agent --package-file=./examples/minimal.package.yaml
```

**monitoring.package.yaml** - Comprehensive monitoring package:

```yaml
resources:
  - skill/dt-app-dashboard
  - skill/dt-dql-essentials
  - skill/dt-infra-kubernetes
  - skill/dt-infra-hosts
  - skill/dt-app-services
  - skill/dt-log-analysis
  - skill/dt-problem-analysis
```

**Example usage:**
```bash
# Build for OpenCode
kb-run build --context=mycontext --agent=monitoring-agent --package-file=./examples/monitoring.package.yaml

# Build and launch in one command
kb-run start --context=mycontext --agent=monitoring-agent --package-file=./examples/monitoring.package.yaml

# Build for Copilot
kb-run start --context=mycontext --agent=monitoring-agent --package-file=./examples/monitoring.package.yaml --target=copilot
```

### Using Packages

**1. Use built-in packages (recommended)**
```bash
# Interactive mode
kb-run build

# With explicit package name
kb-run build --context=dev --agent=test --package=dt-knowledge-base-all
```

**2. Create custom packages**
```bash
# Create your own package file
cat > my-custom.yaml <<EOF
resources:
  - skill/dt-dql-essentials
  - skill/dt-app-dashboard
  - package/dynatrace-candidate
  - package/dynatrace-planned
EOF

# Use it
kb-run build --context=dev --agent=test --package-file=./my-custom.yaml
```

**3. Test with example packages**
```bash
# Try the minimal example
kb-run start --context=dev --agent=test --package-file=./examples/minimal.package.yaml

# Try the monitoring example
kb-run start --context=dev --agent=test --package-file=./examples/monitoring.package.yaml
```

## Future Enhancements

Potential improvements for future releases:

- **`kb-run validate <source>`** - Validate skill structure and dependencies
- **`kb-run scaffold <name>`** - Generate new skill template with boilerplate
- **Additional IDE support** - Support for more AI coding assistants
- **Custom agent templates** - Ability to use custom agent instruction formats

## Testing Local Installation

After running `npm link`, verify the installation:

```bash
# Check that kb-run is available
kb-run --help

# Check version
kb-run --version

# Test build command help
kb-run build --help

# Test start command help
kb-run start --help

# Test interactive mode (easiest)
kb-run build
# Follow the prompts

# Test with built-in package
kb-run build --context=dev --agent=test --package=dt-knowledge-base-all

# Test with custom package file
kb-run build --context=dev --agent=test --package-file=./examples/minimal.package.yaml

# Test start command (build + launch)
kb-run start --context=dev --agent=test --package=dt-knowledge-base-all

# Test non-interactive mode
kb-run start --context=dev --agent=test --package=dt-knowledge-base-all --non-interactive
```

The command should work from any directory once installed globally or linked.

## Additional Notes

### Default Output Location

All builds default to `/tmp/kb-run/<context>/<agent>/` unless overridden with `--output`. This provides:
- **Clean workspace**: No clutter in your project directories
- **Consistent location**: Easy to find evaluation environments
- **Automatic cleanup**: /tmp typically clears on reboot
- **Multi-context support**: Different contexts don't conflict

### Default Package

When no package is specified (and not in interactive mode), kb-run defaults to the `dt-knowledge-base-all` built-in package. This provides a complete, ready-to-use knowledge base with:
- Core Dynatrace platform skills
- OpenCode integration
- Essential automation capabilities

### Agent Integration via aimgr

kb-run integrates with aimgr to:
1. **Resolve agent locations**: Find agent markdown files in the aimgr repository
2. **Install skills and packages**: Use aimgr to install resources to IDE-specific directories
3. **Concatenate instructions**: Combine base prompts with agent-specific instructions

Ensure aimgr is installed and up-to-date for full functionality:
```bash
mise use -g github:dynatrace-oss/ai-config-manager
aimgr sync
```

### Interactive Mode Benefits

Interactive mode is designed to make kb-run more accessible:
- **No need to memorize arguments**: Follow guided prompts
- **Discover available options**: See all packages, contexts, and agents
- **Current context highlighted**: Easily identify your active dtctl context
- **Descriptive choices**: Agent and resource descriptions help you choose
- **Faster iteration**: Quickly build and test different configurations

For automation and CI/CD, use non-interactive mode with explicit arguments.
