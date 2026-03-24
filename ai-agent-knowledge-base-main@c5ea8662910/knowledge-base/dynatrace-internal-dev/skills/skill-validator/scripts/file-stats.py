#!/usr/bin/env python3
"""
File size and metrics validator for skills.

Reports file size metrics (bytes, line count, word count) for every file
in a skill directory and flags warnings/errors based on thresholds.

Categories:
  - SKILL.md: the main skill file (strictest limits)
  - Reference files: any .md under references/
  - Other text files: scripts, other markdown, etc.
  - Binary files: images, PDFs, etc. (size only)

Uses Python 3 stdlib only — no external dependencies.
"""

import sys
import os
import re
import json
import argparse
from pathlib import Path
from typing import List, Tuple, NamedTuple

# ---------------------------------------------------------------------------
# Thresholds
# ---------------------------------------------------------------------------

# (warning_lines, error_lines, warning_words, error_words)
THRESHOLDS_SKILL_MD = (200, 500, 2500, 5000)
THRESHOLDS_REFERENCE = (300, 1000, 5000, 10000)
THRESHOLDS_OTHER = (300, 1000, 5000, 10000)

TOC_LINE_THRESHOLD = 100  # reference files above this need a TOC

THRESHOLD_NOTE = (
    "Thresholds are local early-warning guidance for maintainability, not universal hard caps. "
    "Error thresholds fail this local validator; warning thresholds indicate files to review."
)

# Pattern for internal section links: [text](#anchor) or [text](path#anchor)
TOC_LINK_PATTERN = re.compile(r"\[.*?\]\(.*?#.*?\)")


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------


class FileResult(NamedTuple):
    rel_path: str
    size_bytes: int
    is_binary: bool
    lines: int  # -1 for binary
    words: int  # -1 for binary
    category: str  # "skill_md", "reference", "other", "binary"
    warnings: List[str]
    errors: List[str]


def build_json_payload(skill_root: Path, results: List[FileResult]) -> dict:
    """Build machine-readable summary payload."""
    total = len(results)
    err_count = sum(1 for r in results if r.errors)
    warn_count = sum(1 for r in results if r.warnings and not r.errors)
    pass_count = total - err_count - warn_count

    return {
        "ok": err_count == 0,
        "skill_root": str(skill_root),
        "thresholds": {
            "skill_md": {
                "warning_lines": THRESHOLDS_SKILL_MD[0],
                "error_lines": THRESHOLDS_SKILL_MD[1],
                "warning_words": THRESHOLDS_SKILL_MD[2],
                "error_words": THRESHOLDS_SKILL_MD[3],
            },
            "reference": {
                "warning_lines": THRESHOLDS_REFERENCE[0],
                "error_lines": THRESHOLDS_REFERENCE[1],
                "warning_words": THRESHOLDS_REFERENCE[2],
                "error_words": THRESHOLDS_REFERENCE[3],
            },
            "other": {
                "warning_lines": THRESHOLDS_OTHER[0],
                "error_lines": THRESHOLDS_OTHER[1],
                "warning_words": THRESHOLDS_OTHER[2],
                "error_words": THRESHOLDS_OTHER[3],
            },
            "reference_toc_required_over_lines": TOC_LINE_THRESHOLD,
            "note": THRESHOLD_NOTE,
        },
        "files": [
            {
                "path": r.rel_path,
                "category": r.category,
                "size_bytes": r.size_bytes,
                "is_binary": r.is_binary,
                "lines": r.lines,
                "words": r.words,
                "warnings": r.warnings,
                "errors": r.errors,
            }
            for r in results
        ],
        "summary": {
            "total_files": total,
            "passed_files": pass_count,
            "warning_files": warn_count,
            "error_files": err_count,
        },
    }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def is_hidden(path: Path) -> bool:
    """Return True if any component starts with a dot."""
    return any(part.startswith(".") for part in path.parts)


def classify_file(rel_path: str) -> str:
    """Classify a file into one of the threshold categories."""
    parts = Path(rel_path).parts
    if len(parts) == 1 and parts[0] == "SKILL.md":
        return "skill_md"
    if len(parts) >= 2 and parts[0] == "references" and rel_path.endswith(".md"):
        return "reference"
    return "other"


def read_text_file(file_path: Path) -> Tuple[bool, str]:
    """Try reading a file as UTF-8 text.

    Returns (is_text, content). On decode error returns (False, "").
    """
    try:
        content = file_path.read_text(encoding="utf-8")
        return True, content
    except UnicodeDecodeError:
        return False, ""


def count_words(text: str) -> int:
    """Count words in text."""
    return len(text.split())


def check_toc(content: str) -> bool:
    """Check if the first 100 lines contain internal section links."""
    first_lines = content.splitlines()[:TOC_LINE_THRESHOLD]
    for line in first_lines:
        if TOC_LINK_PATTERN.search(line):
            return True
    return False


def get_thresholds(category: str):
    """Return (warn_lines, err_lines, warn_words, err_words) for category."""
    if category == "skill_md":
        return THRESHOLDS_SKILL_MD
    if category == "reference":
        return THRESHOLDS_REFERENCE
    return THRESHOLDS_OTHER


