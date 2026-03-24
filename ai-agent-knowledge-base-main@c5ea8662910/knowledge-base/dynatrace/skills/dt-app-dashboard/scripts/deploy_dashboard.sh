#!/usr/bin/env bash
set -euo pipefail

# Usage: bash deploy_dashboard.sh <dashboard.json>
[[ $# -lt 1 ]] && { echo "Usage: $0 <dashboard.json>" >&2; exit 1; }
INPUT="$1"

# ── Input guards ─────────────────────────────────────────────────
[[ -f "$INPUT" ]] || { echo "Error: File not found: $INPUT" >&2; exit 1; }
jq empty "$INPUT" 2>/dev/null || { echo "Error: File is not valid JSON: $INPUT" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Validate ─────────────────────────────────────────────────────
bash "$SCRIPT_DIR/validate_dashboard.sh" "$INPUT" >&2 || {
  echo "Validation failed. Deployment aborted." >&2
  exit 1
}

# ── Deploy ───────────────────────────────────────────────────────
APPLY_JSON=$(dtctl apply -f "$INPUT" -o json --plain 2>&1) || {
  echo "$APPLY_JSON" >&2
  exit 1
}

# ── Extract output fields from dtctl response ────────────────────
DASHBOARD_NAME=$(echo "$APPLY_JSON" | jq -r '.name // empty' 2>/dev/null || true)
DASHBOARD_URL=$(echo "$APPLY_JSON" | jq -r '.url // empty' 2>/dev/null || true)

[[ -n "$DASHBOARD_URL" ]] || {
  echo "Error: Deployment succeeded but dtctl did not return dashboard URL." >&2
  echo "$APPLY_JSON" >&2
  exit 1
}

[[ -n "$DASHBOARD_NAME" ]] || DASHBOARD_NAME="Dashboard"

echo "Dashboard link: [${DASHBOARD_NAME}](${DASHBOARD_URL})"
