# npm Global Install and --kb-root Requirement

## Overview

When `kb-run` is installed globally via npm (`npm install -g kb-run`), the knowledge base path auto-detection feature does not work. This is **by design** and is a known limitation of global npm installations.

This document explains why auto-detection fails with global installs and how to work around it.

## Why Auto-Detection Doesn't Work with Global npm Install

### How Auto-Detection Works (Local Development)

When running `kb-run` from source or via `npm link` in development:

```
/path/to/ai-agent-knowledge-base/
├── devtools/
│   └── kb-run/
│       └── dist/
│           └── commands/
│               └── build.js   ← __dirname points here
├── knowledge-base/            ← Auto-detected via relative path: ../../knowledge-base/
│   └── system-prompt/
│       └── SingleTenantPrompt.md
└── packages/
    └── dt-knowledge-base-all.yaml
```

The code uses the current working directory (`process.cwd()`) to find the knowledge base:

```javascript
// Simplified auto-detection logic (two-step process)
// 1. Check if CWD is the KB root itself
// 2. Check if CWD/knowledge-base/ exists and is a valid KB root
```

This works because you typically run kb-run from the repository root or a location that has access to the knowledge-base/ directory.

### What Changes with Global npm Install

When installed globally via npm, the directory structure is completely different:

```
/usr/local/lib/node_modules/kb-run/    ← npm global install location
└── dist/
    └── commands/
        └── build.js                    ← __dirname points here

/path/to/ai-agent-knowledge-base/      ← Your actual knowledge base (separate location)
├── knowledge-base/
├── packages/
└── ...
```

**The problem**: When you run the globally installed kb-run, your current working directory is typically somewhere unrelated to the knowledge base repository. Auto-detection checks `process.cwd()` and `process.cwd()/knowledge-base/`, but neither of these paths contains your actual knowledge base files.

## Solution: Use --kb-root Parameter

When using `kb-run` installed via npm, you **must** explicitly specify the knowledge base root directory using the `--kb-root` parameter.

### Basic Usage

```bash
# Install globally
npm install -g kb-run

# Must use --kb-root for all commands
kb-run build --kb-root /path/to/ai-agent-knowledge-base --context=dev --agent=dt-sre-agent
```

### Interactive Mode

```bash
kb-run build --kb-root /path/to/ai-agent-knowledge-base

# Interactive prompts will guide you through:
# - Package selection
# - Tenant selection
# - Agent selection
# - Target IDE selection
```

### Run Command

```bash
# Build and launch IDE in one command
kb-run run --kb-root /path/to/ai-agent-knowledge-base --context=prod --agent=dt-sre-agent --package=dt-knowledge-base-all
```

### All Parameters Example

```bash
kb-run build \
  --kb-root /home/user/repos/ai-agent-knowledge-base \
  --context=abc12345 \
  --agent=dt-sre-agent \
  --package=dt-knowledge-base-all \
  --target=opencode \
  --output=/tmp/my-agent
```

## Recommended Workflow

### For Development: Use Local Setup (Auto-Detection Works)

If you're developing skills or working on the knowledge base, we recommend using the local development setup:

```bash
# Clone the repository
git clone https://github.com/your-org/ai-agent-knowledge-base.git
cd ai-agent-knowledge-base

# Install kb-run locally
cd devtools/kb-run
npm install
npm run build
npm link

# Now auto-detection works!
cd /path/to/ai-agent-knowledge-base
kb-run build --context=dev --agent=dt-sre-agent
# No --kb-root needed!
```

**Benefits of local development setup**:
- ✅ Auto-detection works (no need to specify --kb-root)
- ✅ Easier to test changes to kb-run itself
- ✅ Easier to test changes to skills and packages
- ✅ Shorter command lines

### For Production/Sharing: Use Global Install with --kb-root

For production use or when sharing with team members who just want to use the tool:

