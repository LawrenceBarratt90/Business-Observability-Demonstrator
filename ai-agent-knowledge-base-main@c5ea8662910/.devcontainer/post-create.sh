#!/bin/bash
set -e

echo "🚀 Setting up AI Agent Knowledge Base development environment..."

# Activate mise in this shell
eval "$(/home/vscode/.local/bin/mise activate bash)"

echo "✅ Tools available:"
mise list

# Build kb-run
echo ""
echo "📦 Building kb-run CLI..."
cd /workspace/devtools/kb-run
npm install
npm run build
echo "✅ kb-run built successfully"

# Return to workspace root
cd /workspace

# Verify OpenCode configuration
echo ""
echo "🔍 Verifying OpenCode configuration..."

# Check if OpenCode config exists
if [ -f "/home/vscode/.config/opencode/opencode.json" ]; then
    echo "  ✅ OpenCode config present"
else
    echo "  ⚠️  OpenCode config missing"
fi

# Check if OpenCode auth is mounted
if [ -f "/home/vscode/.local/share/opencode/auth.json" ]; then
    echo "  ✅ OpenCode credentials mounted"
    # List configured providers
    echo "  📝 Configured providers:"
    opencode auth list 2>/dev/null || echo "     (Could not list - OpenCode may need setup)"
else
    echo "  ⚠️  OpenCode credentials not found"
    echo "     Run 'opencode auth login' on your HOST machine, then restart container"
fi

# Check if git config is available
if [ -f "/home/vscode/.gitconfig" ]; then
    echo "  ✅ Git config mounted"
    GIT_USER=$(git config user.name 2>/dev/null || echo "(not set)")
    GIT_EMAIL=$(git config user.email 2>/dev/null || echo "(not set)")
    echo "     User: ${GIT_USER} <${GIT_EMAIL}>"
else
    echo "  ℹ️  Git config not mounted (optional)"
    echo "     Set up git: git config --global user.name 'Your Name'"
    echo "                 git config --global user.email 'your@email.com'"
fi

# Check GitHub token for mise
if [ -n "${GITHUB_TOKEN}" ] || [ -n "${MISE_GITHUB_TOKEN}" ]; then
    echo "  ✅ GitHub token available (mise API rate limits OK)"
else
    echo "  ⚠️  GITHUB_TOKEN not set — mise may hit GitHub API rate limits"
    echo "     Set GITHUB_TOKEN on your host machine and rebuild the container"
fi

echo ""
echo "✅ Development environment ready!"
echo ""
echo "Available commands:"
echo "  opencode <directory>  - Start OpenCode"
echo "  copilot              - Start GitHub Copilot (if installed)"
echo "  aimgr --help         - AI config manager"
echo "  dtctl --help         - Dynatrace CLI"
echo "  bd --help            - Beads issue tracker"
echo ""
echo "Quick start:"
echo "  ./start.sh                    # Start OpenCode (default)"
echo "  ./start.sh bash               # Start bash shell"
echo "  ./start.sh copilot            # Start Copilot (if installed)"
echo ""
