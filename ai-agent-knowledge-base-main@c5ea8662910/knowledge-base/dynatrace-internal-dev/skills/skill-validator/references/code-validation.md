# Code Validation

## Overview

Code blocks in skills are copy-pasted by users and consumed by AI agents. Invalid code wastes time and damages trust.

This document covers **local syntax validation** for code blocks: Bash, YAML, JSON, Python, and JavaScript.

**Core rule**: If a code block can be executed as-is without user customization, it MUST be validated.

## Contents

- [When Validation Is Required vs Optional](#when-validation-is-required-vs-optional)
- [General Validation Principles](#general-validation-principles)
- [Language-Specific Validation](#language-specific-validation)
- [Code Block Formatting Rules](#code-block-formatting-rules)
- [Validation Checklist](#validation-checklist)
- [Common Issues](#common-issues)

## When Validation Is Required vs Optional

### MUST Validate

- Complete working examples meant to be copy-pasted
- Specific commands with flags or parameters
- Configuration files (YAML, JSON) with actual values
- Scripts that can run without modification

### Optional Validation

- Generic patterns with placeholders (e.g., `command <argument>`)
- Syntax examples showing structure only
- Templates requiring user customization before execution

### Guiding Principle

If content can be executed as-is, it MUST be validated. If it requires substitution or customization, validation is optional but placeholders must be clearly marked.

## General Validation Principles

1. **Test code blocks exactly as written.** Copy the block from the rendered markdown and run it. Do not fix typos or adjust formatting before testing.
2. **Test incrementally.** Start with the simplest form, then add complexity step by step.
3. **Use limits during testing.** Add `| head` or similar to avoid overwhelming output while validating.
4. **Verify against real data.** Never assume a field exists or a flag is valid.

## Language-Specific Validation

### Bash / Shell Commands

**Validation steps:**

1. Verify the command exists and is available in the expected environment
2. Check that all flags are correct and supported (`--help` or man pages)
3. Test read-only commands first before attempting write operations

**Tool:** Use `shellcheck` for static syntax validation. See [troubleshooting.md](troubleshooting.md) for installation.

```bash
# Syntax check a script file
shellcheck script.sh

# Verify a command exists
which command-name

# Check flag support
command-name --help
```

**Common issues:** Shell compatibility (works in zsh but not bash), unquoted variables, missing error handling.

### YAML

**Validation steps:**

1. Validate syntax with `yamllint` — run `yamllint file.yaml` and confirm zero errors
2. Check required fields for the target format
3. Verify indentation uses spaces, not tabs

**Prerequisite:** `yamllint` MUST be available. See [troubleshooting.md](troubleshooting.md) for installation.

```bash
# YAML syntax validation (MUST pass with zero errors)
yamllint file.yaml
```

If `yamllint` is not available, use the Python fallback:

```bash
python3 -c "import yaml, sys; yaml.safe_load(sys.stdin)" < file.yaml
```

**Common issues:** Tabs instead of spaces, unquoted strings containing colons or special characters, incorrect list indentation.

### JSON

**Validation steps:**

1. Validate syntax with `jq` — run `jq . file.json` and confirm valid output
2. Check required fields for the target format
3. Watch for trailing commas, missing closing brackets, and unquoted keys

**Prerequisite:** `jq` MUST be available. See [troubleshooting.md](troubleshooting.md) for installation.

```bash
# JSON syntax validation (MUST produce valid output)
jq . file.json
```

If `jq` is not available, use the Python fallback:

```bash
python3 -m json.tool file.json
```

**Common issues:** Trailing commas after the last element, single quotes instead of double quotes, comments (JSON does not support comments).

### Python

**Validation steps:**

1. Validate syntax with `python3 -m py_compile script.py`
2. Check that all imports are available in the expected environment
3. Execute self-contained snippets to verify correctness

```bash
# Syntax check without execution
python3 -m py_compile script.py

# Execute inline snippet
python3 -c "
import json
data = {'key': 'value'}
print(json.dumps(data, indent=2))
"
```

**Common issues:** Missing imports, Python 2 vs 3 syntax differences, uninstalled third-party packages.

### JavaScript

**Validation steps:**

1. Validate syntax with `node --check script.js`
2. Distinguish between Node.js and browser-specific APIs
3. Execute self-contained snippets to verify correctness

```bash
# Syntax check without execution
node --check script.js

# Execute inline snippet
node -e "
const data = { key: 'value' };
console.log(JSON.stringify(data, null, 2));
"
```

**Common issues:** Browser-only APIs (`document`, `window`) used in Node.js context, missing `require` or `import` statements, CommonJS vs ESM module syntax.

## Code Block Formatting Rules

- **Always specify a language identifier** on fenced code blocks: ` ```bash `, ` ```yaml `, ` ```json `, ` ```python `, ` ```javascript `
- **Use consistent formatting** within a skill — same indentation style, same comment conventions
- **Include comments** in code blocks to explain non-obvious steps
- **Do not mix languages** in a single code block — split into separate blocks with explanatory text

## Validation Checklist

- [ ] Language identifier specified on every code fence
- [ ] Code block categorized: must-validate or optional
- [ ] Must-validate blocks tested with local tools
- [ ] Syntax validation passed (yamllint, jq, shellcheck, py_compile, node --check)
- [ ] Commands and flags verified against `--help` output
- [ ] Results documented

## Common Issues

| Issue | Symptom | Fix |
|-------|---------|-----|
| YAML tabs instead of spaces | Parse error on indentation | Convert tabs to spaces (2-space indent standard) |
| JSON trailing commas | Parse error on last element | Remove comma after last array/object element |
| Missing Python imports | `ModuleNotFoundError` | Add import statements or document required packages |
| Node.js vs browser APIs | `ReferenceError: document is not defined` | Use only Node.js-compatible APIs in skill examples |
| Shell compatibility | Command works in zsh but not bash | Test in bash — skills assume bash unless stated otherwise |
| Unquoted YAML strings | Unexpected parsing of colons or special chars | Quote strings containing special characters |
