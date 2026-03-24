#!/usr/bin/env python3
"""
Create a timestamped validation run directory with a template report.

This script sets up the validation structure for a dt- skill and creates
a pre-filled VALIDATION-REPORT.md template ready for the validator to complete.

Usage:
    python3 create_validation_run.py <skill-name> [--validator <name>]

Arguments:
    skill-name    Name of the skill being validated (e.g., dt-app-dashboard)

Options:
    --validator   Name of the person running validation (default: current user)

Example:
    python3 create_validation_run.py dt-app-dashboard
    python3 create_validation_run.py dt-dql-essentials --validator "Alice"

Output:
    Creates dt-skill-validation/<skill-name>/<timestamp>/VALIDATION-REPORT.md
    Prints the path to the created report file
"""

import os
import sys
import argparse
from datetime import datetime
from pathlib import Path


VALIDATION_REPORT_TEMPLATE = """# Validation Report: {skill_name}

**Date**: {date}
**Validator**: {validator}
**Tenant**: <context-name>
**Environment**: <url>
**Safety Level**: <readwrite-all | readonly>

## Iteration Context

Reference the related `skill-creator` and `skill-validator` artifacts that led to this runtime validation run.

- Skill-creator eval/grading artifacts: <path-or-note>
- Benchmark artifacts: <path-or-note>
- Review viewer / human feedback summary: <path-or-note>
- Skill-validator run summary: <path-or-note>

## Summary

| Category | Tested | Passed | Failed |
|----------|--------|--------|--------|
| DQL Queries | 0 | 0 | 0 |
| dtctl Commands | 0 | 0 | 0 |
| Resources | 0 | 0 | 0 |
| Runtime Recommendations | 0 | N/A | N/A |
| **Total** | **0** | **0** | **0** |

## DQL Query Validation

| Query | Status | Fields Verified | Notes |
|-------|--------|----------------|-------|
| (Add queries here) | PASS/FAIL | field1, field2 | Notes |

**Total Queries Tested**: 0
**Passed**: 0
**Failed**: 0

## dtctl Command Validation

| Command | Status | Notes |
|---------|--------|-------|
| (Add commands here) | PASS/FAIL | Notes |

## Resource Validation

| Resource | Action | Status | Notes |
|----------|--------|--------|-------|
| (Add resources here) | create/test/delete | PASS/FAIL | Notes |

## Runtime Recommendations

Advisory observations that should inform the next `skill-creator` iteration.

| Category | Observation | Suggested Action |
|----------|-------------|------------------|
| Description Alignment | (optional) | (optional) |
| Logical Consistency | (optional) | (optional) |
| Routing Model | (optional) | (optional) |

## Feedback Loop Actions

List concrete next actions based on runtime results and recommendation notes.

- [ ] <action for next skill-creator iteration>
- [ ] <action for next skill-creator iteration>

## Overall Status: PENDING
"""


def main():
    parser = argparse.ArgumentParser(
        description="Create timestamped validation run directory with template report"
    )
    parser.add_argument("skill_name", help="Name of the skill being validated")
    parser.add_argument(
        "--validator",
        help="Name of the validator (default: current user)",
        default=os.environ.get("USER", "unknown"),
    )

    args = parser.parse_args()

    # Validate skill name format
    skill_name = args.skill_name
    if not skill_name.startswith("dt-"):
        print(
            f"Error: Skill name must start with 'dt-' (got: {skill_name})",
            file=sys.stderr,
        )
        sys.exit(1)

    # Find repo root (look for .git directory)
    current_dir = Path.cwd()
    repo_root = current_dir
    while not (repo_root / ".git").exists():
        if repo_root.parent == repo_root:
            print("Error: Not in a git repository", file=sys.stderr)
            sys.exit(1)
        repo_root = repo_root.parent

    # Create timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d-%H%M%S")

    # Create validation directory structure
    validation_dir = repo_root / "dt-skill-validation" / skill_name / timestamp
    validation_dir.mkdir(parents=True, exist_ok=True)

    # Create report file
    report_path = validation_dir / "VALIDATION-REPORT.md"

    # Fill template
    report_content = VALIDATION_REPORT_TEMPLATE.format(
        skill_name=skill_name,
        date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        validator=args.validator,
    )

    # Write report
    with open(report_path, "w") as f:
        f.write(report_content)

    print(
        f"✅ Created validation run directory: {validation_dir.relative_to(repo_root)}"
    )
    print(f"✅ Created report template: {report_path.relative_to(repo_root)}")
    print()
    print(f"Report path: {report_path.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
