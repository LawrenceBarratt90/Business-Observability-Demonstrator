# AI Agent Knowledge Base

**A comprehensive collection of AI agent resources for Dynatrace platform automation and observability.**

This repository provides reusable **skills**, **commands**, and **agents** that enable AI coding assistants (GitHub Copilot, Claude Code, OpenCode, etc.) to work effectively with Dynatrace.

---

## 📦 What's Inside?

This repository contains three types of resources:

### 1. **Skills** - Modular knowledge units
Comprehensive documentation on specific Dynatrace capabilities that AI agents can load and use:
- `dt-app-dashboard` - Dashboard creation and management
- `dt-dql-essentials` - DQL query language fundamentals
- `dt-infra-kubernetes` - Kubernetes monitoring
- `dt-app-notebook` - Notebook operations
- ...and more! [Browse all skills](knowledge-base/dynatrace/skills/)

### 2. **Commands** - Slash commands
Custom commands that extend your AI assistant with Dynatrace-specific actions. *(Coming soon — see [Knowledge Base Overview](docs/kb-overview.md) for the format specification.)*

### 3. **Agents** - Specialized AI personas
Pre-configured agent definitions for dashboard creation, notebook operations, problem analysis, and incident response.

**Skill Naming Convention**: All Dynatrace skills follow the pattern `dt-<domain>-<name>` — see [Writing Skills](docs/contributing/writing-skills.md) for valid domains.

---

## 🚀 Installation & Setup

### Get This Repository

```bash
# Clone the repository
git clone ssh://git@bitbucket.lab.dynatrace.org/dsa/ai-agent-knowledge-base.git
cd ai-agent-knowledge-base
```

---

### Prerequisites

Before you start, you'll need:

1. **Node.js 20+** - Required for development tools
   ```bash
   # Check if installed
   node --version
   
   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   ```


2. **dtctl** - Dynatrace CLI for platform operations
   
   dtctl is required for working with Dynatrace skills that involve platform automation.
   
   **Installation:**
   ```bash
    # Installation via mise (Recommended)
    mise use -g github:dynatrace-oss/dtctl
   
   # Verify installation
   dtctl version
   
    # Or download from GitHub releases
    # See: https://github.com/dynatrace-oss/dtctl/releases
   ```
   
   **Configuration:**
   ```bash
   # Create a context (at least one required)
   dtctl config set-context my-context \
     --environment https://abc123.live.dynatrace.com \
     --token-ref dt0c01.XXXX.YYYY
   
   # Verify configuration
   dtctl config get-contexts
   ```

3. **aimgr (AI Resource Manager)** - Tool for installing and managing AI agent resources
   
   aimgr is a CLI package manager for AI agent resources (think npm for AI skills). You can use it to install resources from this repository into your AI assistant workspace.
   
   **Installation:**
   ```bash
   # Installation via mise (Recommended)
   mise use -g github:dynatrace-oss/ai-config-manager
   
   # Verify installation
   aimgr --version
   
   # Or install using Go
   go install github.com/dynatrace-oss/ai-config-manager/v3/cmd/aimgr@latest
   
   # Or download from GitHub releases
   # See: https://github.com/dynatrace-oss/ai-config-manager/releases
   ```
   
   **Usage:**
   ```bash
   # Install a skill from a local clone of this repository
   cd /path/to/ai-agent-knowledge-base
   aimgr repo add local:/path/to/ai-agent-knowledge-base
   aimgr install skill/dt-dql-essentials
   
   # Or set up aimgr to sync from remote repositories
   # See aimgr documentation for configuring remote sources:
   # https://github.com/dynatrace-oss/ai-config-manager
   ```
   
   > **What is aimgr?** It's a Go-based package manager for AI agent resources. It lets you discover, install, and manage skills/commands/agents across different AI assistants. For full aimgr documentation, visit [github.com/dynatrace-oss/ai-config-manager](https://github.com/dynatrace-oss/ai-config-manager).

4. **Developer Mode** - Windows only, enables symlink creation as non-admin

1. Go to `Settings > System > Advanced`
2. Toggle `Developer Mode` on

---

### Quick Start (Automated Setup)

**For developers contributing to this knowledge base**, after cloning and installing the prerequisites above, run the automated setup script:

```bash
./dev-setup.sh
```

**What the script does:**
1. ✅ Checks if `dtctl` and `aimgr` are installed and available on PATH
2. ✅ Verifies that `dtctl` has at least one context configured
3. ✅ Installs and builds the `kb-run` tool globally
4. ✅ Validates the complete development environment

