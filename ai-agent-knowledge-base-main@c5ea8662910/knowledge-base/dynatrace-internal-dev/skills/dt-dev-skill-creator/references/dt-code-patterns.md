# Dynatrace Code Validation Patterns

Dynatrace-specific code validation for dtctl commands, DQL queries, and resource lifecycle testing.

For general code syntax validation (YAML, JSON, Python, JavaScript, Bash), load a skill for general skill validation.

## Contents

- [Overview](#overview)
- [DQL Code Blocks](#dql-code-blocks)
- [dtctl Command Validation](#dtctl-command-validation)
- [Resource Validation Pattern](#resource-validation-pattern)
- [Safety Rules](#safety-rules)
- [Common Dynatrace Issues](#common-dynatrace-issues)

## Overview

This document covers validation patterns that require a Dynatrace tenant connection:

- **dtctl command validation** — Verify commands work against a real tenant
- **DQL code block validation** — Test queries return expected data
- **Resource lifecycle validation** — Create, test, and clean up test resources

## DQL Code Blocks

DQL queries embedded in skills must be tested against a real tenant.

For detailed DQL validation patterns, incremental testing strategies, and troubleshooting, see [dql-validation.md](dql-validation.md).

**Key approach summary:**

1. Fetch with `limit 1` to verify the datatype and inspect available fields
2. Add filters using verified field names
3. Add aggregations and transformations
4. Test the full query end-to-end

**Critical rules:**

- NEVER assume field names — always verify with `limit 1` first
- Use `--plain` flag on all dtctl query commands for raw output
- Common mistakes: `log.severity` vs `status`, `log.message` vs `content`, `=` vs `==`

```bash
# Verify fields before writing filters
dtctl query "fetch logs | limit 1" --plain

# Then build your query incrementally
dtctl query "fetch logs | filter status == 'ERROR' | limit 10" --plain
```

## dtctl Command Validation

### Command Verification

Before documenting a dtctl command, verify it works:

```bash
# Verify command exists and check flags
dtctl get --help

# Test read-only first
dtctl get workflows --mine --plain

# Check specific resource
dtctl describe workflow <id> --plain
```

### Resource Name Rules

dtctl uses **singular** names for describe and delete operations:

```bash
# ✅ CORRECT - singular for describe/delete
dtctl describe workflow my-workflow
dtctl delete workflow my-workflow

# ❌ WRONG - plural
dtctl describe workflows my-workflow  # Error: unknown command
```

Use **plural** for list operations:

```bash
# ✅ CORRECT - plural for list
dtctl get workflows
dtctl get dashboards --mine
```

## Resource Validation Pattern

For YAML/JSON resource definitions (workflows, dashboards, notebooks, SLOs), follow this sequence:

### 1. Validate Syntax Locally

```bash
# YAML files
yamllint resource.yaml

# JSON files
jq . resource.json
```

### 2. Dry-Run if Available

```bash
dtctl apply -f resource.yaml --dry-run
```

### 3. Apply Test Resource

Always use `test-validation-*` naming prefix:

```bash
dtctl apply -f resource.yaml
```

### 4. Verify Creation

```bash
dtctl describe workflow test-validation-my-workflow --plain
```

### 5. Test Functionality

```bash
# For workflows: execute
dtctl exec workflow test-validation-my-workflow

# For dashboards: verify it loads (manual check or API)
dtctl describe dashboard test-validation-my-dashboard --plain
```

### 6. Clean Up

```bash
dtctl delete workflow test-validation-my-workflow
```

### 7. Verify Cleanup

```bash
# Should return "not found"
dtctl describe workflow test-validation-my-workflow --plain
```

### Complete Example

```bash
# Full lifecycle for a workflow
yamllint workflow.yaml
dtctl apply -f workflow.yaml --dry-run
dtctl apply -f workflow.yaml                      # creates test-validation-*
dtctl describe workflow test-validation-my-workflow --plain
dtctl exec workflow test-validation-my-workflow
dtctl delete workflow test-validation-my-workflow
dtctl describe workflow test-validation-my-workflow --plain  # expect not found
```

## Safety Rules

### Absolute Rules

1. **ALWAYS use `test-validation-*` prefix** for test resources
2. **ONLY delete resources you created** during validation
3. **NEVER modify existing resources** without explicit approval
4. **Read-only operations first**, then write operations
5. **Always clean up** — do not leave test resources behind
6. **Verify cleanup** — confirm deletion succeeded before marking validation complete

### Safety Checklist

Before ANY write operation:

- [ ] Confirmed correct tenant context (`dtctl config current-context`)
- [ ] Resource name uses `test-validation-*` prefix
- [ ] User approved write operation (if needed)
- [ ] Cleanup plan ready

## Common Dynatrace Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| Wrong DQL field names | "Unknown field" error | Query with `limit 1` to discover actual field names |
| Invalid dtctl flags | "Unknown flag" error | Check `--help` output for supported flags |
| Plural resource names | "Resource not found" | Use singular for describe/delete: `workflow` not `workflows` |
| Stale resource IDs | Command succeeds but wrong resource | Verify IDs against current environment before documenting |
| Wrong tenant context | Unexpected data or permissions | Run `dtctl config current-context` to verify |
| Token expired | "Authentication failed" | Run `dtctl auth login` to re-authenticate |
