#!/usr/bin/env bash
# bb-api.sh — Core Bitbucket Server API library
#
# Provides reusable functions for all Bitbucket API operations.
# Source this file to use the functions:
#   source "$(dirname "$0")/bb-api.sh"
#   bb_init
#
# Requirements:
#   - BITBUCKET_TOKEN environment variable must be set
#   - curl must be installed
#   - jq must be installed
#
# Usage pattern:
#   bb_init                                   # Initialize and validate environment
#   bb_get_pr "$PROJECT" "$REPO" "$PR_ID"     # Get PR details as JSON
#   bb_add_comment "$PROJECT" "$REPO" "$PR_ID" "My comment"

set -euo pipefail

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

# Base URL for Bitbucket Server REST API
readonly BB_BASE_URL="${BB_BASE_URL:-https://bitbucket.lab.dynatrace.org/rest/api/1.0}"

# Global project/repo detected from git remote (populated by bb_extract_repo_info)
BB_PROJECT="${BB_PROJECT:-}"
BB_REPO="${BB_REPO:-}"

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

# _bb_curl — Make an authenticated curl request
# Usage: _bb_curl <method> <url> [extra curl args...]
# Output: JSON response body
# Returns: 0 on success, 1 on HTTP error
_bb_curl() {
    local method="$1"
    local url="$2"
    shift 2

    local http_code
    local response
    local tmp_body
    tmp_body=$(mktemp)

    # Capture HTTP status code separately from body
    http_code=$(curl \
        -s \
        -o "$tmp_body" \
        -w "%{http_code}" \
        -X "$method" \
        -H "Authorization: Bearer ${BITBUCKET_TOKEN}" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        "$@" \
        "$url")

    response=$(cat "$tmp_body")
    rm -f "$tmp_body"

    if [[ "$http_code" -lt 200 || "$http_code" -ge 300 ]]; then
        local error_msg
        error_msg=$(printf '%s' "$response" | jq -r '.errors[0].message // .message // "Unknown error"' 2>/dev/null || true)
        echo "bb-api: HTTP $http_code error calling $method $url: $error_msg" >&2
        return 1
    fi

    printf '%s' "$response"
}

# _bb_curl_text — Like _bb_curl but outputs raw text (for diffs)
_bb_curl_text() {
    local method="$1"
    local url="$2"
    shift 2

    local http_code
    local tmp_body
    tmp_body=$(mktemp)

    http_code=$(curl \
        -s \
        -o "$tmp_body" \
        -w "%{http_code}" \
        -X "$method" \
        -H "Authorization: Bearer ${BITBUCKET_TOKEN}" \
        -H "Accept: text/plain" \
        "$@" \
        "$url")

    if [[ "$http_code" -lt 200 || "$http_code" -ge 300 ]]; then
        echo "bb-api: HTTP $http_code error calling $method $url" >&2
        rm -f "$tmp_body"
        return 1
    fi

    cat "$tmp_body"
    rm -f "$tmp_body"
}

# _bb_paginate — Fetch all pages of a paginated Bitbucket endpoint
# Usage: _bb_paginate <url_without_pagination_params>
# Output: JSON array containing all 'values' merged across pages
_bb_paginate() {
    local url="$1"
    local start=0
    local limit=100
    local all_values="[]"
    local is_last_page="false"

    while [[ "$is_last_page" != "true" ]]; do
        local page
        # Append pagination params (handle URLs that already have query params)
        if [[ "$url" == *"?"* ]]; then
            page=$(_bb_curl GET "${url}&limit=${limit}&start=${start}")
        else
            page=$(_bb_curl GET "${url}?limit=${limit}&start=${start}")
        fi

        local page_values
        page_values=$(printf '%s' "$page" | jq '.values // []')

        # Merge this page's values into accumulator
        all_values=$(printf '%s\n%s' "$all_values" "$page_values" | jq -s 'add')

        is_last_page=$(printf '%s' "$page" | jq -r '.isLastPage // true')
        local next_page_start
        next_page_start=$(printf '%s' "$page" | jq -r '.nextPageStart // 0')
        start="$next_page_start"
    done

    printf '%s' "$all_values"
}

# ---------------------------------------------------------------------------
# Configuration functions
# ---------------------------------------------------------------------------

# bb_check_token — Verify BITBUCKET_TOKEN is set
# Returns: 0 if set, 1 if missing (with error message to stderr)
bb_check_token() {
    if [[ -z "${BITBUCKET_TOKEN:-}" ]]; then
        echo "bb-api: BITBUCKET_TOKEN is not set. Export your Bitbucket personal access token:" >&2
        echo "  export BITBUCKET_TOKEN='your-token-here'" >&2
        return 1
    fi
    return 0
}