# ---------------------------------------------------------------------------
# Analysis
# ---------------------------------------------------------------------------


def analyze_file(file_path: Path, skill_root: Path) -> FileResult:
    """Analyze a single file and return its metrics + issues."""
    rel_path = str(file_path.relative_to(skill_root))
    size_bytes = file_path.stat().st_size
    warnings: List[str] = []
    errors: List[str] = []

    is_text, content = read_text_file(file_path)

    if not is_text:
        return FileResult(rel_path, size_bytes, True, -1, -1, "binary", [], [])

    lines = content.count("\n") + (1 if content and not content.endswith("\n") else 0)
    words = count_words(content)
    category = classify_file(rel_path)

    # Apply thresholds
    warn_l, err_l, warn_w, err_w = get_thresholds(category)

    if lines > err_l:
        errors.append(f"Line count {lines} exceeds error threshold ({err_l})")
    elif lines > warn_l:
        warnings.append(f"Line count {lines} exceeds warning threshold ({warn_l})")

    if words > err_w:
        errors.append(f"Word count {words} exceeds error threshold ({err_w})")
    elif words > warn_w:
        warnings.append(f"Word count {words} exceeds warning threshold ({warn_w})")

    # TOC check for reference files > 100 lines
    if category == "reference" and lines > TOC_LINE_THRESHOLD:
        if not check_toc(content):
            warnings.append(
                "Reference file >100 lines should have a table of contents "
                "with links to sections"
            )

    return FileResult(
        rel_path, size_bytes, False, lines, words, category, warnings, errors
    )


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------


def status_icon(result: FileResult) -> str:
    if result.errors:
        return "\u2717"  # ✗
    if result.warnings:
        return "\u26a0"  # ⚠
    return "\u2713"  # ✓


def print_result(result: FileResult, verbose: bool) -> None:
    icon = status_icon(result)
    if result.is_binary:
        line = f"{icon} {result.rel_path}  ({result.size_bytes} bytes, binary)"
    else:
        line = (
            f"{icon} {result.rel_path}  "
            f"({result.size_bytes} bytes, {result.lines} lines, {result.words} words)"
        )

    # Always print files with issues; only print clean files in verbose mode
    if result.errors or result.warnings or verbose:
        print(line)
        for w in result.warnings:
            print(f"    ⚠ {w}")
        for e in result.errors:
            print(f"    ✗ {e}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Report file size metrics for a skill directory"
    )
    parser.add_argument(
        "skill_root",
        nargs="?",
        default=".",
        help="Path to skill root directory (default: current directory)",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Show details for every file, not just those with issues",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output machine-readable JSON results",
    )

    args = parser.parse_args()
    skill_root = Path(args.skill_root).resolve()

    if not skill_root.exists():
        if args.json:
            print(
                json.dumps(
                    {"ok": False, "error": f"Skill root does not exist: {skill_root}"},
                    indent=2,
                )
            )
        else:
            print(f"Error: Skill root does not exist: {skill_root}", file=sys.stderr)
        return 1

    if not skill_root.is_dir():
        if args.json:
            print(
                json.dumps(
                    {"ok": False, "error": f"Not a directory: {skill_root}"}, indent=2
                )
            )
        else:
            print(f"Error: Not a directory: {skill_root}", file=sys.stderr)
        return 1

    # Collect files, skip hidden dirs
    all_files: List[Path] = []
    for dirpath, dirnames, filenames in os.walk(skill_root):
        # Filter out hidden directories and __pycache__ so os.walk skips them
        dirnames[:] = [
            d for d in dirnames if not d.startswith(".") and d != "__pycache__"
        ]
        for fname in filenames:
            if fname.startswith("."):
                continue
            all_files.append(Path(dirpath) / fname)

    all_files.sort()

    if not all_files:
        if args.json:
            print(json.dumps({"ok": False, "error": "No files found"}, indent=2))
        else:
            print("No files found", file=sys.stderr)
        return 1

    if args.verbose:
        print(f"Skill root: {skill_root}")
        print(f"Found {len(all_files)} file(s)\n")

    # Analyze
    results: List[FileResult] = [analyze_file(f, skill_root) for f in all_files]

    if args.json:
        payload = build_json_payload(skill_root, results)
        print(json.dumps(payload, indent=2))
        return 0 if payload["ok"] else 1

    # Print per-file results
    for r in results:
        print_result(r, args.verbose)

    # Summary
    total = len(results)
    err_count = sum(1 for r in results if r.errors)
    warn_count = sum(1 for r in results if r.warnings and not r.errors)
    pass_count = total - err_count - warn_count

    print()
    print(f"Note: {THRESHOLD_NOTE}")
    if err_count:
        print(
            f"✗ {total} file(s): {pass_count} passed, "
            f"{warn_count} warning(s), {err_count} error(s)"
        )
        return 1
    elif warn_count:
        print(
            f"⚠ {total} file(s): {pass_count} passed, "
            f"{warn_count} warning(s), 0 error(s)"
        )
        return 0
    else:
        print(f"✓ {total} file(s): all passed")
        return 0


if __name__ == "__main__":
    sys.exit(main())
