# Root Cause Analysis Templates

These templates guide thorough internal analysis. Use them to investigate failures systematically, then output the compact table format from SKILL.md.

## Template: Tool Failure Analysis

Use this when a tool call fails, produces wrong results, or behaves unexpectedly.

```
TOOL FAILURE ANALYSIS
=====================

1. What tool was used?
   Tool name: _______________
   Tool parameters: _______________

2. What was the input?
   Command/parameters: _______________
   Context/preconditions: _______________

3. What was the expected output?
   Expected result: _______________
   Why you expected this: _______________

4. What was the actual output/error?
   Actual result: _______________
   Error message (if any): _______________

5. Why did it fail?
   Root cause category:
   [ ] Wrong input - I provided incorrect parameters/data
   [ ] Tool bug - Tool has a defect or limitation
   [ ] Environment - System state, permissions, dependencies
   [ ] Misunderstood tool - I used it wrong based on wrong understanding

   Detailed explanation: _______________

6. What information would have prevented this?
   [ ] Better tool documentation (what specifically?)
   [ ] Checking state before calling (what state?)
   [ ] Reading error messages more carefully
   [ ] Testing with simpler input first
   [ ] Consulting examples before using
   [ ] Other: _______________

7. Information category?
   [ ] Category 1: Wrong information in docs/skills (file bug)
   [ ] Category 2: Information existed but not used (workflow fix)
   [ ] Category 3: Information missing (evaluate gap)

8. Prevention action:
   _______________
```

### Example - Filled Template

```
TOOL FAILURE ANALYSIS
=====================

1. What tool was used?
   Tool name: bash
   Tool parameters: command="cd /foo && ls"

2. What was the input?
   Command/parameters: cd /foo && ls
   Context/preconditions: Wanted to list files in /foo directory

3. What was the expected output?
   Expected result: File listing from /foo directory
   Why you expected this: Standard shell pattern for changing directory

4. What was the actual output/error?
   Actual result: Worked but violated best practice
   Error message (if any): None - but bash tool docs say to avoid this

5. Why did it fail?
   Root cause category:
   [X] Wrong input - I provided incorrect parameters/data
   [ ] Tool bug - Tool has a defect or limitation
   [ ] Environment - System state, permissions, dependencies
   [X] Misunderstood tool - I used it wrong based on wrong understanding

   Detailed explanation: Bash tool has workdir parameter specifically for this.
   Using cd && is a shell pattern but not the tool's intended interface.

6. What information would have prevented this?
   [ ] Better tool documentation (what specifically?)
   [X] Checking state before calling - Should have read tool description
   [ ] Reading error messages more carefully
   [ ] Testing with simpler input first
   [X] Consulting examples before using - Tool docs show workdir param
   [ ] Other: _______________

7. Information category?
   [ ] Category 1: Wrong information in docs/skills (file bug)
   [X] Category 2: Information existed but not used (workflow fix)
   [ ] Category 3: Information missing (evaluate gap)

8. Prevention action:
   Always review tool parameters before using. For directory operations,
   check if tool has workdir/cwd parameter instead of using shell cd.
```

## Template: Wrong Decision Analysis

Use this when you chose the wrong approach, library, architecture, or solution.

```
WRONG DECISION ANALYSIS
=======================

1. What decision was made?
   Decision: _______________
   When: _______________ (at what point in session)
   Alternatives considered: _______________

2. What information led to this decision?
   Sources consulted: _______________
   Key factors in decision: _______________
   Assumptions made: _______________

3. Was the information:
   [ ] Wrong - Information was factually incorrect
   [ ] Incomplete - Missing critical details
   [ ] Misinterpreted - Information was right but I understood it wrong
   [ ] Missing - No information available, had to guess

   Explain: _______________

4. What was the correct decision?
   Should have chosen: _______________
   Why this is better: _______________
   How/when discovered it was wrong: _______________

5. What information/process would have led to correct decision?
   [ ] Ask user clarifying question: _______________
   [ ] Research before deciding: _______________
   [ ] Consult documentation: _______________
   [ ] Check for existing patterns/libraries: _______________
   [ ] Propose options to user instead of choosing: _______________
   [ ] Other: _______________

6. Information category?
   [ ] Category 1: Wrong information (file bug - which source?)
   [ ] Category 2: Didn't use available info (workflow fix - what missed?)
   [ ] Category 3: Information gap (evaluate - should doc exist?)

7. Red flags ignored?
   Were there warning signs?
   [ ] User's wording suggested different approach
   [ ] Common pattern for this problem exists
   [ ] Security/performance implications not considered
   [ ] Reinventing wheel instead of using library
   [ ] Other: _______________

8. Prevention strategy:
   Process change: _______________
   Question to always ask: _______________
   Research to always do: _______________
```

### Example - Filled Template

