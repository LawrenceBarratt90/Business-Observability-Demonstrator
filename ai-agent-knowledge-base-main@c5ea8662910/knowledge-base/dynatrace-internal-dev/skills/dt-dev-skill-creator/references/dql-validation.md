# DQL Query Validation

## Overview

All DQL queries in dt- skills MUST be validated against a real tenant. DQL syntax errors in skills waste user time and damage trust.

**Critical principle**: If it can be executed as-is, it MUST be tested.

## Contents

- [When DQL Validation is Required](#when-dql-validation-is-required)
- [Extract All Queries First](#extract-all-queries-first)
- [Validation Pattern](#validation-pattern)
- [Common DQL Errors to Catch](#common-dql-errors-to-catch)
- [Safe Testing Patterns](#safe-testing-patterns)
- [DQL Validation Checklist](#dql-validation-checklist)
- [Example Validation Session](#example-validation-session)
- [Working Examples](#working-examples)
- [Troubleshooting DQL Validation](#troubleshooting-dql-validation)
- [Offline Validation (When Tenant Unavailable)](#offline-validation-when-tenant-unavailable)
- [Best Practices](#best-practices)

## When DQL Validation is Required

**MUST validate:**
- Specific queries with actual metric/field names
- Entity selectors with real tags or management zones
- Filters referencing specific values or patterns
- Complete working examples meant to be copy-pasted

**Optional validation:**
- Generic patterns with placeholders (e.g., `fetch <datatype>`)
- Syntax examples showing structure only
- Templates requiring user customization

## Extract All Queries First

Before validating, extract all DQL queries from the skill using the helper script:

```bash
python3 scripts/extract_dql_queries.py path/to/skill
# Or for structured output:
python3 scripts/extract_dql_queries.py path/to/skill --json
```

This finds all DQL queries in SKILL.md and `references/`, reporting file location, line number, query type, and full query text. **Use this before validation** to ensure you find ALL queries in the skill.

## Validation Pattern

### Step-by-Step DQL Testing

```bash
# 1. Test basic connectivity
dtctl query "fetch logs | limit 1" --plain

# 2. Test datatype (adjust based on your query)
dtctl query "fetch logs | limit 10" --plain
dtctl query "fetch metrics | limit 10" --plain
dtctl query "fetch events | limit 10" --plain
dtctl query "fetch spans | limit 10" --plain

# 3. Test your filter incrementally
dtctl query "fetch logs | filter status == 'ERROR' | limit 10" --plain

# 4. Test aggregations/transformations
dtctl query "fetch logs | summarize count = count() by status | limit 10" --plain

# 5. Test full query
dtctl query "YOUR_COMPLETE_QUERY" --plain
```

### Use --plain Flag

Always include `--plain` flag for validation to get raw output:

```bash
# ✅ CORRECT - raw output
dtctl query "fetch logs | limit 10" --plain

# ❌ WRONG - formatted output may hide errors
dtctl query "fetch logs | limit 10"
```

## Common DQL Errors to Catch

### 1. Invalid Field Names

```bash
# ❌ WRONG - field name doesn't exist
dtctl query "fetch logs | filter log.severity == 'ERROR'" --plain
# Error: Unknown field 'log.severity'

# ✅ CORRECT - use actual field name
dtctl query "fetch logs | filter status == 'ERROR'" --plain
```

**How to find correct fields:**
```bash
# Query with limit and inspect output
dtctl query "fetch logs | limit 1" --plain

# Fields are shown in the output
```

### 2. Incorrect Filter Syntax

```bash
# ❌ WRONG - uses = instead of ==
dtctl query "fetch logs | filter status = 'ERROR'" --plain
# Error: Syntax error

# ✅ CORRECT - use == for comparison
dtctl query "fetch logs | filter status == 'ERROR'" --plain
```

### 3. Missing Aggregation Functions

```bash
# ❌ WRONG - count without ()
dtctl query "fetch logs | summarize count by status" --plain
# Error: Unknown function 'count'

# ✅ CORRECT - count()
dtctl query "fetch logs | summarize count = count() by status" --plain
```

### 4. Invalid Timeframe Syntax

```bash
# ❌ WRONG - invalid timeframe format
dtctl query "fetch logs, from:yesterday" --plain
# Error: Invalid timeframe

# ✅ CORRECT - use proper timeframe
dtctl query "fetch logs, from:now()-24h" --plain
```

### 5. Entity Selector Errors

```bash
# ❌ WRONG - invalid entity selector
dtctl query "fetch dt.entity.host | filter entity.tags contains 'prod'" --plain
# Error: Invalid selector syntax

# ✅ CORRECT - use proper entity selector
dtctl query "fetch dt.entity.host | filter contains(entity.tags, 'production')" --plain
```

## Safe Testing Patterns

### Pattern 1: Test with Limit First

Always start with small limits to avoid overwhelming output:

```bash
# 1. Start with limit 1
dtctl query "fetch logs | limit 1" --plain

# 2. Increase to limit 10
dtctl query "fetch logs | filter status == 'ERROR' | limit 10" --plain

# 3. Use full query only after validation
dtctl query "fetch logs | filter status == 'ERROR' | summarize count()" --plain
```

### Pattern 2: Incremental Complexity

Build up query complexity step by step:

```bash
# 1. Basic fetch
dtctl query "fetch logs | limit 10" --plain

# 2. Add filter
dtctl query "fetch logs | filter status == 'ERROR' | limit 10" --plain

# 3. Add aggregation
dtctl query "fetch logs | filter status == 'ERROR' | summarize count = count() by status" --plain

# 4. Add timeframe
dtctl query "fetch logs, from:now()-1h | filter status == 'ERROR' | summarize count = count() by status" --plain
```

### Pattern 3: Validate Field Names First

Before filtering or aggregating, check what fields exist:

```bash
# 1. Query data to see available fields
dtctl query "fetch logs | limit 1" --plain

# 2. Inspect output for field names
# Look for: status, timestamp, content, etc.

# 3. Use validated field names in filters
dtctl query "fetch logs | filter status == 'ERROR'" --plain
```

## DQL Validation Checklist

Before including a DQL query in a skill:

- [ ] Query tested against real tenant
- [ ] Field names verified (not assumed)
- [ ] Filter syntax correct (== not =)
- [ ] Aggregation functions have ()
- [ ] Timeframe format valid
- [ ] Entity selectors use proper syntax
- [ ] Query returns expected data
- [ ] Output inspected for errors or warnings
- [ ] Tested with --plain flag
- [ ] Results documented in validation report

## Example Validation Session

### Query to Validate
```dql
fetch logs, from:now()-1h
| filter status == 'ERROR'
| summarize errorCount = count() by content
| sort errorCount desc
| limit 10
```

### Validation Steps

```bash
# 1. Test basic fetch
dtctl query "fetch logs | limit 1" --plain
# ✅ Works - logs datatype available

# 2. Test timeframe
dtctl query "fetch logs, from:now()-1h | limit 10" --plain
# ✅ Works - timeframe syntax correct

# 3. Test filter field
dtctl query "fetch logs | limit 1" --plain
# Inspect output - confirms 'status' field exists
# ✅ Field name valid

# 4. Test filter
dtctl query "fetch logs | filter status == 'ERROR' | limit 10" --plain
# ✅ Works - filter syntax correct

# 5. Test aggregation
dtctl query "fetch logs | filter status == 'ERROR' | summarize errorCount = count() by content | limit 10" --plain
# ✅ Works - aggregation correct

# 6. Test sort
dtctl query "fetch logs | filter status == 'ERROR' | summarize errorCount = count() by content | sort errorCount desc | limit 10" --plain
# ✅ Works - sort syntax correct

# 7. Test complete query
dtctl query "fetch logs, from:now()-1h | filter status == 'ERROR' | summarize errorCount = count() by content | sort errorCount desc | limit 10" --plain
# ✅ VALIDATED - query works end-to-end
```

### Document Results

```markdown
**Query**: Error log summary by content
**Status**: ✅ PASS
**Tested**: 2026-01-29
**Output**: Returns top 10 error types by count
**Notes**: Field names validated, aggregation works correctly
```

## Working Examples

### Example 1: Error Logs Count

```bash
# Query: Count error logs in last hour
dtctl query "fetch logs, from:now()-1h | filter status == 'ERROR' | summarize count()" --plain

# Expected output format:
# count
# 42
```

### Example 2: Host CPU Usage

```bash
# Query: Average CPU usage by host
dtctl query "timeseries avg(dt.host.cpu.usage), by:{dt.entity.host} | limit 10" --plain

# Expected output format:
# timestamp, dt.entity.host, avg(dt.host.cpu.usage)
# 2026-01-29T14:00:00Z, HOST-123, 45.2
```

### Example 3: Service Requests

```bash
# Query: Request count by service
dtctl query "fetch spans, from:now()-1h | filter span.kind == 'server' | summarize requests = count() by service.name | sort requests desc | limit 10" --plain

# Expected output format:
# service.name, requests
# checkout-service, 1523
# payment-service, 987
```

## Troubleshooting DQL Validation

### "Unknown field" Error

**Problem**: Field name doesn't exist in data
```bash
dtctl query "fetch logs | filter severity == 'ERROR'" --plain
# Error: Unknown field 'severity'
```

**Solution**: Query data to find correct field name
```bash
# 1. Query sample data
dtctl query "fetch logs | limit 1" --plain

# 2. Inspect output for field names
# Find: "status" not "severity"

# 3. Use correct field
dtctl query "fetch logs | filter status == 'ERROR'" --plain
```

### "Syntax error" Message

**Problem**: Invalid DQL syntax
```bash
dtctl query "fetch logs filter status == 'ERROR'" --plain
# Error: Syntax error - missing pipe
```

**Solution**: Check DQL syntax rules
```bash
# Add pipe before filter
dtctl query "fetch logs | filter status == 'ERROR'" --plain
```

### No Data Returned

**Problem**: Query succeeds but returns no results

**Possible causes:**
1. **Timeframe too narrow** - Extend timeframe:
   ```bash
   # Try longer timeframe
   dtctl query "fetch logs, from:now()-24h | filter status == 'ERROR' | limit 10" --plain
   ```

2. **Filter too restrictive** - Simplify filter:
   ```bash
   # Remove filter to check data exists
   dtctl query "fetch logs | limit 10" --plain
   ```

3. **Wrong datatype** - Try different datatype:
   ```bash
   # Try metrics instead of logs
   dtctl query "fetch metrics | limit 10" --plain
   ```

## Offline Validation (When Tenant Unavailable)

When you don't have tenant access, use these strategies:

### 1. Syntax Review Checklist

- [ ] Datatype is valid (logs, metrics, events, spans, entities)
- [ ] Pipe `|` separates commands
- [ ] Filters use `==` not `=`
- [ ] Aggregation functions have `()`
- [ ] Field names are referenced, not assumed
- [ ] Timeframe uses proper format (now()-1h, etc.)
- [ ] Entity selectors use proper syntax

### 2. Reference Known-Good Patterns

Compare against validated patterns from Dynatrace documentation or a DQL helpers skill if available.

### 3. Mark as Unvalidated

If you cannot validate, clearly mark in documentation:

```markdown
**⚠️ UNVALIDATED QUERY** - This query has not been tested against a real tenant. 
Verify field names and syntax before using.

```dql
fetch logs | filter status == 'ERROR'
```

**To validate**: 
Run `dtctl query "fetch logs | limit 1" --plain` to check available fields.
```

### 4. Provide Validation Instructions

Include steps for users to validate themselves:

```markdown
## Validate This Query

Before using, test the query:

1. Check field names:
   ```bash
   dtctl query "fetch logs | limit 1" --plain
   ```

2. Test the filter:
   ```bash
   dtctl query "fetch logs | filter status == 'ERROR' | limit 10" --plain
   ```

3. Run full query:
   ```bash
   dtctl query "YOUR_QUERY" --plain
   ```
```

## Best Practices

1. **Always use --plain** - Raw output shows errors clearly
2. **Test incrementally** - Build complexity step by step
3. **Validate field names** - Never assume, always check
4. **Start with limit** - Use small limits during testing
5. **Document results** - Record validation in report
6. **Update if broken** - Fix queries that fail validation
7. **Mark unvalidated** - Clearly indicate if not tested
8. **Provide examples** - Show expected output format