If you prefer manual setup or just want to use the skills (not develop them), see the sections below.

---

## 💡 How to Use

There are **three ways** to use the resources in this repository:

### Option 1: Manual Installation

Copy individual skills directly into your AI assistant workspace:

```bash
# Browse available skills
ls knowledge-base/dynatrace/skills/

# Copy a skill to your workspace
cp -r knowledge-base/dynatrace/skills/dt-dql-essentials ~/.opencode/skills/
```

Then reference the skill in your AI assistant's configuration.

### Option 2: Using aimgr

Install individual skills using the aimgr package manager:

```bash
# From a local clone of this repository
cd ai-agent-knowledge-base
aimgr install skill/dt-dql-essentials

# Or configure aimgr with remote sources (see aimgr documentation)
```

aimgr tracks installed resources and keeps them updated.

### Option 3: Using kb-run (Recommended)

The `kb-run` CLI tool creates complete IDE-ready evaluation environments with skills, agents, and IDE configurations pre-configured.

**Installation:**

If you're using VSCode with GitHub Copilot, ensure there's a symlink so that it can be opened from the terminal with `code`.

```bash
# Add a repo to aimgr. For example, add the KB included in this repo
aimgr repo add https://bitbucket.lab.dynatrace.org/scm/dsa/ai-agent-knowledge-base.git

# Navigate to kb-run directory
cd devtools/kb-run

# Install dependencies and build
npm install
npm run build

# Install globally (creates 'kb-run' command)
npm link

# Verify installation
kb-run --version
```

**Quick Start:**

```bash
cd ai-agent-knowledge-base

# Interactive mode (easiest for first-time users)
kb-run start

# Direct command with options
kb-run build \
  --context=my-context \
  --agent=dt-dt-main-agent \
  --package=dt-knowledge-base-all \
  --output ~/my-agent-workspace

# Build and launch in one step
kb-run start \
  --context=my-context \
  --agent=dt-dt-main-agent \
  --package=dt-knowledge-base-all
```

**What kb-run does:**
1. Creates a new directory with IDE configuration (OpenCode, Copilot, Claude, or VSCode)
2. Installs skills from a package definition
3. Embeds agent-specific instructions
4. Optionally launches your IDE with the environment ready to go

**Interactive Mode Example:**
```bash
$ kb-run start

🔧 Interactive Mode

? Select a knowledge base package: dt-knowledge-base-all
? Select an AI agent: dt-dt-main-agent - Dynatrace Platform Orchestrator
? Select target IDE: opencode (default) - Open in OpenCode

✓ Building environment at /tmp/kb-run/dt-dt-main-agent
✓ Installing skills...
✓ Launching OpenCode...
```

**Common Commands:**
```bash
# Build environment without launching IDE
kb-run build --help

# Build and launch IDE in one step
kb-run start --help

# Show version
kb-run --version
```

**For full kb-run documentation**, see [devtools/kb-run/README.md](devtools/kb-run/README.md).

---

## 🗂️ Repository Structure

For detailed structure information and content organization strategy, see **[Knowledge Base Overview](docs/kb-overview.md)**.

---

## 🛠️ Advanced Tools

### MCP Server (Model Context Protocol)

The MCP server provides semantic search over the knowledge base for integration with Claude Desktop and other MCP-compatible tools.

```bash
cd devtools/mcp-server
npm install
npm run build
node dist/index.js
```

**Features:**
- Semantic search using embeddings
- Fast content retrieval
- Self-contained (no external APIs needed)

**VS Code Integration:**
Add to your `settings.json`:
```json
{
  "mcpServers": {
    "dt-knowledgebase": {
      "command": "dql-kb-mcp"
    }
  }
}
```

For full MCP server documentation, see [devtools/mcp-server/README.md](devtools/mcp-server/README.md).

---

## 🤝 Contributing

Want to create new skills or improve existing ones? See the **[Contributing Guide](CONTRIBUTING.md)** for detailed instructions.

---

## 🗃️ Backstage Catalog Onboarding

All skills and agents in this repository are registered in the Backstage catalog via the [`catalog-info.yaml`](catalog-info.yaml) root entry point and the combined entity files under [`catalog/`](catalog/).

### How the catalog is structured

```
catalog-info.yaml               ← Register this file in Backstage (Location entry point)
catalog/
  dynatrace/
    skills.yaml                 ← All public Dynatrace skills
    agents.yaml                 ← All public Dynatrace agents
  dynatrace-dev/
    skills.yaml
  dynatrace-internal-dev/
    skills.yaml
    agents.yaml
  dynatrace-internal-sfm/
    skills.yaml
    agents.yaml
```

