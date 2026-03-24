# Review PR Workflow

Self-contained reference for `review-pr.sh`. Everything you need to fetch
PR data, analyze it, and post structured feedback — including inline API
details and project discovery rules — is here.

## Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [Phase 1: Fetch Output Schema](#phase-1-fetch-output-schema)
3. [Project Discovery](#project-discovery)
4. [Feedback JSON Schema](#feedback-json-schema)
5. [Review Guidelines](#review-guidelines)
6. [API: Fetch Endpoints](#api-fetch-endpoints)
7. [API: Post Comments](#api-post-comments)
8. [Example Feedback Items](#example-feedback-items)

---

## Workflow Overview

The review workflow is a two-phase model to keep the agent's role focused:

### Phase 1 — Fetch (script → agent)

1. Run `review-pr.sh fetch <pr-id-or-url>`.
2. Script calls the Bitbucket API and assembles all PR data into a single JSON blob.
3. Agent receives the JSON: PR metadata, list of changed files, commits, and per-file diffs.

### Phase 2 — Analyze and Post (agent → script)

1. Agent reads Phase 1 JSON; optionally loads project-specific style guides and linter
   configs (see [Project Discovery](#project-discovery)).
2. Agent produces a feedback JSON document (see [Feedback JSON Schema](#feedback-json-schema)).
3. Run `echo '<feedback-json>' | review-pr.sh post <pr-id-or-url> [--dry-run]`.
4. Script posts a summary comment and one inline comment per feedback item.
   Creates tasks for items with `create_task: true`.

```bash
# Phase 1
BB_PROJECT=PFS BB_REPO=copilot-skills \
  bash scripts/review-pr.sh fetch 2639 > pr-data.json

# Phase 2 (agent generates feedback.json, then:)
cat feedback.json | bash scripts/review-pr.sh post 2639
```

---

## Phase 1: Fetch Output Schema

`review-pr.sh fetch` outputs this JSON structure to stdout:

```json
{
  "pr": {
    "id": 2639,
    "title": "Add OAuth 2.0 support with token refresh",
    "description": "- Add token refresh endpoint\n- Add unit tests",
    "author": "Jane Smith",
    "targetBranch": "main",
    "sourceBranch": "feature/add-oauth-support"
  },
  "changed_files": [
    "src/auth/oauth.py",
    "src/auth/tokens.py",
    "tests/test_oauth.py"
  ],
  "commits": [
    {
      "id": "a1b2c3d4e5f6...",
      "message": "Add OAuth token refresh endpoint",
      "author": "Jane Smith"
    },
    {
      "id": "b2c3d4e5f6a1...",
      "message": "Add unit tests for token expiry",
      "author": "Jane Smith"
    }
  ],
  "diffs": {
    "src/auth/oauth.py": "@@ -10,6 +10,20 @@\n ...",
    "src/auth/tokens.py": "@@ -5,3 +5,15 @@\n ...",
    "tests/test_oauth.py": "@@ -0,0 +1,45 @@\n ..."
  }
}
```

Field notes:

- `diffs` is a map of `{filepath: unified-diff-text}`. Empty string means binary file or diff failed.
- `commits[].message` is the first line of the commit message only.
- `changed_files` are relative paths from repo root.

---

## Project Discovery

Before analyzing, look for project-specific rules that should influence the review.
Check these locations (in priority order within each category):

### Style guides

- `docs/style-guide.md`
- `STYLEGUIDE.md`
- `.github/STYLE_GUIDE.md`

### Contributing guidelines

- `CONTRIBUTING.md`
- `.github/CONTRIBUTING.md`

### Linter configuration (language-specific)

**JavaScript/TypeScript:**

- `.eslintrc.json`, `.eslintrc.js`, `.eslintrc.yaml`, `.eslintrc`
- `.prettierrc`, `.prettierrc.json`, `.prettierrc.js`

**Python:**

- `.flake8`
- `pyproject.toml` (look for `[tool.ruff]`, `[tool.pylint]`, `[tool.mypy]` sections)
- `setup.cfg` (look for `[flake8]` section)

**General:**

- `.editorconfig` (indentation, line endings)

### Test configuration

- `pytest.ini` or `[tool.pytest.ini_options]` in `pyproject.toml`
- `jest.config.js`, `jest.config.ts`
- Look for `coverage` thresholds — flag PRs that drop below minimum

If project rules exist, prefer them over generic best practices. Reference them
explicitly in feedback messages (e.g. "per CONTRIBUTING.md §3: …").

---

## Feedback JSON Schema

This is the JSON the agent must produce and pipe to `review-pr.sh post`:

```jsonc
{
  "summary": "string — overall review assessment (required)",
  "items": [
    {
      "file":        "string  — relative path from repo root, or omit for PR-level comment",
      "line":        42,       // integer line number in the TO (new) file; omit if not applicable
      "severity":    "error",  // "error" | "warning" | "info"
      "category":    "security", // "security" | "performance" | "style" | "tests" | "docs"
      "message":     "string  — clear description of the issue (required)",
      "suggestion":  "string  — concrete fix suggestion (optional but recommended)",
      "create_task": true      // boolean; true = create a Bitbucket task (default: false)
    }
  ]
}
```

### Field values

**`severity`** (required):

- `"error"` — must be fixed before merging (security, correctness, data loss risk)
- `"warning"` — should be fixed, important code quality issue
- `"info"` — nice to have, style note, or educational comment

**`category`** (required):

- `"security"` — authentication, authorization, injection, secrets in code
- `"performance"` — N+1 queries, missing caching, expensive operations in loops
- `"style"` — formatting, naming, linter violations
- `"tests"` — missing tests, untested edge cases, flaky tests
- `"docs"` — missing docstrings, outdated comments, README gaps

**`create_task`** (optional, default `false`):

- Set `true` for all `"error"` severity items
- Set `true` for `"warning"` items that reference a specific code requirement
- Set `false` for `"info"` items (informational only)

**Comment anchoring**:

- Provide both `file` and `line` for inline comments on specific code
- Provide only `file` (no `line`) to comment on an entire file
- Omit both for a PR-level comment (applies to the whole PR)

---

## Review Guidelines

### Severity usage

- Use `error` sparingly — only for real blockers (security holes, broken logic, data corruption risk)
- Use `warning` for code smells, missing error handling, non-idiomatic patterns
- Use `info` for suggestions, style improvements, and educational notes

### When to create tasks

- Always create tasks for `error` items: `"create_task": true`
- Create tasks for `warning` items that map to a specific agreed project standard
- Do NOT create tasks for `info` items — keep them as comments only

### Summary comment

- Lead with the overall assessment: LGTM / minor issues / needs changes
- Mention the most significant finding first
- Keep it under 5 sentences

### Line anchoring

- The `line` number refers to the **new file** (TO side of the diff)
- Use line numbers from the diff's `+` lines only
- If a problem spans multiple lines, anchor to the first line

---

## API: Fetch Endpoints

Base URL: `https://bitbucket.lab.dynatrace.org/rest/api/1.0`

### GET PR details

`GET /projects/{project}/repos/{repo}/pull-requests/{id}`

Key response fields used by the script:

```json
{
  "id": 2639,
  "version": 3,
  "title": "...",
  "description": "...",
  "author": { "user": { "displayName": "Jane Smith", "name": "jsmith" } },
  "fromRef": { "displayId": "feature/add-oauth-support" },
  "toRef":   { "displayId": "main" },
  "links":   { "self": [{ "href": "https://..." }] }
}
```

### GET PR changes (changed files)

`GET /projects/{project}/repos/{repo}/pull-requests/{id}/changes`

Paginated. The script calls all pages via `_bb_paginate`. Each item:

```json
{
  "path": {
    "toString": "src/auth/oauth.py",
    "components": ["src", "auth", "oauth.py"]
  },
  "type": "MODIFY"
}
```

`type` values: `ADD`, `MODIFY`, `DELETE`, `RENAME`, `COPY`

### GET PR diff (file-specific)

`GET /projects/{project}/repos/{repo}/pull-requests/{id}/diff/{path}`

- Pass the file path as a URL path suffix (e.g. `.../diff/src/auth/oauth.py`)
- Returns unified diff text (not JSON) — script uses `Accept: text/plain`
- Omit the path to get the full PR diff

```bash
curl -s -H "Authorization: Bearer $BITBUCKET_TOKEN" \
  -H "Accept: text/plain" \
  "https://bitbucket.lab.dynatrace.org/rest/api/1.0/projects/PFS/repos/copilot-skills/pull-requests/2639/diff/src/auth/oauth.py"
```

---

## API: Post Comments

Base URL: `https://bitbucket.lab.dynatrace.org/rest/api/1.0`

### POST inline comment (file + line anchor)

`POST /projects/{project}/repos/{repo}/pull-requests/{id}/comments`

```json
{
  "text": "🔴 **ERROR** · `security`\n\nThis token is logged to stdout, exposing it in CI logs.\n\n**Suggestion:** Use `logger.debug()` with a redacted token or remove the log statement.",
  "anchor": {
    "line": 42,
    "lineType": "ADDED",
    "fileType": "TO",
    "path": "src/auth/oauth.py"
  }
}
```

- `lineType`: `"ADDED"` for lines added in this PR (use for all new code reviews)
- `fileType`: `"TO"` means the new version of the file
- `path`: relative path from repo root

### POST general PR comment (no anchor)

`POST /projects/{project}/repos/{repo}/pull-requests/{id}/comments`

```json
{
  "text": "## Code Review\n\nOverall LGTM with minor issues.\n\n**Findings:** 1 error · 2 warnings · 1 info"
}
```

### POST task (BLOCKER severity comment anchored to parent comment)

Tasks in Bitbucket Server 9.x are comments with `severity: "BLOCKER"` and a parent reference.

```json
{
  "text": "Token exposed in logs — remove the log statement",
  "severity": "BLOCKER",
  "parent": { "id": 5501 }
}
```

- `parent.id` — the ID of the comment this task is anchored to (returned from the comment POST response `.id`)

```bash
# Example: post inline comment and create a task for it
COMMENT=$(curl -s -X POST \
  -H "Authorization: Bearer $BITBUCKET_TOKEN" \
  -H "Content-Type: application/json" \
  "https://bitbucket.lab.dynatrace.org/rest/api/1.0/projects/PFS/repos/copilot-skills/pull-requests/2639/comments" \
  -d '{"text": "Token is logged here", "anchor": {"line":42,"lineType":"ADDED","fileType":"TO","path":"src/auth/oauth.py"}}')

COMMENT_ID=$(echo "$COMMENT" | jq '.id')

curl -s -X POST \
  -H "Authorization: Bearer $BITBUCKET_TOKEN" \
  -H "Content-Type: application/json" \
  "https://bitbucket.lab.dynatrace.org/rest/api/1.0/projects/PFS/repos/copilot-skills/pull-requests/2639/comments" \
  -d "{\"text\": \"Remove token from logs\", \"severity\": \"BLOCKER\", \"parent\": {\"id\": $COMMENT_ID}}"
```

---

## Example Feedback Items

### Error — security issue with task

```json
{
  "file": "src/auth/oauth.py",
  "line": 42,
  "severity": "error",
  "category": "security",
  "message": "OAuth token printed to stdout — will appear in CI logs.",
  "suggestion": "Remove the print statement or replace with `logger.debug()` using a redacted token.",
  "create_task": true
}
```

### Warning — missing error handling

```json
{
  "file": "src/auth/tokens.py",
  "line": 17,
  "severity": "warning",
  "category": "performance",
  "message": "Token refresh called on every request. This makes an external HTTP call for each API request.",
  "suggestion": "Cache the token with a 5-minute TTL using `functools.lru_cache` or a Redis key.",
  "create_task": false
}
```

### Info — missing test coverage

```json
{
  "file": "tests/test_oauth.py",
  "line": null,
  "severity": "info",
  "category": "tests",
  "message": "No test for expired token edge case (token issued > 24h ago).",
  "suggestion": "Add a test that mocks `datetime.now()` to return a time 25h after token issuance.",
  "create_task": false
}
```

### PR-level summary (no file/line)

```json
{
  "summary": "Code is mostly clean. One security issue must be resolved before merging (token leaking to logs). Two minor suggestions on caching and test coverage.",
  "items": []
}
```
