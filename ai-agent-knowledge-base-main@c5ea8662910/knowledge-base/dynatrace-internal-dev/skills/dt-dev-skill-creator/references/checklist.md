# Validation Checklist

Use this checklist **after** completing shared static checks in `skill-validator`.

Shared markdown/link/syntax/content checks are maintained in:

- `knowledge-base/dynatrace-internal-dev/skills/skill-validator/references/checklist.md`

This checklist is additive and Dynatrace-specific.

## Workflow Handoff

- [ ] Current iteration has `skill-creator` evidence ready (evals, benchmark/grading outputs, viewer feedback)
- [ ] Shared static validation completed via `skill-validator`
- [ ] Runtime validation report created with `create_validation_run.py`

## DQL Queries

- [ ] All DQL queries extracted (use `extract_dql_queries.py`)
- [ ] Each query tested against real tenant
- [ ] Field names verified (not assumed)
- [ ] Filter syntax correct (`==` not `=`)
- [ ] Aggregation functions have `()`
- [ ] Timeframe format valid
- [ ] Entity selectors use proper syntax
- [ ] Each query returns expected data
- [ ] Output inspected for errors or warnings
- [ ] Tested with `--plain` flag
- [ ] Query results and verified fields documented in validation report

## dtctl Commands

- [ ] Commands use correct resource names (singular for describe/delete)
- [ ] Flags verified against `--help` output
- [ ] Read-only commands tested before write operations
- [ ] Resource lifecycle pattern followed for write operations
- [ ] Command outcomes documented in validation report

## Safety (before write operations)

- [ ] Confirmed correct tenant context (`dtctl config current-context`)
- [ ] Resource names use `test-validation-*` prefix
- [ ] User approved write operation (if needed)
- [ ] Cleanup plan ready
- [ ] Cleanup completed and verified for all created resources

## Asset Registry

- [ ] Asset registry exists at `docs/registry/assets.yaml`
- [ ] Skill being validated has an entry in the registry
- [ ] Registry entry has correct channel value
- [ ] `validate_asset_registry.py` passes without errors

## Feedback Loop (Recommendations + Iteration)

Capture runtime findings as inputs for the next `skill-creator` iteration:

- [ ] Advisory recommendations captured in report (description alignment, consistency, routing)
- [ ] Relevant `skill-creator` artifacts referenced in report (for example benchmark/grading/review outputs)
- [ ] Runtime findings mapped to concrete next-iteration actions
