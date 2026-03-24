# Setup Monitoring Configuration

Guide for creating or updating a project's `docs/MONITORING.md` file.

## Before Starting

Check if any monitoring-specific skills are available that might help:

- Look for skills like `dynatrace-monitoring`, `cloudwatch-monitoring`,
  `prometheus-monitoring`, etc.
- If found, load them — they may provide specific commands and patterns
  for that monitoring system

These backend skills can inform what to document in `MONITORING.md`.

## Question Flow

Ask questions in this order to build a complete picture:

### 1. What Monitoring Data Exists?

First understand what types of data the project has access to:

- "What types of monitoring data do you have?"
  - Logs (application logs, system logs, access logs)
  - Metrics (response times, error rates, resource usage)
  - Traces/Spans (distributed tracing, request flows)
  - Events (deployments, alerts, incidents)
  - Real User Monitoring (page loads, user interactions, errors)

Let the user describe what's available before asking how to access it.

### 2. How Do You Access Each Data Type?

For each data type identified, ask how to get the data:

- "Where are your logs stored and how do you query them?"
  - Local disk (file paths, log rotation)
  - Cloud service (Dynatrace, CloudWatch, Stackdriver, Azure Monitor)
  - Self-hosted (ELK stack, Loki, Graylog)
  - Simple web service or API

- "How do you access metrics?"
  - Monitoring platform (Dynatrace, Prometheus, Grafana, New Relic)
  - Cloud provider metrics (CloudWatch, Azure Monitor, GCP Monitoring)
  - Custom dashboards or APIs

- "How do you access traces/spans?" (if applicable)
  - Distributed tracing (Dynatrace, Jaeger, Zipkin, OpenTelemetry)

- "Are there CLI tools, APIs, or dashboards you use?"

Capture the actual commands, URLs, or scripts needed to fetch data.

### 3. What Should We Look For?

Understand what patterns indicate problems:

- "What errors or log patterns indicate real problems?"
- "What metrics thresholds are concerning?"
  - Response time > X ms
  - Error rate > Y%
  - Resource usage > Z%
- "Are there specific events that indicate issues?"
- "What patterns in traces indicate problems?"

### 4. What Do These Signals Mean?

This is the critical domain knowledge — understanding context:

- "When you see [error X], what does it usually mean?"
- "What's the typical response when [metric Y] exceeds threshold?"
- "Are there errors that look bad but are actually harmless?"
- "What issues wake you up at 2am vs. what can wait until morning?"
- "Are there known flaky components whose errors can be deprioritized?"

This captures the human judgment that's hard to document but essential
for intelligent triage.

### 5. How Are Issues Currently Handled?

Understand existing workflows:

- "How do you currently triage monitoring alerts?"
- "What's your process for creating tickets from monitoring data?"
- "Are there runbooks or documentation for common issues?"

## Document the Configuration

Create `docs/MONITORING.md` capturing everything in natural language.

### Structure

```markdown
# Monitoring Configuration

## Available Data

What monitoring data exists for this project.

### Logs
- Where: [location/service]
- How to query: [commands/API]
- Format: [structured/unstructured, fields available]

### Metrics
- Where: [dashboard/service]
- How to query: [commands/API]
- Key metrics: [list of important ones]

### Traces (if applicable)
- Where: [service]
- How to query: [commands/API]

## What to Look For

### Critical (immediate attention)
- [Pattern] — [What it means and why it's critical]

### Important (should be tracked)
- [Pattern] — [What it means]

### Can Ignore
- [Pattern] — [Why it's safe to ignore]

## Context and Meaning

Domain knowledge for interpreting signals:
- [Signal] typically means [interpretation]
- When [X] happens, check [Y] first
- [Component] is flaky; errors there are lower priority
```

### Keep It Natural

The file is for an AI agent to read. Natural language works better than
rigid schemas. Write it like you're explaining to a new team member.

## Verify and Iterate

After creating the initial file:

1. Test the documented commands to verify they work
2. Ask if anything is missing
3. Note that the file should evolve as gaps are discovered

The first version won't be perfect — encourage updates after real
analysis sessions reveal missing context.
