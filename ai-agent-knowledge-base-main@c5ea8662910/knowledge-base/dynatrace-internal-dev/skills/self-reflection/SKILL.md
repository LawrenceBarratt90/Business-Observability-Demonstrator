---
name: self-reflection
description: Analyze current session failures by examining errors, root causes, tool failures, and information quality issues. Use when user explicitly requests reflection, self-analysis, post-mortem, or session review to identify what went wrong, why it went wrong, and how to prevent future failures.
---

# Self-Reflection Skill

This skill guides you through a structured failure analysis of the current session to identify root causes, information quality issues, and systemic problems that need fixing.

## Quick Checklist for Rapid Failure Analysis

When a failure occurs, use this checklist for immediate triage:

```
[ ] 1. WHAT FAILED?
    - Tool error? Which tool, what input, what error?
    - Wrong decision? What was chosen, what should have been chosen?
    - Missed requirement? What did user want, what did you deliver?

[ ] 2. INFORMATION CATEGORY?
    - Category 1 (Wrong Info): Did a skill/doc/prompt give wrong guidance?
    - Category 2 (Not Used): Did information exist but you didn't use it?
    - Category 3 (Missing): Did information not exist anywhere?

[ ] 3. ROOT CAUSE?
    - For tool failures: Wrong input / Tool bug / Environment / Permissions?
    - For decisions: Wrong info / Incomplete info / Misinterpreted / Missing?
    - For requirements: Didn't read / Didn't understand / Didn't implement?

[ ] 4. PREVENTION?
    - Bug to file? (Category 1 - wrong information)
    - Process change? (Category 2 - workflow improvement)
    - New documentation? (Category 3 - gap filling)

[ ] 5. PRIORITY?
    - CRITICAL: Blocks work or causes data loss
    - HIGH: Causes repeated failures or significant rework
    - MEDIUM: Causes inefficiency or extra effort
    - LOW: Minor improvement, nice-to-have
```

Use this for quick analysis, then use full templates below for detailed investigation.

## Core Philosophy

**Problems first, always.** Success is expected; failure teaches. This reflection focuses exclusively on:
- What went wrong
- Why it went wrong
- How to prevent it from happening again

Minimize or eliminate "what went well" analysis. The user didn't ask for a pat on the back.

## Reflection Framework

Conduct analysis in the following order:

### 1. Failure Analysis (Start Here)

Begin by cataloging every error, mistake, wrong decision, and suboptimal outcome:

#### Explicit Failures
- **Errors that caused retry/redo**: Tool failures, wrong commands, incorrect edits
- **Wrong decisions**: Chose wrong approach, wrong library, wrong architecture
- **Missed requirements**: Didn't understand or didn't implement what user wanted
- **Wasted effort**: Work that had to be thrown away or redone

#### Subtle Failures
- **Inefficiencies**: Could have been done faster or with fewer steps
- **Poor communication**: User had to clarify, repeat, or correct you
- **Incomplete work**: Partial implementations, missing edge cases
- **Technical debt created**: Quick hacks, TODOs left behind, brittle solutions

#### Near-Miss Failures
- **Caught by user**: User corrected you before you executed
- **Caught by tooling**: Tests, linters, or build failures caught issues
- **Lucky outcomes**: Solution worked despite wrong reasoning

### 2. Information Quality Audit (🚨 CRITICAL)

**This is the most important section.** Most failures trace back to information problems.

For EVERY failure identified above, analyze the information dimension using this three-category framework:

#### Category 1: WRONG/OUTDATED INFORMATION (🐛 Bug - Must Fix)

Information in skills, agent prompts, or documentation that is:
- **Factually incorrect**: Wrong library names, wrong API signatures, wrong commands
- **Outdated**: References old versions, deprecated approaches, obsolete tools
- **Contradictory**: Different sources give conflicting guidance
- **Misleading**: Technically true but practically wrong (e.g., "use X" when Y is better)

**Action Required**: File bugs to fix the source material. These are defects.

**Example Questions**:
- Did a skill tell you to use a deprecated library?
- Did documentation reference a command that doesn't exist?
- Did an agent prompt suggest an approach that's no longer best practice?
- Did two skills give contradictory advice?

**Example from Real Session**:
```
FAILURE: Used pdf-lib when pdf-parse was better suited
ROOT CAUSE: pdf-editor skill recommended pdf-lib for all PDF operations
INFORMATION ISSUE: Wrong information - skill should distinguish reading vs editing
BUG TO FILE: Update pdf-editor skill to recommend pdf-parse for read-only operations
PRIORITY: High - causes wrong library choices
```

