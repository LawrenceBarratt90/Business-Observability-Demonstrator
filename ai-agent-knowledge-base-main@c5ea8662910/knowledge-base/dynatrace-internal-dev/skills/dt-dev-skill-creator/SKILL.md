---
name: dt-dev-skill-creator
description: "Runtime validation guide for Dynatrace dt- skills. Use when validating dt- skills against a real Dynatrace tenant: DQL query execution, dtctl command verification, resource lifecycle testing (create/test/delete), and validation report generation. Requires dtctl CLI and tenant access. Load `skill-validator` first for shared static checks such as markdown, links, and code syntax."
---

# dt-dev-skill-creator

**Why validation matters**: Invalid DQL, dtctl commands, or broken resources in a skill waste user time, damage trust, and can cause production issues. If content can be executed as-is, it MUST be validated.

## Scope and Naming Decision

- Keep the current skill name/path: `dt-dev-skill-creator`
- This is intentional for the current epic and **does not** mean broader "creator" capabilities are already implemented here.
- Current scope is runtime validation for Dynatrace skills, composed with companion skills:
  - **skill-creator**: evals, benchmark artifacts, review viewer, and iteration loop
  - **skill-validator**: shared markdown/code structure checks
  - **dt-dev-skill-creator** (this skill): tenant runtime validation and validation reporting

## Prerequisites

- **Load `skill-creator`** — Needed to run evals, benchmarks, and review viewer artifacts before tenant runtime validation.
- **Load `skill-validator`** — Source of truth for shared markdown, links, and code syntax checks.
- **Load `dynatrace-control`** — Needed for dtctl command patterns, context handling, and Dynatrace resource operations.
- **Python 3.12+ available** — Required for scripts in this skill (`create_validation_run.py`, `verify_validation_report.py`, helper scripts).
- **mdformat tooling installed** — `pip install mdformat mdformat-gfm mdformat-frontmatter` for local formatting checks.
- **dtctl installed and authenticated** — `dtctl config current-context` must work before runtime validation begins.
- **Tenant access and permissions confirmed** — Use a safe validation tenant/context with required scopes for resources under test.

## Validation Workflow

### Step 1: Run skill-creator iteration loop first

Before runtime tenant checks, complete your current `skill-creator` iteration cycle:

1. Run/update evals
2. Review grading/benchmark outputs (for example `grading.json`, `benchmark.json`)
3. Open review viewer output and capture human feedback
4. Apply improvements and repeat until ready for runtime verification

This skill does not replace that loop; it adds tenant runtime evidence after the loop has produced a stable candidate.

### Step 2: Complete shared static validation via skill-validator

Run shared markdown/syntax/file-size checks through `skill-validator` first.

- Use `skill-validator` checklist and scripts for generic checks
- Do not duplicate those checks here
- Carry any relevant findings into this skill's validation report as context

### Step 3: Select tenant and runtime context

Pick which Dynatrace tenant to validate against. First check if the asset registry has tenant info for this skill (see [tenant-selection.md](references/tenant-selection.md)), then fall back to manual selection if needed.

See [tenant-selection.md](references/tenant-selection.md) for the complete tenant selection process, context listing, and configuration file handling.

### Step 4: Validate DQL queries against the selected tenant

Every DQL query in the skill must be tested against a real tenant using incremental testing (fetch with limit, verify fields, build up complexity).

See [dql-validation.md](references/dql-validation.md) for the incremental testing pattern, common errors, and the validation checklist.

### Step 5: Validate dtctl commands and resource lifecycle

All dtctl commands must be verified against a real tenant. For skills with resource definitions (workflows, dashboards, notebooks, SLOs), follow the resource lifecycle pattern.

See [dt-code-patterns.md](references/dt-code-patterns.md) for:

- dtctl command validation
- Resource lifecycle pattern (create/test/delete)
- Safety rules and naming conventions

### Step 6: Capture recommendations and evidence links

After runtime checks, add advisory recommendations (non-blocking) and connect runtime findings back to skill-creator artifacts:

- Link relevant eval/benchmark/review artifacts used in this iteration
- Note whether runtime issues confirm or contradict eval/review signals
- Record concrete next-iteration actions for the skill-creator loop

Recommendations are advisory — they do not block validation unless they expose a concrete runtime failure.

### Step 7: Generate and verify validation report

**CRITICAL - VALIDATION OUTPUT LOCATION**: 

⛔ **NEVER** create validation artifacts inside skill directories (`knowledge-base/.../skills/dt-*/`)  
✅ **ALWAYS** use the `dt-skill-validation/` directory at repo root

Use scripts from this skill:

- `create_validation_run.py` to create the run directory and template report
- `verify_validation_report.py` to verify completeness and location

