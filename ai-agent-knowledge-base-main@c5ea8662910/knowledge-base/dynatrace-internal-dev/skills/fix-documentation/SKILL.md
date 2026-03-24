---
name: fix-documentation
description: "Fix documentation files - either single files (typos, grammar, clarity) or project-wide documentation (README.md, CONTRIBUTING.md, AGENTS.md synchronization). Use when: (1) User requests fixing typos/grammar/clarity in documentation, (2) User asks to update/sync/audit README, CONTRIBUTING, or AGENTS files, (3) After code changes affecting documentation accuracy, (4) Need to verify documentation consistency"
---

# Fix Documentation

Fix documentation files through targeted improvements or comprehensive project documentation synchronization.

## Step 0: Detect Mode

Before doing anything else, check for stealth mode:

```bash
grep -q "# opencode-coder stealth mode" .git/info/exclude 2>/dev/null && echo "STEALTH_ACTIVE"
```

- If output is `STEALTH_ACTIVE` → **stealth mode is active**:
  - AGENTS.md lives at `.coder/AGENTS.md` — **not** at the project root
  - Docs directory is `.coder/docs/` — **not** `docs/`
  - All path operations and instructions must use `.coder/AGENTS.md`
- If no output → **team mode**: AGENTS.md lives at the project root as usual

Carry this context forward into all subsequent steps and loaded reference files.

## Decision Tree

When this skill loads, determine the user's intent:

### 1. Analyze Context
Look for clear indicators:
- **Single file fix**: User mentions a specific file, "this file", "typos here", or provides a file path
- **Project documentation**: User mentions "project docs", "README", "CONTRIBUTING", "AGENTS", or "synchronize documentation"

### 2. If Intent Is Clear
Proceed directly to the appropriate workflow:
- **Single file** → Load [fix-single-document.md](references/fix-single-document.md)
- **Project documentation** → Load [fix-project-documentation.md](references/fix-project-documentation.md)
- **AGENTS.md specifically** → Load [fix-agents-md.md](references/fix-agents-md.md)

### 3. If Intent Is Unclear
Ask the user to clarify using the question tool:

```typescript
question({
  questions: [{
    question: "What type of documentation fix do you need?",
    header: "Documentation Scope",
    options: [
      {
        label: "Fix a specific file",
        description: "Fix typos, grammar, and clarity in a single document"
      },
      {
        label: "Fix project documentation",
        description: "Audit and sync README.md, CONTRIBUTING.md, and AGENTS.md"
      },
      {
        label: "Fix AGENTS.md specifically",
        description: "Update and verify AGENTS.md file only"
      }
    ]
  }]
})
```

## Workflows

### Workflow 1: Fix Single Document
**Purpose**: Fix typos, grammar, and improve clarity in one specific file

**When to use**: User provides or implies a specific file needs fixing

**Full guide**: See [references/fix-single-document.md](references/fix-single-document.md)

**Quick steps**:
1. Identify the target file (ask if not provided)
2. Read the document
3. Fix typos, grammar, and clarity issues
4. Verify file paths mentioned in the document
5. Save the improved document

---

### Workflow 2: Fix Project Documentation
**Purpose**: Audit and synchronize README.md, CONTRIBUTING.md, and AGENTS.md

**When to use**: User requests project-wide documentation fixes or mentions multiple core docs

**Full guide**: See [references/fix-project-documentation.md](references/fix-project-documentation.md)

**Quick steps**:
1. Verify commands in all three files
2. Check file paths are accurate
3. Test code examples
4. Fix inconsistencies and contradictions
5. Use the checklist to ensure completeness

**Checklist**: See [references/project-documentation-checklist.md](references/project-documentation-checklist.md)

---

### Workflow 3: Fix AGENTS.md Specifically
**Purpose**: Update and verify the AGENTS.md file for AI coding assistants

**When to use**: User specifically mentions AGENTS.md or asks about fixing agent instructions

**Full guide**: See [references/fix-agents-md.md](references/fix-agents-md.md)

**Quick steps**:
1. Detect mode (stealth: `.coder/AGENTS.md`, team: `AGENTS.md`)
2. Test all commands in the file
3. Verify all file paths exist
4. Check for redundancy with README/CONTRIBUTING
5. Ensure it's brief and scannable
6. Verify cross-references work

## Reference Files

All detailed guidance is in the references folder:

- **[fix-single-document.md](references/fix-single-document.md)** - Complete guide for fixing individual files
- **[fix-project-documentation.md](references/fix-project-documentation.md)** - Guide for synchronizing README, CONTRIBUTING, and AGENTS
- **[fix-agents-md.md](references/fix-agents-md.md)** - Detailed guide for maintaining AGENTS.md
- **[project-documentation-checklist.md](references/project-documentation-checklist.md)** - Comprehensive checklist for project documentation audits

## Key Principles

1. **Ask when unclear**: Use the question tool if user intent isn't obvious from context
2. **Load references on demand**: Read reference files based on the chosen workflow
3. **Test, don't assume**: Always verify commands and file paths work
4. **Update all affected files**: Changes often need to be reflected across multiple docs
5. **Minimize disruption**: Fix what's broken, preserve what works