#### Category 2: INFORMATION NOT USED (⚙️ Workflow Issue)

Information that existed and was available but you didn't use it:
- **Didn't check available context**: Had a skill loaded but didn't follow it
- **Didn't read documentation**: Documentation existed but you didn't read it
- **Didn't ask clarifying questions**: Could have asked but assumed instead
- **Ignored warnings**: Tools or users warned you but you proceeded anyway

**Action Required**: Process improvement. Why didn't you use available information?

**Example Questions**:
- Was there a skill loaded that you should have consulted but didn't?
- Did you skip reading a file that would have answered your question?
- Did you make assumptions when you could have asked?
- Did error messages contain hints you ignored?

**Example from Real Session**:
```
FAILURE: Tried to use git commit --amend when commit was already pushed
ROOT CAUSE: Didn't check git status to see if commit was pushed
INFORMATION ISSUE: Workflow - git Safety Protocol was in context but not followed
PROCESS IMPROVEMENT: Always run git status before deciding to amend
PATTERN: Rushing through git operations without checking state first
```

#### Category 3: INFORMATION MISSING (❓ Gap - Decide if Fix Needed)

Information that doesn't exist anywhere:
- **Missing skills**: No skill covers this domain
- **Missing documentation**: No guide exists for this tool/workflow
- **Missing examples**: Concept explained but no concrete examples
- **Missing context**: Information exists somewhere but not accessible to you

**Action Required**: Evaluate if gap should be filled. Not every gap needs fixing.

**Decision Criteria**:
- **Frequency**: Is this a common task?
- **Difficulty**: Is it hard to figure out without guidance?
- **Risk**: Do mistakes here cause significant problems?
- **Cost**: Is it worth maintaining documentation?

**Example Questions**:
- Should there be a skill for this workflow?
- Should this tool have a reference guide?
- Should this common pattern have examples?
- Should this context be injected into agent prompts?

**Example from Real Session**:
```
FAILURE: Didn't know how to handle large file uploads efficiently
ROOT CAUSE: No guidance on file upload strategies
INFORMATION ISSUE: Gap - no skill exists for file upload patterns
DECISION: Create skill? YES
  - Frequency: High (many apps need file uploads)
  - Difficulty: High (streaming, chunking, validation are complex)
  - Risk: High (memory issues, security vulnerabilities)
  - Cost: Moderate (one-time skill creation, low maintenance)
ACTION: Create file-upload-patterns skill with streaming/chunking examples
```

#### Information Usage Analysis (Meta-Level)

For Category 2 issues (information not used), dig deeper:

**Timing**: When did the information become relevant?
- Was it available from the start but you didn't check?
- Did it become available partway through (skill loaded late)?
- Was it always accessible but you forgot about it?

**Discoverability**: Could you have found it?
- Was it obvious where to look?
- Was it buried in a long document?
- Was it under an unexpected name?

**Applicability**: How obvious was the connection?
- Was it clearly relevant to your task?
- Did it require inference to connect it to your problem?
- Was the guidance too abstract to apply directly?

**Example Analysis**:
```
FAILURE: Didn't run bd sync before saying "done"
INFORMATION: Session Close Protocol in beads context clearly states this
TIMING: Available from session start
DISCOVERABILITY: In beads context, clearly marked "CRITICAL"
APPLICABILITY: Directly relevant - completing work requires sync
WHY NOT USED: Rushed to completion, skipped checklist
PROCESS FIX: Always read session close protocol when user says "done"
```

### 3. Root Cause Analysis

For each failure, go beyond surface symptoms to find true root causes.

## Root Cause Analysis Templates

> **Internal use**: These templates guide your analysis process. For full templates, see [references/templates.md](references/templates.md).

**Quick template summaries** (use full templates for detailed investigation):

### Tool Failure (quick)
1. What tool + input?
2. Expected vs actual?
3. Why? (wrong input / tool bug / environment / misunderstood)
4. Info category? (wrong info → bug / not used → workflow / missing → gap)
5. Prevention?

### Wrong Decision (quick)
1. What decided + when?
2. What info led to this?
3. Info was: wrong / incomplete / misinterpreted / missing?
4. Correct decision?
5. Red flags ignored?
6. Prevention?

### Information Quality Issue (quick)
1. What's wrong + where (file:line)?
2. What should it say?
3. Impact + priority?
4. Bug report ready?

