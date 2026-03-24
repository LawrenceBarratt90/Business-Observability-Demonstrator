#!/usr/bin/env bash
# review-pr.sh — Two-phase PR review tool for Bitbucket Server
#
# Phase 1 — FETCH (script → agent):
#   review-pr.sh fetch <pr-id-or-url>
#   Outputs PR data as JSON to stdout for agent analysis.
#
# Phase 2 — POST (agent → script):
#   echo '<feedback-json>' | review-pr.sh post <pr-id-or-url> [--dry-run]
#   Reads feedback JSON from stdin, posts comments/tasks to Bitbucket.
#
# Requirements:
#   - BITBUCKET_TOKEN environment variable must be set
#   - curl and jq must be installed
#   - bb-api.sh must be in the same directory
#
# Examples:
#   # Fetch PR data for agent analysis
#   review-pr.sh fetch 2639
#   review-pr.sh fetch https://bitbucket.lab.dynatrace.org/projects/PFS/repos/myrepo/pull-requests/2639
#
#   # Post agent-generated feedback (pipe JSON to stdin)
#   echo '{"summary":"LGTM","items":[]}' | review-pr.sh post 2639
#   cat feedback.json | review-pr.sh post 2639 --dry-run

set -euo pipefail

# ---------------------------------------------------------------------------
# Bootstrap — source bb-api.sh from same directory as this script
# ---------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=bb-api.sh
source "${SCRIPT_DIR}/bb-api.sh"

# ---------------------------------------------------------------------------
# Usage
# ---------------------------------------------------------------------------

_usage() {
    cat >&2 <<'EOF'
Usage:
  review-pr.sh fetch <pr-id-or-url>
      Fetch PR data (details, diffs, commits) and output as JSON to stdout.

  review-pr.sh post <pr-id-or-url> [--dry-run]
      Read feedback JSON from stdin and post comments/tasks to Bitbucket.
      Use --dry-run to preview without calling the API.

Feedback JSON format (stdin for 'post'):
  {
    "summary": "Overall review summary text",
    "items": [
      {
        "file": "path/to/file.py",
        "line": 42,
        "severity": "error|warning|info",
        "category": "security|performance|style|tests|docs",
        "message": "Issue description",
        "suggestion": "How to fix (optional)",
        "create_task": true
      }
    ]
  }

Environment variables:
  BITBUCKET_TOKEN   Personal access token (required)
  BB_PROJECT        Bitbucket project key (auto-detected from git remote)
  BB_REPO           Bitbucket repository slug (auto-detected from git remote)
EOF
    exit 1
}

# ---------------------------------------------------------------------------
# Argument resolution helpers
# ---------------------------------------------------------------------------

