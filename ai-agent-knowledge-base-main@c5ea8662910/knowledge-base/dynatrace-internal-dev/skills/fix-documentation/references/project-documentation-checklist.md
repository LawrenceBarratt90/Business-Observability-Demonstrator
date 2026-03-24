# Project Documentation Checklist

Use this checklist when auditing and fixing README.md, CONTRIBUTING.md, and AGENTS.md.

## Step 0: Detect Mode

Before starting, check for stealth mode:

```bash
grep -q "# opencode-coder stealth mode" .git/info/exclude 2>/dev/null && echo "STEALTH_ACTIVE"
```

- If `STEALTH_ACTIVE` → AGENTS.md lives at `.coder/AGENTS.md`. All checklist items labeled "AGENTS.md" below refer to `.coder/AGENTS.md`.
- If no output → AGENTS.md lives at the project root as usual.

Throughout this checklist, `{agents_md}` = `.coder/AGENTS.md` (stealth) or `AGENTS.md` (team mode).

---

## Phase 1: Command Verification

**Goal**: Ensure all documented commands work as described

### README.md Commands
- [ ] Installation commands tested and work
- [ ] CLI usage examples run without errors
- [ ] Configuration commands produce expected results
- [ ] All command-line flags/options are accurate

### CONTRIBUTING.md Commands
- [ ] Build commands work (`npm run build`, etc.)
- [ ] Test commands execute properly
- [ ] Development setup commands are accurate
- [ ] Linting/formatting commands work

### `{agents_md}` Commands
- [ ] Every command listed has been tested
- [ ] Build/compile commands work
- [ ] Test commands execute properly
- [ ] Quick reference commands are accurate

### Cross-File Command Consistency
- [ ] Installation commands match across README and CONTRIBUTING
- [ ] Script names in `{agents_md}` match package.json
- [ ] No conflicting command descriptions

---

## Phase 2: File Path Verification

**Goal**: Ensure all file paths mentioned in documentation exist

### README.md Paths
- [ ] Configuration file paths exist
- [ ] Example file references are valid
- [ ] Links to other docs (CONTRIBUTING.md) work

### CONTRIBUTING.md Paths
- [ ] Project structure paths exist
- [ ] Example code file references are valid
- [ ] Links to README.md and code examples work

### `{agents_md}` Paths
- [ ] All file paths mentioned exist
- [ ] Script locations are accurate
- [ ] Cross-references to README/CONTRIBUTING work

### Cross-File Path Consistency
- [ ] Same paths referenced consistently across files
- [ ] No broken internal links between docs
- [ ] Relative paths work from project root

---

## Phase 3: Content Accuracy

**Goal**: Ensure documentation matches actual code behavior

### README.md Accuracy
- [ ] Feature descriptions match implementation
- [ ] Configuration options match actual config schema
- [ ] Default values documented are actual defaults
- [ ] Output examples match actual output
- [ ] Troubleshooting tips are still relevant

### CONTRIBUTING.md Accuracy
- [ ] Architecture description matches code structure
- [ ] Tech stack list is up to date
- [ ] Code examples compile without errors
- [ ] Design patterns documented are actually used
- [ ] Project structure reflects actual directories

### `{agents_md}` Accuracy
- [ ] Commands produce documented output
- [ ] Architecture references are still valid
- [ ] Code style reminders match actual style guide
- [ ] Quick references are up to date

---

## Phase 4: Consistency Checks

**Goal**: Ensure no contradictions across documentation files

### Terminology Consistency
- [ ] Same terms used across all files
- [ ] Capitalization is consistent
- [ ] No synonyms for the same concept (choose one term)
- [ ] Abbreviations defined consistently

### Content Consistency
- [ ] Default values match across all files
- [ ] Feature descriptions don't contradict
- [ ] Architecture descriptions align
- [ ] No conflicting instructions

### Example Consistency
- [ ] Code examples produce same results across files
- [ ] Configuration examples match actual config
- [ ] Command examples work as shown in all files

---

## Phase 5: Quality Standards

**Goal**: Ensure each file meets its purpose and audience needs

### README.md Quality
- [ ] Installation is straightforward for end users
- [ ] No developer-specific jargon
- [ ] No internal implementation details
- [ ] No build/test commands (user-facing only)
- [ ] Clear and concise for newcomers

### CONTRIBUTING.md Quality
- [ ] Comprehensive for developers
- [ ] Architecture clearly explained
- [ ] Step-by-step guides for adding features
- [ ] Code examples are complete and correct
- [ ] Development workflow is clear

### `{agents_md}` Quality
- [ ] Brief and scannable (< 5 minutes to read)
- [ ] No redundant content from other docs
- [ ] All essential commands present
- [ ] Quick references are actually quick
- [ ] Links to other docs for details

---

## Phase 6: Cross-References

**Goal**: Ensure links between files are accurate and helpful

### Link Verification
- [ ] README → CONTRIBUTING link works
- [ ] `{agents_md}` → CONTRIBUTING links work
- [ ] `{agents_md}` → README links work (if any)
- [ ] All internal section anchors work

### Reference Appropriateness
- [ ] README references CONTRIBUTING for dev details
- [ ] `{agents_md}` references CONTRIBUTING for architecture
- [ ] No circular or redundant references
- [ ] References add value (not just "see other doc")

---

## Phase 7: Final Verification

**Goal**: Confirm all fixes are complete and tested

### Testing
- [ ] Re-run all commands from all files
- [ ] Verify all file paths one more time
- [ ] Check that examples still work
- [ ] Confirm no new inconsistencies introduced

### Review
- [ ] All three files updated where needed
- [ ] No contradictions remain
- [ ] Changes are minimal but complete
- [ ] Documentation is now trustworthy

### Sign-Off
- [ ] All checklist items completed
- [ ] Changes tested and verified
- [ ] Ready to commit documentation updates

---

## Quick Issue Reference

Use this table to quickly identify which file(s) to update for common issues:

| Issue | README.md | CONTRIBUTING.md | `{agents_md}` |
|-------|-----------|-----------------|-----------|
| Installation command changed | ✅ | ✅ | |
| New CLI flag added | ✅ | ✅ | |
| Build script renamed | | ✅ | ✅ |
| Architecture changed | | ✅ | ✅ (reference) |
| File moved | ✅ (if user-facing) | ✅ | ✅ |
| Config option added | ✅ | ✅ | |
| New development command | | ✅ | ✅ |
| Terminology changed | ✅ | ✅ | ✅ |

---

## Notes

- **Don't create test files**: Verify against existing code only
- **Test with actual commands**: Don't assume commands work
- **Update all three files**: Even small changes may affect multiple files
- **Verify twice**: Check once, fix, then verify again
- **Keep it minimal**: Only fix what's wrong, don't rewrite everything