# bb_init — Initialize and validate the environment
#
# Checks:
#   1. BITBUCKET_TOKEN is set
#   2. curl is available
#   3. jq is available
#   4. Populates BB_PROJECT and BB_REPO globals (if not already set)
#
# Usage: bb_init
# Returns: 0 on success, 1 if any prerequisite is missing
bb_init() {
    # Check BITBUCKET_TOKEN
    bb_check_token || return 1

    # Check curl
    if ! command -v curl &>/dev/null; then
        echo "bb-api: 'curl' is required but not installed." >&2
        return 1
    fi

    # Check jq
    if ! command -v jq &>/dev/null; then
        echo "bb-api: 'jq' is required but not installed. Install it with your package manager:" >&2
        echo "  brew install jq   # macOS" >&2
        echo "  apt install jq    # Debian/Ubuntu" >&2
        return 1
    fi

    # Populate BB_PROJECT and BB_REPO from git remote (if not already set)
    if [[ -z "${BB_PROJECT:-}" || -z "${BB_REPO:-}" ]]; then
        bb_extract_repo_info || true  # Non-fatal: caller may supply project/repo explicitly
    fi

    return 0
}

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------

# bb_parse_pr_url — Extract project, repo, and PR ID from a Bitbucket PR URL
#
# URL format:
#   https://bitbucket.lab.dynatrace.org/projects/PFS/repos/copilot-skills/pull-requests/2639
#
# Usage:  read -r PROJECT REPO PR_ID <<< "$(bb_parse_pr_url "$url")"
# Output: "PROJECT REPO PR_ID" on stdout (space-separated)
# Returns: 0 on success, 1 if URL format not recognized
bb_parse_pr_url() {
    local url="$1"

    # Match: /projects/<PROJECT>/repos/<REPO>/pull-requests/<PR_ID>
    if [[ "$url" =~ /projects/([^/]+)/repos/([^/]+)/pull-requests/([0-9]+) ]]; then
        printf '%s %s %s\n' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}" "${BASH_REMATCH[3]}"
        return 0
    fi

    echo "bb-api: Cannot parse Bitbucket PR URL: $url" >&2
    echo "bb-api: Expected format: https://<host>/projects/<PROJECT>/repos/<REPO>/pull-requests/<ID>" >&2
    return 1
}

# bb_get_current_branch — Get the name of the current git branch
#
# Usage: branch=$(bb_get_current_branch)
# Output: branch name on stdout
bb_get_current_branch() {
    git rev-parse --abbrev-ref HEAD
}

# bb_detect_target_branch — Detect the default target branch for a PR
#
# Checks remote branches in priority order: main, master, develop
# Returns the first one found.
#
# Usage: target=$(bb_detect_target_branch)
# Output: branch name on stdout
# Returns: 0 if found, 1 if none of the candidates exist
bb_detect_target_branch() {
    local candidates=("main" "master" "develop")

    for branch in "${candidates[@]}"; do
        if git ls-remote --exit-code --heads origin "$branch" &>/dev/null; then
            printf '%s\n' "$branch"
            return 0
        fi
    done

    echo "bb-api: Could not detect target branch (checked: ${candidates[*]})" >&2
    return 1
}

# bb_extract_repo_info — Parse git remote URL to extract project and repo name
#
# Supports Bitbucket Server SSH and HTTPS remote URL formats:
#   SSH:   ssh://git@bitbucket.lab.dynatrace.org/pfs/copilot-skills.git
#   HTTPS: https://bitbucket.lab.dynatrace.org/scm/pfs/copilot-skills.git
#   Also:  https://bitbucket.lab.dynatrace.org/projects/PFS/repos/copilot-skills
#
# Sets globals: BB_PROJECT, BB_REPO
# Usage: bb_extract_repo_info
# Returns: 0 on success, 1 if URL not recognized
bb_extract_repo_info() {
    local remote_url
    remote_url=$(git remote get-url origin 2>/dev/null) || {
        echo "bb-api: No git remote 'origin' found" >&2
        return 1
    }

    local project repo

    # HTTPS /projects/<PROJECT>/repos/<REPO> format
    if [[ "$remote_url" =~ /projects/([^/]+)/repos/([^/.]+) ]]; then
        project="${BASH_REMATCH[1]}"
        repo="${BASH_REMATCH[2]}"

    # HTTPS /scm/<project>/<repo>.git format (Bitbucket Server SCM path)
    elif [[ "$remote_url" =~ /scm/([^/]+)/([^/.]+)(\.git)?$ ]]; then
        project="${BASH_REMATCH[1]^^}"   # uppercase project key
        repo="${BASH_REMATCH[2]}"

    # SSH ssh://git@<host>/<project>/<repo>.git
    elif [[ "$remote_url" =~ @[^/]+[:/]([^/]+)/([^/.]+)(\.git)?$ ]]; then
        project="${BASH_REMATCH[1]^^}"   # uppercase project key
        repo="${BASH_REMATCH[2]}"

    else
        echo "bb-api: Cannot parse Bitbucket project/repo from remote URL: $remote_url" >&2
        return 1
    fi

    BB_PROJECT="$project"
    BB_REPO="$repo"
    export BB_PROJECT BB_REPO
    return 0
}

