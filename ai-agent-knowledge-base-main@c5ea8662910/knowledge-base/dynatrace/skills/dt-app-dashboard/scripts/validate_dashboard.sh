#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXECUTOR="$SCRIPT_DIR/dashboard-validator.js"

usage() {
  echo "Usage: $0 <dashboard-id | path-to-dashboard.json>"
  echo ""
  echo "Examples:"
  echo "  $0 dynatrace.clouds.aws-eks"
  echo "  $0 003a354b-de20-4a5d-bf7f-ce7372dd1d42"
  echo "  $0 ./dashboard.json"
  exit 1
}

[[ $# -lt 1 ]] && usage

INPUT="$1"

# ── Resolve dashboard JSON ───────────────────────────────────────
if [[ -f "$INPUT" ]]; then
  DASHBOARD_JSON=$(cat "$INPUT")
else
  DASHBOARD_JSON=$(dtctl get dashboard "$INPUT" -o json --plain)
fi

# ── Validate ─────────────────────────────────────────────────────
OUTPUT=$(echo "$DASHBOARD_JSON" | jq '{dashboard: .}' \
  | dtctl exec function -f "$EXECUTOR" --data - --plain \
  | jq -r .result)

echo "$OUTPUT"

# Exit with error if validation did not succeed
echo "$OUTPUT" | grep -q "VALIDATION SUCCEEDED" || exit 1