The report captures both runtime evidence and references to skill-creator iteration artifacts.

See [validation-tracking.md](references/validation-tracking.md) for directory structure, the report template, and an example complete session.

## Release Readiness Rules

Assets with `release-status: planned` or `released` in the asset registry **must not reference any CLI tools**. This applies equally to skills and agents.

### What Is Allowed in Releasable Assets

- DQL queries in `dql` code blocks
- JSON/YAML configuration examples
- Markdown documentation and explanations

### What Is NOT Allowed in Releasable Assets

The following content makes an asset **ineligible for `planned` or `released` status**:

- **Bash scripts** — `.sh` files or `bash`/`sh` code blocks
- **dtctl commands** — e.g., `dtctl query`, `dtctl get`, `dtctl apply`
- **CLI tool references in code blocks** — `jq`, `grep`, `sed`, `sort`, `cat`, `awk`, `curl`, etc.
- **JavaScript files** — `.js` files executed via dtctl
- **Agent instructions to run tools** — agent markdown that tells users to run `dtctl query '...'` or similar shell commands

### Tool-Using Assets Must Be `candidate`

If an asset (skill or agent) uses bash, dtctl, or any CLI tooling, it **must** have `release-status: candidate` in the asset registry. It cannot be set to `planned` or `released` until a dedicated tool runtime is supported.

### Enforcement

This rule is enforced during **manual validation review** — there is no automated enforcement. When reviewing an asset marked `planned` or `released`, validators must check the full markdown content (including all referenced files and agent definitions) for tool references.

### Future Tool Runtime

A future version will include a dedicated bash tool set and dtctl integration. Assets currently marked `candidate` due to tool usage will be eligible for release when this runtime ships.

See the asset registry documentation (`docs/registry/README.md`) for `release-status` field details.

## Safety Rules (CRITICAL)

### Absolute Rules

1. **NEVER modify/delete existing resources** without explicit user approval
2. **ALWAYS use test-validation-\* naming** for test resources
3. **ONLY delete resources YOU created** during validation
4. **NEVER write validation artifacts inside the skill directory** — use dt-skill-validation/ at repo root
5. **Read-only operations FIRST** before any writes
6. **Warn before ANY write operation** in production-like tenants
7. **If uncertain, ASK the user** before proceeding

### Safety Checklist

Before ANY write operation:

- [ ] Confirmed correct tenant context
- [ ] Resource name uses test-validation-\* prefix
- [ ] User approved write operation (if needed)
- [ ] Have cleanup plan ready

## Available Scripts

Scripts are in the `scripts/` directory. Run with `--help` for full usage.

### Validation Workflow Scripts

- **create_validation_run.py** — Creates timestamped validation directory with template report
  - Usage: `python3 scripts/create_validation_run.py dt-app-dashboard --validator "Your Name"`
  - Ensures validation artifacts are created in the correct location
  - Generates pre-filled VALIDATION-REPORT.md template

- **verify_validation_report.py** — Verifies validation report completeness and correctness
  - Usage: `python3 scripts/verify_validation_report.py dt-app-dashboard`
  - Checks report location, required sections, metadata, and completion status
  - Supports `--json` output for automation

### Helper Scripts

- **list_contexts.py** — Lists configured dtctl contexts (`--json` for structured output)
- **extract_dql_queries.py** — Extracts all DQL queries from a skill for validation
- **init_skill.py** — Optional scaffold helper for bootstrapping a new skill directory
  - Not required for the validation workflow in this skill
  - Use when you explicitly want template files for a new skill draft

### Asset Registry Scripts

- **generate_asset_registry.py** — Discovers all assets in the knowledge base and generates/updates `docs/registry/assets.yaml`
  - Usage: `python3 scripts/generate_asset_registry.py [--dry-run] [--json]`
  - Auto-fills channel from directory structure, leaves owner fields empty for manual entry
  - Merges with existing file (never overwrites user data)

- **validate_asset_registry.py** — Validates the asset registry for correctness
  - Usage: `python3 scripts/validate_asset_registry.py [--json] [--strict]`
  - Checks structure, required fields, valid enum values
  - Cross-references registry entries against actual filesystem (missing/stale detection)

## References

- [Validation Checklist](references/checklist.md) — Consolidated progress tracker for all validation checks
- [DQL Validation](references/dql-validation.md) — DQL query validation patterns and troubleshooting
- [dtctl Code Patterns](references/dt-code-patterns.md) — dtctl command validation and resource lifecycle
- [Tenant Selection](references/tenant-selection.md) — Tenant selection workflow and configuration
- [Validation Tracking](references/validation-tracking.md) — Directory structure, report template, and example session
- [Troubleshooting](references/troubleshooting.md) — dtctl installation, authentication, and connection issues
