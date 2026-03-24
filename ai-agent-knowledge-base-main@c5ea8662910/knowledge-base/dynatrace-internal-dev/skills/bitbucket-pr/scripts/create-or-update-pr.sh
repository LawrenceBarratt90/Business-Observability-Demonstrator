#!/usr/bin/env bash
# create-or-update-pr.sh — Create a new PR or update an existing one
#
# Usage:
#   create-or-update-pr.sh create [--title "..."] [--description "..."] [--target-branch "..."] [--dry-run]
#   create-or-update-pr.sh update <pr-id-or-url> [--title "..."] [--description "..."] [--dry-run]
#
# Environment:
#   BITBUCKET_TOKEN  — required: personal access token
#   BB_BASE_URL      — optional: override Bitbucket base URL
#   BB_PROJECT       — optional: override project key (normally auto-detected from git remote)
#   BB_REPO          — optional: override repository slug
#
# Output:
#   stdout: PR URL (and ID on create)
#   stderr: errors and warnings
#
# Exit codes:
#   0  success (or dry-run completed)
#   1  error (missing args, git context failure, API error)

set -euo pipefail

# ---------------------------------------------------------------------------
# Source the API library
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=bb-api.sh
source "${SCRIPT_DIR}/bb-api.sh"

# ---------------------------------------------------------------------------
# Usage / help
# ---------------------------------------------------------------------------
usage() {
    cat >&2 <<EOF
Usage:
  $(basename "$0") create [--title "..."] [--description "..."] [--target-branch "..."] [--dry-run]
  $(basename "$0") update <pr-id-or-url> [--title "..."] [--description "..."] [--dry-run]

Options:
  --title "..."           PR title (create: auto-generated from branch name if omitted)
  --description "..."     PR description (create: auto-generated from git log if omitted)
  --target-branch "..."   Target/base branch (create only; auto-detected if omitted)
  --dry-run               Print what would be sent without calling the API

Examples:
  $(basename "$0") create --title "My feature" --dry-run
  $(basename "$0") update 2639 --description "Updated description"
  $(basename "$0") update https://bitbucket.example.com/projects/FOO/repos/bar/pull-requests/42 --title "New title"
EOF
    exit 1
}

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
if [[ $# -lt 1 ]]; then
    usage
fi

COMMAND="$1"
shift

if [[ "$COMMAND" != "create" && "$COMMAND" != "update" ]]; then
    echo "create-or-update-pr: Unknown command '${COMMAND}'. Expected 'create' or 'update'." >&2
    usage
fi

# For 'update', the first remaining argument is pr-id-or-url
PR_ID_OR_URL=""
if [[ "$COMMAND" == "update" ]]; then
    if [[ $# -lt 1 || "$1" == --* ]]; then
        echo "create-or-update-pr: 'update' requires a PR ID or URL as the first argument." >&2
        usage
    fi
    PR_ID_OR_URL="$1"
    shift
fi

OPT_TITLE=""
OPT_DESCRIPTION=""
OPT_TARGET_BRANCH=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --title)
            [[ $# -lt 2 ]] && { echo "create-or-update-pr: --title requires a value." >&2; exit 1; }
            OPT_TITLE="$2"
            shift 2
            ;;
        --title=*)
            OPT_TITLE="${1#--title=}"
            shift
            ;;
        --description)
            [[ $# -lt 2 ]] && { echo "create-or-update-pr: --description requires a value." >&2; exit 1; }
            OPT_DESCRIPTION="$2"
            shift 2
            ;;
        --description=*)
            OPT_DESCRIPTION="${1#--description=}"
            shift
            ;;
        --target-branch)
            [[ $# -lt 2 ]] && { echo "create-or-update-pr: --target-branch requires a value." >&2; exit 1; }
            OPT_TARGET_BRANCH="$2"
            shift 2
            ;;
        --target-branch=*)
            OPT_TARGET_BRANCH="${1#--target-branch=}"
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "create-or-update-pr: Unknown option: $1" >&2
            usage
            ;;
    esac
done

# ---------------------------------------------------------------------------
# Verify we're inside a git repo
# ---------------------------------------------------------------------------
if ! git rev-parse --git-dir &>/dev/null 2>&1; then
    echo "create-or-update-pr: Not inside a git repository." >&2
    exit 1
fi

# ---------------------------------------------------------------------------
# Initialize bb-api (validates token, curl, jq; populates BB_PROJECT/BB_REPO)
# ---------------------------------------------------------------------------
bb_init

# ---------------------------------------------------------------------------
# CREATE
# ---------------------------------------------------------------------------
if [[ "$COMMAND" == "create" ]]; then
    # Detect current branch
    CURRENT_BRANCH="$(bb_get_current_branch)"
    if [[ "$CURRENT_BRANCH" == "HEAD" ]]; then
        echo "create-or-update-pr: Detached HEAD state — cannot determine source branch." >&2
        exit 1
    fi

    # Resolve target branch
    if [[ -n "$OPT_TARGET_BRANCH" ]]; then
        TARGET_BRANCH="$OPT_TARGET_BRANCH"
    else
        TARGET_BRANCH="$(bb_detect_target_branch)"
    fi

    # Auto-generate title from branch name if not provided:
    #   feature/my-cool-feature  →  My cool feature
    #   fix_some_bug             →  Fix some bug
    if [[ -n "$OPT_TITLE" ]]; then
        TITLE="$OPT_TITLE"
    else
        # Strip leading path component (e.g. "feature/"), replace hyphens and underscores with spaces
        branch_basename="${CURRENT_BRANCH##*/}"
        title_raw="${branch_basename//-/ }"
        title_raw="${title_raw//_/ }"
        # Capitalize first letter (bash portable approach)
        TITLE="$(tr '[:lower:]' '[:upper:]' <<< "${title_raw:0:1}")${title_raw:1}"
    fi

    # Auto-generate description from git log if not provided
    if [[ -n "$OPT_DESCRIPTION" ]]; then
        DESCRIPTION="$OPT_DESCRIPTION"
    else
        # Get commits that are on current branch but not on target
        if git rev-parse --verify "origin/${TARGET_BRANCH}" &>/dev/null 2>&1; then
            compare_ref="origin/${TARGET_BRANCH}"
        elif git rev-parse --verify "${TARGET_BRANCH}" &>/dev/null 2>&1; then
            compare_ref="${TARGET_BRANCH}"
        else
            compare_ref=""
        fi

        if [[ -n "$compare_ref" ]]; then
            commit_count=$(git rev-list --count "${compare_ref}..HEAD" 2>/dev/null || echo "0")
            if [[ "$commit_count" -eq 0 ]]; then
                echo "create-or-update-pr: Warning: no commits found between ${compare_ref} and HEAD." >&2
                DESCRIPTION=""
            else
                DESCRIPTION="$(git log --oneline "${compare_ref}..HEAD" --format="- %s")"
            fi
        else
            echo "create-or-update-pr: Warning: cannot find ref '${TARGET_BRANCH}' to generate description from git log." >&2
            DESCRIPTION=""
        fi
    fi

    # Dry-run: print and exit
    if [[ "$DRY_RUN" == true ]]; then
        echo "=== DRY RUN: would create PR ==="
        echo "  Project:        ${BB_PROJECT}"
        echo "  Repo:           ${BB_REPO}"
        echo "  From branch:    ${CURRENT_BRANCH}"
        echo "  To branch:      ${TARGET_BRANCH}"
        echo "  Title:          ${TITLE}"
        echo "  Description:"
        if [[ -n "$DESCRIPTION" ]]; then
            while IFS= read -r line; do
                echo "    ${line}"
            done <<< "$DESCRIPTION"
        else
            echo "    (empty)"
        fi
        exit 0
    fi

    # Create the PR
    response="$(bb_create_pr \
        "${BB_PROJECT}" \
        "${BB_REPO}" \
        "${TITLE}" \
        "${DESCRIPTION}" \
        "${CURRENT_BRANCH}" \
        "${TARGET_BRANCH}")"

    # Extract PR ID and URL from response
    pr_id="$(printf '%s' "$response" | jq -r '.id')"
    pr_url="$(printf '%s' "$response" | jq -r '.links.self[0].href // empty')"

    if [[ -z "$pr_url" ]]; then
        # Construct URL from known parts as fallback
        bb_host="${BB_BASE_URL%%/rest/*}"
        pr_url="${bb_host}/projects/${BB_PROJECT}/repos/${BB_REPO}/pull-requests/${pr_id}"
    fi

    echo "PR #${pr_id}: ${pr_url}"
    exit 0
fi

# ---------------------------------------------------------------------------
# UPDATE
# ---------------------------------------------------------------------------
if [[ "$COMMAND" == "update" ]]; then
    # Resolve project/repo/pr_id from URL or plain ID
    if [[ "$PR_ID_OR_URL" == http* ]]; then
        read -r UPD_PROJECT UPD_REPO UPD_PR_ID <<< "$(bb_parse_pr_url "$PR_ID_OR_URL")"
    else
        UPD_PROJECT="${BB_PROJECT}"
        UPD_REPO="${BB_REPO}"
        UPD_PR_ID="${PR_ID_OR_URL}"
    fi

    # Validate PR ID is numeric
    if ! [[ "$UPD_PR_ID" =~ ^[0-9]+$ ]]; then
        echo "create-or-update-pr: PR ID must be numeric, got: '${UPD_PR_ID}'." >&2
        exit 1
    fi

    # Fetch current PR (needed for optimistic locking version + current field values)
    current_pr="$(bb_get_pr "${UPD_PROJECT}" "${UPD_REPO}" "${UPD_PR_ID}")"
    current_version="$(printf '%s' "$current_pr" | jq -r '.version')"
    current_title="$(printf '%s' "$current_pr"   | jq -r '.title')"
    current_description="$(printf '%s' "$current_pr" | jq -r '.description // ""')"
    pr_url="$(printf '%s' "$current_pr" | jq -r '.links.self[0].href // empty')"

    if [[ -z "$pr_url" ]]; then
        bb_host="${BB_BASE_URL%%/rest/*}"
        pr_url="${bb_host}/projects/${UPD_PROJECT}/repos/${UPD_REPO}/pull-requests/${UPD_PR_ID}"
    fi

    # Use provided values or fall back to existing
    NEW_TITLE="${OPT_TITLE:-$current_title}"
    NEW_DESCRIPTION="${OPT_DESCRIPTION:-$current_description}"

    # Dry-run: print and exit
    if [[ "$DRY_RUN" == true ]]; then
        echo "=== DRY RUN: would update PR #${UPD_PR_ID} ==="
        echo "  Project:     ${UPD_PROJECT}"
        echo "  Repo:        ${UPD_REPO}"
        echo "  Version:     ${current_version} (optimistic lock)"
        echo "  Title:       ${NEW_TITLE}"
        echo "  Description:"
        if [[ -n "$NEW_DESCRIPTION" ]]; then
            while IFS= read -r line; do
                echo "    ${line}"
            done <<< "$NEW_DESCRIPTION"
        else
            echo "    (empty)"
        fi
        exit 0
    fi

    # Update the PR
    bb_update_pr \
        "${UPD_PROJECT}" \
        "${UPD_REPO}" \
        "${UPD_PR_ID}" \
        "${current_version}" \
        "${NEW_TITLE}" \
        "${NEW_DESCRIPTION}" \
        > /dev/null

    echo "PR #${UPD_PR_ID}: ${pr_url}"
    exit 0
fi
