#!/bin/bash
# ============================================================
#  Business Observability Demonstrator — Update Script
# ============================================================
#
#  Usage:
#    bash update.sh              # Pull + rebuild + restart server + deploy UI
#    bash update.sh --server     # Server-side only (no AppEngine deploy)
#    bash update.sh --ui         # AppEngine UI deploy only (no server restart)
#    bash update.sh --no-restart # Pull + build but don't restart server
#
#  This script updates without losing credentials, configs, or state.
#  It reads setup.conf for deploy credentials automatically.
# ============================================================

set -e
cd "$(dirname "$0")"

# ── Colors ──
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
ok()   { echo -e "  ${GREEN}✓ $1${NC}"; }
warn() { echo -e "  ${YELLOW}⚠ $1${NC}"; }
fail() { echo -e "  ${RED}✗ $1${NC}"; exit 1; }

# ── Parse flags ──
DO_SERVER=true
DO_UI=true
DO_RESTART=true

for arg in "$@"; do
  case "$arg" in
    --server)     DO_UI=false ;;
    --ui)         DO_SERVER=false; DO_RESTART=false ;;
    --no-restart) DO_RESTART=false ;;
    -h|--help)
      echo "Usage: bash update.sh [--server | --ui | --no-restart]"
      echo "  --server      Server only (skip AppEngine deploy)"
      echo "  --ui          AppEngine UI only (skip server restart)"
      echo "  --no-restart  Pull + build but don't restart the server"
      exit 0
      ;;
  esac
done

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Business Observability Demonstrator — Update            ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Load credentials from setup.conf ──
CONF_FILE="$(pwd)/setup.conf"
if [[ -f "$CONF_FILE" ]]; then
  source "$CONF_FILE"
  ok "Loaded credentials from setup.conf"
else
  warn "No setup.conf found — AppEngine deploy will be skipped unless credentials are in env"
fi

# Derive URLs
if [[ "$ENV_TYPE" == "prod" ]]; then
  APPS_URL="https://${TENANT_ID}.apps.dynatrace.com"
else
  APPS_URL="https://${TENANT_ID}.sprint.apps.dynatracelabs.com"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 1: Pull latest code
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "\n${CYAN}${BOLD}[1/5]${NC} ${BOLD}Pulling latest changes${NC}"

# Stash any local changes to avoid conflicts
if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
  STASHED=false
else
  git stash push -m "update-script-$(date +%s)" 2>/dev/null && STASHED=true || STASHED=false
  [[ "$STASHED" == true ]] && warn "Stashed local changes (will restore after)"
fi

BEFORE=$(git rev-parse HEAD 2>/dev/null || echo "unknown")

# Pull from all configured remotes (origin + demonstrator)
PULLED=false
for remote in demonstrator origin; do
  if git remote get-url "$remote" &>/dev/null; then
    BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
    if git pull "$remote" "$BRANCH" 2>&1 | tail -3; then
      ok "Pulled from $remote/$BRANCH"
      PULLED=true
      break
    else
      warn "Failed to pull from $remote — trying next"
    fi
  fi
done

if [[ "$PULLED" != true ]]; then
  warn "No remote pull succeeded — continuing with local code"
fi

AFTER=$(git rev-parse HEAD 2>/dev/null || echo "unknown")

# Restore stashed changes
if [[ "$STASHED" == true ]]; then
  git stash pop 2>/dev/null && ok "Restored stashed changes" || warn "Could not restore stash — run: git stash pop"
fi

if [[ "$BEFORE" == "$AFTER" ]]; then
  echo -e "  Already up to date (${AFTER:0:7})"
else
  echo -e "  Updated: ${BEFORE:0:7} → ${AFTER:0:7}"
  # Show what changed
  git --no-pager log --oneline "${BEFORE}..${AFTER}" 2>/dev/null | head -10
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 2: Install dependencies (only if package.json changed)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "\n${CYAN}${BOLD}[2/5]${NC} ${BOLD}Checking dependencies${NC}"

if [[ "$BEFORE" != "$AFTER" ]] && git diff --name-only "${BEFORE}" "${AFTER}" 2>/dev/null | grep -q "package.json"; then
  echo "  package.json changed — running npm install..."
  npm install --loglevel=warn 2>&1 | tail -3
  ok "Dependencies updated"
elif [[ ! -d node_modules ]]; then
  echo "  node_modules missing — running npm install..."
  npm install --loglevel=warn 2>&1 | tail -3
  ok "Dependencies installed"
