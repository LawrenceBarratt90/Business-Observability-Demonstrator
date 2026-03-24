# Testing Checklist

Use this checklist to verify the dev container OpenCode setup is working correctly.

## Pre-flight Check (Before Container Start)

### On Host Machine
- [ ] OpenCode is installed: `opencode --version`
- [ ] API keys are configured: `opencode auth list`
- [ ] Auth file exists: `ls -la ~/.local/share/opencode/auth.json`
- [ ] Podman or Docker is available: `podman --version` or `docker --version`

### In Repository
- [ ] Config files exist:
  ```bash
  ls .devcontainer/config/opencode/opencode.json
  ```
- [ ] Scripts are executable:
  ```bash
  ls -l start.sh .devcontainer/start-volumes.sh .devcontainer/post-create.sh
  ```

## Container Build Test

### Clean Build
```bash
# Remove any existing container/image
podman rm -f ai-agent-kb-devcontainer
podman rmi ai-agent-kb-devcontainer:latest

# Build and start
./start.sh bash
```

### Expected Output
During startup you should see:
```
🚀 Starting AI Agent Knowledge Base Dev Container...
   Using: podman
📦 Building dev container image (first time setup)...
🆕 Creating new container...
📂 Configuring volume mounts:
  ✓ Mounting OpenCode data (auth.json, database)
  ✓ Mounting .gitconfig
⚙️  Running post-create setup...
```

## Inside Container Tests

Once inside the container (`./start.sh bash`), run these tests:

### 1. OpenCode Config Present
```bash
test -f ~/.config/opencode/opencode.json && echo "✅ PASS" || echo "❌ FAIL"
```

### 2. OpenCode Auth Mounted
```bash
test -f ~/.local/share/opencode/auth.json && echo "✅ PASS" || echo "❌ FAIL"
```

### 3. OpenCode Can List Auth
```bash
opencode auth list
# Should show your configured providers (Anthropic, OpenAI, etc.)
```

### 4. Git Config Available
```bash
git config user.name
git config user.email
# Should show your name and email
```

### 5. Development Tools Available
```bash
node --version
bun --version
python --version
bd --version
opencode --version
```

### 6. Workspace Mounted
```bash
ls /workspace/README.md
# Should exist
```

### 7. Check Volume Mounts
```bash
# From another terminal on host:
podman inspect ai-agent-kb-devcontainer | jq '.[0].Mounts[] | select(.Destination | contains("opencode"))'

# Should show:
# {
#   "Type": "bind",
#   "Source": "/home/YOUR_USER/.local/share/opencode",
#   "Destination": "/home/vscode/.local/share/opencode",
#   ...
# }
```

## Functional Tests

### Test 1: OpenCode Can Start
```bash
# In container
cd /workspace
opencode --help
# Should show help without errors
```

### Test 2: OpenCode Has Plugin
```bash
cat ~/.config/opencode/opencode.json | jq '.plugin'
# Should show: ["@hk9890/opencode-coder"]
```

### Test 3: API Key Update (No Rebuild)
```bash
# On HOST:
opencode auth login
# Add a new provider or update existing

# In container (without restart):
opencode auth list
# Should immediately show the change
```

### Test 4: Config Update (Requires Rebuild)
```bash
# Edit config
vim .devcontainer/config/opencode/opencode.json
# Change something (e.g., theme)

# Rebuild
podman rm -f ai-agent-kb-devcontainer
podman rmi ai-agent-kb-devcontainer:latest
./start.sh bash

# Verify change
cat ~/.config/opencode/opencode.json
# Should show your change
```

## Troubleshooting Tests

### Problem: No API Keys
```bash
# In container:
ls -la ~/.local/share/opencode/auth.json
# If missing, check host:
# Exit container
exit
# On host:
ls -la ~/.local/share/opencode/auth.json
opencode auth list
```

### Problem: Permission Denied
```bash
# Check file permissions in container
ls -la ~/.local/share/opencode/
ls -la ~/.config/opencode/

# Should be owned by vscode:vscode (UID 1000)
```

### Problem: Old Config Cached
```bash
# Complete rebuild
podman rm -f ai-agent-kb-devcontainer
podman rmi ai-agent-kb-devcontainer:latest
podman system prune -f
./start.sh bash
```

## Success Criteria

All of these should be ✅:
- [ ] Container builds without errors
- [ ] Volume mounts show in startup output
- [ ] OpenCode config files present in container
- [ ] OpenCode auth.json mounted from host
- [ ] `opencode auth list` shows your providers
- [ ] Git config shows your name/email
- [ ] All development tools available (node, bun, python, bd)
- [ ] Workspace is accessible at `/workspace`
- [ ] OpenCode can run without errors
- [ ] API key changes on host reflect immediately in container
- [ ] Config changes require rebuild (as expected)

## Test Results Template

Copy this for your test run:

```
Date: _______________
Tester: _______________
Host OS: _______________
Container Runtime: podman / docker (circle one)

Pre-flight Check:          PASS / FAIL
Container Build:           PASS / FAIL
OpenCode Config:           PASS / FAIL
OpenCode Auth:             PASS / FAIL
Git Config:                PASS / FAIL
Development Tools:         PASS / FAIL
Workspace Mount:           PASS / FAIL
Functional Tests:          PASS / FAIL
API Key Update Test:       PASS / FAIL
Config Update Test:        PASS / FAIL

Overall: PASS / FAIL

Notes:
_________________________________
_________________________________
```