### 4. Tool and Skill Performance Analysis

Evaluate effectiveness of tools and skills loaded:

#### Skills Loaded

For each skill: Relevance (✅/⚠️/❌) | Accuracy (✅/⚠️/❌) | Completeness (✅/⚠️/❌) | Usage (✅/⚠️/❌)
- ❌ issues = file bugs or note gaps

#### Documents Fetched

For each document: Usefulness (✅/⚠️/❌) | Accuracy (✅/⚠️/❌) | Right source? (✅/⚠️/❌)

#### Tool Usage Patterns

Analyze tool usage for inefficiencies:

**Redundant Operations**:
- Did you read the same file multiple times?
- Did you run the same command repeatedly?
- Did you search for the same thing twice?

**Sequential Operations That Could Be Parallel**:
- Did you read files one at a time when you could read them in parallel?
- Did you run independent commands sequentially?
- Did you create issues one by one instead of in parallel?

**Wrong Tool Choices**:
- Did you use bash when a specialized tool exists?
- Did you use task tool when direct tool would be faster?
- Did you use grep when you knew the file path?

**Tool Failures**:
- List every tool failure
- For each: root cause analysis (see framework above)
- For each: how to prevent in future

### 5. Process and Workflow Failures

Analyze the workflow for problems:

#### Planning Failures
- **No plan**: Started work without planning
- **Wrong plan**: Plan was logically flawed
- **Incomplete plan**: Missed requirements or edge cases
- **Ignored plan**: Made plan but didn't follow it

#### Execution Failures
- **Wrong order**: Did steps in inefficient order
- **Missed parallelization**: Could have done things concurrently
- **Unnecessary work**: Did work that wasn't needed
- **Incomplete work**: Left TODOs or partial implementations

#### Communication Failures
- **Assumptions instead of questions**: Made assumptions when could have asked
- **Unclear explanations**: User had to ask for clarification
- **Missing status updates**: User didn't know what you were doing
- **Wrong tone**: Too verbose, too terse, or inappropriate for context

### 6. Recommendations (Actionable Only)

Every recommendation must be:
- **Specific**: Not "improve docs" but "add section 3.2 with git amend safety rules"
- **Actionable**: Someone can implement it immediately
- **Prioritized**: Critical > High > Medium > Low based on impact and frequency

#### Category 1 Fixes: Wrong Information (CRITICAL - File Bugs)

Format bug reports:
```
BUG: [issue] | LOCATION: [path:line] | CURRENT: [text] | SHOULD BE: [text] | PRIORITY: [level]
```

#### Category 2 Fixes: Workflow Improvements

Format workflow fixes:
```
WORKFLOW: [issue] | ROOT CAUSE: [why] | FIX: [process change] | TRIGGER: [when]
```

#### Category 3 Fixes: Gap Filling (Evaluate Each)

Format gap analysis:
```
GAP: [missing info] | FREQ/DIFFICULTY/RISK: [H/M/L] | RECOMMENDATION: [action]
```

## Output Format

Structure your reflection as a compact issue list:

```markdown
# Session Issues

**Session**: [brief task description]
**Outcome**: [success/partial/failure]

| # | Sev | Type | Location | Issue | Action |
|---|-----|------|----------|-------|--------|
| 1 | CRIT | Wrong Info | path/file.md:45 | [~50 char description] | Fix: [what to change] |
| 2 | HIGH | Workflow | - | [~50 char description] | Process: [change needed] |
| 3 | MED | Gap | - | [~50 char description] | Consider: [recommendation] |

## Details (if asked)

Expand any issue with "detail #N" - keep main output scannable.
```

### Column Guide

| Column | Values | Notes |
|--------|--------|-------|
| Sev | CRIT/HIGH/MED/LOW | CRIT=blocks work, HIGH=repeated failures, MED=inefficiency, LOW=minor |
| Type | Wrong Info / Workflow / Gap / Tool Fail | Maps to Category 1/2/3 + tool failures |
| Location | path:line or "-" | Where the problem is (if applicable) |
| Issue | Max ~50 chars | What's wrong - be specific |
| Action | Fix/Process/Consider | What to do about it |

### Severity Guide
- **CRIT**: Wrong info in skills/docs causing failures - file bug immediately
- **HIGH**: Repeated workflow issues or significant rework needed
- **MED**: Inefficiencies, minor gaps
- **LOW**: Nice-to-have improvements

