#!/usr/bin/env python3
"""
Verify that a validation report was generated correctly.

This script checks that a VALIDATION-REPORT.md file exists at the correct
location and contains all required sections and metadata.

Usage:
    python3 verify_validation_report.py <path-to-validation-dir>
    python3 verify_validation_report.py <skill-name>

Arguments:
    path    Path to validation directory (e.g., dt-skill-validation/dt-app-dashboard/2026-01-29-124808/)
            OR skill name (e.g., dt-app-dashboard) to check latest validation

Options:
    --json    Output results as JSON

Exit codes:
    0 = Valid report
    1 = Missing or malformed report
    2 = Report location is incorrect

Example:
    python3 verify_validation_report.py dt-skill-validation/dt-app-dashboard/2026-01-29-124808/
    python3 verify_validation_report.py dt-app-dashboard
    python3 verify_validation_report.py dt-app-dashboard --json
"""

import os
import sys
import argparse
import json
import re
from pathlib import Path


REQUIRED_SECTIONS = [
    "## Iteration Context",
    "## Summary",
    "## DQL Query Validation",
    "## dtctl Command Validation",
    "## Resource Validation",
    "## Runtime Recommendations",
    "## Feedback Loop Actions",
    "## Overall Status:",
]

REQUIRED_METADATA = [
    "**Date**:",
    "**Validator**:",
    "**Tenant**:",
    "**Environment**:",
    "**Safety Level**:",
]


def find_repo_root():
    """Find the git repository root."""
    current_dir = Path.cwd()
    repo_root = current_dir
    while not (repo_root / ".git").exists():
        if repo_root.parent == repo_root:
            return None
        repo_root = repo_root.parent
    return repo_root


def find_latest_validation(skill_name, repo_root):
    """Find the latest validation run for a skill."""
    validation_base = repo_root / "dt-skill-validation" / skill_name

    if not validation_base.exists():
        return None

    # Find all timestamped directories
    runs = [
        d
        for d in validation_base.iterdir()
        if d.is_dir() and re.match(r"\d{4}-\d{2}-\d{2}-\d{6}", d.name)
    ]

    if not runs:
        return None

    # Sort by name (timestamp format sorts correctly)
    latest = sorted(runs, key=lambda x: x.name, reverse=True)[0]
    return latest


def verify_report_location(report_path, repo_root):
    """Verify the report is in the correct location."""
    try:
        rel_path = report_path.relative_to(repo_root)
    except ValueError:
        return False, "Report is not inside the repository"

    # Check if path starts with dt-skill-validation/
    parts = rel_path.parts
    if len(parts) < 4:
        return False, f"Invalid path structure: {rel_path}"

    if parts[0] != "dt-skill-validation":
        return (
            False,
            f"Report must be in dt-skill-validation/ directory (found: {parts[0]}/)",
        )

    # Check skill name format (dt-*)
    skill_name = parts[1]
    if not skill_name.startswith("dt-"):
        return False, f"Skill name must start with 'dt-' (found: {skill_name})"

    # Check timestamp format (YYYY-MM-DD-HHMMSS)
    timestamp = parts[2]
    if not re.match(r"\d{4}-\d{2}-\d{2}-\d{6}", timestamp):
        return (
            False,
            f"Invalid timestamp format: {timestamp} (expected: YYYY-MM-DD-HHMMSS)",
        )

    # Check filename
    if parts[3] != "VALIDATION-REPORT.md":
        return (
            False,
            f"Report filename must be exactly 'VALIDATION-REPORT.md' (found: {parts[3]})",
        )

    return True, "Report location is correct"


