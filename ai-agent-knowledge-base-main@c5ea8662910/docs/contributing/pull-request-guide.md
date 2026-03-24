# Pull Request Guide

What your pull request must contain so that both humans and AI agents can review it effectively.

## Goal

A PR for a skill change should be **self-contained for review**. An agent (or human) reading the PR should understand what changed, why, and how to verify it — without needing to ask follow-up questions.

## Required PR Content

### 1. What and Why

Clearly describe:

- **What skill** was created or changed
- **Why** — What problem does this solve? What use case does it address?
- **What changed** — For updates to existing skills: what specifically was added, removed, or modified?

### 2. How to Test

Provide concrete testing instructions:

- **Key use cases** — The 3-5 scenarios this skill addresses (same ones from [validation](validation-guide.md#step-1-define-key-use-cases))
- **Required tenant** — Which Dynatrace tenant to test against (or "any tenant with X capabilities")
- **Test steps** — How a reviewer can verify the skill works:
  1. Load the skill in an AI assistant
  2. Ask specific questions / perform specific tasks
  3. Expected outcomes

### 3. Validation Report

**Every PR must include a `dt-dev-skill-creator` validation report.** This is non-negotiable.

The report should be:

- Generated using the `dt-dev-skill-creator` skill (see [Validation Guide](validation-guide.md#step-5-generate-and-review-the-validation-report))
- Located in `dt-skill-validation/` at the repo root
- Included in the PR as a committed file

The report must show:

- Structural validation results (markdown, links, code blocks)
- DQL query test results (if applicable)
- dtctl command test results (if applicable)
- Resource lifecycle test results (if applicable)

### 4. Asset Registry

If this is a **new skill**, the PR must also include:

- An entry in `docs/registry/assets.yaml` with ownership and metadata filled in
- The correct `channel` matching the skill's directory location

## PR Template

Use this structure in your PR description:

```markdown
## Summary

- **Skill**: dt-<domain>-<name>
- **Type**: New skill / Update / Bug fix
- **Why**: [Brief explanation of the motivation]

## Changes

- [List of specific changes made]

## How to Test

1. Load `dt-<domain>-<name>` in your AI assistant
2. Ask: "[specific question matching a key use case]"
3. Expected: [what should happen]

Repeat for each key use case.

**Required tenant**: [tenant ID or requirements]

## Validation

- [ ] Structural validation passing (skill-validator)
- [ ] DQL queries tested against live tenant
- [ ] dtctl commands verified
- [ ] Validation report attached in `dt-skill-validation/`
- [ ] Asset registry entry exists in `docs/registry/assets.yaml`

## Validation Report

See `dt-skill-validation/<skill-name>/<timestamp>/VALIDATION-REPORT.md`
```

## What Reviewers Check

When reviewing a skill PR, reviewers (human or agent) verify:

1. **Validation report exists and is complete** — Not just present, but actually reviewed
2. **Description quality** — Will agents pick up this skill when they should?
3. **Use cases are covered** — Do the test scenarios match what users would actually ask?
4. **No broken references** — All links, commands, and queries are valid
5. **Naming and structure** — Follows `dt-<domain>-<name>` convention
6. **Asset registry** — Entry exists with correct metadata

## Next Steps

- [Validation Guide](validation-guide.md) — How to generate the validation report
- [Writing Skills](writing-skills.md) — Skill content guidelines
- [Dev Environment Setup](dev-environment-setup.md) — Tool installation