# _resolve_pr_ref — Parse <pr-id-or-url> and set PR_PROJECT, PR_REPO, PR_ID globals
# Usage: _resolve_pr_ref <pr-id-or-url>
_resolve_pr_ref() {
    local ref="$1"

    if [[ "$ref" =~ ^https?:// ]]; then
        # URL form — parse project/repo/id from it
        local parsed
        parsed=$(bb_parse_pr_url "$ref") || exit 1
        read -r PR_PROJECT PR_REPO PR_ID <<< "$parsed"
    else
        # Numeric ID — use BB_PROJECT / BB_REPO from environment or git remote
        if [[ -z "${BB_PROJECT:-}" || -z "${BB_REPO:-}" ]]; then
            echo "review-pr: BB_PROJECT and BB_REPO must be set when using a numeric PR ID." >&2
            echo "  Either pass a full URL, or run from a Bitbucket git repo directory." >&2
            exit 1
        fi
        PR_PROJECT="$BB_PROJECT"
        PR_REPO="$BB_REPO"
        PR_ID="$ref"
    fi

    export PR_PROJECT PR_REPO PR_ID
}

# ---------------------------------------------------------------------------
# FETCH subcommand
# ---------------------------------------------------------------------------

cmd_fetch() {
    local ref="${1:-}"
    [[ -n "$ref" ]] || { echo "review-pr fetch: missing <pr-id-or-url>" >&2; _usage; }

    bb_init

    _resolve_pr_ref "$ref"

    # --- 1. PR details ---
    local pr_json
    pr_json=$(bb_get_pr "$PR_PROJECT" "$PR_REPO" "$PR_ID")

    local pr_id pr_title pr_description pr_author pr_target pr_source
    pr_id=$(printf '%s' "$pr_json"     | jq '.id')
    pr_title=$(printf '%s' "$pr_json"  | jq -r '.title')
    pr_description=$(printf '%s' "$pr_json" | jq -r '.description // ""')
    pr_author=$(printf '%s' "$pr_json" | jq -r '.author.user.displayName // .author.user.name // "unknown"')
    pr_target=$(printf '%s' "$pr_json" | jq -r '.toRef.displayId')
    pr_source=$(printf '%s' "$pr_json" | jq -r '.fromRef.displayId')

    # --- 2. Changed files ---
    local changes_json
    changes_json=$(bb_get_pr_changes "$PR_PROJECT" "$PR_REPO" "$PR_ID")

    # Extract file paths; handle both 'path.toString' and nested 'path.components'
    local changed_files
    changed_files=$(printf '%s' "$changes_json" | jq '[.[].path.toString // (.[].path.components | join("/")) // ""]  | map(select(. != ""))')

    # --- 3. Commits ---
    local commits_json
    commits_json=$(bb_get_pr_commits "$PR_PROJECT" "$PR_REPO" "$PR_ID")

    local commits
    commits=$(printf '%s' "$commits_json" | jq '[.[] | {
        id: .id,
        message: (.message | split("\n")[0]),
        author: (.author.displayName // .author.name // "unknown")
    }]')

    # --- 4. Per-file diffs ---
    # Build a JSON object: { "file/path": "<diff text>", ... }
    # Use a temp file to avoid "Argument list too long" when diffs are large.
    local diffs_tmp
    diffs_tmp=$(mktemp)
    printf '{}' > "$diffs_tmp"

    local file_list
    # Read file paths as a newline-separated list for bash iteration
    file_list=$(printf '%s' "$changed_files" | jq -r '.[]')

    while IFS= read -r filepath; do
        [[ -z "$filepath" ]] && continue
        local diff_text
        # On diff failure (binary file, etc.) use empty string — don't abort
        if diff_text=$(bb_get_pr_diff "$PR_PROJECT" "$PR_REPO" "$PR_ID" "$filepath" 2>/dev/null); then
            jq --arg k "$filepath" --arg v "$diff_text" '. + {($k): $v}' "$diffs_tmp" > "${diffs_tmp}.tmp" \
                && mv "${diffs_tmp}.tmp" "$diffs_tmp"
        else
            jq --arg k "$filepath" '. + {($k): ""}' "$diffs_tmp" > "${diffs_tmp}.tmp" \
                && mv "${diffs_tmp}.tmp" "$diffs_tmp"
        fi
    done <<< "$file_list"

    # --- 5. Assemble and output final JSON ---
    # Use --slurpfile to load diffs from file (avoids shell arg size limits)
    jq -n \
        --argjson pr_id      "$pr_id" \
        --arg     title      "$pr_title" \
        --arg     description "$pr_description" \
        --arg     author     "$pr_author" \
        --arg     target     "$pr_target" \
        --arg     source     "$pr_source" \
        --argjson files      "$changed_files" \
        --argjson commits    "$commits" \
        --slurpfile diffs    "$diffs_tmp" \
        '{
            pr: {
                id:           $pr_id,
                title:        $title,
                description:  $description,
                author:       $author,
                targetBranch: $target,
                sourceBranch: $source
            },
            changed_files: $files,
            commits:       $commits,
            diffs:         $diffs[0]
        }'
    rm -f "$diffs_tmp"
}

# ---------------------------------------------------------------------------
# POST subcommand
# ---------------------------------------------------------------------------

cmd_post() {
    local ref="${1:-}"
    [[ -n "$ref" ]] || { echo "review-pr post: missing <pr-id-or-url>" >&2; _usage; }

    local dry_run=false
    shift  # consumed $ref; remaining args are flags
    for arg in "$@"; do
        case "$arg" in
            --dry-run) dry_run=true ;;
            *) echo "review-pr post: unknown option: $arg" >&2; _usage ;;
        esac
    done

    # Read feedback JSON from stdin
    local feedback
    if ! feedback=$(cat); then
        echo "review-pr post: failed to read stdin" >&2
        exit 1
    fi

    # Validate JSON
    if ! printf '%s' "$feedback" | jq empty 2>/dev/null; then
        echo "review-pr post: invalid JSON received on stdin" >&2
        exit 1
    fi

    # Only call bb_init (which checks token/curl/jq) when not dry-running,
    # but we still need jq for parsing — so always check json tools are present.
    if [[ "$dry_run" == false ]]; then
        bb_init
        _resolve_pr_ref "$ref"
    else
        # In dry-run mode: still resolve project/repo/id for display, but skip API init
        # Only auto-detect BB_PROJECT/BB_REPO from git remote if not already set by caller
        if [[ -z "${BB_PROJECT:-}" || -z "${BB_REPO:-}" ]]; then
            bb_extract_repo_info 2>/dev/null || true
        fi
        _resolve_pr_ref "$ref"
    fi

    # --- Parse feedback ---
    local summary
    summary=$(printf '%s' "$feedback" | jq -r '.summary // ""')

    local items_count
    items_count=$(printf '%s' "$feedback" | jq '.items | length')

    # Count by severity for the summary comment header
    local err_count warn_count info_count task_count
    err_count=$(printf '%s'  "$feedback" | jq '[.items[] | select(.severity == "error")]  | length')
    warn_count=$(printf '%s' "$feedback" | jq '[.items[] | select(.severity == "warning")] | length')
    info_count=$(printf '%s' "$feedback" | jq '[.items[] | select(.severity == "info")]   | length')
    task_count=$(printf '%s' "$feedback" | jq '[.items[] | select(.create_task == true)]  | length')

    # --- Build summary comment text ---
    local summary_text
    summary_text=$(printf '## Code Review\n\n%s\n\n**Findings:** %d errors · %d warnings · %d info (%d items total)' \
        "$summary" "$err_count" "$warn_count" "$info_count" "$items_count")

    # --- Dry-run: print plan and exit ---
    if [[ "$dry_run" == true ]]; then
        echo "=== DRY RUN — no API calls will be made ==="
        echo ""
        echo "PR: ${PR_PROJECT}/${PR_REPO}#${PR_ID}"
        echo ""
        echo "--- Summary comment ---"
        printf '%s\n' "$summary_text"
        echo ""
        echo "--- Inline comments (${items_count} items) ---"

        local i=0
        while [[ $i -lt $items_count ]]; do
            local item
            item=$(printf '%s' "$feedback" | jq ".items[$i]")
            local file line severity category message suggestion create_task
            file=$(printf '%s'       "$item" | jq -r '.file        // ""')
            line=$(printf '%s'       "$item" | jq -r '.line        // "null"')
            severity=$(printf '%s'   "$item" | jq -r '.severity    // "info"')
            category=$(printf '%s'   "$item" | jq -r '.category    // ""')
            message=$(printf '%s'    "$item" | jq -r '.message     // ""')
            suggestion=$(printf '%s' "$item" | jq -r '.suggestion  // ""')
            create_task=$(printf '%s' "$item" | jq -r '.create_task // false')

            printf '  [%d] %s %s:%s — %s\n' "$((i+1))" "$(echo "$severity" | tr '[:lower:]' '[:upper:]')" "$file" "$line" "$message"
            [[ -n "$suggestion" ]] && printf '       Suggestion: %s\n' "$suggestion"
            [[ "$create_task" == "true" ]] && printf '       → Would create task\n'
            ((i++)) || true
        done

        echo ""
        printf 'Would post: 1 summary comment + %d inline comment(s), create %d task(s)\n' \
            "$items_count" "$task_count"
        return 0
    fi

    # --- Live posting ---
    local posted_comments=0
    local posted_tasks=0
    local failed_items=0

    # Post summary comment
    if bb_add_comment "$PR_PROJECT" "$PR_REPO" "$PR_ID" "$summary_text" >/dev/null 2>&1; then
        ((posted_comments++)) || true
    else
        echo "review-pr: WARNING: failed to post summary comment" >&2
        ((failed_items++)) || true
    fi

    # Post inline comments and tasks
    local i=0
    while [[ $i -lt $items_count ]]; do
        local item
        item=$(printf '%s' "$feedback" | jq ".items[$i]")

        local file line severity category message suggestion create_task
        file=$(printf '%s'       "$item" | jq -r '.file        // ""')
        line=$(printf '%s'       "$item" | jq -r '.line        // "null"')
        severity=$(printf '%s'   "$item" | jq -r '.severity    // "info"')
        category=$(printf '%s'   "$item" | jq -r '.category    // ""')
        message=$(printf '%s'    "$item" | jq -r '.message     // ""')
        suggestion=$(printf '%s' "$item" | jq -r '.suggestion  // ""')
        create_task=$(printf '%s' "$item" | jq -r '.create_task // false')

        # Build inline comment text
        local severity_icon
        case "$severity" in
            error)   severity_icon="🔴" ;;
            warning) severity_icon="🟡" ;;
            info)    severity_icon="🔵" ;;
            *)       severity_icon="⚪" ;;
        esac

        local comment_text
        comment_text="${severity_icon} **${severity^^}**"
        [[ -n "$category" ]] && comment_text+=" · \`${category}\`"
        comment_text+=$'\n\n'"${message}"
        [[ -n "$suggestion" ]] && comment_text+=$'\n\n'"**Suggestion:** ${suggestion}"

        # Post inline comment if we have file + line; else post as general comment
        local comment_id=""
        if [[ -n "$file" && "$line" != "null" && -n "$line" ]]; then
            local comment_response
            if comment_response=$(bb_add_file_comment "$PR_PROJECT" "$PR_REPO" "$PR_ID" \
                    "$file" "$line" "$comment_text" 2>&1); then
                comment_id=$(printf '%s' "$comment_response" | jq -r '.id // empty')
                ((posted_comments++)) || true
            else
                echo "review-pr: WARNING: failed to post inline comment for ${file}:${line} — ${comment_response}" >&2
                ((failed_items++)) || true
            fi
        else
            # No file/line anchor — fall back to a general PR comment
            local comment_response
            if comment_response=$(bb_add_comment "$PR_PROJECT" "$PR_REPO" "$PR_ID" \
                    "$comment_text" 2>&1); then
                comment_id=$(printf '%s' "$comment_response" | jq -r '.id // empty')
                ((posted_comments++)) || true
            else
                echo "review-pr: WARNING: failed to post general comment — ${comment_response}" >&2
                ((failed_items++)) || true
            fi
        fi

        # Create task if requested and we have a comment ID to anchor it to
        if [[ "$create_task" == "true" && -n "$comment_id" ]]; then
            local task_text="${message}"
            [[ -n "$suggestion" ]] && task_text+=" — ${suggestion}"

            if bb_create_task "$PR_PROJECT" "$PR_REPO" "$PR_ID" "$comment_id" "$task_text" >/dev/null 2>&1; then
                ((posted_tasks++)) || true
            else
                echo "review-pr: WARNING: failed to create task for comment ${comment_id}" >&2
                ((failed_items++)) || true
            fi
        elif [[ "$create_task" == "true" && -z "$comment_id" ]]; then
            echo "review-pr: WARNING: skipping task creation for item $((i+1)) — parent comment was not posted" >&2
        fi

        ((i++)) || true
    done

    # --- Summary output ---
    printf 'Posted %d comment(s), created %d task(s)' "$posted_comments" "$posted_tasks"
    if [[ $failed_items -gt 0 ]]; then
        printf ' (%d failure(s) — see stderr for details)' "$failed_items"
    fi
    printf '\n'
}

# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

SUBCOMMAND="${1:-}"
shift || true   # shift off subcommand; remaining in "$@"

case "$SUBCOMMAND" in
    fetch)
        cmd_fetch "$@"
        ;;
    post)
        cmd_post "$@"
        ;;
    ""|--help|-h)
        _usage
        ;;
    *)
        echo "review-pr: unknown subcommand: ${SUBCOMMAND}" >&2
        _usage
        ;;
esac
