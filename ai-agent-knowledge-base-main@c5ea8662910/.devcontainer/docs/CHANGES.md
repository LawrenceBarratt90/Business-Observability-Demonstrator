# Dev Container OpenCode Configuration - Changes Summary

## Problem
Dev container had no OpenCode configuration and could not access API keys needed for OpenCode to function.

## Solution
Implemented a hybrid approach:
1. **OpenCode configuration** → Baked into image (version controlled, consistent)
2. **API keys/credentials** → Mounted from host (secure, no rebuild needed to update)

## Files Created/Modified

### New Configuration
- `.devcontainer/config/opencode/opencode.json` - OpenCode settings
- `.devcontainer/config/README.md` - Config documentation

### Updated Scripts
- `.devcontainer/Dockerfile` - Now copies OpenCode config into image
- `.devcontainer/start-volumes.sh` - NEW: Volume mount configuration
- `start.sh` - Updated to source volume configuration
- `.devcontainer/post-create.sh` - Added OpenCode verification

### Documentation
- `.devcontainer/SETUP.md` - Comprehensive setup guide
- `.devcontainer/QUICK-START.md` - Quick reference
- `.devcontainer/.gitignore` - Prevent committing secrets
- `README.md` - Added dev container section

## Architecture

### Build Time (in image)
```
.devcontainer/config/opencode/*.json
    ↓ (COPY in Dockerfile)
/home/vscode/.config/opencode/
```

### Runtime (mounted)
```
~/.local/share/opencode/auth.json (host)
    ↓ (volume mount)
/home/vscode/.local/share/opencode/auth.json (container)
```

## Usage

### First Time Setup
```bash
# On HOST - configure API keys
opencode auth login

# Start container
./start.sh
```

### Update Configuration
```bash
# Edit config files
vim .devcontainer/config/opencode/opencode.json

# Rebuild image
podman rm -f ai-agent-kb-devcontainer
podman rmi ai-agent-kb-devcontainer:latest
./start.sh
```

### Update API Keys
```bash
# On HOST
opencode auth login

# No rebuild needed - mounted live!
```

## Security
✅ API keys never in image (mounted from host)
✅ Configuration in version control (no secrets)
✅ .gitignore prevents accidental credential commits

## Benefits
1. **No rebuild needed** for API key updates
2. **Version controlled** configuration
3. **Secure** credential handling
4. **Consistent** environment across team
5. **Easy to update** - clear separation of concerns

## Testing
After implementing these changes:
1. Rebuild container: `./start.sh bash`
2. Verify OpenCode config: `ls ~/.config/opencode/`
3. Verify API keys mounted: `ls ~/.local/share/opencode/auth.json`
4. Test OpenCode: `opencode auth list`

## Next Steps (Optional)
- [ ] Add SSH key mounting for git operations
- [ ] Add custom plugins to OpenCode config
- [ ] Configure additional volume mounts in `start-volumes.sh`
- [ ] Set up VS Code dev container integration
