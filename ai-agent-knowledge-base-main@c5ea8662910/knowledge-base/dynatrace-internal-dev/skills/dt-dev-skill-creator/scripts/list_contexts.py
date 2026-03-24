#!/usr/bin/env python3
"""
List dtctl contexts and return structured data.

This helper script parses the output of `dtctl config get-contexts` and returns
structured JSON data for use in tenant selection workflows.

Usage:
    python3 list_contexts.py [--json]

Options:
    --json    Output as JSON (default: pretty print for humans)

Output (JSON):
    {
        "current": "nrg77339",
        "contexts": [
            {
                "name": "nrg77339",
                "environment": "https://nrg77339.dev.apps.dynatracelabs.com",
                "safety_level": "readwrite-all",
                "is_current": true
            },
            ...
        ]
    }
"""

import subprocess
import sys
import json
import re


def parse_contexts_output(output):
    """
    Parse the output of `dtctl config get-contexts`.

    Expected format:
    CURRENT   NAME       ENVIRONMENT                                   SAFETY-LEVEL
              dre63214   https://dre63214.apps.dynatrace.com           readonly
    *         nrg77339   https://nrg77339.dev.apps.dynatracelabs.com   readwrite-all
    """
    contexts = []
    current_context = None

    lines = output.strip().split("\n")

    # Skip header line
    for line in lines[1:]:
        if not line.strip():
            continue

        # Parse line: CURRENT   NAME   ENVIRONMENT   SAFETY-LEVEL
        # The CURRENT column has '*' for current context
        parts = line.split()
        if len(parts) < 3:
            continue

        # Check if first part is '*' (current context marker)
        is_current = parts[0] == "*"

        # Adjust indices based on whether current marker is present
        if is_current:
            name = parts[1]
            environment = parts[2]
            safety_level = parts[3] if len(parts) > 3 else "unknown"
        else:
            name = parts[0] if parts[0] not in ("", "*") else parts[1]
            environment = parts[1] if parts[0] not in ("", "*") else parts[2]
            safety_level = (
                parts[2]
                if (parts[0] not in ("", "*") and len(parts) > 2)
                else (parts[3] if len(parts) > 3 else "unknown")
            )

        if is_current:
            current_context = name

        contexts.append(
            {
                "name": name,
                "environment": environment,
                "safety_level": safety_level,
                "is_current": is_current,
            }
        )

    return {"current": current_context, "contexts": contexts}


def get_contexts():
    """
    Run `dtctl config get-contexts` and parse the output.

    Returns:
        dict: Structured context data

    Raises:
        RuntimeError: If dtctl command fails
    """
    try:
        result = subprocess.run(
            ["dtctl", "config", "get-contexts"],
            capture_output=True,
            text=True,
            check=True,
        )
        return parse_contexts_output(result.stdout)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Failed to get dtctl contexts: {e.stderr}")
    except FileNotFoundError:
        raise RuntimeError("dtctl command not found. Is dtctl installed and in PATH?")


def print_pretty(data):
    """Print context data in human-readable format."""
    if not data["contexts"]:
        print("No dtctl contexts configured.")
        return

    print(f"\nConfigured dtctl contexts ({len(data['contexts'])} found):\n")

    for ctx in data["contexts"]:
        marker = "→" if ctx["is_current"] else " "
        print(f"{marker} {ctx['name']}")
        print(f"  Environment:  {ctx['environment']}")
        print(f"  Safety Level: {ctx['safety_level']}")
        if ctx["is_current"]:
            print(f"  (CURRENT CONTEXT)")
        print()


def main():
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="List dtctl contexts with structured output"
    )
    parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    try:
        data = get_contexts()

        if args.json:
            print(json.dumps(data, indent=2))
        else:
            print_pretty(data)

        return 0

    except RuntimeError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        print("\nInterrupted", file=sys.stderr)
        return 130


if __name__ == "__main__":
    sys.exit(main())
