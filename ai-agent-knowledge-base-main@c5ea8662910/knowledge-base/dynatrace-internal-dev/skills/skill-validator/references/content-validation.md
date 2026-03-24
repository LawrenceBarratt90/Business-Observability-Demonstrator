# Content Validation (Recommendations)

Soft quality checks for skill content. Unlike markdown and code validation (which produce errors), these checks produce **recommendations** — observations and suggestions that the user decides whether to act on.

These checks are performed manually during review. They are not automated.

Scope reminder: this guide is for static/local content quality review. It does not replace eval execution, benchmark analysis, or live Dynatrace runtime validation.

## Contents

- [Description-Content Alignment](#description-content-alignment)
- [Logical Consistency](#logical-consistency)
- [Routing Model](#routing-model)
- [Eval-Era Coverage & Assertions](#eval-era-coverage--assertions)
- [Workflow Handoff Clarity](#workflow-handoff-clarity)

## Description-Content Alignment

Check whether the SKILL.md frontmatter `description` field accurately reflects the actual skill content.

### What to Look For

- Does the description promise capabilities the content doesn't deliver?
- Does the content cover topics not mentioned in the description?
- Are keywords in the description (tools, APIs, platform areas) actually present in the skill?
- Would an AI agent loading this skill based on the description get what it expects?

### Example Observations

- **Recommendation**: Description mentions "dashboard creation" but content only covers dashboard analysis. Consider updating the description or adding creation instructions.
- **Recommendation**: Content includes extensive DQL filtering patterns not reflected in the description. Consider adding "DQL filtering" to the description for better agent pickup.

For quantitative trigger performance and iterative description tuning, hand off to `skill-creator` description optimization workflows.

## Logical Consistency

Check whether the content makes sense logically across all files in the skill.

### What to Look For

- Do prerequisites match what the instructions actually require? (e.g., prerequisites list tool X but instructions use tool Y)
- Do examples match the instructions they illustrate?
- Are DQL query patterns consistent across the skill? (e.g., one section uses `fetch logs` while another uses a different entity for the same use case)
- Do step-by-step instructions follow a logical order?
- Are there contradictions between SKILL.md and reference files?

### Example Observations

- **Recommendation**: Prerequisites mention "dtctl installed" but no dtctl commands appear in the skill. Consider removing from prerequisites.
- **Recommendation**: Section A recommends filtering by `status == "ERROR"` but Section B uses `loglevel == "ERROR"` for the same concept. Consider standardizing.

## Routing Model

Check whether SKILL.md properly acts as a routing hub that forwards to reference files for details.

### What to Look For

- Is SKILL.md concise and focused on routing, or does it contain too much inline detail?
- Are all reference files linked from SKILL.md?
- Are there reference files that exist but aren't reachable from SKILL.md?
- Does SKILL.md duplicate content that belongs in reference files?
- Is the routing clear — can an agent quickly find the right reference file for a given task?

### Example Observations

- **Recommendation**: SKILL.md contains 150 lines of DQL examples that could be moved to a dedicated reference file. Consider extracting to `references/dql-patterns.md`.
- **Recommendation**: Reference file `references/advanced-queries.md` exists but is not linked from SKILL.md. Consider adding a link in the References section.
- **Suggestion**: SKILL.md duplicates the "Common Errors" table from `references/troubleshooting.md`. Consider removing the duplicate and linking instead.

## Eval-Era Coverage & Assertions

Check whether the skill content supports modern eval workflows without duplicating `skill-creator` execution mechanics.

### What to Look For

- Do eval prompts appear realistic, specific, and tied to concrete task outcomes (not overly generic one-liners)?
- Do assertion inputs (e.g., expectations/assertions in `evals/evals.json`) test meaningful outcomes rather than trivial keyword matches?
- Are there obvious gaps in coverage across main use cases and near-miss cases?
- If trigger-eval sets exist, do they include both should-trigger and should-not-trigger examples?
- Are local structural checks in place (`scripts/validate-evals.py`) before running benchmark loops?

### Example Observations

- **Recommendation**: Several eval prompts are too generic ("do the task"). Add concrete context and expected artifacts so runs are reproducible.
- **Recommendation**: Assertions only check keyword presence; add outcome-level checks that are harder to satisfy accidentally.
- **Recommendation**: Trigger-eval inputs include only should-trigger cases. Add near-miss should-not-trigger queries before description optimization.

Run-time grading quality, benchmark interpretation, and assertion refinement loops belong to `skill-creator`.

## Workflow Handoff Clarity

Check that the skill documentation clearly hands off to specialized workflows at the right boundary.

### What to Look For

- Does SKILL.md clearly state that this layer is static/local validation only?
- Is there an explicit handoff to `skill-creator` for eval-driven iteration, benchmark review, and description optimization?
- Is there an explicit handoff to `dt-dev-skill-creator` for live Dynatrace/runtime validation?
- Does the wording avoid claiming that this skill performs live tenant validation or human-readable report generation?

### Example Observations

- **Recommendation**: Add a dedicated integration section mapping static checks here vs eval loop in `skill-creator`.
- **Recommendation**: Scope statement implies full validation ownership. Narrow wording to static/local checks and point to downstream skills.
