#!/usr/bin/env python3
"""
Extract all DQL queries from a dt- skill for validation.

This script helps agents and users find ALL DQL queries in a skill so they can be
validated individually. It searches for dtctl query commands and DQL code blocks.

Usage:
    python3 extract_dql_queries.py <skill-path>
    python3 extract_dql_queries.py <skill-path> --json

Examples:
    python3 extract_dql_queries.py ../../../skills/dynatrace-control
    python3 extract_dql_queries.py ../../../skills/my-skill --json
"""

import argparse
import json
import re
import sys
from pathlib import Path


def extract_queries_from_file(file_path):
    """Extract DQL queries from a single file."""
    queries = []

    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}", file=sys.stderr)
        return queries

    # Pattern 1: dtctl query "..." commands
    # Matches: dtctl query "fetch logs | filter status == 'ERROR'" --plain
    dtctl_pattern = r'dtctl\s+query\s+"([^"]+)"'
    for match in re.finditer(dtctl_pattern, content):
        query_text = match.group(1)
        # Get line number
        line_num = content[: match.start()].count("\n") + 1
        queries.append(
            {
                "file": str(file_path),
                "line": line_num,
                "query": query_text,
                "type": "dtctl_command",
            }
        )

    # Pattern 2: dtctl query '...' commands (single quotes)
    dtctl_pattern_single = r"dtctl\s+query\s+'([^']+)'"
    for match in re.finditer(dtctl_pattern_single, content):
        query_text = match.group(1)
        line_num = content[: match.start()].count("\n") + 1
        queries.append(
            {
                "file": str(file_path),
                "line": line_num,
                "query": query_text,
                "type": "dtctl_command",
            }
        )

    # Pattern 3: DQL code blocks (```dql ... ```)
    dql_block_pattern = r"```dql\s*\n(.*?)\n```"
    for match in re.finditer(dql_block_pattern, content, re.DOTALL):
        query_text = match.group(1).strip()
        line_num = content[: match.start()].count("\n") + 1
        queries.append(
            {
                "file": str(file_path),
                "line": line_num,
                "query": query_text,
                "type": "dql_code_block",
            }
        )

    return queries


def extract_queries_from_skill(skill_path):
    """Extract all DQL queries from a skill directory."""
    skill_path = Path(skill_path)

    if not skill_path.exists():
        print(f"Error: Skill path does not exist: {skill_path}", file=sys.stderr)
        sys.exit(1)

    if not skill_path.is_dir():
        print(f"Error: Skill path is not a directory: {skill_path}", file=sys.stderr)
        sys.exit(1)

    all_queries = []

    # Search in SKILL.md
    skill_md = skill_path / "SKILL.md"
    if skill_md.exists():
        queries = extract_queries_from_file(skill_md)
        all_queries.extend(queries)

    # Search in references/ directory
    references_dir = skill_path / "references"
    if references_dir.exists() and references_dir.is_dir():
        for md_file in references_dir.glob("*.md"):
            queries = extract_queries_from_file(md_file)
            all_queries.extend(queries)

    return all_queries


def format_query_preview(query, max_length=60):
    """Format query text for display, truncating if needed."""
    # Replace newlines with spaces for inline display
    preview = query.replace("\n", " ").strip()
    # Collapse multiple spaces
    preview = re.sub(r"\s+", " ", preview)
    if len(preview) > max_length:
        preview = preview[: max_length - 3] + "..."
    return preview


def print_queries_human(queries, skill_path):
    """Print queries in human-readable format."""
    print(f"\n=== DQL Queries Found in {Path(skill_path).name} ===\n")

    if not queries:
        print("No DQL queries found.")
        return

    print(f"Total queries found: {len(queries)}\n")

    for i, query in enumerate(queries, 1):
        rel_path = Path(query["file"]).relative_to(Path(skill_path).parent)
        print(f"Query {i}:")
        print(f"  File: {rel_path}:{query['line']}")
        print(f"  Type: {query['type']}")
        print(f"  Preview: {format_query_preview(query['query'])}")
        print(f"  Full Query:")
        # Indent full query
        for line in query["query"].split("\n"):
            print(f"    {line}")
        print()


def print_queries_json(queries):
    """Print queries in JSON format."""
    output = {"total_queries": len(queries), "queries": queries}
    print(json.dumps(output, indent=2))


def main():
    parser = argparse.ArgumentParser(
        description="Extract DQL queries from a dt- skill for validation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 extract_dql_queries.py ../../../skills/dynatrace-control
  python3 extract_dql_queries.py ../../../skills/my-skill --json
        """,
    )
    parser.add_argument("skill_path", help="Path to skill directory")
    parser.add_argument(
        "--json", action="store_true", help="Output in JSON format for parsing"
    )

    args = parser.parse_args()

    # Extract queries
    queries = extract_queries_from_skill(args.skill_path)

    # Output results
    if args.json:
        print_queries_json(queries)
    else:
        print_queries_human(queries, args.skill_path)

    # Exit with error code if no queries found (for automation)
    sys.exit(0 if queries else 0)  # Always exit 0, just inform user


if __name__ == "__main__":
    main()
