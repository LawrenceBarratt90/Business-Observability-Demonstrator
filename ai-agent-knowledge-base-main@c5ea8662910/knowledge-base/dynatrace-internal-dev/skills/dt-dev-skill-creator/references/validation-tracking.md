# Validation Tracking

## Purpose

Use this guide to track **Dynatrace runtime validation evidence** for a dt- skill and connect it to the broader `skill-creator` improvement loop.

- `skill-creator` artifacts (evals, grading, benchmarks, review outputs) explain **why you changed** the skill.
- `dt-dev-skill-creator` validation reports explain **what actually worked at runtime** in a real tenant.

Both are needed for a complete feedback loop.

## Scope Boundary

- Shared static checks (markdown, links, syntax, structure) belong to `skill-validator`.
- This document focuses on runtime-only evidence: DQL execution, dtctl command validation, resource lifecycle checks, and tenant-specific findings.

## CRITICAL - Validation Output Location

⛔ **NEVER** create validation artifacts inside skill directories:

- ❌ `knowledge-base/dynatrace-internal-dev/skills/dt-app-dashboard/VALIDATION-REPORT.md`
- ❌ `knowledge-base/dynatrace-internal-dev/skills/dt-app-dashboard/validation/`

✅ **ALWAYS** use `dt-skill-validation/` at repo root:

- ✅ `dt-skill-validation/dt-app-dashboard/2026-02-16-160208/VALIDATION-REPORT.md`

Use `create_validation_run.py` to enforce this location.

## Directory Structure

```text
dt-skill-validation/
  dt-app-dashboard/
    skill-validation-instructions.md        (optional tenant/context preferences)
    2026-02-16-160208/
      VALIDATION-REPORT.md
  dt-dql-essentials/
    2026-02-21-101500/
      VALIDATION-REPORT.md
```

Validation reports are part of repository history and should be committed with skill updates.

## Recommended Sequence (Composed Workflow)

1. Run `skill-creator` eval and review loop for your current draft.
2. Run `skill-validator` static checks.
3. Use this skill for tenant runtime validation.
4. Record runtime outcomes in `VALIDATION-REPORT.md` and reference related `skill-creator` artifacts.
5. Feed unresolved runtime findings back into next `skill-creator` iteration.

## Create a Validation Run

From this skill directory:

```bash
python3 scripts/create_validation_run.py dt-app-dashboard --validator "Your Name"
```

This creates:

- `dt-skill-validation/<skill-name>/<timestamp>/VALIDATION-REPORT.md`

## Verify a Completed Report

```bash
# Verify latest run for skill
python3 scripts/verify_validation_report.py dt-app-dashboard

# Or verify a specific run
python3 scripts/verify_validation_report.py dt-skill-validation/dt-app-dashboard/2026-02-16-160208

# JSON output for automation
python3 scripts/verify_validation_report.py dt-app-dashboard --json
```

## Validation Report Expectations

The report template includes these evidence sections:

- Runtime test metadata (tenant/context/environment/safety level)
- Summary table
- DQL query validation
- dtctl command validation
- Resource lifecycle validation
- Runtime recommendations and feedback-loop actions

### Skill-Creator Evidence Linkage

Use the report section for iteration linkage to reference artifacts from `skill-creator` work, such as:

- `grading.json`
- `benchmark.json`
- review viewer output and key feedback notes

If there is no direct file bridge, include relative paths or short references in markdown. The goal is traceability, not forced format conversion.

## Example Session

```bash
# 1) Complete skill-creator loop for current draft (eval/review/benchmark)
# 2) Run skill-validator shared checks

# 3) Create runtime validation run
python3 scripts/create_validation_run.py dt-app-dashboard --validator "Example Validator"

# 4) Execute runtime checks
dtctl config current-context
dtctl query "fetch logs | limit 10" --plain
dtctl get workflows --mine --plain

# 5) Fill VALIDATION-REPORT.md with runtime results + linked iteration artifacts

# 6) Verify report completeness
python3 scripts/verify_validation_report.py dt-app-dashboard
```
