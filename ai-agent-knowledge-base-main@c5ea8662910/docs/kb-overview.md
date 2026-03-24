# Dynatrace Skills Knowledge Base Structure

## Overview

The `knowledge-base` directory contains a structured repository of **skills** for Dynatrace AI agents. Skills are reusable knowledge modules that provide AI agents with specific capabilities, instructions, and reference materials. This repository focuses on **skill hosting and validation**, not functional testing.

## Repository Purpose

This repository is designed for:

1. **Skill Hosting** - Centralized storage of reusable AI agent skills
2. **Skill Validation** - Manual validation processes to ensure skill quality
3. **Skill Documentation** - Comprehensive documentation for each skill
4. **Integration Support** - Making skills consumable by AI tools (aimgr, Claude Code, GitHub Copilot)

## Repository Scope

### What This Repository DOES
✅ Host Dynatrace skills following the `dt-<domain>-<name>` naming convention  
✅ Provide skill validation guidance via `skill-creator` and `dt-dev-skill-creator` skills  
✅ Document skills with clear instructions, examples, and references  
✅ Support skill discovery and installation via tools like aimgr  
✅ Organize content by distribution channel and audience  

### What This Repository DOES NOT DO
❌ Run automated functional tests against Dynatrace environments  
❌ Provide runtime agent servers or infrastructure  
❌ Act as a product (skills are consumed by products)  
❌ Execute tests or evaluations automatically  

## Directory Structure

```
knowledge-base/
├── dynatrace/                 # Public Dynatrace content (shipped by Dynatrace server)
│   ├── skills/                # Production skills for end users
│   ├── commands/              # Slash commands (dt/<domain>/<name>.md)
│   ├── agents/                # Agent definitions
│   └── packages/              # Skill packages/bundles
│
├── dynatrace-dev/             # Public development content (NOT shipped by server)
│   └── skills/                # Development tools and workflows
│       ├── dynatrace-control/ # dtctl CLI skill
│       └── ...
│
├── dynatrace-internal-dev/    # Internal development content (NOT public)
│   └── skills/                # Internal dev tools and platform services
│       ├── dt-dev-skill-creator/  # Skill validation for dt- skills
│       └── ...
│
├── dynatrace-internal-sfm/    # Self-monitoring content (internal only)
│   ├── skills/                # Self-monitoring and operations skills
│   └── packages/              # SFM-specific packages
│
└── system-prompt/             # System-level prompts and configurations
```

## Content Distribution Strategy

### dynatrace/ - Public Production Content
**Audience**: All Dynatrace customers and users  
**Distribution**: Shipped via Dynatrace server  
**Content Type**: Production-ready skills, commands, agents  

**Examples:**
- `dt-app-dashboard` - Dashboard creation and management
- `dt-dql-essentials` - Core DQL query language
- `dt-infra-kubernetes` - Kubernetes monitoring

**Quality Bar:**
- Fully validated and tested
- Production-ready documentation
- Comprehensive examples and references
- Versioned and maintained

### dynatrace-dev/ - Public Development Content
**Audience**: Developers working with Dynatrace (internal + external)  
**Distribution**: Public repository, NOT shipped by server  
**Content Type**: Development tools, workflows, integrations  

**Examples:**
- `dynatrace-control` - dtctl CLI skill for managing Dynatrace resources
- Development workflows and patterns
- Integration guides

**Quality Bar:**
- Validated for development use
- May require additional setup
- Documentation for developers
- Subject to more frequent changes

### dynatrace-internal-dev/ - Internal Development Content
**Audience**: Dynatrace platform engineers and internal developers  
**Distribution**: Internal only, NOT public  
**Content Type**: Platform services, internal tools, validation frameworks  

**Examples:**
- `dt-dev-skill-creator` - Validation for dt- skills (uses dtctl)
- Platform service integration skills
- Internal development workflows
- Engineering tooling