```bash
# Install globally
npm install -g kb-run

# Always use --kb-root
kb-run build --kb-root /path/to/ai-agent-knowledge-base --context=prod --agent=dt-sre-agent
```

**Benefits of global install**:
- ✅ Available from any directory
- ✅ Easier to install (single npm command)
- ✅ Version managed by npm
- ✅ No need to clone the full repository

## Environment Variable Alternative

If you don't want to type `--kb-root` every time, you can set an environment variable:

```bash
# Add to your .bashrc or .zshrc
export KB_ROOT=/path/to/ai-agent-knowledge-base

# Or use it inline
KB_ROOT=/path/to/ai-agent-knowledge-base kb-run build --context=dev --agent=dt-sre-agent
```

**Note**: As of this writing, kb-run does not yet read from the `KB_ROOT` environment variable, but this is a potential future enhancement.

## Common Errors

### Error: "Cannot find knowledge base at path"

**Symptoms**:
```
Error: Cannot find knowledge base at path: /usr/local/lib/node_modules/knowledge-base
```

**Cause**: You installed kb-run globally but didn't specify `--kb-root`.

**Solution**: Always use `--kb-root` with global installations:
```bash
kb-run build --kb-root /path/to/ai-agent-knowledge-base --context=dev --agent=dt-sre-agent
```

### Error: "Cannot find package file"

**Symptoms**:
```
Error: Built-in package not found: dt-knowledge-base-all
```

**Cause**: kb-run is looking in the wrong location for packages (global npm directory instead of your knowledge base).

**Solution**: Specify `--kb-root`:
```bash
kb-run build --kb-root /path/to/ai-agent-knowledge-base --context=dev --agent=dt-sre-agent --package=dt-knowledge-base-all
```

### Error: "Cannot find base prompt"

**Symptoms**:
```
Error: Base prompt file not found: knowledge-base/system-prompt/SingleTenantPrompt.md
```

**Cause**: Auto-detection is trying to find the prompt file relative to the global npm installation directory.

**Solution**: Use `--kb-root`:
```bash
kb-run build --kb-root /path/to/ai-agent-knowledge-base --context=dev --agent=dt-sre-agent
```

## Comparison: Local vs Global Install

| Aspect | Local Development Setup | Global npm Install |
|--------|------------------------|-------------------|
| **Installation** | Clone repo + `npm link` | `npm install -g kb-run` |
| **Auto-detection** | ✅ Works | ❌ Doesn't work |
| **--kb-root required** | No | Yes (always) |
| **Command length** | Shorter | Longer (due to --kb-root) |
| **Use case** | Development, testing | Production, sharing |
| **Updates** | Manual (git pull) | `npm update -g kb-run` |
| **Available where** | Only in repo directory | Anywhere |

## Why Not Fix Auto-Detection for Global Installs?

You might wonder: "Why doesn't kb-run just figure this out automatically?"

**Technical challenges**:
1. **No standard location**: Users can clone the knowledge base repository anywhere on their system
2. **Multiple clones**: Users might have multiple clones (dev, staging, prod)
3. **No registry**: There's no global registry of where knowledge bases are located
4. **Security**: Scanning the filesystem for knowledge bases would be slow and potentially insecure
5. **Explicit is better**: Requiring `--kb-root` makes it clear which knowledge base you're using

**Philosophy**: Being explicit about the knowledge base location prevents confusion and ensures reproducible builds. When you see `--kb-root /path/to/kb`, you know exactly which knowledge base is being used.

## Summary

- **npm global install breaks auto-detection** - This is expected behavior
- **Always use --kb-root with global installs** - No way around this limitation
- **Use local development setup for convenience** - Auto-detection works, no --kb-root needed
- **This is a known limitation, not a bug** - The architecture requires explicit paths for global installs

## Related Documentation

- [Main README](../README.md) - Full kb-run documentation
- [Troubleshooting](../README.md#troubleshooting) - Common issues and solutions
- [Installation](../README.md#installation) - Installation options