# ---------------------------------------------------------------------------
# Read operations
# ---------------------------------------------------------------------------

# bb_get_pr — Get PR details
#
# Usage: bb_get_pr <project> <repo> <pr_id>
# Output: PR details as JSON
bb_get_pr() {
    local project="$1"
    local repo="$2"
    local pr_id="$3"

    _bb_curl GET "${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests/${pr_id}"
}

# bb_get_pr_changes — Get the list of files changed in a PR
#
# Usage: bb_get_pr_changes <project> <repo> <pr_id>
# Output: JSON array of changed file objects (all pages merged)
bb_get_pr_changes() {
    local project="$1"
    local repo="$2"
    local pr_id="$3"

    _bb_paginate "${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests/${pr_id}/changes"
}

# bb_get_pr_commits — Get the list of commits in a PR
#
# Usage: bb_get_pr_commits <project> <repo> <pr_id>
# Output: JSON array of commit objects (all pages merged)
bb_get_pr_commits() {
    local project="$1"
    local repo="$2"
    local pr_id="$3"

    _bb_paginate "${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests/${pr_id}/commits"
}

# bb_get_pr_comments — Get all comments on a PR (all pages merged)
#
# Usage: bb_get_pr_comments <project> <repo> <pr_id>
# Output: JSON array of activity objects that are comments
bb_get_pr_comments() {
    local project="$1"
    local repo="$2"
    local pr_id="$3"

    # The /activities endpoint returns all activity including comments
    # Filter to COMMENTED type for just comments
    local activities
    activities=$(_bb_paginate "${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests/${pr_id}/activities")

    printf '%s' "$activities" | jq '[.[] | select(.action == "COMMENTED")]'
}

