#!/bin/bash
# Self-Healing Pre-Start Script for BizObs Server
# Runs before the server starts — ensures compiled TS agents exist and data dirs are ready.

set -e

APP_DIR="/home/ec2-user/Business-Observability-Demonstrator"
NODE="/home/ec2-user/.nvm/versions/node/v24.14.0/bin/node"
NPX="/home/ec2-user/.nvm/versions/node/v24.14.0/bin/npx"
LOG="$APP_DIR/server.log"

cd "$APP_DIR"

log() {
  echo "[self-heal] $(date '+%Y-%m-%d %H:%M:%S') $*" | tee -a "$LOG"
}

# 1. Ensure data directory exists (for field-repo.json etc.)
if [ ! -d "$APP_DIR/data" ]; then
  mkdir -p "$APP_DIR/data"
  log "Created data/ directory"
fi

# 2. Ensure saved-configs directory exists
if [ ! -d "$APP_DIR/saved-configs" ]; then
  mkdir -p "$APP_DIR/saved-configs"
  log "Created saved-configs/ directory"
fi

# 3. Check if TS agents compilation is needed
# The server imports from dist/agents/ — if missing, compile them
SENTINEL="$APP_DIR/dist/agents"
if [ ! -d "$SENTINEL" ]; then
  log "⚠️  dist/agents/ missing — compiling TypeScript agents..."
  $NPX tsc --project tsconfig.json 2>&1 | tee -a "$LOG" || true
  if [ -d "$SENTINEL" ]; then
    log "✅ TypeScript compilation succeeded"
  else
    log "❌ TypeScript compilation failed — server may still start (agents optional)"
  fi
else
  log "✅ dist/agents/ exists — skipping TS compilation"
fi

# 4. Verify server.js exists
if [ ! -f "$APP_DIR/server.js" ]; then
  log "❌ FATAL: server.js not found!"
  exit 1
fi

# 5. Verify otel.cjs exists
if [ ! -f "$APP_DIR/otel.cjs" ]; then
  log "⚠️  otel.cjs not found — telemetry will not be available"
fi

# 6. Quick syntax check on server entry point
$NODE --check "$APP_DIR/server.js" 2>&1 | tee -a "$LOG"
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  log "❌ server.js has syntax errors — attempting to continue anyway"
fi

log "✅ Self-heal checks complete — starting server"
