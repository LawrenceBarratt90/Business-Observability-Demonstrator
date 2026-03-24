# Create / Update PR Workflow

Self-contained reference for `create-or-update-pr.sh`. Everything you need
to create or update a Bitbucket Server pull request — including inline API
details — is here.

## Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [Branch Detection Logic](#branch-detection-logic)
3. [Auto-Generated Title](#auto-generated-title)
4. [Auto-Generated Description](#auto-generated-description)
5. [API: Create PR](#api-create-pr)
6. [API: Update PR](#api-update-pr)
7. [Common Errors](#common-errors)
8. [Worked Example](#worked-example)

---

## Workflow Overview

### Create a PR

1. Verify git repo and that `BITBUCKET_TOKEN` is set.
2. Get current branch with `git rev-parse --abbrev-ref HEAD`.
3. Detect target branch (or use `--target-branch`). See [Branch Detection Logic](#branch-detection-logic).
4. Build title: from `--title` if provided, else auto-generate from branch name.
5. Build description: from `--description` if provided, else auto-generate from `git log`.
6. POST to `/projects/{project}/repos/{repo}/pull-requests`.
7. Print `PR #<id>: <url>` to stdout.

### Update an existing PR

1. Verify git repo and that `BITBUCKET_TOKEN` is set.
2. Accept `<pr-id>` (numeric) or full URL — parse project/repo/id from URL if given.
3. GET the current PR to read the current `version` (required for optimistic locking).
4. Merge supplied `--title` / `--description` with existing values (unchanged fields keep their current values).
5. PUT to `/projects/{project}/repos/{repo}/pull-requests/{id}`.
6. Print `PR #<id>: <url>` to stdout.

---

## Branch Detection Logic

`bb_detect_target_branch` checks remote branch existence **in priority order**:

```text
main  →  master  →  develop
```

Implementation uses `git ls-remote --exit-code --heads origin <branch>`.
The first branch that exists on `origin` is returned.

```bash
# What the script does internally:
for branch in main master develop; do
    if git ls-remote --exit-code --heads origin "$branch" &>/dev/null; then
        echo "$branch"   # use this one
        break
    fi
done
```

Override the auto-detection with `--target-branch <name>`.

---

## Auto-Generated Title

Derived from the current branch name when `--title` is not provided:

1. Strip the leading path prefix: `feature/my-cool-feature` → `my-cool-feature`
2. Replace hyphens and underscores with spaces: `my-cool-feature` → `my cool feature`
3. Capitalize the first letter: `my cool feature` → `My cool feature`

Examples:

| Branch name | Auto-title |
| --- | --- |
| `feature/add-oauth-support` | `Add oauth support` |
| `fix/null_pointer_in_login` | `Null pointer in login` |
| `JIRA-1234-improve-perf` | `JIRA-1234 improve perf` |
| `my-branch` | `My branch` |

---

## Auto-Generated Description

Built from `git log` when `--description` is not provided:

```bash
git log --oneline origin/<target>..HEAD --format="- %s"
```

Falls back to local `<target>..HEAD` if `origin/<target>` doesn't exist.
Warns and uses an empty description if no commits are found.

Example output for a branch with 3 commits:

```text
- Add OAuth token refresh endpoint
- Wire up refresh token to login flow
- Add unit tests for token expiry
```

---

## API: Create PR

**`POST /projects/{project}/repos/{repo}/pull-requests`**

Base URL: `https://bitbucket.lab.dynatrace.org/rest/api/1.0`

### Create PR: Request body

```json
{
  "title": "My cool feature",
  "description": "- Add OAuth token refresh endpoint\n- Add unit tests",
  "state": "OPEN",
  "open": true,
  "closed": false,
  "fromRef": {
    "id": "refs/heads/feature/my-cool-feature",
    "repository": {
      "slug": "copilot-skills",
      "project": { "key": "PFS" }
    }
  },
  "toRef": {
    "id": "refs/heads/main",
    "repository": {
      "slug": "copilot-skills",
      "project": { "key": "PFS" }
    }
  },
  "locked": false
}
```

Key fields:

- `fromRef.id` — **full ref**, e.g. `refs/heads/feature/my-branch` (not just branch name)
- `toRef.id` — same format for the target branch
- `repository.slug` — repo slug (lowercase, hyphens)
- `project.key` — project key (uppercase)

### Response (201 Created)

```json
{
  "id": 2639,
  "version": 0,
  "title": "My cool feature",
  "description": "...",
  "state": "OPEN",
  "links": {
    "self": [{ "href": "https://bitbucket.lab.dynatrace.org/projects/PFS/repos/copilot-skills/pull-requests/2639" }]
  }
}
```

The script extracts `id` and `links.self[0].href` from this response.

### Create PR: Example curl

```bash
curl -s -X POST \
  -H "Authorization: Bearer $BITBUCKET_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  "https://bitbucket.lab.dynatrace.org/rest/api/1.0/projects/PFS/repos/copilot-skills/pull-requests" \
  -d '{
    "title": "Add OAuth support",
    "description": "- Add token refresh\n- Add tests",
    "state": "OPEN", "open": true, "closed": false, "locked": false,
    "fromRef": { "id": "refs/heads/feature/add-oauth", "repository": { "slug": "copilot-skills", "project": { "key": "PFS" } } },
    "toRef":   { "id": "refs/heads/main",               "repository": { "slug": "copilot-skills", "project": { "key": "PFS" } } }
  }'
```

---

## API: Update PR

**`PUT /projects/{project}/repos/{repo}/pull-requests/{id}`**

> **Optimistic locking**: Bitbucket Server requires the current `version` number
> in the request body. Get it from `GET .../pull-requests/{id}` → `.version`.
> If the version doesn't match, the API returns `409 Conflict`.

### Update PR: Request body

```json
{
  "id": 2639,
  "version": 3,
  "title": "Updated title",
  "description": "Updated description"
}
```

- `id` — the PR ID (integer)
- `version` — **required**: current version from the GET response (increments on each update)
- `title` — new title (pass existing title if only updating description)
- `description` — new description (pass existing description if only updating title)

### Response (200 OK)

Same shape as create response; `version` will be incremented by 1.

### Update PR: Example curl

```bash
# 1. Get current version
VERSION=$(curl -s \
  -H "Authorization: Bearer $BITBUCKET_TOKEN" \
  "https://bitbucket.lab.dynatrace.org/rest/api/1.0/projects/PFS/repos/copilot-skills/pull-requests/2639" \
  | jq '.version')

# 2. Update with new title
curl -s -X PUT \
  -H "Authorization: Bearer $BITBUCKET_TOKEN" \
  -H "Content-Type: application/json" \
  "https://bitbucket.lab.dynatrace.org/rest/api/1.0/projects/PFS/repos/copilot-skills/pull-requests/2639" \
  -d "{\"id\": 2639, \"version\": $VERSION, \"title\": \"New title\", \"description\": \"Updated desc\"}"
```

---

## Common Errors

| Situation | Symptom | Fix |
| --- | --- | --- |
| Branch not pushed to remote | `404` on create — fromRef not found | `git push -u origin <branch>` first |
| PR already exists for branch | `409 Conflict` on create | Use `update` subcommand instead |
| Detached HEAD | "Cannot determine source branch" error | Check out a named branch |
| Stale version on update | `409 Conflict` — version mismatch | Fetch the PR again to get the latest version |
| Token missing | "BITBUCKET_TOKEN is not set" | `export BITBUCKET_TOKEN=your-token` |
| No commits on branch | Warning: description will be empty | Commit at least one change before creating PR |
| Target branch not found | "Could not detect target branch" | Pass `--target-branch <name>` explicitly |

---

## Worked Example

```bash
# You're on feature/add-oauth-support with 2 commits on top of main

export BITBUCKET_TOKEN="your-personal-access-token"

# Dry run first to preview
bash scripts/create-or-update-pr.sh create --dry-run
# Output:
# === DRY RUN: would create PR ===
#   Project:        PFS
#   Repo:           copilot-skills
#   From branch:    feature/add-oauth-support
#   To branch:      main
#   Title:          Add oauth support
#   Description:
#     - Add OAuth token refresh endpoint
#     - Add unit tests for token expiry

# Create for real
bash scripts/create-or-update-pr.sh create
# Output: PR #2639: https://bitbucket.lab.dynatrace.org/projects/PFS/repos/copilot-skills/pull-requests/2639

# Later: update the title
bash scripts/create-or-update-pr.sh update 2639 --title "Add OAuth 2.0 support with token refresh"
# Output: PR #2639: https://bitbucket.lab.dynatrace.org/projects/PFS/repos/copilot-skills/pull-requests/2639
```
