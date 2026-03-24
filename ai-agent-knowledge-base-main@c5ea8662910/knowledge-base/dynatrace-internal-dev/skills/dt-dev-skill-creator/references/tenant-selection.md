# Tenant Selection

## Overview

Before any validation, you must select which Dynatrace tenant to validate against. Always check for existing configuration before asking the user.

## Contents

- [Overview](#overview)
- [Step 0: Check Asset Registry (Optional Shortcut)](#step-0-check-asset-registry-optional-shortcut)
- [Step 1: Get Available Contexts](#step-1-get-available-contexts)
- [Step 2: Check for Previous Validation Config](#step-2-check-for-previous-validation-config)
- [Step 3: Verify Context](#step-3-verify-context)
- [Configuration File Template](#configuration-file-template)

## Step 0: Check Asset Registry (Optional Shortcut)

Before running `list_contexts.py`, check if the asset registry has tenant info for this skill:

1. Check if `docs/registry/assets.yaml` exists at repo root
2. Parse YAML and look up the skill under `assets.skills.<skill-name>`
3. Read the `test-environment-url` field

**If the field is non-empty:**
- Show the user: "Registry specifies environment **<test-environment-url>** for this skill"
- Run `python3 scripts/list_contexts.py --json` and find the configured context whose `environment` matches the registry URL
- If a matching context exists, use that context name and skip to Step 3 (Verify Context)
- If no matching context exists, fall through to Step 1

**If the field is empty or registry doesn't exist:**
- Continue with normal Step 1 flow (no change to existing behavior)

This is an optional shortcut — the full tenant selection flow still works if the registry is unavailable.

## Step 1: Get Available Contexts

Use the `list_contexts.py` helper script to get configured dtctl contexts:

```bash
python3 scripts/list_contexts.py --json
```

This returns structured data about all configured dtctl contexts:

```json
{
  "current": "nrg77339",
  "contexts": [
    {
      "name": "nrg77339",
      "environment": "https://nrg77339.dev.apps.dynatracelabs.com",
      "safety_level": "readwrite-all",
      "is_current": true
    }
  ]
}
```

For human-readable output, omit the `--json` flag:

```bash
python3 scripts/list_contexts.py
```

## Step 2: Check for Previous Validation Config

Check if the skill has been validated before:

```bash
test -f dt-skill-validation/<skill-name>/skill-validation-instructions.md
```

### If Config Exists

1. Read tenant config from file (e.g., previously used "nrg77339")
2. Show user current context info from `list_contexts.py`
3. Ask: "Previous validation used **nrg77339** (readwrite-all). Use nrg77339 again, or select different tenant?"
4. Present options:
   - Use the same tenant again
   - Select from configured contexts (show list from `list_contexts.py`)
   - Create new context (reference the Dynatrace control skill)
5. If a different tenant is selected, update the file

### If Config Does NOT Exist

1. Show user available contexts from `list_contexts.py`
2. Highlight current context
3. Ask user which tenant to use:

   ```text
   Which Dynatrace tenant should I use for validation?

   Configured contexts:
   -> nrg77339 (readwrite-all) - CURRENT
      dre63214 (readonly)
      gmg80500 (readonly)

   Options:
   - Use current context (nrg77339)
   - Select different context from list
   - Create new context (load a skill for Dynatrace environment control)
   ```

4. Create `dt-skill-validation/<skill-name>/skill-validation-instructions.md` with tenant config

## Step 3: Verify Context

Before ANY validation commands, confirm the context:

```bash
# Check current context
dtctl config current-context

# Describe context (shows environment URL, safety level, scopes)
dtctl config describe-context

# Confirm with user if context is production-like
```

## Configuration File Template

Each skill gets its own `skill-validation-instructions.md`:

```markdown
# Validation Instructions: <skill-name>

## Tenant Configuration
- **Context**: nrg77339
- **Environment**: https://nrg77339.dev.apps.dynatracelabs.com
- **Safety Level**: readwrite-all
- **Last Used**: 2026-01-29

## Validation Approach
- Focus on: [read-only commands, DQL queries, etc.]
- Skip: [write operations, etc.]

## Special Notes
- [Any skill-specific guidance]
```
