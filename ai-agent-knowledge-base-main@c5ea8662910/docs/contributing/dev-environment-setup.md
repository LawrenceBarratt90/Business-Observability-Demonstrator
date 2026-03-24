# Dev Environment Setup

How to set up your environment for creating and validating Dynatrace skills.

## Two Ways to Create Skills

### Option A: Write by Hand

Skills are Markdown files following the [Agent Skills Specification](https://agentskills.io/specification). You can write them entirely by hand using any text editor. All you need is:

- A `SKILL.md` file with the correct frontmatter and structure
- Optionally, a `references/` directory for supporting docs and a `templates/` directory for reusable JSON/YAML

This is a valid approach for simple skills or if you prefer full manual control. Refer to the specification for the required format.

### Option B: Use AI Skills + LLM (Recommended)

The recommended workflow uses three AI skills loaded in your LLM-powered editor (GitHub Copilot, Claude Code, OpenCode, or similar):

1. **`skill-creator`** — Owns drafting, eval creation, iteration, benchmark/review comparison, and description optimization
2. **`skill-validator`** — Owns static/local validation (markdown, links, code blocks, file-size guidance, eval-asset structure)
3. **`dt-dev-skill-creator`** — Owns Dynatrace runtime validation (tenant-backed DQL checks, dtctl commands, resource lifecycle testing, validation reports)

With these skills loaded, your AI assistant can move through the full workflow without mixing responsibilities between them.

**Recommended phase order:**

1. Draft or revise the skill with `skill-creator`
2. Iterate on representative evals and review outputs with `skill-creator`
3. Run static/local checks with `skill-validator`
4. Run live Dynatrace validation with `dt-dev-skill-creator`
5. Feed runtime findings back into the next `skill-creator` iteration if needed

> These skills are auto-loaded in this repo via `ai.package.yaml`. Verify they are active in your session before starting.

**Additional tools you may need:**

| Tool | Purpose | Required? |
|------|---------|-----------|
| `dtctl` | Dynatrace CLI for tenant operations | For validation against a live tenant |
| `mdformat` | Markdown formatting (`pip install mdformat mdformat-gfm mdformat-frontmatter`) | For formatting checks |
| Node.js 20+ | Running devtools (kb-run, MCP server) | Only if working on devtools |

## Next Steps

- [Scope Your Contribution](scope-your-contribution.md) — Determine new skill vs. extending an existing one, sync with owners
- [Writing Skills](writing-skills.md) — How to write effective skill content
- [Validation Guide](validation-guide.md) — Testing your skill against a live tenant
- [Pull Request Guide](pull-request-guide.md) — What your PR must contain
