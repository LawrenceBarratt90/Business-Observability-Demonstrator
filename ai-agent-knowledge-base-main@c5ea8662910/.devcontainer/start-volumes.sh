#!/bin/bash
# This file defines volumes to mount in the dev container
# Source this file in start.sh to get VOLUME_MOUNTS variable

# Detect host home directory
HOST_HOME="${HOME}"

# Initialize volume mounts array
VOLUME_MOUNTS=""

# OpenCode data directory (auth.json and database)
# Mount unconditionally — Docker/Podman will create the host directory if missing.
# This matches the dev-image approach and avoids silently skipping the auth mount.
VOLUME_MOUNTS="${VOLUME_MOUNTS} -v ${HOST_HOME}/.local/share/opencode:/home/vscode/.local/share/opencode:Z"
echo "  ✓ Mounting OpenCode data (auth.json, database)"

# Git config (optional - for commit signing)
if [ -f "${HOST_HOME}/.gitconfig" ]; then
    VOLUME_MOUNTS="${VOLUME_MOUNTS} -v ${HOST_HOME}/.gitconfig:/home/vscode/.gitconfig:Z"
    echo "  ✓ Mounting .gitconfig"
fi

# Export for use in start.sh
export VOLUME_MOUNTS
