# Fix Project Documentation (README, CONTRIBUTING, AGENTS)

This guide covers auditing and synchronizing the three core documentation files that must stay in sync with each other and the codebase.

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

Maintain project documentation in a synchronized, accurate state by **identifying and fixing issues** across three documentation files that must stay in sync with each other and with the actual codebase implementation.

## When to Use

- User requests to "fix project documentation"
- User mentions README, CONTRIBUTING, or AGENTS needing updates
- After major code changes that affect documentation
- User requests documentation audit or synchronization
- Context indicates multiple documentation files need fixing

## The Three Documentation Files

### README.md (End User Documentation)
**Purpose**: What end users need to know to install and use the tool

**Focus**: How to install, configure, and use the tool

**Content**:
- Installation instructions
- CLI usage examples
- Configuration options
- Troubleshooting common issues
- Link to CONTRIBUTING.md for developers

**Restrictions**:
- **NO developer content**: Never include development instructions, testing procedures, or internal architecture details
- **NO build and test commands**: End users should not execute tests or run builds
- **NO project structure**: End users are not interested in code structure or architecture
- References to CONTRIBUTING.md are acceptable for technical details

### CONTRIBUTING.md (Developer Documentation)
**Purpose**: What developers need to know to extend and maintain the tool

**Focus**: Technical documentation for developers extending the tool

**Content**:
- Tech stack used
- Complete architecture overview
- Project structure with key directories
- Design patterns and principles
- Step-by-step guides for adding features
- Development workflow with testing procedures
- Code style guidelines
- TypeScript best practices

**Restrictions**:
- **NO excessive file details**: Document what goes in folders without listing every individual file
- If using directory trees, NEVER include files—only folders
- **NO detailed code examples in guidelines**: Code examples acceptable in "Adding New X" sections only
- **Exclude**: Don't mention AGENTS.md or include license information

### AGENTS.md (AI Agent Instructions)
**Purpose**: Quick reference for AI coding assistants during development

**Location**: `{agents_md}` (`.coder/AGENTS.md` in stealth mode, `AGENTS.md` at project root in team mode)

**Focus**: Quick reference for AI coding assistants

**Content**:
- Essential commands (compile, build, test)
- Quick architecture reference pointing to CONTRIBUTING.md for details
- Code style reminders
- Quick references for common tasks

**Restrictions**:
- **NO redundancy**: Keep it brief, avoid duplicating README or CONTRIBUTING
- **All commands and file paths must be accurate and tested**
- See [fix-agents-md.md](fix-agents-md.md) for detailed guidance

## Cross-File Synchronization Requirements

### 1. No Contradictions
Same information presented in different files must be identical

**Examples**:
- Default config values in README must match CONTRIBUTING and AGENTS
- Command options must be described consistently
- Installation steps should align across files

### 2. Consistent Terminology
Use the same term names across all files

**Examples**:
- If README calls it "transformation profiles", don't call it "transformation rules" in CONTRIBUTING
- If README says "processors", use "processors" everywhere (not "transformers")
- Capitalization should be consistent (e.g., "pipeline" vs "Pipeline")

### 3. Cross-References Must Be Accurate
Links and references between files must work

**Requirements**:
- `{agents_md}` points to CONTRIBUTING.md for detailed info
- README.md points to CONTRIBUTING.md for dev guidelines
- All file paths must be correct

### 4. Single Source of Truth for Code Examples
Avoid duplicating complex examples

**Pattern**:
- Complex examples live in CONTRIBUTING.md
- README.md can reference them ("See CONTRIBUTING.md for examples")
- `{agents_md}` keeps examples minimal or references CONTRIBUTING.md

## Verification Process

**Important**: Do NOT create test directories or files during verification. You may execute project commands (npm scripts, compiled CLI), but skip any tests that require creating new files or folders. Focus on verifying documentation against existing code and testing commands that work with current state.

### 1. Command Verification
**Test**: For each command documented, verify it actually works

**Process**:
1. Identify all commands in README.md, CONTRIBUTING.md, and `{agents_md}`
2. Run each command and note the output
3. Compare documented behavior with actual behavior
4. Update documentation if behavior differs

**If Issue Found**:
- ✅ Test the command against the actual codebase
- ✅ Note the correct behavior
- ✅ Update ALL documentation files with the correct command and output
- ✅ Re-test to confirm the fix works

### 2. File Reference Verification
**Test**: Check that all file paths exist

**Process**:
1. Extract all file paths from all three documentation files
2. Verify each path exists in the codebase
3. Check if any files moved or were renamed

**If Issue Found**:
- ✅ Verify the correct file path in the codebase
- ✅ Update the path in ALL documentation files
- ✅ Test that examples still work with corrected paths

### 3. Code Example Verification
**Test**: Run code examples from CONTRIBUTING.md

**Process**:
1. Extract code examples from CONTRIBUTING.md
2. Create temporary test files if needed
3. Verify examples compile/run without errors
4. Check that patterns match actual codebase

**If Issue Found**:
- ✅ Identify where the example is used (README, CONTRIBUTING, AGENTS)
- ✅ Fix the example to be syntactically correct
- ✅ Verify code compiles without errors
- ✅ Test that examples follow actual patterns in codebase

### 4. Consistency Checks
**Test**: Compare descriptions across files

**Process**:
1. Search for architecture descriptions in all files
2. Compare option descriptions across README and CONTRIBUTING
3. Check that examples produce expected output
4. Verify terminology consistency

**If Issue Found** (Contradiction):
- ✅ Identify the source of truth from actual codebase behavior
- ✅ Update ALL documentation files to match the correct behavior
- ✅ Remove any conflicting or outdated information
- ✅ Re-test for consistency

## Common Scenarios

### Scenario 1: After Adding a New Feature
1. Document it in README.md with usage and options
2. Document full implementation details in CONTRIBUTING.md
3. Add command to `{agents_md}` if it's frequently used
4. Verify all three files reference the command correctly
5. Test that the documented command works

### Scenario 2: After Changing Configuration
1. Update example configs in project
2. Update all references in README.md
3. Update all references in CONTRIBUTING.md (Config section)
4. Update defaults in `{agents_md}` if listed
5. Verify consistency across all files

### Scenario 3: After Refactoring Project Structure
1. Update CONTRIBUTING.md Project Structure section
2. Update `{agents_md}` Architecture Quick Reference
3. Update any file paths in code examples across all files
4. Update README.md if user-facing paths changed
5. Verify all references point to correct locations

## See Also

- [fix-agents-md.md](fix-agents-md.md) - Detailed guide for AGENTS.md specifically
- [project-documentation-checklist.md](project-documentation-checklist.md) - Complete checklist for verification
