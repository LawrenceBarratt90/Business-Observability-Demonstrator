# Dev Container Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOST MACHINE                             │
│                                                                   │
│  ~/.local/share/opencode/                                        │
│  ├── auth.json          ◄─────── API KEYS (mounted, not copied) │
│  └── opencode.db                                                 │
│                                                                   │
│  ~/.gitconfig           ◄─────── Git identity (mounted)         │
│                                                                   │
│  ~/repo/                                                         │
│  └── .devcontainer/                                              │
│      └── config/                                                 │
│          └── opencode/                                           │
│              ├── opencode.json          ◄─── Config (copied to  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ docker/podman run
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONTAINER                                   │
│                                                                   │
│  /home/vscode/.config/opencode/  ◄─── Config (from image)       │
│  ├── opencode.json                                               │
│                                                                   │
│  /home/vscode/.local/share/opencode/  ◄─── Data (mounted)       │
│  ├── auth.json                                                   │
│  └── opencode.db                                                 │
│                                                                   │
│  /home/vscode/.gitconfig  ◄─── Git config (mounted)             │
│                                                                   │
│  /workspace  ◄─── Repository (mounted)                           │
│  ├── knowledge-base/                                             │
│  ├── devtools/                                                   │
│  └── ...                                                         │
└─────────────────────────────────────────────────────────────────┘
```

## File Flow Diagram

### Build Time (Image Creation)

```
.devcontainer/Dockerfile
    │
    ├─► Install mise
    ├─► Install tools (node, bun, python, etc.)
    └─► COPY config/opencode/*.json → ~/.config/opencode/
            │
            └─► Image: ai-agent-kb-devcontainer:latest
                Contains:
                - All development tools
                - OpenCode configuration (no secrets)
```

### Runtime (Container Start)

```
start.sh
    │
    ├─► Load start-volumes.sh
    │   └─► Define VOLUME_MOUNTS:
    │       ├─ Host ~/.local/share/opencode → Container ~/.local/share/opencode
    │       ├─ Host ~/.gitconfig → Container ~/.gitconfig
    │       └─ Host repo → Container /workspace
    │
    ├─► docker/podman run with volumes
    │
    └─► Run post-create.sh
        └─► Verify OpenCode setup
            ├─ Check config present
            ├─ Check auth.json mounted
            └─ List configured providers
```

## Data Flow

### Configuration Updates

```
┌──────────────────────────────────────────────────────────┐
│  Configuration Changes (opencode.json, etc.)             │
│                                                           │
│  Edit .devcontainer/config/opencode/opencode.json       │
│                    │                                      │
│                    ▼                                      │
│  Requires rebuild: podman build ...                      │
│                    │                                      │
│                    ▼                                      │
│  New image with updated config                           │
│                    │                                      │
│                    ▼                                      │
│  Start new container from new image                      │
└──────────────────────────────────────────────────────────┘
```

### Credential Updates

```
┌──────────────────────────────────────────────────────────┐
│  Credential Changes (API keys)                           │
│                                                           │
│  opencode auth login (on host)                           │
│                    │                                      │
│                    ▼                                      │
│  Updates ~/.local/share/opencode/auth.json               │
│                    │                                      │
│                    ▼                                      │
│  Immediately available in container (mounted volume)     │
│                    │                                      │
│                    ▼                                      │
│  No rebuild or restart needed!                           │
└──────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### Dockerfile
- Install system dependencies
- Install mise
- Install development tools
- **COPY** OpenCode config files (no secrets)
- Set up user environment

### start.sh
- Detect container runtime (podman/docker)
- Build image if needed
- **Load volume configuration** from start-volumes.sh
- Create/start container with volumes
- Run post-create setup on first start
- Execute requested command

### start-volumes.sh
- Check for OpenCode data directory on host
- Check for git config on host
- Build VOLUME_MOUNTS string with appropriate mounts
- Provide feedback about what's being mounted

### post-create.sh
- Activate mise environment
- Build kb-run tool
- **Verify OpenCode setup**:
  - Check config present
  - Check auth mounted
  - List auth providers
  - Verify git config

## Security Model

### What's in the Image (Public/Shareable)
✅ Development tools (Node.js, Python, etc.)
✅ OpenCode configuration (settings, plugins)
✅ Project-specific tooling
❌ NO API keys
❌ NO credentials
❌ NO personal data

### What's Mounted (Private/Local)
🔒 API keys (auth.json)
🔒 OpenCode database
🔒 Git config (name, email, signing keys)
🔒 Workspace (your code)

## Directory Structure

```
.devcontainer/
├── config/                      # Version controlled configs
│   ├── README.md
│   └── opencode/
│       ├── opencode.json        # OpenCode settings
│
├── Dockerfile                   # Image definition
├── devcontainer.json           # VS Code config
├── mise-template.toml          # Tool versions
│
├── start-volumes.sh            # Volume mount logic
├── post-create.sh              # Container setup
│
├── SETUP.md                    # Detailed setup guide
├── QUICK-START.md              # Quick reference
├── TESTING.md                  # Test procedures
├── ARCHITECTURE.md             # This file
├── CHANGES.md                  # What changed
└── .gitignore                  # Prevent credential leaks
```

## Lifecycle

### First Time Setup
1. User configures API keys on host: `opencode auth login`
2. User runs: `./start.sh`
3. Script builds image (includes config, not credentials)
4. Script creates container with volumes
5. post-create.sh verifies setup
6. OpenCode starts with config + mounted credentials

### Daily Usage
1. User runs: `./start.sh`
2. Script starts existing container
3. Script executes command (default: opencode)
4. OpenCode has access to config + credentials

### Configuration Update
1. User edits `.devcontainer/config/opencode/opencode.json`
2. User removes container and image
3. User runs: `./start.sh`
4. Script rebuilds image with new config
5. New container uses new config

### Credential Update
1. User runs on host: `opencode auth login`
2. Updates `~/.local/share/opencode/auth.json`
3. Container sees change immediately (mounted volume)
4. No rebuild or restart needed

## Benefits of This Architecture

1. **Separation of Concerns**
   - Config: Version controlled, in image
   - Secrets: On host, mounted at runtime

2. **No Rebuild for Secrets**
   - Update API keys without image rebuild
   - Faster iteration during development

3. **Security**
   - Secrets never in image
   - Can share image without leaking credentials

4. **Flexibility**
   - Team shares config via git
   - Each developer has own credentials

5. **Consistency**
   - Same config for all team members
   - Tools pre-installed and versioned
