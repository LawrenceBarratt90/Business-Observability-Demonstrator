#!/bin/bash

# dev-setup.sh - Development Environment Setup for AI Agent Knowledge Base
# This script checks prerequisites, verifies tool configuration, and installs kb-run

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Track overall status
PREREQ_CHECK_PASSED=true

# ============================================
# STEP 1: Check Required Tools
# ============================================
print_header "Step 1: Checking Required Tools"

# Check for dtctl
print_info "Checking for dtctl..."
if command -v dtctl &> /dev/null; then
    DTCTL_VERSION=$(dtctl version 2>&1 | head -n 1 || echo "unknown")
    print_success "dtctl is installed and available on PATH"
    print_info "   Version: $DTCTL_VERSION"
else
    print_error "dtctl is NOT installed or not available on PATH"
    print_info "   Install with: mise use -g github:dynatrace-oss/dtctl"
    print_info "   Or download from: https://github.com/dynatrace-oss/dtctl/releases"
    PREREQ_CHECK_PASSED=false
fi

# Check for aimgr
print_info "Checking for aimgr..."
if command -v aimgr &> /dev/null; then
    AIMGR_VERSION=$(aimgr --version 2>&1 || echo "unknown")
    print_success "aimgr is installed and available on PATH"
    print_info "   Version: $AIMGR_VERSION"
else
    print_error "aimgr is NOT installed or not available on PATH"
    print_info "   Install with: mise use -g github:dynatrace-oss/ai-config-manager"
    print_info "   Alternative: go install github.com/dynatrace-oss/ai-config-manager/v3/cmd/aimgr@latest"
    print_info "   Or download from: https://github.com/dynatrace-oss/ai-config-manager/releases"
    PREREQ_CHECK_PASSED=false
fi

# Check for Node.js (needed for kb-run installation)
print_info "Checking for Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1 | sed 's/v//')
    print_success "Node.js is installed: $NODE_VERSION"
    
    if [ "$NODE_MAJOR" -lt 18 ]; then
        print_warning "Node.js version is less than 18. Version 18+ is recommended."
        print_info "   Install via nvm: nvm install 18 && nvm use 18"
    fi
else
    print_error "Node.js is NOT installed"
    print_info "   Install via nvm: https://github.com/nvm-sh/nvm"
    PREREQ_CHECK_PASSED=false
fi

# Check for npm (needed for kb-run installation)
print_info "Checking for npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm is installed: $NPM_VERSION"
else
    print_error "npm is NOT installed (should come with Node.js)"
    PREREQ_CHECK_PASSED=false
fi

# Exit if prerequisites failed
if [ "$PREREQ_CHECK_PASSED" = false ]; then
    print_header "Setup Failed"
    print_error "One or more required tools are missing. Please install them and run this script again."
    exit 1
fi

# ============================================
# STEP 2: Check dtctl Configuration
# ============================================
print_header "Step 2: Verifying dtctl Configuration"

print_info "Checking for dtctl contexts..."

# Use dtctl config get-contexts to list contexts
DTCTL_CONTEXTS=$(dtctl config get-contexts 2>&1 || echo "")

if [ -z "$DTCTL_CONTEXTS" ] || echo "$DTCTL_CONTEXTS" | grep -qi "no contexts"; then
    print_error "No dtctl contexts configured"
    print_info "   Configure a context with: dtctl config set-context"
    print_info "   Example:"
    print_info "     dtctl config set-context my-context \\"
    print_info "       --environment https://abc123.live.dynatrace.com \\"
    print_info "       --token dt0c01.XXXX.YYYY"
    exit 1
else
    print_success "dtctl contexts are configured"
    echo ""
    
    # Show available contexts in a clean format
    print_info "Available contexts:"
    echo "$DTCTL_CONTEXTS" | grep -v "^$"
    echo ""
    
    # Check for active context using current-context command
    ACTIVE_CONTEXT=$(dtctl config current-context 2>&1 || echo "")
    if [ -n "$ACTIVE_CONTEXT" ] && [[ "$ACTIVE_CONTEXT" != "Error:"* ]]; then
        print_success "Active context: $ACTIVE_CONTEXT"
    else
        print_warning "No active context set"
        print_info "   Set with: dtctl config use-context <context-name>"
    fi
fi

# ============================================
# STEP 3: Install kb-run Tool
# ============================================
print_header "Step 3: Installing kb-run Tool"

KB_RUN_DIR="devtools/kb-run"

if [ ! -d "$KB_RUN_DIR" ]; then
    print_error "kb-run directory not found at $KB_RUN_DIR"
    print_info "   Make sure you're running this script from the repository root"
    exit 1
fi

print_info "Navigating to kb-run directory..."
cd "$KB_RUN_DIR"

print_info "Installing dependencies..."
if npm install; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

print_info "Building kb-run..."
if npm run build; then
    print_success "kb-run built successfully"
else
    print_error "Failed to build kb-run"
    exit 1
fi

print_info "Installing kb-run globally..."
if npm link; then
    print_success "kb-run installed globally"
else
    print_error "Failed to install kb-run globally"
    print_info "   You may need to run with sudo: sudo npm link"
    exit 1
fi

# Return to repository root
cd - > /dev/null

# Verify kb-run installation
print_info "Verifying kb-run installation..."
if command -v kb-run &> /dev/null; then
    KB_RUN_VERSION=$(kb-run --version 2>&1 || echo "installed")
    print_success "kb-run is available on PATH"
    print_info "   Version: $KB_RUN_VERSION"
else
    print_error "kb-run command not found after installation"
    print_warning "You may need to add npm global bin directory to your PATH"
    print_info "   Find npm bin path with: npm bin -g"
    exit 1
fi

# ============================================
# SETUP COMPLETE
# ============================================
print_header "Setup Complete! 🎉"

print_success "All prerequisites are installed and configured"
print_success "Development environment is ready"

echo ""
print_info "Next steps:"
echo "   1. Explore available skills:"
echo "      ls knowledge-base/dynatrace/skills/"
echo ""
echo "   2. Use kb-run to create an evaluation environment:"
echo "      kb-run start"
echo ""
echo "   3. Install individual skills with aimgr:"
echo "      aimgr install skill/dt-dql-essentials"
echo ""
echo "   4. View documentation:"
echo "      cat docs/kb-overview.md"
echo ""

print_info "For more information, see README.md"
