# Analyze and Triage

Workflow for analyzing monitoring data, identifying issues, and tracking
them in beads.

## Purpose

This workflow turns monitoring data into tracked issues. The AI agent:

1. Reads project-specific monitoring configuration
2. Executes commands to fetch monitoring data
3. Uses judgment to identify potential issues
4. Checks for existing related bugs/tasks
5. Creates new issues or updates existing ones

## Prerequisites

The project must have a `docs/MONITORING.md` file that documents:

- How to query monitoring data
- What to look for when analyzing

If no `docs/MONITORING.md` exists, use the setup workflow first.

## Step 1: Read MONITORING.md

Read the project's `docs/MONITORING.md` to understand:

- What commands or APIs to use for fetching data
- What kinds of issues are important
- What can be safely ignored
- Domain-specific context for interpretation

This file is the source of truth for how to access and interpret monitoring data.

## Step 2: Fetch Monitoring Data

Execute the commands or scripts documented in `MONITORING.md` to retrieve
current monitoring data.

**Output the raw data to a working file** — something like
`issue-summary.md` in a temp location or the project root. This serves
as:

- A record of what was analyzed
- Input for the analysis step
- Evidence to reference when creating issues

### Handling Multiple Sources

If `MONITORING.md` describes multiple data sources:

- Query all of them unless the user specified otherwise
- If unsure which to check, ask the user

### Handling Failures

If a command fails:

- Note the failure in the output file
- Continue with other sources
- Report the failure to the user at the end

## Step 3: Analyze the Data

Read through the fetched data and identify potential issues.

**This is LLM judgment, not rigid parsing.** Look for:

- Error messages and patterns
- Anomalies compared to what's described as normal
- Patterns that match the "what to look for" guidance
- Anything that seems concerning even if not explicitly listed

Use the domain knowledge in `MONITORING.md` to guide interpretation:

- What error codes actually matter?
- What thresholds indicate problems?
- What patterns indicate known vs. new issues?

### Grouping

Multiple log entries or alerts about the same underlying issue should be
grouped together. One bug per root cause, not one per log line.

## Step 4: Check for Existing Issues

For each identified problem, search beads to see if it's already tracked:

```bash
bd list --status=open --json
# or search with grep
bd list | grep -i "relevant keywords"
```

### If Related Issue Exists

Decide whether to:

- **Skip** — The issue is already tracked and this doesn't add new info
- **Update** — Add a comment with new information or frequency
- **Create anyway** — This is a new occurrence or different enough to
  warrant separate tracking

Ask the user if uncertain about the right action.

### If No Related Issue

Proceed to create a new bug or task.

## Step 5: Create or Update Issues

For new issues, use `bd create`:

```bash
bd create --type=bug --title="Brief description of the problem"
```

Include in the description:

- What was observed (error messages, patterns)
- When and how often (time range, frequency)
- Where (which service, component, log source)
- Any relevant context from the monitoring data

For updates to existing issues, add comments with new information.

### Priority

Use judgment informed by `MONITORING.md` guidance:

- What the project considers critical vs. minor
- Frequency and impact of the issue
- Whether it's actively causing problems

Don't apply rigid mappings — interpret based on context.

## Step 6: Report Results

Summarize what was done:

- How many data sources were queried
- What issues were identified
- Which were new vs. already tracked
- What actions were taken (created, updated, skipped)

Example:

```text
Analyzed monitoring data from 2 sources (CloudWatch logs, Sentry errors).

Found 4 potential issues:
- Database connection timeouts (47 occurrences) → Created oc-a1b2
- Slow API responses (12 occurrences) → Updated existing oc-x9y8 with new data
- Deprecated endpoint usage (3 calls) → Created oc-c3d4
- Memory warning on worker → Skipped, already tracked in oc-m5n6

1 data source failed: Grafana API returned 401 (token may be expired)
```

## Agentic Guidelines

### Safe to Do Automatically

- Fetching data using documented commands
- Analyzing and grouping findings
- Searching for existing related issues
- Creating bugs for clear, new problems
- Adding comments to existing issues

### Ask the User

- Which data sources to query (if multiple and user's intent is unclear)
- Whether to create or skip a borderline issue
- How to handle an issue that partially matches an existing one
- What priority to assign if guidance is ambiguous

### Use Judgment

This workflow relies on LLM judgment, not rigid rules:

- **No hard-coded thresholds** — Interpret "concerning" based on context
- **No rigid parsing** — Read data like a human would
- **No strict schemas** — The monitoring config is documentation, not
  config

### Maintain Context

When creating issues, link back to the monitoring analysis:

- Reference the data source
- Include timestamps and frequencies
- Capture enough context that someone can investigate later