# bb_get_pr_tasks — Get all tasks on a PR
#
# In Bitbucket Server, tasks are comments with severity="BLOCKER".
# They are retrieved via the activities endpoint and filtered by severity.
#
# Usage: bb_get_pr_tasks <project> <repo> <pr_id>
# Output: JSON array of task objects with shape:
#   { id, text, state ("OPEN"|"RESOLVED"), version, author, anchor }
bb_get_pr_tasks() {
    local project="$1"
    local repo="$2"
    local pr_id="$3"

    local activities
    activities=$(_bb_paginate "${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests/${pr_id}/activities")

    # Filter to COMMENTED activities where the comment severity is BLOCKER (these are tasks)
    printf '%s' "$activities" | jq '[
        .[] | select(.action == "COMMENTED") | .comment |
        select(.severity == "BLOCKER") |
        {
            id:      .id,
            text:    (.text // ""),
            state:   (.state // "OPEN"),
            version: (.version // 0),
            author:  (.author.name // .author.slug // "unknown"),
            anchor:  (.anchor // null)
        }
    ]'
}

# bb_get_pr_diff — Get the diff for a PR (full or file-specific)
#
# Usage: bb_get_pr_diff <project> <repo> <pr_id> [filepath]
# Output: Diff text (unified diff format)
#   - If filepath is provided, returns diff only for that file
#   - If omitted, returns the full PR diff
bb_get_pr_diff() {
    local project="$1"
    local repo="$2"
    local pr_id="$3"
    local filepath="${4:-}"

    local url="${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests/${pr_id}/diff"

    if [[ -n "$filepath" ]]; then
        # URL-encode the filepath (replace / with %2F would break path; use as path component)
        url="${url}/${filepath}"
    fi

    _bb_curl_text GET "$url"
}

# ---------------------------------------------------------------------------
# Write operations
# ---------------------------------------------------------------------------

# bb_create_pr — Create a new pull request
#
# Usage: bb_create_pr <project> <repo> <title> <description> <from_branch> <to_branch>
# Output: Created PR as JSON (includes PR ID and links)
bb_create_pr() {
    local project="$1"
    local repo="$2"
    local title="$3"
    local description="$4"
    local from_branch="$5"
    local to_branch="$6"

    local payload
    payload=$(jq -n \
        --arg title "$title" \
        --arg description "$description" \
        --arg from_ref "$from_branch" \
        --arg to_ref "$to_branch" \
        --arg repo_slug "$repo" \
        --arg project_key "$project" \
        '{
            title: $title,
            description: $description,
            state: "OPEN",
            open: true,
            closed: false,
            fromRef: {
                id: ("refs/heads/" + $from_ref),
                repository: {
                    slug: $repo_slug,
                    project: { key: $project_key }
                }
            },
            toRef: {
                id: ("refs/heads/" + $to_ref),
                repository: {
                    slug: $repo_slug,
                    project: { key: $project_key }
                }
            },
            locked: false
        }')

    _bb_curl POST \
        "${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests" \
        --data "$payload"
}

# bb_update_pr — Update an existing PR's title and/or description
#
# Bitbucket Server uses optimistic locking — the 'version' field from the
# current PR must be supplied to prevent conflicting updates.
#
# Usage: bb_update_pr <project> <repo> <pr_id> <version> <title> <description>
# Output: Updated PR as JSON
bb_update_pr() {
    local project="$1"
    local repo="$2"
    local pr_id="$3"
    local version="$4"
    local title="$5"
    local description="$6"

    local payload
    payload=$(jq -n \
        --argjson id "$pr_id" \
        --argjson version "$version" \
        --arg title "$title" \
        --arg description "$description" \
        '{
            id: $id,
            version: $version,
            title: $title,
            description: $description
        }')

    _bb_curl PUT \
        "${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests/${pr_id}" \
        --data "$payload"
}

# bb_add_comment — Add a general (PR-level) comment
#
# Usage: bb_add_comment <project> <repo> <pr_id> <text>
# Output: Created comment as JSON (includes comment ID)
bb_add_comment() {
    local project="$1"
    local repo="$2"
    local pr_id="$3"
    local text="$4"

    local payload
    payload=$(jq -n --arg text "$text" '{ text: $text }')

    _bb_curl POST \
        "${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests/${pr_id}/comments" \
        --data "$payload"
}

# bb_add_file_comment — Add an inline comment on a specific file and line
#
# Usage: bb_add_file_comment <project> <repo> <pr_id> <filepath> <line> <text>
#   filepath — path relative to repo root (e.g. "src/main.py")
#   line     — line number in the file to anchor the comment to
#
# Output: Created comment as JSON (includes comment ID)
bb_add_file_comment() {
    local project="$1"
    local repo="$2"
    local pr_id="$3"
    local filepath="$4"
    local line="$5"
    local text="$6"

    local payload
    payload=$(jq -n \
        --arg text "$text" \
        --arg path "$filepath" \
        --argjson line "$line" \
        '{
            text: $text,
            anchor: {
                line: $line,
                lineType: "ADDED",
                fileType: "TO",
                path: $path
            }
        }')

    _bb_curl POST \
        "${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests/${pr_id}/comments" \
        --data "$payload"
}

# bb_create_task — Create a task anchored to an existing comment
#
# In Bitbucket Server, tasks are comments with severity="BLOCKER".
# A task anchored to a parent comment is a reply with severity="BLOCKER".
#
# Usage: bb_create_task <project> <repo> <pr_id> <comment_id> <text>
#   comment_id — ID of the parent comment to attach the task to
#
# Output: Created task/comment as JSON (includes comment ID)
bb_create_task() {
    local project="$1"
    local repo="$2"
    local pr_id="$3"
    local comment_id="$4"
    local text="$5"

    local payload
    payload=$(jq -n \
        --arg text "$text" \
        --argjson parent_id "$comment_id" \
        '{
            text:     $text,
            severity: "BLOCKER",
            parent:   { id: $parent_id }
        }')

    _bb_curl POST \
        "${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests/${pr_id}/comments" \
        --data "$payload"
}

# bb_resolve_task — Mark a task (BLOCKER comment) as RESOLVED
#
# In Bitbucket Server, tasks are comments with severity="BLOCKER".
# Resolving a task means setting the comment's state to "RESOLVED"
# via PUT /projects/{project}/repos/{repo}/pull-requests/{pr_id}/comments/{comment_id}.
#
# Usage: bb_resolve_task <project> <repo> <pr_id> <task_id> <version>
#   task_id — the comment ID of the task (from bb_get_pr_tasks)
#   version — current version of the comment (required for optimistic locking)
#
# Output: Updated comment as JSON
bb_resolve_task() {
    local project="$1"
    local repo="$2"
    local pr_id="$3"
    local task_id="$4"
    local version="$5"

    local payload
    payload=$(jq -n \
        --argjson id      "$task_id" \
        --argjson version "$version" \
        '{ id: $id, version: $version, state: "RESOLVED" }')

    _bb_curl PUT \
        "${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests/${pr_id}/comments/${task_id}" \
        --data "$payload"
}

# bb_approve_pr — Approve a PR as the currently authenticated user
#
# Usage: bb_approve_pr <project> <repo> <pr_id>
# Output: Approval/participant JSON
bb_approve_pr() {
    local project="$1"
    local repo="$2"
    local pr_id="$3"

    # The approve endpoint uses the current user's slug; using 'me' works via
    # a POST to the participants endpoint with APPROVED status
    _bb_curl POST \
        "${BB_BASE_URL}/projects/${project}/repos/${repo}/pull-requests/${pr_id}/approve"
}