```
WRONG DECISION ANALYSIS
=======================

1. What decision was made?
   Decision: Implement JWT authentication from scratch
   When: After user said "add authentication"
   Alternatives considered: None - jumped straight to implementation

2. What information led to this decision?
   Sources consulted: None - used existing JWT knowledge
   Key factors in decision: Knew how JWT works, seemed straightforward
   Assumptions made: User wants custom implementation

3. Was the information:
   [ ] Wrong - Information was factually incorrect
   [X] Incomplete - Missing critical details
   [ ] Misinterpreted - Information was right but I understood it wrong
   [X] Missing - No information available, had to guess

   Explain: No guidance on Node.js auth libraries. Didn't know if user
   preferred specific library. Didn't consider that established libraries
   are better for security-critical features.

4. What was the correct decision?
   Should have chosen: Use passport.js or similar established library
   Why this is better: Battle-tested, secure, handles edge cases, faster
   How/when discovered it was wrong: User said "just use passport"

5. What information/process would have led to correct decision?
   [X] Ask user clarifying question: "Do you have a preferred auth library?"
   [X] Research before deciding: "Node.js authentication best practices"
   [ ] Consult documentation: _______________
   [X] Check for existing patterns/libraries: Should have searched npm
   [X] Propose options to user instead of choosing: "passport vs custom?"
   [ ] Other: _______________

6. Information category?
   [ ] Category 1: Wrong information (file bug - which source?)
   [X] Category 2: Didn't use available info (workflow fix - should have asked)
   [X] Category 3: Information gap (evaluate - Node.js auth skill?)

7. Red flags ignored?
   Were there warning signs?
   [ ] User's wording suggested different approach
   [X] Common pattern for this problem exists - Auth is solved problem
   [X] Security/performance implications not considered - Security critical!
   [X] Reinventing wheel instead of using library - Classic mistake
   [ ] Other: _______________

8. Prevention strategy:
   Process change: For security features, ALWAYS ask about libraries first
   Question to always ask: "This is security-critical - library preference?"
   Research to always do: "[tech] [feature] established libraries" search
   Rule: Never implement crypto/auth from scratch without explicit user request
```

## Template: Information Quality Issue

Use this when you discover wrong, outdated, or misleading information in skills, docs, or prompts.

```
INFORMATION QUALITY ISSUE
=========================

1. What information was wrong/outdated?
   Exact quote: "_______________"
   Paraphrase: _______________

2. Where was it located?
   Source type: [ ] Skill [ ] Agent prompt [ ] Documentation [ ] Other
   Skill name: _______________
   File path: _______________
   Section: _______________
   Line number (if known): _______________

3. What is the correct information?
   Should say: "_______________"
   Why this is correct: _______________
   Source of correct info: _______________

4. Impact: How did this affect the session?
   [ ] Caused tool failure
   [ ] Led to wrong decision
   [ ] Wasted time/effort
   [ ] Required rework
   [ ] Caused user confusion
   [ ] Other: _______________

   Specific impact: _______________
   Time/effort cost: _______________

5. Priority: CRITICAL (must fix) vs LOW (minor)
   [ ] CRITICAL - Blocks work or causes major failures
   [ ] HIGH - Causes repeated failures or significant rework
   [ ] MEDIUM - Causes inefficiency or extra effort
   [ ] LOW - Minor issue, rare impact

   Priority justification: _______________

6. Recommended fix:
   [ ] Replace text: Change "___" to "___"
   [ ] Add clarification: Add note explaining "___"
   [ ] Add example: Show example of "___"
   [ ] Remove section: Section is obsolete/wrong
   [ ] Restructure: Move/reorganize to "___"

   Specific change needed: _______________

7. Related issues?
   Are there similar problems in other locations?
   [ ] Yes - list: _______________
   [ ] No - isolated issue
   [ ] Unknown - should audit for similar issues

8. Bug report ready?
   [ ] Yes - format as bug and file
   [ ] No - needs more investigation: _______________
```

### Example - Filled Template

