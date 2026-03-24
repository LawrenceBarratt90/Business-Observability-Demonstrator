# Process PR Feedback Workflow

Self-contained reference for `process-pr-feedback.sh`. Everything you need
to fetch open tasks and comments, decide what to do, and execute those
actions — including inline API details — is here.

## Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [Phase 1: Fetch Output Schema](#phase-1-fetch-output-schema)
3. [Understanding Bitbucket Tasks](#understanding-bitbucket-tasks)
4. [Auto-Resolution Criteria](#auto-resolution-criteria)
5. [Actions JSON Schema](#actions-json-schema)
6. [Reply Implementation Note](#reply-implementation-note)
7. [API: Fetch Endpoints](#api-fetch-endpoints)
8. [API: Write Endpoints](#api-write-endpoints)
9. [Example Action Scenarios](#example-action-scenarios)

---

## Workflow Overview

The feedback-processing workflow is a two-phase model:

### Phase 1 — Fetch (script → agent)

1. Run `process-pr-feedback.sh fetch <pr-id-or-url>`.
2. Script retrieves all PR activities from Bitbucket, filters to comments
   and tasks, and structures them into a JSON document.
3. Agent receives: open tasks, resolved tasks, comment threads with replies,
   and a summary count.

### Phase 2 — Analyze and Act (agent → script)

1. Agent reads Phase 1 JSON and the current state of the codebase.
2. For each open task, agent determines whether it has been addressed.
3. Agent produces an actions JSON document (see [Actions JSON Schema](#actions-json-schema)).
4. Run `echo '<actions-json>' | process-pr-feedback.sh act <pr-id-or-url> [--dry-run]`.
5. Script resolves tasks, posts replies, and creates new tasks as directed.

```bash
# Phase 1
BB_PROJECT=PFS BB_REPO=copilot-skills \
  bash scripts/process-pr-feedback.sh fetch 2639 > feedback.json

# Agent analyzes feedback.json and current code, produces actions.json

# Phase 2 (dry run first)
cat actions.json | bash scripts/process-pr-feedback.sh act 2639 --dry-run

# Execute for real
cat actions.json | bash scripts/process-pr-feedback.sh act 2639
```

---

## Phase 1: Fetch Output Schema

`process-pr-feedback.sh fetch` outputs this JSON structure to stdout:

```json
{
  "open_tasks": [
    {
      "id": 5501,
      "text": "Remove OAuth token from stdout logging",
      "version": 0
    }
  ],
  "resolved_tasks": [
    {
      "id": 5489,
      "text": "Add null check for refresh token"
    }
  ],
  "comments": [
    {
      "id": 5498,
      "author": "jsmith",
      "text": "Token exposed in logs on line 42 — this will leak in CI.",
      "file": "src/auth/oauth.py",
      "line": 42,
      "replies": [
        {
          "id": 5503,
          "author": "auto-reviewer",
          "text": "Acknowledged, will fix before merge."
        }
      ]
    }
  ],
  "summary": {
    "open_tasks": 1,
    "resolved_tasks": 1,
    "total_comments": 3
  }
}
```

Field notes:

- `open_tasks[].version` — **required** for resolving (optimistic locking)
- `comments[].file` — may be `null` for PR-level comments not anchored to a file
- `comments[].line` — may be `null` for file-level or PR-level comments
- `comments[].replies` — flat array of direct replies (one level deep)

---

## Understanding Bitbucket Tasks

**Bitbucket Server 9.x does not have a separate "tasks" API.** Tasks are
implemented as comments with `severity == "BLOCKER"`.

How the script identifies them:

- Fetches all activities from `/activities` endpoint
- Filters to `action == "COMMENTED"` entries
- Among those, filters to `comment.severity == "BLOCKER"` — these are tasks
- `open_tasks`: severity `BLOCKER` AND `state != "RESOLVED"`
- `resolved_tasks`: severity `BLOCKER` AND `state == "RESOLVED"`

This means:

- `open_tasks` in the fetch output = unresolved BLOCKER comments
- Resolving a task = setting that comment's `state` to `"RESOLVED"` via PUT
- Creating a new task = posting a comment with `severity: "BLOCKER"` and a `parent` reference

---

## Auto-Resolution Criteria

Resolve a task automatically **only** when all of the following are true:

1. **Code was changed**: The file mentioned in the task appears in recent commits
   (check `git log --oneline` or compare commit SHAs to the PR's commit list).

2. **The concern is addressed**: Read the current version of the file and verify
   the issue described in the task no longer exists.
   - Example: task says "remove token from logs" → confirm no `print(token)` or
     `logger.info(token)` appears in the current file.

3. **The fix is unambiguous**: The task description matches exactly one code
   location and that location is clearly fixed.

**Do NOT auto-resolve if:**

- The task is vague (e.g. "improve this") without a clear success criterion
- The mentioned file has not changed since the task was created
- You're unsure whether the fix is complete — add a reply instead and leave open
- The task mentions a problem you cannot verify by reading the current code

**Prefer leaving open with a reply** over auto-resolving when in doubt.

---

## Actions JSON Schema

This is the JSON the agent must produce and pipe to `process-pr-feedback.sh act`:

```json
{
  "resolve_tasks": [5501, 5489],
  "replies": [
    {
      "comment_id": 5498,
      "text": "Fixed in commit a1b2c3d: removed print(token) from oauth.py:42"
    }
  ],
  "new_tasks": [
    {
      "comment_id": 5498,
      "text": "Also check refresh_token is not logged in tokens.py"
    }
  ]
}
```

### Field values

**`resolve_tasks`** (array of integers, optional):

- List of task IDs to mark as `RESOLVED`
- IDs come from `open_tasks[].id` in the fetch output
- Only include IDs of tasks that have been genuinely addressed

**`replies`** (array, optional):

- `comment_id` — ID of the comment to reply to (from `comments[].id` in fetch output)
- `text` — reply text (plain text; keep it concise and specific)

**`new_tasks`** (array, optional):

- `comment_id` — ID of the existing comment to anchor the new task to
- `text` — task description (becomes a new BLOCKER comment under that comment)
- Use when reviewing the code reveals additional required changes not yet captured

All three arrays default to `[]` if omitted. An all-empty actions document is
valid (means no action needed).

---

## Reply Implementation Note

Replies use the **same** POST comments endpoint as regular comments, but include
a `parent` field referencing the parent comment ID. This is how Bitbucket Server
implements threaded comments.

Payload for a reply:

```json
{
  "text": "Fixed in commit a1b2c3d: removed print(token) from oauth.py line 42",
  "parent": { "id": 5498 }
}
```

The script constructs this via the `_bb_add_reply` helper, which POSTs to:

```text
POST /projects/{project}/repos/{repo}/pull-requests/{pr_id}/comments
```

---

## API: Fetch Endpoints

Base URL: `https://bitbucket.lab.dynatrace.org/rest/api/1.0`

### GET PR activities (comments and tasks)

`GET /projects/{project}/repos/{repo}/pull-requests/{id}/activities`

The script fetches all pages via `_bb_paginate` and filters to `action == "COMMENTED"`.

Each activity item (relevant fields):

```json
{
  "action": "COMMENTED",
  "comment": {
    "id": 5498,
    "text": "Token exposed in logs...",
    "severity": "NORMAL",
    "state": "OPEN",
    "version": 2,
    "author": { "name": "jsmith", "slug": "jsmith" },
    "anchor": {
      "path": "src/auth/oauth.py",
      "line": 42,
      "lineType": "ADDED",
      "fileType": "TO"
    },
    "comments": [
      {
        "id": 5503,
        "text": "Acknowledged",
        "author": { "name": "auto-reviewer" }
      }
    ]
  }
}
```

Filtering logic used by the script:

- **Regular comments**: `action == "COMMENTED"` AND `comment.severity != "BLOCKER"`
- **Tasks (open)**: `action == "COMMENTED"` AND `comment.severity == "BLOCKER"`
  AND `comment.state != "RESOLVED"`
- **Tasks (resolved)**: `action == "COMMENTED"` AND `comment.severity == "BLOCKER"`
  AND `comment.state == "RESOLVED"`

```bash
curl -s -H "Authorization: Bearer $BITBUCKET_TOKEN" \
  "https://bitbucket.lab.dynatrace.org/rest/api/1.0/projects/PFS/repos/copilot-skills/pull-requests/2639/activities?limit=100"
```

---

## API: Write Endpoints

Base URL: `https://bitbucket.lab.dynatrace.org/rest/api/1.0`

### PUT resolve task (update comment state)

`PUT /projects/{project}/repos/{repo}/pull-requests/{id}/comments/{comment_id}`

> **Optimistic locking required**: fetch current `version` from GET first.

```bash
# Step 1: get current version
VERSION=$(curl -s -H "Authorization: Bearer $BITBUCKET_TOKEN" \
  "https://bitbucket.lab.dynatrace.org/rest/api/1.0/projects/PFS/repos/copilot-skills/pull-requests/2639/comments/5501" \
  | jq '.version')

# Step 2: mark resolved
curl -s -X PUT \
  -H "Authorization: Bearer $BITBUCKET_TOKEN" \
  -H "Content-Type: application/json" \
  "https://bitbucket.lab.dynatrace.org/rest/api/1.0/projects/PFS/repos/copilot-skills/pull-requests/2639/comments/5501" \
  -d "{\"id\": 5501, \"version\": $VERSION, \"state\": \"RESOLVED\"}"
```

Request body:

```json
{
  "id": 5501,
  "version": 0,
  "state": "RESOLVED"
}
```

Response: updated comment object with `"state": "RESOLVED"` and incremented `version`.

### POST reply to existing comment

`POST /projects/{project}/repos/{repo}/pull-requests/{id}/comments`

```json
{
  "text": "Fixed in commit a1b2c3d: removed print(token) from oauth.py line 42",
  "parent": { "id": 5498 }
}
```

```bash
curl -s -X POST \
  -H "Authorization: Bearer $BITBUCKET_TOKEN" \
  -H "Content-Type: application/json" \
  "https://bitbucket.lab.dynatrace.org/rest/api/1.0/projects/PFS/repos/copilot-skills/pull-requests/2639/comments" \
  -d '{"text": "Fixed in latest commit.", "parent": {"id": 5498}}'
```

Response: new comment object with `id`, `version`, `author`, `text`.

### POST new task (BLOCKER comment with parent)

`POST /projects/{project}/repos/{repo}/pull-requests/{id}/comments`

```json
{
  "text": "Also check refresh_token is not logged in tokens.py",
  "severity": "BLOCKER",
  "parent": { "id": 5498 }
}
```

Response: new comment object; `severity` will be `"BLOCKER"` and `state` will be `"OPEN"`.

---

## Example Action Scenarios

### Scenario 1: Task addressed — resolve and reply

**Situation**: Open task says "Remove OAuth token from stdout logging". You confirm
`print(token)` was removed in the latest commit.

**Actions JSON**:

```json
{
  "resolve_tasks": [5501],
  "replies": [
    {
      "comment_id": 5501,
      "text": "Fixed in commit a1b2c3: removed `print(access_token)` from oauth.py:42."
    }
  ],
  "new_tasks": []
}
```

### Scenario 2: Task NOT addressed — reply explaining status

**Situation**: Open task says "Add null check for refresh token". Reviewing
`tokens.py` shows no null check was added.

**Actions JSON**:

```json
{
  "resolve_tasks": [],
  "replies": [
    {
      "comment_id": 5489,
      "text": "tokens.py still does not have a null check for refresh_token. The value can be None when the user has not authenticated via OAuth."
    }
  ],
  "new_tasks": []
}
```

### Scenario 3: New issue discovered while reviewing — create task

**Situation**: While verifying the log-removal fix, you notice `refresh_token`
is also logged in a different location not covered by an existing task.

**Actions JSON**:

```json
{
  "resolve_tasks": [5501],
  "replies": [
    {
      "comment_id": 5501,
      "text": "Fixed. Also spotted refresh_token logging in tokens.py — created a follow-up task."
    }
  ],
  "new_tasks": [
    {
      "comment_id": 5501,
      "text": "refresh_token is also logged at tokens.py:31 — remove before merge"
    }
  ]
}
```

### Scenario 4: Nothing to do

**Situation**: All tasks are resolved, no open tasks, no follow-ups needed.

**Actions JSON**:

```json
{
  "resolve_tasks": [],
  "replies": [],
  "new_tasks": []
}
```