Each `.yaml` file is a multi-document YAML file (documents separated by `---`) where every document is a Backstage `Component` entity.

### Onboarding a new skill or agent

**1. Add the Component entity** to the appropriate combined file in `catalog/`:

- Public skill → `catalog/dynatrace/skills.yaml`
- Public agent → `catalog/dynatrace/agents.yaml`
- Internal dev skill/agent → `catalog/dynatrace-internal-dev/skills.yaml` or `agents.yaml`
- SFM skill/agent → `catalog/dynatrace-internal-sfm/skills.yaml` or `agents.yaml`

Use the following template (append as a new `---`-separated document):

```yaml
---
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: <skill-or-agent-name>          # e.g. dt-app-dashboard
  namespace: default                   # use 'internal' for internal-only entities
  title: <Human Readable Title>
  description: >
    One or two sentence description of what this skill/agent does.
  annotations:
    backstage.io/source-location: url:https://bitbucket.lab.dynatrace.org/projects/DSA/repos/ai-agent-knowledge-base/browse/knowledge-base/<channel>/<skills|agents>/<name>
spec:
  type: ai-skill                       # or 'ai-agent'
  lifecycle: experimental
  owner: capability/<your-team>
  system: default/<system>
  product-architect: user:default/<ldap>
  product-manager: user:default/<ldap>
```

**2. Verify** that the file it belongs to is already listed as a target in [`catalog-info.yaml`](catalog-info.yaml). For the existing categories no changes to `catalog-info.yaml` are needed — they are already registered.

**3. If you are adding an entirely new channel/category**, also add a new target line in [`catalog-info.yaml`](catalog-info.yaml):

```yaml
    - ./catalog/<new-channel>/skills.yaml
```

and create the corresponding file in `catalog/<new-channel>/`.

### Registering the catalog in Backstage

Point Backstage at the root location file to import all entities at once:

```
https://bitbucket.lab.dynatrace.org/projects/DSA/repos/ai-agent-knowledge-base/browse/catalog-info.yaml
```

Add this URL under **Catalog → Register existing component** in your Backstage instance. Backstage will follow all targets recursively and import every Component entity.

---

## 📖 Documentation

- **[Knowledge Base Overview](docs/kb-overview.md)** - Complete structure and architecture
- **[Contributing Guide](CONTRIBUTING.md)** - How to create and contribute skills
- **[Agent Instructions](AGENTS.md)** - Quick reference for AI assistants
- **[kb-run README](devtools/kb-run/README.md)** - CLI tool documentation
- **[MCP Server README](devtools/mcp-server/README.md)** - MCP server documentation

---

## ❓ FAQ

**Q: What is this repository?**  
A: A collection of reusable AI agent resources (skills, commands, agents) for Dynatrace platform automation.

**Q: Do I need to install everything?**  
A: No! Install only what you need. Start with a single skill using manual copy or use kb-run for a complete setup.

**Q: What's the difference between aimgr and kb-run?**  
A: 
- **aimgr**: Package manager for installing individual skills/commands/agents into your workspace
- **kb-run**: Development tool for creating complete IDE evaluation environments with pre-configured skills and agents

**Q: Can I use this with any AI assistant?**  
A: Yes! Skills work with GitHub Copilot, Claude Code, OpenCode, and any assistant that supports skill/prompt loading.

**Q: Is this a software product?**  
A: No, this is a documentation repository. It contains knowledge resources that AI agents consume.

---

## 📝 What This Repository Is NOT

- ❌ Not a testing framework - no automated functional tests
- ❌ Not a runtime service - no agent servers or infrastructure  
- ❌ Not a product - skills are consumed by products


---

## 🐳 Dev Container Setup

**For isolated development with all tools pre-configured**, use the dev container:

```bash
# Start OpenCode in dev container (default)
./start.sh

# Or start a bash shell
./start.sh bash
```

**Prerequisites:**
- Podman or Docker installed
- OpenCode API keys configured on host (run `opencode auth login`)

See the `.devcontainer/` directory for container configuration files.

The dev container includes:
- ✅ All development tools (Node.js, Bun, Python, etc.) via mise
- ✅ OpenCode configuration baked into image
- ✅ Your API keys mounted securely from host
- ✅ Git configuration (optional)
- ✅ `kb-run` CLI pre-built and ready