```
INFORMATION QUALITY ISSUE
=========================

1. What information was wrong/outdated?
   Exact quote: "Use pdf-lib for PDF operations"
   Paraphrase: Skill recommends pdf-lib for all PDF work

2. Where was it located?
   Source type: [X] Skill [ ] Agent prompt [ ] Documentation [ ] Other
   Skill name: pdf-editor
   File path: src/skills/pdf-editor/SKILL.md
   Section: "Getting Started"
   Line number (if known): 45

3. What is the correct information?
   Should say: "Use pdf-parse for reading PDFs, pdf-lib for editing/creating"
   Why this is correct: pdf-parse is faster and simpler for read-only operations
   Source of correct info: npm package docs, performance testing

4. Impact: How did this affect the session?
   [X] Caused tool failure - pdf-lib was overkill
   [X] Led to wrong decision - Chose wrong library
   [X] Wasted time/effort - Had to switch libraries
   [ ] Required rework
   [ ] Caused user confusion
   [ ] Other: _______________

   Specific impact: Installed pdf-lib, wrote parsing code, then switched to
   pdf-parse when realized it was better suited. 15 minutes wasted.
   Time/effort cost: ~15 minutes + frustration

5. Priority: CRITICAL (must fix) vs LOW (minor)
   [ ] CRITICAL - Blocks work or causes major failures
   [X] HIGH - Causes repeated failures or significant rework
   [ ] MEDIUM - Causes inefficiency or extra effort
   [ ] LOW - Minor issue, rare impact

   Priority justification: PDF reading is common operation. Wrong library
   choice causes wasted effort every time. High frequency = high priority.

6. Recommended fix:
   [X] Replace text: Change "Use pdf-lib for PDF operations" to version below
   [X] Add clarification: Explain when to use each library
   [ ] Add example: Show example of "___"
   [ ] Remove section: Section is obsolete/wrong
   [ ] Restructure: Move/reorganize to "___"

   Specific change needed:
   "Use pdf-parse for reading/extracting text from PDFs (faster, simpler).
   Use pdf-lib for creating or editing PDFs (more features, heavier).
   For read-only operations, always prefer pdf-parse."

7. Related issues?
   Are there similar problems in other locations?
   [X] Yes - list: Should audit all skills that recommend single libraries
   [ ] No - isolated issue
   [ ] Unknown - should audit for similar issues

8. Bug report ready?
   [X] Yes - format as bug and file
   [ ] No - needs more investigation: _______________

BUG REPORT:
-----------
TITLE: pdf-editor skill recommends wrong library for read operations
LOCATION: src/skills/pdf-editor/SKILL.md, line 45
CURRENT: "Use pdf-lib for PDF operations"
SHOULD BE: "Use pdf-parse for reading, pdf-lib for editing/creating"
IMPACT: Causes wrong library selection for read-only PDF operations
PRIORITY: High (common operation, causes wasted effort)
```

## Root Cause Framework for Tool Failures

When a tool call fails or produces wrong results:

**Level 1: What failed?**
- Which tool? (bash, read, edit, etc.)
- What was the error message?
- What did you expect vs. what happened?

**Level 2: Why did you call it that way?**
- What information did you base your decision on?
- What assumptions did you make?
- Did you check documentation/examples first?

**Level 3: What should have prevented this?**
- Should you have known better? (information available but not used)
- Should the system have known better? (wrong information in context)
- Could the tool have failed more gracefully? (tool design issue)

**Level 4: How to prevent recurrence?**
- Skill update needed? (add guidance)
- Process change needed? (add verification step)
- Tool change needed? (better error messages, validation)

### Example Root Cause Analysis - Tool Failure

```
FAILURE: bash("cd /foo && ls") instead of bash("ls", workdir="/foo")

L1 - What failed:
  - Bash tool with cd && pattern
  - Still worked but violated best practice
  
L2 - Why called that way:
  - Didn't check bash tool documentation
  - Used common shell pattern instead of tool-specific parameter
  
L3 - What should have prevented:
  - Bash tool description explicitly says "AVOID using `cd <directory> && <command>`"
  - Information was available in tool description
  - Category 2: Information not used (workflow issue)
  
L4 - How to prevent:
  - Process: Always review tool parameters before using
  - Pattern: When changing directory is needed, check if tool has workdir parameter
  - Reminder: Tool APIs often differ from raw CLI usage
```

## Root Cause Framework for Wrong Decisions

When you chose the wrong approach, library, or architecture:

**Level 1: What decision was wrong?**
- What did you choose?
- What should you have chosen?
- How did you discover it was wrong?

**Level 2: What information led to this decision?**
- What did you know when you decided?
- What sources informed your choice?
- What alternatives did you consider?

**Level 3: What information was missing or wrong?**
- Was there wrong information in your context? (Category 1)
- Was there information you didn't check? (Category 2)
- Was there information that didn't exist? (Category 3)

**Level 4: Decision point analysis**
- Should you have asked clarifying questions?
- Should you have researched more deeply?
- Should you have proposed options to user?
- Were there red flags you ignored?

**Level 5: How to improve decision-making?**
- What information needs to be added/fixed?
- What decision-making process needs to change?
- What questions should always be asked?
- What research should always be done?

### Example Root Cause Analysis - Wrong Decision

```
FAILURE: Built custom auth system instead of using existing library

L1 - What was wrong:
  - Decided to implement JWT auth from scratch
  - Should have used passport.js or similar
  - Discovered when user said "just use passport"
  
L2 - Information at decision time:
  - User said "implement authentication"
  - Didn't specify library or approach
  - No skill guidance on Node.js auth best practices
  
L3 - Information issues:
  - Category 3: Information gap - no Node.js auth skill
  - Category 2: Workflow - could have asked "which auth library?"
  
L4 - Decision point failures:
  - Should have asked: "Do you have a preferred auth library?"
  - Should have researched: "What's the standard approach?"
  - Should have proposed: "I could use passport.js or implement custom - preference?"
  - Red flag ignored: Implementing auth from scratch is rarely right
  
L5 - Prevention:
  - Create Node.js auth skill listing common libraries
  - Process: Always ask about libraries for security-critical features
  - Pattern: For any "implement X" where X is solved problem, ask about existing solutions first
  - Rule: Never implement security features from scratch without explicit user request
```
