# Dev Container Quick Start

## First Time Setup

### 1. Configure OpenCode API Keys (ON HOST)
```bash
opencode auth login
# Follow prompts to add API keys
```

### 2. Start Container
```bash
./start.sh
# Builds image, creates container, starts OpenCode
```

## Daily Usage

```bash
# Start OpenCode (default)
./start.sh

# Start bash shell
./start.sh bash

# Run any command
./start.sh "bd ready"
```

## Common Tasks

### Update API Keys
```bash
# On HOST:
opencode auth login

# No container restart needed!
```

### Update OpenCode Config
```bash
# Edit files:
vim .devcontainer/config/opencode/opencode.json

# Rebuild:
podman rm -f ai-agent-kb-devcontainer
podman rmi ai-agent-kb-devcontainer:latest
./start.sh
```

### Get Shell in Running Container
```bash
podman exec -it ai-agent-kb-devcontainer bash
```

### Verify Setup
```bash
./start.sh bash
# Inside container:
opencode auth list
bd --version
```

## Troubleshooting

### No API Keys
```bash
# On HOST:
opencode auth login
ls -la ~/.local/share/opencode/auth.json

# Restart:
podman restart ai-agent-kb-devcontainer
```

### Complete Rebuild
```bash
podman rm -f ai-agent-kb-devcontainer
podman rmi ai-agent-kb-devcontainer:latest
./start.sh
```

## Architecture

**In Image (build time):**
- Mise + tools
- OpenCode config
- Development tools

**Mounted (runtime):**
- Workspace → `/workspace`
- `~/.local/share/opencode` → `/home/vscode/.local/share/opencode` (API keys)
- `~/.gitconfig` → `/home/vscode/.gitconfig` (optional)

📖 **See [SETUP.md](SETUP.md) for detailed documentation**
