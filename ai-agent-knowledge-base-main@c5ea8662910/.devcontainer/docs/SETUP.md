# Dev Container Setup Guide

This guide explains how the dev container handles configuration and credentials.

## Architecture

### What's Baked Into the Image
These are copied during `docker build` and become part of the image:

- **Mise config** (`.devcontainer/mise-template.toml`) → `~/.config/mise/config.toml`
- **OpenCode config** (`.devcontainer/config/opencode/*.json`) → `~/.config/opencode/`
- **Development tools** installed via mise (Node.js, Bun, Python, etc.)

### What's Mounted at Runtime
These are mounted from your host machine when the container starts:

- **Workspace** (`/path/to/repo` → `/workspace`)
- **OpenCode data** (`~/.local/share/opencode` → `/home/vscode/.local/share/opencode`)
  - Contains `auth.json` (API keys)
  - Contains `opencode.db` (OpenCode database)
- **Git config** (`~/.gitconfig` → `/home/vscode/.gitconfig`) - optional

## Initial Setup

### 1. Configure OpenCode API Keys on Host

**Before** starting the container, set up your API keys on your host machine:

```bash
# On your HOST (not in container)
opencode auth login

# Follow the prompts to add your API keys:
# - Anthropic (for Claude models)
# - OpenAI (if using GPT models)
# - Langdock (if using Langdock proxy)
# - etc.

# Verify
opencode auth list
```

### 2. Build and Start Container

```bash
# First time - builds image and creates container
./start.sh

# This will:
# 1. Build the image (includes OpenCode config)
# 2. Create container with volume mounts
# 3. Run post-create setup
# 4. Start OpenCode
```

### 3. Verify Setup Inside Container

When the container starts, you'll see output like:

```
🔍 Verifying OpenCode configuration...
  ✅ OpenCode config present
  ✅ OpenCode credentials mounted
  📝 Configured providers:
    ● Anthropic (api)
    ● OpenAI (api)
    ● langdock (api)
  ✅ Git config mounted
     User: Your Name <your@email.com>
```

## Usage

### Starting OpenCode (Default)

```bash
./start.sh
# or explicitly:
./start.sh opencode /workspace
```

### Starting a Bash Shell

```bash
./start.sh bash
```

### Running Other Commands

```bash
./start.sh "bd ready"
./start.sh "npm test"
```

## Customization

### Update OpenCode Configuration

Edit config files in `.devcontainer/config/opencode/`:
- `opencode.json` - Main OpenCode settings

Then rebuild the image:

```bash
# Remove container and image
podman rm -f ai-agent-kb-devcontainer
podman rmi ai-agent-kb-devcontainer:latest

# Start again (will rebuild)
./start.sh
```

### Update API Keys

API keys are mounted, so changes on host are immediately available:

```bash
# On your HOST
opencode auth login
# Add/update credentials

# In container - no rebuild needed!
# Just restart if running
```

### Add More Volume Mounts

Edit `.devcontainer/start-volumes.sh` to add more mounts:

```bash
# Example: Mount SSH keys
if [ -d "${HOST_HOME}/.ssh" ]; then
    VOLUME_MOUNTS="${VOLUME_MOUNTS} -v ${HOST_HOME}/.ssh:/home/vscode/.ssh:Z"
    echo "  ✓ Mounting SSH keys"
fi
```

## Troubleshooting

### OpenCode Can't Find API Keys

**Symptom**: OpenCode says "No API key configured"

**Solution**:
1. Check on host: `opencode auth list`
2. If empty, run: `opencode auth login`
3. Verify file exists: `ls -la ~/.local/share/opencode/auth.json`
4. Restart container: `podman restart ai-agent-kb-devcontainer`

### OpenCode Config Changes Not Applied

**Symptom**: Changed `opencode.json` but OpenCode still uses old settings

**Solution**: Config is baked into image, need to rebuild:
```bash
podman rm -f ai-agent-kb-devcontainer
podman rmi ai-agent-kb-devcontainer:latest
./start.sh
```

### Git Commits Show Wrong Author

**Symptom**: Git commits don't have your name/email

**Solutions**:
1. **Option A**: Mount your host `.gitconfig` (handled automatically in `start-volumes.sh`)
2. **Option B**: Configure in container:
   ```bash
   ./start.sh bash
   git config --global user.name "Your Name"
   git config --global user.email "your@email.com"
   ```

### Permission Issues with Mounted Volumes

**Symptom**: "Permission denied" errors when accessing mounted files

**Solution**: SELinux context (the `:Z` flag handles this automatically)
- For Podman: `--userns=keep-id` maps host UID to container UID
- For Docker: Usually works by default

## Advanced

### Inspect Running Container

```bash
# Get a shell in running container
podman exec -it ai-agent-kb-devcontainer bash

# Check OpenCode setup
opencode auth list
ls -la ~/.config/opencode/
ls -la ~/.local/share/opencode/

# Check git setup
git config --list
```

### Rebuild Everything

```bash
# Nuclear option - complete rebuild
podman rm -f ai-agent-kb-devcontainer
podman rmi ai-agent-kb-devcontainer:latest
podman system prune -f
./start.sh
```

### Debug Volume Mounts

```bash
# Check what's mounted
podman inspect ai-agent-kb-devcontainer | jq '.[0].Mounts'
```

## File Organization

```
.devcontainer/
├── Dockerfile              # Image definition
├── devcontainer.json       # VS Code dev container config
├── mise-template.toml      # Tool versions
├── post-create.sh          # Setup script
├── start-volumes.sh        # Volume mount configuration
├── SETUP.md               # This file
└── config/
    ├── README.md          # Config documentation
    └── opencode/
        ├── opencode.json           # OpenCode settings
        └── oh-my-opencode.json     # Agent configs
```

## Security Notes

✅ **Safe** - API keys are mounted from host, NOT in image
✅ **Safe** - Configuration (without secrets) is in image
✅ **Safe** - Workspace is mounted, not copied
❌ **Never** commit `auth.json` or API keys to git
❌ **Never** add secrets to config files in `.devcontainer/config/`