**Quality Bar:**
- Internal validation standards
- May reference internal systems
- Documentation for internal teams
- Access-controlled

### dynatrace-internal-sfm/ - Self-Monitoring Content
**Audience**: Dynatrace SRE and operations teams  
**Distribution**: Internal only  
**Content Type**: Self-monitoring, operations, incident response  

**Examples:**
- `dt-prod-tenant-analysis` - Production tenant health analysis
- Operations playbooks
- Incident response workflows
- Performance monitoring

**Quality Bar:**
- Operations-focused
- Real-time monitoring capabilities
- Incident response ready
- High reliability requirements

## Skill Naming Convention

**Pattern**: `dt-<domain>-<name>`

All Dynatrace skills MUST follow this naming pattern to ensure:
- **Discoverability**: Easy to find all Dynatrace skills using glob patterns
- **Organization**: Logical grouping by domain
- **Consistency**: Predictable naming reduces confusion
- **Tooling**: Enables automated validation and packaging

> **Scope**: This convention applies to Dynatrace platform skills in the `dynatrace/` channel. Development tools and meta-skills in other channels may use descriptive names without the `dt-` prefix (e.g., `skill-validator`, `dynatrace-control`).

See [Writing Skills](contributing/writing-skills.md#naming-convention) for the complete domain list and examples.

## Skill Structure

Each skill is a directory containing a `SKILL.md` core file, and optional `references/` and `templates/` subdirectories.

See [Writing Skills](contributing/writing-skills.md#skill-structure) for the required structure, and [Writing Skills — SKILL.md](contributing/writing-skills.md#skillmd--the-core-file) for SKILL.md requirements and examples.

## Commands and Agents

### Commands Directory

> **Note**: The commands format is defined but no commands have been published yet. The specification below describes the intended structure for future contributions.

Slash commands that users can invoke directly:

**Pattern**: `dt/<domain>/<name>.md`

**Location**: `knowledge-base/dynatrace/commands/`

**Examples**:
- `dt/critical-incident/initial-assessment.md`
- `dt/critical-incident/component-health-check.md`

**Characteristics:**
- Predefined prompts or workflows
- Directly executable by users
- Domain-organized

### Agents Directory

Agent definitions that configure AI agent behavior:

**Pattern**: `dt-<domain>-<name>.md`

**Location**: `knowledge-base/dynatrace/agents/`

**Examples**:
- `dt-dt-main-agent.md` (dynatrace channel)
- `dt-sfm-critical-incident-agent.md` (dynatrace-internal-sfm channel)
- `dt-dev-kb-tester-agent.md` (dynatrace-internal-dev channel)

**Characteristics:**
- Define agent personality and goals
- Reference skills and commands
- Specify available tools and resources

## Design Principles

### 1. Skill-Centric Architecture

Skills are the fundamental unit of knowledge:
- Self-contained and focused
- Loadable independently
- Composable for complex capabilities

### 2. Distribution-Aware Organization

Content is organized by distribution channel:
- **Public + Shipped** (`dynatrace/`) - Highest quality bar, versioned
- **Public + Not Shipped** (`dynatrace-dev/`) - Development focused
- **Internal** (`dynatrace-internal-dev/`, `dynatrace-internal-sfm/`) - Access controlled

### 3. Naming Consistency

The `dt-<domain>-<name>` convention ensures:
- Easy discovery and search
- Logical organization
- Tool integration support
- Clear ownership (Dynatrace)

### 4. Modularity and Reusability

Skills promote reuse:
- One skill, multiple agents can use it
- References avoid content duplication
- Templates provide starting points
- Clear separation of concerns

### 5. Validation Over Testing

Focus on skill quality validation:
- Manual validation using skill-creator and dt-dev-skill-creator
- No automated functional testing
- Quality checks for documentation and structure
- Command and query syntax validation

### 6. Documentation Quality

High-quality documentation is essential:
- Clear, step-by-step instructions
- Concrete examples
- Accurate references
- Documented limitations

## Asset Ownership & Metadata

Selected assets in the knowledge base have ownership and metadata tracked in a central registry.

**Registry location**: [`docs/registry/assets.yaml`](registry/assets.yaml)  
**Schema documentation**: [`docs/registry/README.md`](registry/README.md)

### Tracked Fields

| Field | Description |
|-------|-------------|
| `channel` | Distribution channel for tracked assets |
| `pm-owner` | Product Manager owner (email) |
| `pa-owner` | Platform Architect owner (email) |
| `capability` | Organizational unit / department |
| `release-status` | Release state: candidate → planned → released |
| `test-environment-url` | Full URL to test environment |

The registry currently tracks assets from `dynatrace` and `dynatrace-internal-sfm`.

### Tooling

Two scripts manage the registry (located in `dt-dev-skill-creator/scripts/`):

- **`generate_asset_registry.py`** — Auto-discovers assets and generates/updates the registry
- **`validate_asset_registry.py`** — Validates the registry for correctness

New assets should be added to the registry as part of the contribution process. Run the generate script to auto-discover new assets, or add entries manually.

## Skill Lifecycle

### 1. Creation

Create the skill following the `dt-<domain>-<name>` convention in the appropriate distribution directory, then register it in `docs/registry/assets.yaml`. See [Writing Skills](contributing/writing-skills.md) for naming rules, required structure, and best practices.

### 2. Validation

Validate manually using `skill-creator` and `dt-dev-skill-creator`. See the [Validation Guide](contributing/validation-guide.md) for the complete validation workflow.

### 3. Testing

Install the skill in an AI assistant and verify that outcomes match the documentation. Document any issues or improvements found.

### 4. Contribution

Contribute via pull request, including validation results and clear commit messages. See the [Pull Request Guide](contributing/pull-request-guide.md) for requirements and the review checklist.

### 5. Maintenance

Update skills for platform changes, fix reported issues, and revalidate after changes. See [Writing Skills — Best Practices](contributing/writing-skills.md#best-practices) for maintenance guidance.

### 6. Production Deployment

Once a skill is merged and the owner approves, the **Data Intelligence (DI) capability team** picks it up and installs it into the product using their agentic tooling. Contributors do not handle deployment — skills are pure knowledge, and the release process is owned by DI. See the [Contributing Guide](../CONTRIBUTING.md#from-development-to-product) for the full picture.

## Integration with AI Tools

Skills can be discovered and installed via **aimgr** (AI Resource Manager) or manually copied into AI assistant configurations. See the [README](../README.md) for aimgr usage and tool integration details.

## Content Migration and Organization

When organizing or migrating skills:

1. **Identify Audience**: Who uses this skill?
   - All users → `dynatrace/`
   - Developers → `dynatrace-dev/`
   - Internal dev → `dynatrace-internal-dev/`
   - Operations → `dynatrace-internal-sfm/`

2. **Verify Dependencies**: Does the skill depend on:
   - Internal systems? → Internal directory
   - Development tools? → Dev directory
   - Production APIs only? → Public directory

3. **Check Distribution**: Should it be:
   - Shipped by server? → `dynatrace/`
   - Available publicly but not shipped? → `dynatrace-dev/`
   - Internal only? → `dynatrace-internal-*`

4. **Update References**: After moving skills:
   - Update cross-references
   - Update package definitions
   - Update agent configurations
   - Test skill loading

## Resources

- [Contributing Guide](../CONTRIBUTING.md) - How to create and contribute skills
- [Writing Skills](contributing/writing-skills.md) - Naming, structure, and best practices
- [Validation Guide](contributing/validation-guide.md) - How to validate skills
- [Pull Request Guide](contributing/pull-request-guide.md) - PR requirements and review checklist
- [Agents Instructions](../AGENTS.md) - AI assistant instructions for working with this repository
- [Example Skills](../knowledge-base/dynatrace/skills/) - Browse existing skills for patterns
