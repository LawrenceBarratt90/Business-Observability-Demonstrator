---
name: observability-triage
description: >
  Analyze monitoring data (logs, metrics, spans, events, RUM) and triage
  issues into beads. Use when: (1) User wants to analyze logs, metrics,
  or monitoring data, (2) User mentions 'check logs', 'analyze errors',
  'triage issues', 'review monitoring', (3) User wants to find bugs from
  observability data, (4) User asks to 'create issues from logs' or
  'triage alerts', (5) User wants to set up monitoring analysis for a
  project.
---

# Observability Triage

Analyze monitoring data and triage issues into beads.

## Workflows

This skill has two workflows. **Choose based on whether `docs/MONITORING.md`
exists:**

### 1. Setup Monitoring Configuration

**Use when:** `docs/MONITORING.md` does not exist, OR user wants to update
the monitoring configuration.

**Also use when:** User asks to analyze monitoring data but no
`docs/MONITORING.md` exists — create it first, then proceed to workflow 2.

**[setup-monitoring-config.md](references/setup-monitoring-config.md)** —
Interactive guide for creating `docs/MONITORING.md` through conversation
with the user.

### 2. Analyze and Triage

**Use when:** `docs/MONITORING.md` exists and user wants to analyze
monitoring data.

**[analyze-and-triage.md](references/analyze-and-triage.md)** — Fetch
monitoring data, identify issues, check for duplicates, create or update
beads.

## Prerequisites

- **beads (`bd` CLI)** — Required for creating and managing triage issues.
  The analyze-and-triage workflow uses `bd create`, `bd list`, and `bd update`
  to track discovered issues. Install beads before using this skill.

## Decision Flow

```text
User asks about monitoring
          │
          ▼
  docs/MONITORING.md exists?
          │
    ┌─────┴─────┐
    │           │
   No          Yes
    │           │
    ▼           ▼
Workflow 1   Workflow 2
 (Setup)    (Analyze)
    │           │
    └─────┬─────┘
          │
          ▼
   (After setup,
    continue to
    Workflow 2)
```
