# Contributing Guide

Thank you for contributing to the AI Agent Knowledge Base! This repository hosts **Dynatrace documentation structured as AI agent skills** — modular knowledge units that AI assistants load on demand.

> **Important**: This is a documentation repository. You're creating documentation skills, not software features. There are no automated tests — all validation is manual against real Dynatrace tenants.

## What You'll Contribute

- **Skills** — Modular knowledge units (e.g., `dt-app-dashboard`, `dt-dql-essentials`)
- **Commands** — Slash commands for specific workflows
- **Agents** — AI agent definitions for specialized use cases

## From Development to Product

Understanding the full journey of a skill helps explain why the process is structured the way it is:

```
You (contributor)                          DI team (Data Intelligence)
─────────────────                          ────────────────────────────
1. Develop locally with dtctl              
2. Validate with local tools & agent       
   harness (skill-creator, etc.)           
3. Submit PR, owner reviews & approves     
                                      ──►  4. DI capability picks up the skill
                                           5. Installs via agentic agent
                                           6. Skill is available in the product
```

**Your responsibility** is steps 1–3: develop, validate, and get the skill merged. Once the skill owner (PM/PA) approves and it's merged, the **Data Intelligence capability team** handles production deployment — they install skills into the product using their own agentic tooling.

This separation is why **skills must not include release or deployment tooling**. Skills are pure knowledge — the release process is owned by DI and happens outside this repository.

## Contributing Workflow

| Step | Guide | What You'll Do |
|------|-------|----------------|
| 1. **Set Up** | [Dev Environment Setup](docs/contributing/dev-environment-setup.md) | Install tools, load AI skills |
| 2. **Scope** | [Scope Your Contribution](docs/contributing/scope-your-contribution.md) | Determine if this is a new skill or extends an existing one, sync with owners |
| | [Skill Owner Guide](docs/contributing/skill-owner-guide.md) | If you own a skill — your ongoing responsibilities |
| 3. **Write** | [Writing Skills](docs/contributing/writing-skills.md) | Create your SKILL.md following naming conventions and structure standards |
| 4. **Validate** | [Validation Guide](docs/contributing/validation-guide.md) | Test against a real Dynatrace tenant, generate a validation report |
| 5. **Submit** | [Pull Request Guide](docs/contributing/pull-request-guide.md) | Open a PR with test instructions and attached validation report |

## Quick Reference

- **Naming**: All Dynatrace skills follow `dt-<domain>-<name>` — see [Writing Skills](docs/contributing/writing-skills.md) for valid domains
- **Quality standards**: Defined by `skill-creator`, `skill-validator`, and `dt-dev-skill-creator` skills — load them in your AI assistant
- **Scoping**: Decide new skill vs. extending existing — see [Scope Your Contribution](docs/contributing/scope-your-contribution.md)
- **Asset registry**: Every skill needs an entry in [`docs/registry/assets.yaml`](docs/registry/assets.yaml)
- **Validation reports**: Go in `dt-skill-validation/` at repo root (never inside skill directories)

## Additional Resources

- [Knowledge Base Overview](docs/kb-overview.md) — Architecture and project structure
- [Coding Guide](docs/CODING.md) — Build commands and project conventions
- [Asset Registry](docs/registry/README.md) — Ownership and metadata schema
- [Agent Skills Specification](https://agentskills.io/specification) — Underlying skill format
