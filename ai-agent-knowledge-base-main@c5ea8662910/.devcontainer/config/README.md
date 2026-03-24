# Dev Container Configuration

This directory contains configuration files that are baked into the dev container image.

## OpenCode Configuration

- `opencode/opencode.json` - Main OpenCode configuration

This file is copied to `/home/vscode/.config/opencode/` during image build.

## What's NOT in this directory

**API Keys and Credentials** are mounted at runtime from:
- `~/.local/share/opencode/` (host) → `/home/vscode/.local/share/opencode/` (container)

This keeps secrets out of the image and allows them to be updated without rebuilding.

## Customization

To customize OpenCode settings:
1. Edit the config files in this directory
2. Rebuild the container: `./start.sh bash` then exit, then rebuild image
3. Or manually copy files into running container for testing

To update API keys:
- Run `opencode auth login` on your host machine
- Changes are automatically available in container via mount
