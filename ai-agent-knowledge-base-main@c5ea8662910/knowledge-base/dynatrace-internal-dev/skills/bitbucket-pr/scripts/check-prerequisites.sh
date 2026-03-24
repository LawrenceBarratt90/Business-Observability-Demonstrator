#!/bin/bash
# Check Bitbucket prerequisites for bitbucket-pr skill operations
# Returns 0 if all required checks pass, 1 otherwise

set -e

echo "🔍 Checking prerequisites for Bitbucket PR..."
echo ""

# Check 1: BITBUCKET_TOKEN environment variable
echo -n "  BITBUCKET_TOKEN: "
if [ -z "$BITBUCKET_TOKEN" ]; then
    echo "❌ Not set"
    echo ""
    echo "Error: BITBUCKET_TOKEN environment variable is not set."
    echo ""
    echo "Resolution:"
    echo "  Set BITBUCKET_TOKEN to your Bitbucket personal access token"
    echo "  Get one at: https://bitbucket.lab.dynatrace.org/plugins/servlet/access-tokens/manage"
    echo ""
    echo "  export BITBUCKET_TOKEN=your_token_here"
    exit 1
fi
echo "✅ Set"

# Check 2: curl installation
echo -n "  curl: "
if ! command -v curl &> /dev/null; then
    echo "❌ Not installed"
    echo ""
    echo "Error: curl is required but not found."
    echo ""
    echo "Install curl:"
    echo "  Linux:  apt-get install curl"
    echo "  macOS:  brew install curl"
    exit 1
fi
echo "✅ Installed"

# Check 3: jq installation
echo -n "  jq: "
if ! command -v jq &> /dev/null; then
    echo "❌ Not installed"
    echo ""
    echo "Error: jq is required but not found."
    echo ""
    echo "Install jq:"
    echo "  Linux:  apt-get install jq"
    echo "  macOS:  brew install jq"
    exit 1
fi
echo "✅ Installed"

# Check 4: Git repository
echo -n "  Git repository: "
if ! git rev-parse --git-dir 2>/dev/null > /dev/null; then
    echo "❌ Not found"
    echo ""
    echo "Error: Not in a git repository."
    echo ""
    echo "Resolution:"
    echo "  Navigate to your project directory."
    echo "  Run: git init  (to initialize a new repository)"
    exit 1
fi
echo "✅ Found"

# Check 5: Bitbucket remote detected (warning only, not fatal)
echo -n "  Bitbucket remote: "
REMOTE_URL=$(git remote get-url origin 2>/dev/null || true)

BB_PROJECT=""
BB_REPO=""

if echo "$REMOTE_URL" | grep -q "bitbucket.lab.dynatrace.org"; then
    # Extract project and repo from URL
    # Handles both HTTPS and SSH URL formats:
    #   https://bitbucket.lab.dynatrace.org/scm/PROJECT/repo.git
    #   ssh://git@bitbucket.lab.dynatrace.org/PROJECT/repo.git
    BB_PROJECT=$(echo "$REMOTE_URL" | sed -E 's|.*[/:]([^/]+)/([^/]+)(\.git)?$|\1|' | tr '[:lower:]' '[:upper:]')
    BB_REPO=$(echo "$REMOTE_URL" | sed -E 's|.*[/:]([^/]+)/([^/]+)(\.git)?$|\2|' | sed 's/\.git$//')
    echo "✅ Detected"
else
    echo "⚠️  Not detected"
    echo ""
    echo "  ⚠️  No Bitbucket remote detected. You may need to set BB_PROJECT and BB_REPO manually."
fi

# All required checks passed
echo ""
echo "✅ All prerequisites met"
echo "   Bitbucket: https://bitbucket.lab.dynatrace.org"
if [ -n "$BB_PROJECT" ] && [ -n "$BB_REPO" ]; then
    echo "   Project: $BB_PROJECT  Repository: $BB_REPO"
fi
echo ""
exit 0
