# Writing Skills

How to write effective Dynatrace skill content for AI agents.

> **Detailed writing guidance** lives primarily in `skill-creator`. Load `skill-validator` for static/local validation while drafting, and load `dt-dev-skill-creator` when you need Dynatrace-specific runtime validation against a real tenant. This document covers the essentials.

## Naming Convention

**All Dynatrace skills MUST follow this pattern:** `dt-<domain>-<name>`

### Current Domains

| Domain | Description | Examples |
|--------|-------------|----------|
| `app` | Application monitoring | `dt-app-dashboard`, `dt-app-notebook`, `dt-app-frontend` |
| `infra` | Infrastructure monitoring | `dt-infra-kubernetes`, `dt-infra-hosts`, `dt-infra-aws` |
| `dql` | DQL query language | `dt-dql-essentials` |
| `problem` | Problem analysis | `dt-problem-analysis` |
| `log` | Log monitoring | `dt-log-analysis` |
| `proc` | Process workflows | `dt-proc-critical-incident` |
| `system` | System operations | *(no skills yet)* |
| `prod` | Production operations | `dt-prod-tenant-analysis` *(internal-sfm only)* |
| `dev` | Development tools | `dt-dev-skill-creator` *(internal-dev only)* |

The `prod` and `dev` domains are restricted to internal channels (`dynatrace-internal-sfm/` and `dynatrace-internal-dev/` respectively).

More domains can be added as needed.

### Naming Scope

The `dt-<domain>-<name>` convention applies to **Dynatrace platform skills** — those shipped in the `dynatrace/` channel. Development tools and meta-skills in other channels (`dynatrace-dev/`, `dynatrace-internal-dev/`) may use descriptive names without the `dt-` prefix (e.g., `skill-validator`, `dynatrace-control`, `self-reflection`).

### Examples

- `dt-app-dashboard/` — Dashboard creation and management
- `dt-dql-essentials/` — Core DQL query language
- `dt-proc-critical-incident/` — Critical incident response workflow
- ~~`dashboard-skill/`~~ — Missing `dt-` prefix
- ~~`dt_app_dashboard/`~~ — Wrong separator (use hyphens)
- ~~`dt-application-dashboard/`~~ — Invalid domain (use `app` not `application`)

## Skill Structure

```
dt-<domain>-<name>/
├── SKILL.md              # Required: Main skill definition
├── references/           # Optional: Detailed supporting docs
│   ├── guide-1.md
│   └── guide-2.md
└── templates/            # Optional: Reusable JSON/YAML templates
    ├── dashboard.json
    └── README.md
```

### SKILL.md — The Core File

Every skill needs exactly one `SKILL.md`. This is what the AI agent loads. It must have:

1. **Frontmatter** — `name` and `description` fields (YAML between `---` markers)
2. **Clear structure** — Sections for prerequisites, instructions, examples, references
3. **Actionable content** — Step-by-step instructions the agent can follow
4. **Concrete examples** — Copy-paste ready commands and code

```markdown
---
name: dt-<domain>-<name>
description: "A concise description of what this skill does. This description is what triggers agent pickup — make it specific and keyword-rich."
---

# dt-<domain>-<name>

## Prerequisites
- Required knowledge, tools, access

## Instructions
### Step 1: ...
### Step 2: ...

## Examples
### Example 1: [Concrete use case]

## References
- [Detailed Guide](references/guide.md)
```

### The Description Field Matters

The `description` in frontmatter is critical — it's how AI agents decide whether to load the skill. A vague description means the skill never gets used. Be specific about:

- What platform area it covers
- What tasks it helps with
- What tools/APIs it uses (dtctl, DQL, etc.)

## Best Practices

- **Keep SKILL.md focused** — Move detailed content to `references/`
- **Link, don't duplicate** — Reference other docs instead of copying content
- **Write for agents** — Structure content so an AI can follow it step-by-step
- **Include limitations** — Document what the skill does NOT cover
- **Provide concrete examples** — Real commands, real queries, real output

## Skill Restrictions

### Release Constraints

Currently, only assets (skills and agents) that contain **plain DQL query examples** can be released (`release-status: planned` or `released`). The following are **not allowed** in releasable assets:

- Bash scripts (`.sh` files)
- `dtctl` commands
- CLI tool references (`jq`, `grep`, `sed`, `sort`, `cat`, `curl`, etc.)
- Shell code blocks with tool invocations

**Why?** The current release infrastructure only supports DQL content. A dedicated tool runtime for bash and dtctl is not yet available.

### Future Tool Support

A future version will include a dedicated bash tool set and dtctl integration. Assets that require these tools can be written now but must be marked as `candidate` in the asset registry — they will be released when tool runtime support ships.

### What This Means for Contributors

- **DQL-only skills and agents**: Can go through the full release pipeline. Set `release-status: planned` in the asset registry.
- **Tool-using skills and agents**: Write them, mark `release-status: candidate` in the asset registry. They will be released when the runtime supports it.

See [Asset Registry](../registry/README.md) for details on the `release-status` field.

## Detailed Guidance

For comprehensive writing and validation guidance, load these skills in your AI assistant:

- **`skill-creator`** — Full specification, eval-driven improvement loop, review workflow, description optimization
- **`skill-validator`** — Static/local validation: markdown, links, code blocks, file-size guidance, eval asset structure
- **`dt-dev-skill-creator`** — Dynatrace-specific runtime validation: DQL, dtctl commands, resource lifecycle, validation reports

The [Agent Skills Specification](https://agentskills.io/specification) defines the underlying format.

## Next Steps

- [Dev Environment Setup](dev-environment-setup.md) — Setting up your tools
- [Validation Guide](validation-guide.md) — Testing your skill
- [Pull Request Guide](pull-request-guide.md) — Submitting your work