### Type Mapping
- **Wrong Info** = Category 1 (bugs to file)
- **Workflow** = Category 2 (process issues)
- **Gap** = Category 3 (missing info to evaluate)
- **Tool Fail** = Tool errors with root cause

### Good Examples

```
| 1 | CRIT | Wrong Info | skills/pdf-editor:45 | Recommends pdf-lib for reading (should be pdf-parse) | Fix: distinguish read vs edit |
| 2 | HIGH | Workflow | - | Didn't check git status before amend | Process: always check before amend |
| 3 | MED | Gap | - | No Node.js auth library guidance | Consider: create node-auth skill |
| 4 | LOW | Tool Fail | - | Used cd && instead of workdir param | Process: check tool params first |
```

### Bad Examples (too vague)
```
| 1 | HIGH | Wrong Info | somewhere | Skill was wrong | Fix: make it better |
```

## Important Guidelines

1. **Compact output, thorough analysis**: Use the templates above internally, but OUTPUT only the issue table
2. **Be specific**: "skills/pdf-editor:45 - recommends pdf-lib for reading" not "skill was wrong"
3. **Root causes, not symptoms**: Trace to WHY - wrong info? didn't check? doesn't exist?
4. **CRIT = file bug now**: Wrong info in skills/docs is a defect - don't just note it, fix it
5. **One line per issue**: If you can't fit it in ~50 chars, you haven't found the core problem yet

## Analysis Techniques

### Conversation Audit
1. Read entire conversation from start
2. Mark every point where you:
   - Got an error
   - Got corrected by user
   - Had to redo work
   - Made an assumption that was wrong
   - Chose wrong approach
3. For each mark, ask "why did this happen?"

### Tool Audit
1. List every tool invocation
2. For each failed tool call: full root cause analysis
3. For successful calls: could it have been avoided/optimized?
4. Identify patterns: same file read 3x, sequential ops that could be parallel

### Information Audit (Most Important)
1. List all skills loaded: mark which were actually used
2. List all information in context: mark what was ignored
3. For each failure: which category? (wrong info / didn't use / missing)
4. For Category 1: prepare bug reports
5. For Category 2: identify why info wasn't used
6. For Category 3: evaluate if gap should be filled

### Decision Audit
1. List all significant decisions made
2. For each: what information informed it?
3. For wrong decisions: what information was wrong/missing/unused?
4. For right decisions: was it luck or good process?

## Concrete Example: Real Failure Analysis

### Example Session
User asked to "implement file upload with progress tracking". You implemented using synchronous fs.writeFile, causing browser to hang on large files.

### Compact Output (What You Deliver)

```markdown
# Session Issues

**Session**: Implement file upload with progress tracking
**Outcome**: partial (rewrote after hang on large files)

| # | Sev | Type | Location | Issue | Action |
|---|-----|------|----------|-------|--------|
| 1 | HIGH | Workflow | - | Used fs.writeFile without asking about file sizes | Process: ask scale before I/O ops |
| 2 | MED | Gap | - | No Node.js file upload guidance exists | Consider: create file-upload skill |

## Details (if asked)

**#1**: Implemented sync file upload, worked for small test files, hung on user's 50MB video. Should have asked "what file sizes?" before choosing approach. Root cause: no I/O checklist trigger.

**#2**: Common task (high freq) + easy to get wrong (high risk) + security implications = worth creating skill. Content: streaming vs buffering, multer/busboy/formidable, progress tracking, file validation.
```

### Internal Analysis (How You Got There)

Used Wrong Decision Analysis template internally:
- Decision: fs.writeFile for uploads (wrong)
- Should have: streaming approach
- Info issue: Category 2 (didn't research) + Category 3 (no skill exists)
- Red flags ignored: "large files" implies streaming needed
- Prevention: I/O checklist + file-upload skill

## Self-Reflection Meta-Analysis

After completing a reflection, verify quality:

- ✅ Started with failures, not successes
- ✅ Completed three-category information audit
- ✅ Root causes identified, not just symptoms
- ✅ Category 1 issues formatted as bug reports
- ✅ Category 2 issues include process fixes
- ✅ Category 3 gaps evaluated with decision rationale
- ✅ Every recommendation is specific and actionable
- ✅ Recommendations prioritized by impact
- ✅ Patterns identified across multiple failures
- ✅ Meta-reflection completed

If any ❌, the reflection is incomplete. Redo it.

The goal is ruthless honesty in service of continuous improvement.
