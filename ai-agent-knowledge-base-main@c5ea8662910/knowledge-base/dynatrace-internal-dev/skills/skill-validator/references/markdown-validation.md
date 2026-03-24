# Markdown Validation

## Overview

Markdown validation for skills focuses on what matters for AI agents reading the content:

1. **Parseability** — Can the markdown be parsed without errors?
2. **Link integrity** — Do all links point to real files?
3. **Code blocks** — Are code blocks properly closed?

This validation does NOT enforce formatting rules like trailing spaces, line length, or heading hierarchy. Those don't affect AI agents' ability to read and understand the content.

## Using the Validation Script

From the skill root directory:

```bash
# Validate all markdown files
python3 scripts/validate-markdown.py

# Verbose output
python3 scripts/validate-markdown.py -v

# Validate specific file
python3 scripts/validate-markdown.py -f SKILL.md
```

**Exit codes:**
- `0` — All files valid
- `1` — Validation failed

## What Gets Validated

### 1. Markdown Parseability

The script uses `markdown-it-py` to parse each markdown file. If parsing fails, the file contains invalid markdown syntax.

**Common issues:**
- Mismatched brackets in links: `[text](incomplete`
- Unclosed emphasis markers: `**bold text without closing`
- Invalid HTML tags embedded in markdown

**What is NOT checked:**
- ❌ Heading hierarchy (h1 → h3 without h2)
- ❌ Trailing spaces
- ❌ Line length
- ❌ Blank lines around headings

These formatting details don't affect AI readability.

### 2. Link Integrity

Every `[text](path)` link is extracted and validated.

**Rules:**

- **All relative links MUST resolve** — If `[text](references/foo.md)` exists, then `references/foo.md` must exist on disk
- **External URLs are allowed** — `https://example.com` links are fine and not checked
- **Links MUST NOT escape skill boundary** — Cannot link to `../../other-skill/file.md`
- **Relative paths required** — No absolute filesystem paths like `/home/user/...`

**Placeholders are ignored:**

These are recognized as examples/placeholders and not validated:
- `[text](url)` — Generic placeholder
- `[text](path)` — Generic placeholder  
- `[text](file)` — Generic placeholder
- `[text](https://example.com)` — Example domain
- Links containing `<`, `>`, `{`, `}` — Template markers

**Fragment anchors:**

Links with fragments like `[text](file.md#section)` are validated only for the file part. The file must exist; the anchor is not checked.

### 3. Code Block Closure

All code blocks must be properly closed:

````markdown
```python
code here
```
````

If parsing succeeds, code blocks are valid. The parser automatically detects unclosed blocks.

**What is NOT checked:**
- ❌ Language identifiers (though recommended)
- ❌ Code syntax within blocks (see code-validation.md for that)

## Cross-Skill Reference Rules

Skills MUST NOT directly reference other skills by name.

### Rule: No Direct Skill Name References

Do NOT hard-code skill folder names or identifiers in markdown content. Skills may be renamed, reorganized, split, or replaced.

**Bad examples:**

```markdown
Load the 'data-processor' skill                        ❌
Load skill 'api-helper'                                ❌
See the my-dashboard skill for details                 ❌
```

**Good examples:**

```markdown
Load a skill for data processing                       ✅
Load a skill that covers API integration               ✅
Load relevant skills for dashboard creation            ✅
```

### Related Skills Sections

If a skill includes a "Related Skills" section, describe **capabilities**, not specific skill names.

**Correct pattern:**

```markdown
## Related Skills

- **Query Language** — Core query syntax and structure
- **Dashboard Creation** — Embed queries in dashboards
- **Log Analysis** — Correlate traces with application logs
```

**Incorrect pattern:**

```markdown
## Related Skills

- **query-essentials** — Load this skill for queries       ❌
- **dashboard-builder** — Load for dashboard work          ❌
- **log-analyzer** — Understanding log patterns            ❌
```

**Why this matters:** When skills reference other skills by name and those names are wrong or stale, the AI agent tries to load nonexistent skills. Describing capabilities lets the agent find the right skill regardless of naming changes.

## Why This Approach

**Focus on AI readability, not formatting:**

AI agents can read markdown with:
- ✅ Inconsistent heading hierarchy
- ✅ Trailing spaces  
- ✅ Long lines
- ✅ Missing blank lines around headings

AI agents CANNOT work with:
- ❌ Broken links (instructions reference non-existent files)
- ❌ Invalid markdown syntax (parser crashes)
- ❌ Unclosed code blocks (content misinterpreted)

**No configuration required:**

The validation script has sensible defaults built-in. No external configuration files needed.

**Lightweight:**

Only requires Python 3 and `markdown-it-py`. No complex toolchain or project configuration.

## Validation Checklist

- [ ] All `.md` files are parseable (markdown-it-py succeeds)
- [ ] Every markdown link checked — all resolve to real files
- [ ] No broken links (zero tolerance)
- [ ] All file links use relative paths (no absolute filesystem paths)
- [ ] No links escape the skill folder boundary
- [ ] No direct references to other skill names (folder names or identifiers)
- [ ] Cross-skill references describe capabilities, not names
- [ ] All code blocks properly closed
