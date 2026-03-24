# Fix AGENTS.md File

This guide covers maintaining and synchronizing the AGENTS.md file specifically.

## Step 0: Detect Mode

Before doing anything else, check for stealth mode:

```bash
grep -q "# opencode-coder stealth mode" .git/info/exclude 2>/dev/null && echo "STEALTH_ACTIVE"
```

- If output is `STEALTH_ACTIVE` → **stealth mode is active**:
  - AGENTS.md lives at `.coder/AGENTS.md` — **not** at the project root
  - Docs directory is `.coder/docs/` — **not** `docs/`
  - All file operations in this guide targeting "AGENTS.md" must use `.coder/AGENTS.md`
- If no output → **team mode**: AGENTS.md lives at the project root as usual

Throughout this guide:
- `{agents_md}` refers to `.coder/AGENTS.md` in stealth mode, `AGENTS.md` in team mode

## Purpose

AGENTS.md serves as a quick reference for AI coding assistants during development. It must be accurate, concise, and synchronized with other project documentation.

## AGENTS.md Guidelines

### Focus
Quick reference for AI coding assistants during development

### Content Requirements
- **Essential commands**: Build, test, run, deploy commands
- **Quick architecture reference**: Points to CONTRIBUTING.md for full details
- **Code style reminders**: Brief, critical style points
- **Quick references**: File paths, common patterns, gotchas

### Content Restrictions
- **NO redundancy**: Keep it brief, avoid duplicating README or CONTRIBUTING
- **NO detailed explanations**: Link to CONTRIBUTING.md instead
- **NO user-facing content**: This is for development assistants, not end users
- **All commands must be accurate and tested**: Every command listed must work

## Common Issues to Fix

### 1. Outdated Commands
**Problem**: Build/test commands changed but `{agents_md}` not updated
**Fix**: Test all commands, update `{agents_md}` to match current scripts

### 2. Incorrect File Paths
**Problem**: File paths listed don't exist or moved
**Fix**: Verify all paths exist, update to correct locations

### 3. Redundant Content
**Problem**: Duplicates information from README or CONTRIBUTING
**Fix**: Remove duplicates, add reference links instead

### 4. Missing Critical Commands
**Problem**: New important scripts not documented
**Fix**: Add new commands with brief descriptions

### 5. Broken Cross-References
**Problem**: Links to README.md or CONTRIBUTING.md are broken
**Fix**: Verify and update all cross-reference links

## Verification Steps

1. **Test all commands**: Run each command listed in `{agents_md}`
   ```bash
   # For each command in {agents_md}, verify it works:
   <command-from-agents-md>
   ```

2. **Verify file paths**: Check that all file paths mentioned exist
   ```bash
   # For each path mentioned, verify:
   ls <path-from-agents-md>
   ```

3. **Check cross-references**: Ensure links to README/CONTRIBUTING work
   - Follow each link and verify target section exists

4. **Compare with package.json scripts**: Ensure documented scripts match
   ```bash
   # Compare {agents_md} commands with:
   cat package.json | grep -A 20 '"scripts"'
   ```

5. **Verify against CONTRIBUTING.md**: Ensure architecture references are consistent
   - Check that any architecture descriptions match CONTRIBUTING.md

## Update Checklist

When fixing `{agents_md}`:

- [ ] All commands tested and working
- [ ] All file paths verified to exist
- [ ] No redundant content (checked against README/CONTRIBUTING)
- [ ] Cross-references to README/CONTRIBUTING are accurate
- [ ] New important commands added if missing
- [ ] Brief and concise (no lengthy explanations)
- [ ] Focused on development assistance, not end-user guidance

## Synchronization with Other Files

`{agents_md}` must be consistent with:

### With README.md
- Installation commands should match
- Project name and description should align
- Don't duplicate end-user content

### With CONTRIBUTING.md
- Architecture references should point to CONTRIBUTING for details
- Development commands should match
- Don't duplicate detailed technical content

### With package.json
- Script commands should match exactly
- Script descriptions should be accurate

## Common Patterns

### Good AGENTS.md Entry
```markdown
## Build and Test

npm run build  # Compile TypeScript to dist/
npm test       # Run all tests
npm run typecheck  # Verify types without building

See CONTRIBUTING.md for architecture details.
```

### Bad AGENTS.md Entry
```markdown
## Build and Test

To build the project, you need to compile TypeScript. The build system uses
the TypeScript compiler with the configuration in tsconfig.json. The output
goes to the dist/ directory where the compiled JavaScript files are stored...

[Too verbose, duplicates what's likely in CONTRIBUTING.md]
```

## Testing Before Submitting

Before marking `{agents_md}` as fixed:

1. Run every command listed
2. Open every file path mentioned
3. Click every cross-reference link
4. Compare with README and CONTRIBUTING for conflicts
5. Ensure brevity (should be scannable in < 2 minutes)
