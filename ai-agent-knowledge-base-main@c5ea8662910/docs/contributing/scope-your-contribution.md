# Scope Your Contribution

Before writing code or documentation, determine where your contribution fits and coordinate with the right people. **Do this before opening a pull request.**

## New Skill or Existing Skill?

Not every piece of Dynatrace knowledge warrants its own skill. The first question is: does this need a new skill, or should it extend an existing one?

### Check Existing Skills

Browse the skills that already exist:

```
knowledge-base/dynatrace/skills/          # Public production skills
knowledge-base/dynatrace-dev/skills/      # Public dev tools
knowledge-base/dynatrace-internal-dev/skills/  # Internal dev tools
knowledge-base/dynatrace-internal-sfm/skills/  # Internal self-monitoring
```

Look up the [Asset Registry](../registry/assets.yaml) to see all registered skills, their owners, and capabilities.

### Decision Criteria

**Extend an existing skill when:**

- Your content adds to an already-covered domain (e.g., one more DQL pattern belongs in `dt-dql-essentials`)
- An agent would need both the existing and your new content for the same task
- The existing skill's scope naturally includes your topic
- The addition is small — a new section, a few more examples, an extra reference

**Create a new skill when:**

- The content covers a distinct domain area not addressed by any existing skill
- It's large enough to stand on its own (not just a few paragraphs)
- An agent would load it for a clearly different reason than existing skills
- The existing skills' scope would become unfocused by including it

**When in doubt**, check with the skill owner (see below) — they know the intended scope.

## If Extending an Existing Skill

### 1. Identify the Owner

Look up the skill in [`docs/registry/assets.yaml`](../registry/assets.yaml). Every skill has:

- **`pm-owner`** — Product Manager responsible for the skill's content direction
- **`pa-owner`** — Platform Architect responsible for technical accuracy

```yaml
# Example: who owns dt-dql-essentials?
dt-dql-essentials:
  pm-owner: peter.zahrer@dynatrace.com
  pa-owner: herwig.moser@dynatrace.com
  capability: Grail
```

### 2. Sync with the Owner

Before making changes, reach out to the owner(s):

- Explain what you want to add or change
- Confirm it fits the skill's scope
- Agree on the approach

**Do not open a pull request without owner alignment.** PRs that modify existing skills without owner coordination will be rejected.

### 3. Proceed to Writing

Once aligned with the owner, proceed to [Writing Skills](writing-skills.md) and follow the normal workflow.

## If Creating a New Skill

### 1. Confirm It Doesn't Fit Elsewhere

Double-check that no existing skill covers this domain. If there's overlap, discuss with that skill's owner first.

### 2. Register in the Asset Registry

Every new skill in `dynatrace` or `dynatrace-internal-sfm` needs an entry in [`docs/registry/assets.yaml`](../registry/assets.yaml). See the [Asset Registry README](../registry/README.md) for the full schema.

**Add your entry:**

```yaml
assets:
  skills:
    dt-<domain>-<name>:
      channel: dynatrace              # match the knowledge-base/<channel>/ directory
      pm-owner: your.pm@dynatrace.com
      pa-owner: your.pa@dynatrace.com
      capability: Your Team Name
      jira-project: PROJ
      release-status: candidate       # default for newly tracked assets
      test-environment-url: https://umsaywsjuo.dev.apps.dynatracelabs.com
```

**Or use the `dt-dev-skill-creator` skill** (after creating the skill directory):

```
Ask your AI assistant: "Please discover and register new assets in the asset registry"
```

The skill will scan the filesystem, add new entries for tracked channels, and preserve existing data. Fill in ownership fields manually after discovery.

### 3. Pick the Right Channel

Skills live under `knowledge-base/<channel>/skills/`. Choose the right channel:

| Channel | Directory | Purpose |
|---------|-----------|---------|
| `dynatrace` | `knowledge-base/dynatrace/` | Public production skills shipped to customers |
| `dynatrace-dev` | `knowledge-base/dynatrace-dev/` | Public dev tools (not shipped to customers) |
| `dynatrace-internal-dev` | `knowledge-base/dynatrace-internal-dev/` | Internal dev tools, validation scripts |
| `dynatrace-internal-sfm` | `knowledge-base/dynatrace-internal-sfm/` | Internal self-monitoring / operations |

Only `dynatrace` and `dynatrace-internal-sfm` are tracked in the asset registry.

### 4. Proceed to Writing

Once registered, proceed to [Writing Skills](writing-skills.md) and follow the normal workflow.

## Summary

| Scenario | Action | Key Step |
|----------|--------|----------|
| Content fits an existing skill | Extend that skill | Sync with the owner first |
| Content needs a new skill | Create new skill | Register in `assets.yaml`, pick the right channel |
| Unsure | Check with the nearest skill owner | Look up ownership in `assets.yaml` |

**Bottom line**: Clarify scope and ownership before writing. A PR without this alignment will need rework.

## Next Steps

- [Skill Owner Guide](skill-owner-guide.md) — Ongoing responsibilities if you own a skill
- [Dev Environment Setup](dev-environment-setup.md) — Tools and setup
- [Writing Skills](writing-skills.md) — How to write skill content
- [Validation Guide](validation-guide.md) — Testing your skill
- [Pull Request Guide](pull-request-guide.md) — PR requirements
