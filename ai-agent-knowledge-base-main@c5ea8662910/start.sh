#!/bin/bash
set -e

# Script to start the dev container and run any command
# Works with both Docker and Podman

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER_NAME="ai-agent-kb-devcontainer"
IMAGE_NAME="ai-agent-kb-devcontainer:latest"

# Detect container runtime (Docker or Podman)
if command -v podman &> /dev/null; then
    CONTAINER_CMD="podman"
elif command -v docker &> /dev/null; then
    CONTAINER_CMD="docker"
else
    echo "Error: Neither docker nor podman found. Please install one of them."
    exit 1
fi

# Parse command line arguments
REBUILD=false
ARGS=()
for arg in "$@"; do
    if [ "$arg" = "--rebuild" ]; then
        REBUILD=true
    else
        ARGS+=("$arg")
    fi
done

# Default command if none provided
if [ ${#ARGS[@]} -eq 0 ]; then
    COMMAND="opencode /workspace"
else
    COMMAND="${ARGS[*]}"
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting AI Agent Knowledge Base Dev Container...${NC}"
echo -e "${BLUE}   Using: ${CONTAINER_CMD}${NC}"

# Function to check if container exists
container_exists() {
    $CONTAINER_CMD ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

# Function to check if container is running
container_running() {
    $CONTAINER_CMD ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"
}

# Function to build the image if needed
build_image() {
    if ! $CONTAINER_CMD image inspect "${IMAGE_NAME}" >/dev/null 2>&1; then
        # Warn about missing GitHub token (only when actually building)
        if [ -z "${GITHUB_TOKEN}" ] && [ -z "${MISE_GITHUB_TOKEN}" ]; then
            echo -e "${YELLOW}⚠️  WARNING: GITHUB_TOKEN not set${NC}"
            echo -e "${YELLOW}   mise may hit GitHub API rate limits (60 req/hr) during image build.${NC}"
            echo -e "${YELLOW}   Set GITHUB_TOKEN in your shell profile to avoid this.${NC}"
            echo ""
        fi
        echo -e "${YELLOW}📦 Building dev container image (first time setup)...${NC}"
        $CONTAINER_CMD build -t "${IMAGE_NAME}" \
            --build-arg GITHUB_TOKEN="${GITHUB_TOKEN}" \
            --build-arg MISE_GITHUB_TOKEN="${MISE_GITHUB_TOKEN:-$GITHUB_TOKEN}" \
            -f .devcontainer/Dockerfile .devcontainer/
    fi
}

# Function to start the container
start_container() {
    if container_exists; then
        if ! container_running; then
            echo -e "${GREEN}▶️  Starting existing container...${NC}"
            $CONTAINER_CMD start "${CONTAINER_NAME}"
        else
            echo -e "${GREEN}✅ Container already running${NC}"
        fi
    else
        echo -e "${YELLOW}🆕 Creating new container...${NC}"
        
        # Load volume mount configuration
        echo -e "${BLUE}📂 Configuring volume mounts:${NC}"
        source "${SCRIPT_DIR}/.devcontainer/start-volumes.sh"
        
        # Podman-specific options
        PODMAN_OPTS=""
        if [ "$CONTAINER_CMD" = "podman" ]; then
            # Podman runs rootless by default, adjust user mapping if needed
            PODMAN_OPTS="--userns=keep-id"
        fi
        
        $CONTAINER_CMD run -d \
            --name "${CONTAINER_NAME}" \
            --hostname devcontainer \
            -v "${SCRIPT_DIR}:/workspace:Z" \
            ${VOLUME_MOUNTS} \
            -p 3000:3000 \
            -e NODE_ENV=development \
            -e GITHUB_TOKEN="${GITHUB_TOKEN}" \
            -e MISE_GITHUB_TOKEN="${MISE_GITHUB_TOKEN:-$GITHUB_TOKEN}" \
            --user vscode \
            $PODMAN_OPTS \
            "${IMAGE_NAME}" \
            sleep infinity
        
        echo -e "${YELLOW}⚙️  Running post-create setup...${NC}"
        $CONTAINER_CMD exec "${CONTAINER_NAME}" bash /workspace/.devcontainer/post-create.sh
    fi
}

# Handle --rebuild: remove container and image to force clean rebuild
if [ "$REBUILD" = true ]; then
    echo -e "${YELLOW}♻️  Rebuilding: removing existing container and image...${NC}"
    if container_exists; then
        $CONTAINER_CMD rm -f "${CONTAINER_NAME}"
        echo -e "${GREEN}   Container removed${NC}"
    fi
    if $CONTAINER_CMD image inspect "${IMAGE_NAME}" >/dev/null 2>&1; then
        $CONTAINER_CMD rmi "${IMAGE_NAME}"
        echo -e "${GREEN}   Image removed${NC}"
    fi
fi

# Build image if needed
build_image

# Start or ensure container is running
start_container

# Execute the requested command with mise environment
echo -e "${GREEN}🚀 Running: ${COMMAND}${NC}"
echo ""
$CONTAINER_CMD exec -it "${CONTAINER_NAME}" bash -c "eval \"\$(/home/vscode/.local/bin/mise activate bash)\" && ${COMMAND}"
