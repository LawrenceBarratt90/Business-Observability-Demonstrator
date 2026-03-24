# Asset Ownership & Metadata Registry

The asset registry (`docs/registry/assets.yaml`) tracks ownership and release metadata for the subset of assets we actively publish from this repository.

## Scope

Only assets in these channels are tracked:

- `dynatrace`
- `dynatrace-internal-sfm`

Assets from `dynatrace-dev` and `dynatrace-internal-dev` are intentionally excluded from this registry.

## What the Registry Answers

- Who owns this asset?
- Which channel does it belong to?
- What is its release state?
- Which Dynatrace environment should be used by default for validation?

## Schema

```yaml
schema_version: "1.0"
assets:
  skills:
    <skill-name>: { ... }
  agents:
    <agent-name>: { ... }
  commands:
    <command-path>: { ... }
```

Each tracked asset entry contains these fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| `channel` | enum | yes | `dynatrace` or `dynatrace-internal-sfm` |
| `pm-owner` | string or list | yes | PM owner email(s) |
| `pa-owner` | string or list | yes | PA owner email(s) |
| `capability` | string | yes | Owning team/capability |
| `jira-project` | string | yes | Jira project key |
| `release-status` | enum | yes | `candidate`, `planned`, or `released` |
| `test-environment-url` | string | yes | Full `https://` environment URL |

## Release Status Definitions

| Status | Meaning |
|---|---|
| `candidate` | Tracked, but not yet ready to ship broadly. Use this while the asset is still under evaluation or blocked by release-runtime constraints. |
| `planned` | Approved and intended for release. |
| `released` | Already shipped. |

Normal progression is `candidate` → `planned` → `released`.

## Default Environment URLs

If an asset does not need an explicit override, use the channel default:

| Channel | Default `test-environment-url` |
|---|---|
| `dynatrace` | `https://umsaywsjuo.dev.apps.dynatracelabs.com` |
| `dynatrace-internal-sfm` | `https://dre63214.apps.dynatrace.com/` |

Explicit per-asset overrides are allowed when a different environment is required.

## Asset Types

- **Skills** — `knowledge-base/*/skills/*/SKILL.md`
- **Agents** — `knowledge-base/*/agents/*.md`
- **Commands** — `knowledge-base/*/commands/**/*.md`

## Example

```yaml
assets:
  skills:
    dt-dql-advanced:
      channel: dynatrace
      pm-owner: alice.smith@dynatrace.com
      pa-owner: carol.chen@dynatrace.com
      capability: Platform Engineering
      jira-project: PE
      release-status: candidate
      test-environment-url: https://umsaywsjuo.dev.apps.dynatracelabs.com
```

## Adding a New Asset

1. Open `docs/registry/assets.yaml`
2. Add the asset under `skills`, `agents`, or `commands`
3. Fill in ownership fields
4. Set `release-status: candidate`
5. Use the channel default `test-environment-url` unless the asset needs a different environment

You can also use `dt-dev-skill-creator` to discover and register new tracked assets automatically. It preserves existing manual metadata and applies the channel defaults.
