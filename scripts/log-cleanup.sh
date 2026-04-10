#!/bin/bash
# ============================================================
#  Business Observability Demonstrator — Log Cleanup & Rotation
# ============================================================
#  Prevents server.log and other logs from filling the disk.
#
#  Usage:
#    bash scripts/log-cleanup.sh              # Run once (manual)
#    bash scripts/log-cleanup.sh --install    # Install as daily cron job
#    bash scripts/log-cleanup.sh --uninstall  # Remove the cron job
#
#  What it does:
#    1. Rotates logs/server.log when it exceeds MAX_LOG_SIZE (default 50MB)
#    2. Keeps up to MAX_ROTATED_LOGS rotated copies (default 3)
#    3. Cleans up stale root-level server.log (legacy path from setup.sh)
#    4. Purges npm debug logs older than 7 days
#    5. Trims dist/logs/agents.log if oversized
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# ── Configuration ───────────────────────────────────────────
MAX_LOG_SIZE_MB=50                   # Rotate when log exceeds this size
MAX_ROTATED_LOGS=3                   # Keep this many rotated copies
NPM_LOG_RETENTION_DAYS=7             # Delete npm debug logs older than this
CRON_SCHEDULE="0 3 * * *"           # Daily at 3 AM

# ── Colors (only when interactive) ──────────────────────────
if [ -t 1 ]; then
  GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
else
  GREEN=''; YELLOW=''; CYAN=''; NC=''
fi
ok()   { echo -e "  ${GREEN}✓ $1${NC}"; }
warn() { echo -e "  ${YELLOW}⚠ $1${NC}"; }
info() { echo -e "  ${CYAN}→ $1${NC}"; }

# ── Cron management ─────────────────────────────────────────
install_cron() {
  local cron_cmd="$CRON_SCHEDULE cd $PROJECT_DIR && bash scripts/log-cleanup.sh >> logs/log-cleanup.out 2>&1"
  # Remove any existing entry first, then add
  local existing
  existing=$( (crontab -l 2>/dev/null || true) | (grep -v "log-cleanup.sh" || true) )
  printf '%s\n%s\n' "$existing" "$cron_cmd" | crontab -
  ok "Cron job installed: daily at 3 AM"
  echo "  Verify with: crontab -l"
  exit 0
}

uninstall_cron() {
  crontab -l 2>/dev/null | grep -v "log-cleanup.sh" | crontab -
  ok "Cron job removed"
  exit 0
}

case "${1:-}" in
  --install)   install_cron ;;
  --uninstall) uninstall_cron ;;
esac

# ── Utility: get file size in MB ────────────────────────────
file_size_mb() {
  local file="$1"
  if [ -f "$file" ]; then
    local bytes
    bytes=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo 0)
    echo $(( bytes / 1048576 ))
  else
    echo 0
  fi
}

echo "$(date '+%Y-%m-%d %H:%M:%S') — Log cleanup starting"
FREED=0

# ── 1. Clean up legacy root-level server.log ────────────────
LEGACY_LOG="$PROJECT_DIR/server.log"
if [ -f "$LEGACY_LOG" ]; then
  SIZE_MB=$(file_size_mb "$LEGACY_LOG")
  if [ "$SIZE_MB" -gt 0 ]; then
    rm -f "$LEGACY_LOG"
    FREED=$(( FREED + SIZE_MB ))
    ok "Removed legacy server.log (${SIZE_MB}MB) — logs now go to logs/server.log"
  fi
fi

# ── 2. Rotate logs/server.log ───────────────────────────────
SERVER_LOG="$PROJECT_DIR/logs/server.log"
mkdir -p "$PROJECT_DIR/logs"

if [ -f "$SERVER_LOG" ]; then
  SIZE_MB=$(file_size_mb "$SERVER_LOG")
  if [ "$SIZE_MB" -ge "$MAX_LOG_SIZE_MB" ]; then
    info "server.log is ${SIZE_MB}MB (limit: ${MAX_LOG_SIZE_MB}MB) — rotating"

    # Shift existing rotated logs (server.log.3 → deleted, .2 → .3, .1 → .2)
    for i in $(seq "$MAX_ROTATED_LOGS" -1 2); do
      prev=$(( i - 1 ))
      [ -f "${SERVER_LOG}.${prev}.gz" ] && mv "${SERVER_LOG}.${prev}.gz" "${SERVER_LOG}.${i}.gz"
    done

    # Compress current log → server.log.1.gz
    gzip -c "$SERVER_LOG" > "${SERVER_LOG}.1.gz"
    truncate -s 0 "$SERVER_LOG"

    # Remove rotated logs beyond the retention limit
    for i in $(seq $(( MAX_ROTATED_LOGS + 1 )) $(( MAX_ROTATED_LOGS + 5 ))); do
      rm -f "${SERVER_LOG}.${i}.gz"
    done

    FREED=$(( FREED + SIZE_MB ))
    ok "Rotated server.log (was ${SIZE_MB}MB, kept ${MAX_ROTATED_LOGS} backups)"
  else
    ok "server.log is ${SIZE_MB}MB — under ${MAX_LOG_SIZE_MB}MB limit, no rotation needed"
  fi
fi

# ── 3. Trim dist/logs/agents.log ────────────────────────────
AGENTS_LOG="$PROJECT_DIR/dist/logs/agents.log"
if [ -f "$AGENTS_LOG" ]; then
  SIZE_MB=$(file_size_mb "$AGENTS_LOG")
  if [ "$SIZE_MB" -ge "$MAX_LOG_SIZE_MB" ]; then
    truncate -s 0 "$AGENTS_LOG"
    FREED=$(( FREED + SIZE_MB ))
    ok "Truncated agents.log (was ${SIZE_MB}MB)"
  fi
fi

# ── 4. Clean stale npm debug logs ───────────────────────────
NPM_LOGS_DIR="$HOME/.npm/_logs"
if [ -d "$NPM_LOGS_DIR" ]; then
  DELETED_COUNT=$(find "$NPM_LOGS_DIR" -name "*.log" -mtime +"$NPM_LOG_RETENTION_DAYS" -delete -print 2>/dev/null | wc -l)
  if [ "$DELETED_COUNT" -gt 0 ]; then
    ok "Cleaned $DELETED_COUNT npm debug log(s) older than ${NPM_LOG_RETENTION_DAYS} days"
  fi
fi

# ── 5. Clean log-cleanup.out if it gets too big ─────────────
CLEANUP_LOG="$PROJECT_DIR/logs/log-cleanup.out"
if [ -f "$CLEANUP_LOG" ]; then
  SIZE_MB=$(file_size_mb "$CLEANUP_LOG")
  if [ "$SIZE_MB" -ge 5 ]; then
    tail -100 "$CLEANUP_LOG" > "${CLEANUP_LOG}.tmp" && mv "${CLEANUP_LOG}.tmp" "$CLEANUP_LOG"
    ok "Trimmed log-cleanup.out (was ${SIZE_MB}MB)"
  fi
fi

# ── Summary ─────────────────────────────────────────────────
if [ "$FREED" -gt 0 ]; then
  echo "  📊 Freed ~${FREED}MB of disk space"
else
  echo "  📊 All logs within limits — nothing to clean"
fi

AVAIL_MB=$(df -m / | awk 'NR==2 {print $4}')
AVAIL_GB=$(( AVAIL_MB / 1024 ))
echo "  💾 Disk: ${AVAIL_GB}GB free"
echo "$(date '+%Y-%m-%d %H:%M:%S') — Log cleanup complete"