def verify_report_content(report_path):
    """Verify the report contains required sections and metadata."""
    issues = []

    try:
        with open(report_path, "r") as f:
            content = f.read()
    except Exception as e:
        return False, [f"Failed to read report: {e}"]

    # Check required sections
    for section in REQUIRED_SECTIONS:
        if section not in content:
            issues.append(f"Missing required section: {section}")

    # Check required metadata
    for metadata in REQUIRED_METADATA:
        if metadata not in content:
            issues.append(f"Missing required metadata: {metadata}")

    # Check if metadata fields are filled (not just placeholders)
    placeholder_pattern = r"<[^>]+>"
    for metadata in REQUIRED_METADATA:
        if metadata in content:
            # Extract the line containing this metadata
            for line in content.split("\n"):
                if metadata in line:
                    # Check if it still has placeholder tags like <name> or <url>
                    if re.search(placeholder_pattern, line):
                        issues.append(
                            f"Metadata not filled: {metadata} (still has placeholder values)"
                        )
                    break

    # Check if summary table has values (not all zeros or placeholders)
    if "## Summary" in content:
        summary_section = content.split("## Summary")[1].split("##")[0]
        # Look for the Total row
        if "**Total**" in summary_section:
            total_line = [
                line for line in summary_section.split("\n") if "**Total**" in line
            ]
            if total_line:
                # Check if it's still "0 | 0 | 0" or has X placeholders
                if (
                    "| **0** | **0** | **0** |" in total_line[0]
                    or "| **X** | **X**" in total_line[0]
                ):
                    issues.append(
                        "Summary table not filled: Total row still has placeholder values"
                    )

    # Check overall status
    if "## Overall Status:" in content:
        status_section = (
            content.split("## Overall Status:")[1].strip().split("\n")[0].strip()
        )
        if status_section == "PENDING":
            issues.append("Overall Status is still PENDING - validation not complete")
        elif status_section not in ["PASS", "FAIL"]:
            issues.append(
                f"Overall Status must be PASS or FAIL (found: {status_section})"
            )

    return len(issues) == 0, issues


def main():
    parser = argparse.ArgumentParser(
        description="Verify validation report is correctly generated"
    )
    parser.add_argument(
        "path",
        help="Path to validation directory or skill name",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results as JSON",
    )

    args = parser.parse_args()

    # Find repo root
    repo_root = find_repo_root()
    if not repo_root:
        print("Error: Not in a git repository", file=sys.stderr)
        sys.exit(1)

    # Determine if path is a skill name or directory path
    input_path = Path(args.path)

    if input_path.exists() and input_path.is_dir():
        # It's a directory path
        validation_dir = input_path
    elif input_path.name.startswith("dt-"):
        # It's a skill name - find latest validation
        validation_dir = find_latest_validation(input_path.name, repo_root)
        if not validation_dir:
            result = {
                "valid": False,
                "errors": [f"No validation runs found for skill: {input_path.name}"],
            }
            if args.json:
                print(json.dumps(result, indent=2))
            else:
                print(
                    f"❌ No validation runs found for skill: {input_path.name}",
                    file=sys.stderr,
                )
            sys.exit(1)
    else:
        result = {
            "valid": False,
            "errors": [f"Invalid path or skill name: {args.path}"],
        }
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print(f"❌ Invalid path or skill name: {args.path}", file=sys.stderr)
        sys.exit(1)

    # Check for VALIDATION-REPORT.md
    report_path = validation_dir / "VALIDATION-REPORT.md"

    result = {
        "valid": True,
        "report_path": str(report_path.relative_to(repo_root)),
        "errors": [],
        "warnings": [],
    }

    # Check if report exists
    if not report_path.exists():
        result["valid"] = False
        result["errors"].append(
            f"VALIDATION-REPORT.md not found in {validation_dir.relative_to(repo_root)}"
        )

        if args.json:
            print(json.dumps(result, indent=2))
        else:
            print(
                f"❌ VALIDATION-REPORT.md not found in {validation_dir.relative_to(repo_root)}",
                file=sys.stderr,
            )
        sys.exit(1)

    # Verify location
    location_valid, location_msg = verify_report_location(report_path, repo_root)
    if not location_valid:
        result["valid"] = False
        result["errors"].append(location_msg)

    # Verify content
    content_valid, content_issues = verify_report_content(report_path)
    if not content_valid:
        result["valid"] = False
        result["errors"].extend(content_issues)

    # Output results
    if args.json:
        print(json.dumps(result, indent=2))
    else:
        if result["valid"]:
            print(
                f"✅ Validation report is valid: {report_path.relative_to(repo_root)}"
            )
        else:
            print(
                f"❌ Validation report has issues: {report_path.relative_to(repo_root)}"
            )
            print("\nErrors found:")
            for error in result["errors"]:
                print(f"  - {error}")

    sys.exit(0 if result["valid"] else 1)


if __name__ == "__main__":
    main()