else
  ok "Dependencies up to date (no package.json changes)"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 3: Build TypeScript agents
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "\n${CYAN}${BOLD}[3/5]${NC} ${BOLD}Building TypeScript agents${NC}"

if [[ "$DO_SERVER" == true ]]; then
  npm run build:agents 2>&1 | tail -3
  ok "Agents compiled"
else
  echo "  Skipped (--ui mode)"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 4: Restart server (zero-downtime: stop → start)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "\n${CYAN}${BOLD}[4/5]${NC} ${BOLD}Restarting server${NC}"

if [[ "$DO_RESTART" == true && "$DO_SERVER" == true ]]; then
  # Stop existing server
  if [[ -f server.pid ]]; then
    PID=$(cat server.pid)
    if kill -0 "$PID" 2>/dev/null; then
      kill "$PID" 2>/dev/null
      echo "  Stopped server (PID $PID)"
      sleep 2
      kill -0 "$PID" 2>/dev/null && kill -9 "$PID" 2>/dev/null || true
    fi
    rm -f server.pid
  fi
  pkill -f "node.*server.js" 2>/dev/null || true
  sleep 1

  # Rotate log if large
  if [[ -f logs/server.log ]]; then
    LOG_SIZE=$(stat -c%s logs/server.log 2>/dev/null || echo 0)
    if (( LOG_SIZE > 52428800 )); then
      gzip -c logs/server.log > logs/server.log.1.gz
      truncate -s 0 logs/server.log
      ok "Rotated server.log ($(( LOG_SIZE / 1048576 ))MB)"
    fi
  fi

  # Start server
  mkdir -p logs
  nohup npm start >> logs/server.log 2>&1 &
  SERVER_PID=$!
  echo "$SERVER_PID" > server.pid

  # Wait for health
  echo -n "  Waiting for server"
  for i in {1..20}; do
    if curl -sf http://localhost:8080/api/health &>/dev/null; then
      break
    fi
    echo -n "."
    sleep 1
  done
  echo ""

  if curl -sf http://localhost:8080/api/health &>/dev/null; then
    ok "Server running on port 8080 (PID: $SERVER_PID)"
  else
    warn "Server still starting — check: tail -f logs/server.log"
  fi
else
  echo "  Skipped (--no-restart or --ui mode)"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 5: Deploy AppEngine UI (hot-update — no restart needed)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "\n${CYAN}${BOLD}[5/5]${NC} ${BOLD}Deploying AppEngine UI${NC}"

if [[ "$DO_UI" == true ]]; then
  # Resolve deploy credentials
  DEPLOY_ID="${DEPLOY_OAUTH_CLIENT_ID:-$DT_APP_OAUTH_CLIENT_ID}"
  DEPLOY_SECRET="${DEPLOY_OAUTH_CLIENT_SECRET:-$DT_APP_OAUTH_CLIENT_SECRET}"

  if [[ -z "$DEPLOY_ID" || -z "$DEPLOY_SECRET" ]]; then
    warn "No deploy OAuth credentials found — skipping AppEngine deploy"
    echo -e "  ${CYAN}To deploy manually: DT_APP_OAUTH_CLIENT_ID=... DT_APP_OAUTH_CLIENT_SECRET=... npx dt-app deploy${NC}"
  else
    export DT_APP_OAUTH_CLIENT_ID="$DEPLOY_ID"
    export DT_APP_OAUTH_CLIENT_SECRET="$DEPLOY_SECRET"

    echo "  Building AppEngine app..."
    if npx dt-app build 2>&1 | tail -3; then
      ok "App built"
    else
      fail "App build failed — check TypeScript errors"
    fi

    echo "  Deploying to ${APPS_URL:-Dynatrace}..."
    if npx dt-app deploy --non-interactive 2>&1 | tail -5; then
      ok "AppEngine UI deployed — changes are live immediately (no restart needed)"
    else
      warn "Deploy had issues — retry with: bash update.sh --ui"
    fi
  fi
else
  echo "  Skipped (--server mode)"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Done
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo -e "${GREEN}${BOLD}✅ Update complete!${NC}"
echo ""
echo -e "  ${CYAN}Server:${NC}  $(curl -sf http://localhost:8080/api/health | grep -o '"status":"[^"]*"' || echo 'not checked')"
echo -e "  ${CYAN}Commit:${NC}  $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
echo -e "  ${CYAN}Version:${NC} $(grep '"version"' app.config.json 2>/dev/null | head -1 | grep -o '"[0-9.]*"' || echo 'unknown')"
echo ""
