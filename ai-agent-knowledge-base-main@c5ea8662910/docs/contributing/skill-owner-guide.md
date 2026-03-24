# Skill Owner Guide

What it means to own a skill — your ongoing responsibilities after a skill is registered.

## Who Is a Skill Owner?

Every skill in the [Asset Registry](../registry/assets.yaml) has two owners:

- **`pm-owner`** — Product Manager responsible for the skill's content direction and use case prioritization
- **`pa-owner`** — Platform Architect responsible for technical accuracy and implementation quality

Ownership is not a one-time label. If your name is on a skill, the expectations below apply continuously.

## Core Responsibilities

### 1. Review Content for Correctness

Regularly review the skill's content and verify:

- **Nothing is wrong** — Are the instructions, queries, and examples factually correct?
- **Nothing is misleading** — Does the content lead the model toward the right approach, or does it send agents down wrong paths?
- **Nothing is outdated** — Has the Dynatrace platform changed since this was written? Are deprecated APIs or features still referenced?
- **Nothing contradicts public documentation** — The skill should complement Dynatrace docs, not restate or contradict them.

### 2. Guard Model Context Efficiency

Skills consume model context when loaded. Every line must earn its place.

**Rule of thumb:** If your `SKILL.md` is longer than ~200 lines, audit it. A skill that loads thousands of tokens but only covers one or two use cases is almost certainly bloated. Compare your skill's size against how many distinct use cases it serves — if the ratio feels off, it probably is.

- **Remove content the model already knows** — Modern LLMs are trained on public documentation. Don't restate what's already in the model's training data. Focus on what the model gets wrong or doesn't know.
- **Cut "don't do this" content that has no "do this instead"** — Listing anti-patterns without alternatives wastes context and can even prime the model toward the bad pattern. If you include a "don't", always pair it with the correct approach.
- **Right-size the detail level** — Newer, more capable models need less hand-holding. Content that was necessary for earlier models may now be noise. Re-evaluate whether step-by-step instructions are still needed or if a concise reference suffices.
- **Move detailed content to references** — Keep `SKILL.md` focused and concise. Push deep-dive content into `references/` files that get loaded only when needed.

### 3. Evaluate and Improve Use Cases

Each skill defines use cases — the scenarios it helps an AI agent handle. As owner, you are responsible for their quality:

- **Are existing use cases well-implemented?** — Test them. Use `kb-run run` to launch an evaluation environment, ask the questions a user would ask, and evaluate the output. If the agent produces mediocre answers, the use case content needs improvement. See the [validation guide](validation-guide.md) for the full workflow.
- **Are use cases still relevant?** — Platform changes may make some use cases obsolete or shift what users actually need help with.
- **Are there missing use cases?** — Think about what users in your domain actually struggle with. If there's a common task that the skill doesn't cover but should, flag it or contribute it.

### 4. Approve or Reject Contributions

When contributors want to extend your skill (see [Scope Your Contribution](scope-your-contribution.md)):

- They must contact you **before** opening a PR
- Evaluate whether the proposed content fits the skill's scope
- Review the PR for technical accuracy and context efficiency
- Reject content that doesn't meet the bar — it's better to have no content than bad content in model context

### 5. Maintain the Asset Registry

Keep your skill's entry in [`docs/registry/assets.yaml`](../registry/assets.yaml) current:

- Update `release-status` when release constraints change
- Keep `test-environment-url` on the channel default unless the skill needs an explicit override
- Update ownership if responsibilities transfer

## When to Act

Ownership is not passive. Revisit your skill:

- **When the platform changes** — New features, deprecated APIs, changed behavior
- **When model capabilities improve** — Content that was necessary may become noise
- **When users report problems** — Bad agent output from your skill is your problem to fix
- **When contributors propose changes** — Review promptly; don't block contributors
- **Periodically** — Even without a trigger, review at least once per quarter

## Summary

| Responsibility | Question to Answer |
|---------------|-------------------|
| Content correctness | Is everything in the skill factually right? |
| Context efficiency | Does every line earn its place in the model's context window? |
| Use case quality | Do the use cases actually help agents produce good output? |
| Contribution gating | Does proposed new content meet the bar? |
| Registry maintenance | Is the asset registry entry current? |

## Next Steps

- [Scope Your Contribution](scope-your-contribution.md) — How contributors coordinate with you
- [Validation Guide](validation-guide.md) — How to validate skill content
- [Asset Registry](../registry/README.md) — Ownership and metadata schema
