# Base image - Debian Bookworm with basic tools
FROM mcr.microsoft.com/devcontainers/base:bookworm

# Install system dependencies
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        git \
        curl \
        ca-certificates \
        build-essential \
        vim \
        less \
        jq \
        pipx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install mise as vscode user
USER vscode

# Install mise
RUN curl https://mise.run | sh

# Add mise to PATH and shell initialization
ENV PATH="/home/vscode/.local/bin:${PATH}"
RUN echo 'eval "$(/home/vscode/.local/bin/mise activate bash)"' >> /home/vscode/.bashrc \
    && echo 'eval "$(/home/vscode/.local/bin/mise activate bash)"' >> /home/vscode/.bash_profile

# Copy mise-template.toml to mise config location and install tools
COPY --chown=vscode:vscode mise-template.toml /home/vscode/.config/mise/config.toml
# GitHub token for mise (avoids 60 req/hr API rate limit during tool install)
# Note: ARG values are visible in `docker history`. Acceptable for local dev
# images that are never pushed to a registry.
ARG GITHUB_TOKEN
ARG MISE_GITHUB_TOKEN=${GITHUB_TOKEN}
RUN /home/vscode/.local/bin/mise install

# Copy OpenCode configuration (but NOT credentials)
# Credentials will be mounted at runtime from ~/.local/share/opencode
COPY --chown=vscode:vscode config/opencode/*.json /home/vscode/.config/opencode/

# Set working directory
WORKDIR /workspace
