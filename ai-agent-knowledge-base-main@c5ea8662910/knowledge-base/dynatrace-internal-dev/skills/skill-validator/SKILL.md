---
name: skill-validator
description: "Static/local validation for skill assets. Use when checking markdown parseability, link integrity, code block syntax, file-size guidance, and local eval asset structure before benchmark or live-runtime validation."
---

# Skill Validator

Local-first validation foundation for skill repositories.

## Overview

This skill provides **static and local validation** for any skill:

- **Markdown validation** — Parseability, link integrity
- **Code block validation** — Syntax checks for embedded code (YAML, JSON, Python, JavaScript, Bash)
- **File stats validation** — Maintainability-oriented size thresholds and TOC checks
- **Eval asset validation** — Local checks for `evals/evals.json` and trigger-eval input sets

All checks run locally and operate on repository content only. This skill does **not** run live tenant tests, benchmark loops, or human-readable validation report generation.

## Integration & Handoff

Use this skill as the static/local layer, then hand off to specialized workflows:

- **Handoff to `skill-creator`** for eval-driven iteration:
  - Running eval loops and benchmark review
  - Improving assertion quality through iterative grading
  - Description trigger optimization (`run_eval.py` / `run_loop.py` flows)
- **Handoff to `dt-dev-skill-creator`** for live Dynatrace/runtime validation:
  - Tenant-backed DQL and API checks
  - Resource lifecycle testing (create/test/delete)
  - Runtime behavior validation in real Dynatrace environments

This separation keeps `skill-validator` focused on deterministic local checks while downstream skills handle dynamic execution quality.

## Prerequisites

Required tools for validation:

| Tool | Purpose | Install |
|------|---------|---------|
| python3 | Markdown validation script | Usually pre-installed |
| markdown-it-py | Markdown parsing library | `pip install markdown-it-py` |
| yamllint | YAML syntax validation | [GitHub](https://github.com/adrienverge/yamllint) |
| jq | JSON syntax validation | [GitHub](https://github.com/jqlang/jq) |
| shellcheck | Shell script linting | [GitHub](https://github.com/koalaman/shellcheck) |

Python and Node.js use built-in tools (`python3 -m py_compile`, `node --check`).

See [troubleshooting.md](references/troubleshooting.md) for installation help.

## Validation Workflow

### Step 1: Validate Markdown

Run the validation script from the skill root:

```bash
python3 scripts/validate-markdown.py
```

For verbose output showing details:

```bash
python3 scripts/validate-markdown.py -v
```

To validate a specific file:

```bash
python3 scripts/validate-markdown.py -f path/to/file.md
```

The script validates:
- **Parseability** — Markdown can be parsed without errors
- **Link integrity** — All `[text](path)` links resolve to real files
- **Code blocks** — All code blocks are properly closed

See [markdown-validation.md](references/markdown-validation.md) for validation rules and what matters for AI agents.

### Step 2: Validate Code Block Syntax

For each code block, run the appropriate local validator:

```bash
# YAML
yamllint file.yaml

# JSON
jq . file.json

# Python
python3 -m py_compile script.py

# JavaScript
node --check script.js

# Bash
shellcheck script.sh
```

See [code-validation.md](references/code-validation.md) for:

- When validation is required vs optional
- Language-specific validation steps
- Common syntax errors and fixes

### Step 3: Validate File Stats

Run the file-stats script from the skill root:

```bash
python3 scripts/file-stats.py
```

For verbose output showing every file:

```bash
python3 scripts/file-stats.py -v
```

The script validates:
- **File sizes** — Line count and word count against per-category thresholds
- **SKILL.md guidance** — Warning >200 lines / >2500 words, error >500 lines / >5000 words
- **Reference file guidance** — Warning >300 lines / >5000 words, error >1000 lines / >10000 words
- **TOC check** — Reference files >100 lines must have section links in first 100 lines

Thresholds are **early-warning maintainability guidance** for local quality control. Error thresholds fail this local validator, but they are not a universal cross-repo policy.

### Step 4: Validate Eval Assets (Local Structure)

Run lightweight eval-asset validation from the skill root:

```bash
python3 scripts/validate-evals.py
```

To validate one specific eval asset:

```bash
python3 scripts/validate-evals.py -f path/to/evals-or-trigger-set.json
```

The script validates:
- **`evals/evals.json` structure** — required fields such as `evals[].id` and `evals[].prompt`, plus expectations/assertions shape when present
- **Assertion inputs** — expectation/assertion entries are structurally usable for later grading workflows
- **Trigger eval sets** — array entries with `query` + `should_trigger` boolean

This is structural validation only. For running evals, grading outcomes, benchmark analysis, and trigger optimization, hand off to `skill-creator`.

### Step 5: Content Validation (Recommendations)

Review the skill content for logical quality. Unlike previous steps, this produces **recommendations**, not pass/fail results.

Use the content validation guide for what to check:

- **Description-content alignment** — Does the description match what the skill actually covers?
- **Logical consistency** — Do prerequisites, instructions, and examples align?
- **Routing model** — Does SKILL.md route properly to reference files?

See [content-validation.md](references/content-validation.md) for detailed guidance and example observations.

Results from this step are advisory. Record observations for reviewer context, but do not treat them as blocking static-validation errors.

## Machine-Readable Output

Local scripts support JSON output for assertion/automation pipelines:

```bash
python3 scripts/validate-markdown.py --json
python3 scripts/file-stats.py --json
python3 scripts/validate-evals.py --json
```

These outputs are intended as structured evidence for tooling and grading pipelines. They are **not** human narrative reports.

## Scope

**This skill covers:**

- ✅ Markdown parseability (can be read by markdown parsers)
- ✅ Link integrity (all links resolve)
- ✅ Code block syntax validation (local tools)
- ✅ Frontmatter validation (YAML structure)
- ✅ File size validation (line count, word count early-warning thresholds)
- ✅ Local eval asset structure checks (eval prompts, assertion inputs, trigger-eval inputs)
- ✅ Content quality recommendations (description alignment, logical consistency, routing model)
- ✅ Machine-readable local validation evidence (`--json` in scripts)

**This skill does NOT cover:**

- ❌ Markdown formatting/style rules (trailing spaces, line length, etc.)
- ❌ Heading hierarchy enforcement
- ❌ Remote system connections
- ❌ Live resource testing (APIs, databases, cloud services)
- ❌ Eval execution loops, benchmark result interpretation, or description optimization execution
- ❌ Human-readable validation report generation
- ❌ Resource lifecycle testing (create/test/delete)

Use `skill-creator` for eval-driven iteration/benchmark/description optimization, and `dt-dev-skill-creator` for live Dynatrace runtime validation.

## References

- [Markdown Validation](references/markdown-validation.md) — What matters for AI agents
- [Code Validation](references/code-validation.md) — Syntax validation for code blocks
- [Checklist](references/checklist.md) — Quick validation checklist
- [Troubleshooting](references/troubleshooting.md) — Tool installation help
- [Content Validation](references/content-validation.md) — Recommendations for content quality

## Scripts

- [validate-markdown.py](scripts/validate-markdown.py) — Markdown validation script using markdown-it-py
- [file-stats.py](scripts/file-stats.py) — File size and metrics validation script
- [validate-evals.py](scripts/validate-evals.py) — Local eval-asset validation for `evals.json` and trigger-eval sets
