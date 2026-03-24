---
name: bitbucket-pr
description: "Manage Bitbucket Server/Data Center pull requests: create/update PRs, review code changes, process PR feedback and tasks. Use when: (1) User asks to create or update a Bitbucket PR, (2) User wants to review a PR on Bitbucket Server, (3) User mentions 'Bitbucket', 'BB PR', or 'code review on Bitbucket', (4) User wants to process PR comments or tasks, (5) User wants to resolve or reply to PR feedback. NOTE: Bitbucket Server/Data Center only (REST API 1.0) — does NOT support Bitbucket Cloud."
---

# Bitbucket PR Management

## Prerequisites

- `BITBUCKET_TOKEN` env var set (personal access token from
  [Bitbucket access tokens](https://bitbucket.lab.dynatrace.org/plugins/servlet/access-tokens/manage))
- `curl` and `jq` installed
- Git repo with Bitbucket remote
- **Bitbucket Server/Data Center only** — not compatible with Bitbucket Cloud

Run `bash scripts/check-prerequisites.sh` to verify.

## Project Conventions

Before creating, reviewing, or updating a PR, check for project-specific conventions:

- **Team mode**: Read `docs/PULL-REQUESTS.md` if it exists
- **Stealth mode**: Read `.coder/docs/PULL-REQUESTS.md` if it exists

These conventions define branch naming, PR description format, and code review guidelines for the project. Apply them when generating titles, descriptions, and review feedback.

## Use Case 1: Create or Update PR

Use when creating a new PR from the current branch or updating an existing PR's title, description, or reviewers.
`BB_PROJECT` and `BB_REPO` are auto-detected from the git remote; set them explicitly if needed.

```bash
# Check prerequisites
bash scripts/check-prerequisites.sh

# Create PR from current branch
bash scripts/create-or-update-pr.sh create [--title "..."] [--description "..."] [--dry-run]

# Update existing PR
bash scripts/create-or-update-pr.sh update <pr-id-or-url> [--title "..."] [--description "..."]
```

See [references/create-update-workflow.md](references/create-update-workflow.md) for full workflow details.

## Use Case 2: Review PR

Use when reviewing code changes in a PR and providing structured feedback with inline comments.
`BB_PROJECT` and `BB_REPO` are auto-detected from the git remote; set them explicitly if needed.

```bash
# Check prerequisites
bash scripts/check-prerequisites.sh

# Phase 1: Fetch PR data for analysis
BB_PROJECT=PFS BB_REPO=myrepo bash scripts/review-pr.sh fetch <pr-id-or-url>

# Phase 2: Post feedback (agent generates feedback JSON, pipes to script)
echo '<feedback-json>' | bash scripts/review-pr.sh post <pr-id-or-url> [--dry-run]
```

See [references/review-workflow.md](references/review-workflow.md) for feedback JSON schema and project discovery.

## Use Case 3: Process PR Feedback

Use when a PR has been reviewed and you need to address comments, resolve tasks, or reply to feedback.
`BB_PROJECT` and `BB_REPO` are auto-detected from the git remote; set them explicitly if needed.

```bash
# Check prerequisites
bash scripts/check-prerequisites.sh

# Phase 1: Fetch all comments and tasks
BB_PROJECT=PFS BB_REPO=myrepo bash scripts/process-pr-feedback.sh fetch <pr-id-or-url>

# Phase 2: Execute actions
echo '<actions-json>' | bash scripts/process-pr-feedback.sh act <pr-id-or-url> [--dry-run]
```

See [references/feedback-workflow.md](references/feedback-workflow.md) for actions JSON schema.

## Scripts

- `check-prerequisites.sh` — Verify environment (token, tools, git remote)
- `bb-api.sh` — Core API library (sourced by other scripts, not called directly)
- `create-or-update-pr.sh` — Use case 1
- `review-pr.sh` — Use case 2
- `process-pr-feedback.sh` — Use case 3

## References

- [references/create-update-workflow.md](references/create-update-workflow.md) — PR creation and update workflow
- [references/review-workflow.md](references/review-workflow.md) — Code review workflow and feedback JSON schema
- [references/feedback-workflow.md](references/feedback-workflow.md) — PR feedback processing and actions JSON schema
