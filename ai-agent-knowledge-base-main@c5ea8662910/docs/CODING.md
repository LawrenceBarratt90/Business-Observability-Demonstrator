# Coding

This is a documentation repository. The primary "code" is Markdown skills, not software.

## Project Structure

```
knowledge-base/
  dynatrace/                  # Public production skills (shipped to customers)
  dynatrace-dev/              # Public dev tools (not shipped)
  dynatrace-internal-dev/     # Internal dev tools, validation scripts
  dynatrace-internal-sfm/     # Internal self-monitoring / operations
  system-prompt/              # System-level prompts
devtools/
  kb-run/                     # CLI for building agent packages (TypeScript ESM)
  mcp-server/                 # MCP server for DQL knowledge base (TypeScript ESM)
docs/                         # Project-level documentation
```

## Skill Development

Skill writing conventions (naming, structure, frontmatter, validation) are **defined by the loaded skills**, not by this file. Do not duplicate them here.

For Dynatrace skill work in this repository, use these three skills together with a clear ownership split:

1. **`skill-creator`** -- draft or improve the skill, run evals, compare iterations, review outputs, and optimize the trigger description
2. **`skill-validator`** -- run static/local validation such as markdown parseability, links, code-block syntax, file-size guidance, and eval-asset structure
3. **`dt-dev-skill-creator`** -- run live Dynatrace validation such as tenant-backed DQL checks, dtctl verification, resource lifecycle testing, and runtime validation reporting

Typical order for a substantial Dynatrace skill change:

1. Use `skill-creator` to define and iterate on representative evals
2. Use `skill-validator` to catch local/static issues before runtime testing
3. Use `dt-dev-skill-creator` to validate the skill against a real tenant and record runtime evidence
4. Feed runtime findings back into the next `skill-creator` iteration if needed

These are auto-loaded in this repo via `ai.package.yaml`. The skills contain the detailed naming rules, SKILL.md structure requirements, frontmatter constraints, and validation commands.

### Contributing & Validation

- [Contributing Guide](../CONTRIBUTING.md) -- Full contribution workflow overview
- [Dev Environment Setup](contributing/dev-environment-setup.md) -- Tools and setup
- [Scope Your Contribution](contributing/scope-your-contribution.md) -- New skill vs. extending existing, owner coordination
- [Skill Owner Guide](contributing/skill-owner-guide.md) -- Ongoing responsibilities for skill owners
- [Writing Skills](contributing/writing-skills.md) -- Naming conventions, structure, best practices
- [Validation Guide](contributing/validation-guide.md) -- Testing against live tenants, generating reports
- [Pull Request Guide](contributing/pull-request-guide.md) -- PR requirements and review checklist

## Devtools

When editing TypeScript code under `devtools/`, read the CODING.md in that subproject:

- `devtools/kb-run/docs/CODING.md` -- build, test, and code style for the kb-run CLI
- `devtools/mcp-server/docs/CODING.md` -- build, test, and code style for the MCP server
