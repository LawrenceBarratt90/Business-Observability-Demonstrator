# Validation Checklist

Quick reference for skill validation. See reference files for details on each check.

## Markdown

Run validation script:

```bash
python3 scripts/validate-markdown.py -v
# For machine-readable output:
python3 scripts/validate-markdown.py --json
```

Manual checks:

- [ ] All `.md` files are parseable by markdown-it-py
- [ ] Every markdown link checked — all resolve to real files
- [ ] No broken links (zero tolerance)
- [ ] All file links use relative paths (no absolute filesystem paths)
- [ ] No links escape the skill folder boundary
- [ ] Unnecessary cross-skill name references are avoided
- [ ] Companion skills are named explicitly when a workflow handoff would otherwise be ambiguous
- [ ] All reference files are linked from SKILL.md
- [ ] No duplicated content between SKILL.md and reference files

## Code Blocks

- [ ] Must-validate blocks tested with local tools
- [ ] Syntax validation passed:
  - [ ] YAML: `yamllint`
  - [ ] JSON: `jq .`
  - [ ] Python: `python3 -m py_compile`
  - [ ] JavaScript: `node --check`
  - [ ] Bash: `shellcheck`
- [ ] Commands and flags verified against `--help` output

## File Stats

Run file stats script:

```bash
python3 scripts/file-stats.py -v
# For machine-readable output:
python3 scripts/file-stats.py --json
```

- [ ] No file size errors (SKILL.md ≤500 lines/5000 words, reference files ≤1000 lines/10000 words)
- [ ] Warning thresholds are treated as early-warning maintainability guidance (not universal hard policy)
- [ ] Reference files >100 lines have TOC with section links in first 100 lines

## Eval Assets (Local Structure)

Run eval asset validator:

```bash
python3 scripts/validate-evals.py -v
# For machine-readable output:
python3 scripts/validate-evals.py --json
```

- [ ] `evals/evals.json` is structurally valid when present
- [ ] Eval prompts are non-empty and specific enough for reproducible testing
- [ ] Expectation/assertion inputs are present and structurally valid before benchmark grading
- [ ] Trigger-eval sets include `query` + boolean `should_trigger`
- [ ] Trigger-eval sets include both should-trigger and should-not-trigger cases

## Content (Recommendations)

These are advisory checks — record observations but do not treat as errors.

- [ ] Description-content alignment: does the frontmatter `description` match the actual skill content?
- [ ] Logical consistency: do prerequisites, instructions, and examples align without contradictions?
- [ ] Routing model: does SKILL.md route to reference files rather than containing excessive inline detail?
- [ ] All reference files are reachable from SKILL.md
- [ ] Handoff is explicit: use `skill-creator` for eval loop/benchmark review/description optimization
- [ ] Handoff is explicit: use `dt-dev-skill-creator` for live Dynatrace/runtime validation

See [content-validation.md](content-validation.md) for detailed guidance.
