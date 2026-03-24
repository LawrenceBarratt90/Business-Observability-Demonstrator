# Validation Guide

How to validate that your skill works correctly and will be useful to AI agents.

## Why Validation Matters

An unvalidated skill is a liability. Invalid DQL queries, broken dtctl commands, weak eval coverage, or misleading instructions waste user time and damage trust. Validation in this repository happens in **layers**:

1. `skill-creator` proves the skill helps on representative prompts
2. `skill-validator` proves the local/static assets are structurally sound
3. `dt-dev-skill-creator` proves the Dynatrace-specific behavior works against a real tenant

## Prerequisites

- **A Dynatrace tenant** — You cannot fully validate a Dynatrace runtime skill without access to a real tenant. Check `docs/registry/assets.yaml` for the designated `test-environment-url`, or use your own.
- **`skill-creator` skill loaded** — Provides eval creation, output review, benchmarking, and description optimization
- **`skill-validator` skill loaded** — Provides static/local validation (structure, syntax, links, eval-asset checks)
- **`dt-dev-skill-creator` skill loaded** — Provides Dynatrace-specific runtime validation (DQL, dtctl, resource lifecycle, validation reports)
- **`dtctl` installed and authenticated** — Required for tenant-level validation
- **`mdformat` installed** — `pip install mdformat mdformat-gfm mdformat-frontmatter`

> These skills are auto-loaded in this repo via `ai.package.yaml`, but verify they are active before proceeding.

## Validation Workflow

### Step 1: Define Key Use Cases

Before running any checks, identify the **key questions** your skill must answer. These are the scenarios a user would bring to an AI agent:

- "How do I create a dashboard showing service health?"
- "What DQL query gives me error rates by service?"
- "How do I set up Kubernetes monitoring?"

Write down 3-5 key use cases. These become the backbone for both your eval prompts and your later runtime validation.

### Step 2: Build and review evals with `skill-creator`

Use `skill-creator` to build realistic test prompts and compare iterations of the skill.

At a minimum:

1. Create a small eval set based on your key use cases
2. Run the eval loop and review outputs qualitatively
3. Add or refine assertions where objective checks make sense
4. Compare behavior against a baseline or previous iteration

If your skill's description needs tuning, use `skill-creator`'s description optimization workflow rather than guessing from keywords alone.

### Step 3: Run static/local validation with `skill-validator`

Use the `skill-validator` skill for automated checks:

- Markdown/link validation
- Code block syntax checks
- File-size guidance and TOC checks
- Eval asset structure checks (`evals/evals.json`, trigger-eval input sets)
- Content-review recommendations and handoff clarity

```
Ask your AI assistant: "Please validate the structure of dt-<domain>-<name>"
```

This step should happen before tenant validation so you do not spend runtime validation time on avoidable local problems.

### Step 4: Run tenant-level validation with `dt-dev-skill-creator`

Use the `dt-dev-skill-creator` skill for Dynatrace-specific checks:

- **DQL queries** — Every query must execute successfully against a real tenant
- **dtctl commands** — Every command must be valid and produce expected output
- **Resource lifecycle** — If the skill creates resources (dashboards, workflows, etc.), test the full create/test/delete cycle
- **Runtime evidence capture** — Record what actually worked in the tenant and what must feed back into the next iteration

The `dt-dev-skill-creator` skill has detailed instructions for each validation type. See its references:

- `references/dql-validation.md` — Incremental DQL testing pattern
- `references/dt-code-patterns.md` — dtctl command validation and resource lifecycle
- `references/tenant-selection.md` — How to select the right test tenant

### Step 5: Generate and review the validation report

With the `dt-dev-skill-creator` skill loaded, ask your AI assistant to generate a validation report:

```
"Please generate a validation report for dt-<domain>-<name>"
```

The skill will create a timestamped report in `dt-skill-validation/` at the repo root (never inside the skill directory).

**Read the report carefully.** A validation report is only useful if someone actually reviews it. Check:

- Are all DQL queries marked as passing?
- Were all dtctl commands tested?
- Are there any warnings or partial failures?
- Does the report reference the relevant `skill-creator` iteration artifacts?
- Do the runtime findings confirm or challenge what the eval/review loop suggested?

### Step 6: Feed runtime findings back into the next iteration

If runtime validation reveals problems, do not stop at the report. Feed those findings back into the next `skill-creator` iteration:

- refine prompts or assertions
- update instructions/examples
- improve description wording if trigger behavior is still wrong
- rerun static checks before validating again against the tenant

## What "Validated" Means

A validated skill has:

- Representative evals reviewed with `skill-creator`
- Static/local checks passing in `skill-validator`
- All DQL queries tested against a real tenant
- All dtctl commands verified
- Key use cases covered by both evals and runtime checks
- A complete validation report generated in `dt-skill-validation/`
- The registry entry still points at the correct `test-environment-url` and `release-status`

## Next Steps

- [Pull Request Guide](pull-request-guide.md) — Your PR must include the validation report
- [Dev Environment Setup](dev-environment-setup.md) — Tool installation
- [Writing Skills](writing-skills.md) — Skill content guidelines
