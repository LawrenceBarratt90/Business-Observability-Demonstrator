#!/usr/bin/env python3
"""
Lightweight markdown validator for skills.

Validates only what matters for AI agents:
1. Markdown is parseable
2. Links resolve to real files
3. Code blocks are properly closed

Uses markdown-it-py for proper markdown parsing.
"""

import sys
import json
from pathlib import Path
from typing import List, Tuple, Set
import argparse

try:
    from markdown_it import MarkdownIt
except ImportError:
    print("Error: markdown-it-py is required", file=sys.stderr)
    print("Install with: pip install markdown-it-py", file=sys.stderr)
    sys.exit(1)


def parse_markdown(file_path: Path) -> Tuple[bool, str, List]:
    """
    Parse markdown file and return tokens.

    Returns:
        (success, message, tokens)
    """
    try:
        content = file_path.read_text(encoding="utf-8")
        md = MarkdownIt()
        tokens = md.parse(content)
        return True, "Markdown parsed successfully", tokens
    except UnicodeDecodeError as e:
        return False, f"File encoding error: {e}", []
    except Exception as e:
        return False, f"Failed to parse markdown: {e}", []


def extract_links_from_tokens(tokens: List, file_path: Path) -> List[str]:
    """Extract all links from markdown tokens."""
    links = []

    for token in tokens:
        if token.type == "inline" and token.children:
            for child in token.children:
                if child.type == "link_open":
                    href = child.attrGet("href")
                    if href:
                        links.append(href)

    return links


def is_placeholder_link(url: str) -> bool:
    """Check if a URL is a placeholder/example, not a real link."""
    placeholders = [
        "example.com",
        "example.org",
        "example.net",
        "your-",
        "my-",  # your-file.md, my-project
    ]

    # Check for obvious template markers
    if any(marker in url for marker in ["<", ">", "{", "}"]):
        return True

    # Check for single-word placeholders (likely examples in docs)
    # e.g., [text](url), [text](path), [text](file)
    if url.lower() in ["url", "path", "file", "link", "href"]:
        return True

    url_lower = url.lower()
    return any(placeholder in url_lower for placeholder in placeholders)


def check_links(
    file_path: Path, skill_root: Path, tokens: List
) -> Tuple[bool, List[str], int]:
    """
    Check that all relative links resolve to real files.

    Returns:
        (success, list of error messages, number of links found)
    """
    errors = []
    links = extract_links_from_tokens(tokens, file_path)

    for link in links:
        # Skip external URLs
        if link.startswith("http://") or link.startswith("https://"):
            continue

        # Skip mailto links
        if link.startswith("mailto:"):
            continue

        # Skip placeholder/example links
        if is_placeholder_link(link):
            continue

        # Skip pure anchors (fragments only)
        link_without_fragment = link.split("#")[0]
        if not link_without_fragment:
            continue

        # Resolve relative to the file's parent directory
        link_path = (file_path.parent / link_without_fragment).resolve()

        # Check if target exists
        if not link_path.exists():
            errors.append(
                f"Broken link in {file_path.name}: [{link}] -> {link_path} (does not exist)"
            )
            continue

        # Check if link escapes skill boundary
        try:
            link_path.relative_to(skill_root)
        except ValueError:
            errors.append(
                f"Link escapes skill boundary in {file_path.name}: [{link}] -> {link_path}"
            )

    return len(errors) == 0, errors, len(links)


def check_code_blocks(tokens: List) -> Tuple[bool, str]:
    """
    Check code blocks from tokens.

    markdown-it-py automatically validates that code blocks are closed,
    so if parsing succeeded, code blocks are valid.
    """
    fence_count = sum(1 for token in tokens if token.type == "fence")
    code_block_count = sum(1 for token in tokens if token.type == "code_block")

    total = fence_count + code_block_count

    if total == 0:
        return True, "No code blocks found"

    return True, f"{total} code block(s) properly closed"


def relative_path(path: Path, root: Path) -> str:
    """Return path relative to root when possible."""
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def validate_file(file_path: Path, skill_root: Path, verbose: bool = False) -> dict:
    """Validate a single markdown file and return detailed results."""
    rel_path = relative_path(file_path, skill_root)
    if verbose:
        print(f"\nValidating: {rel_path}")

    all_passed = True

    result = {
        "file": rel_path,
        "valid": True,
        "parse": {"passed": False, "message": ""},
        "code_blocks": {"passed": False, "message": ""},
        "links": {"passed": False, "count": 0, "errors": []},
    }

    # Parse markdown
    parsed, msg, tokens = parse_markdown(file_path)
    result["parse"] = {"passed": parsed, "message": msg}
    if verbose:
        status = "✓" if parsed else "✗"
        print(f"  {status} Parseable: {msg}")
    if not parsed:
        result["valid"] = False
        return result

    # Check code blocks
    passed, msg = check_code_blocks(tokens)
    result["code_blocks"] = {"passed": passed, "message": msg}
    if verbose:
        status = "✓" if passed else "✗"
        print(f"  {status} Code blocks: {msg}")
    if not passed:
        all_passed = False

    # Check links
    passed, errors, link_count = check_links(file_path, skill_root, tokens)
    result["links"] = {"passed": passed, "count": link_count, "errors": errors}
    if verbose:
        status = "✓" if passed else "✗"
        print(
            f"  {status} Links: {'All links valid' if passed else f'{len(errors)} broken link(s)'}"
        )
    if not passed:
        for error in errors:
            print(f"    - {error}")
        all_passed = False

    result["valid"] = all_passed
    return result


def find_markdown_files(skill_root: Path) -> List[Path]:
    """Find all markdown files in the skill directory."""
    return sorted(skill_root.rglob("*.md"))


def main():
    parser = argparse.ArgumentParser(
        description="Validate markdown files in a skill using markdown-it-py"
    )
    parser.add_argument(
        "skill_root",
        nargs="?",
        default=".",
        help="Path to skill root directory (default: current directory)",
    )
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    parser.add_argument(
        "-f", "--file", help="Validate specific file instead of all markdown files"
    )
    parser.add_argument(
        "--json", action="store_true", help="Output machine-readable JSON results"
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

    # Find files to validate
    if args.file:
        files = [Path(args.file).resolve()]
        if not files[0].exists():
            if args.json:
                print(
                    json.dumps(
                        {"ok": False, "error": f"File does not exist: {files[0]}"},
                        indent=2,
                    )
                )
            else:
                print(f"Error: File does not exist: {files[0]}", file=sys.stderr)
            return 1
    else:
        files = find_markdown_files(skill_root)

    if not files:
        if args.json:
            print(
                json.dumps({"ok": False, "error": "No markdown files found"}, indent=2)
            )
        else:
            print("No markdown files found", file=sys.stderr)
        return 1

    if args.verbose:
        print(f"Skill root: {skill_root}")
        print(f"Found {len(files)} markdown file(s)")

    # Validate all files
    results = [
        validate_file(file_path, skill_root, args.verbose) for file_path in files
    ]
    all_valid = all(r["valid"] for r in results)
    invalid_files = [r["file"] for r in results if not r["valid"]]

    if args.json:
        payload = {
            "ok": all_valid,
            "skill_root": str(skill_root),
            "files": results,
            "summary": {
                "total_files": len(results),
                "valid_files": sum(1 for r in results if r["valid"]),
                "invalid_files": len(invalid_files),
                "invalid_file_paths": invalid_files,
            },
        }
        print(json.dumps(payload, indent=2))
        return 0 if all_valid else 1

    # Summary
    if args.verbose or not all_valid:
        print()

    if all_valid:
        print(f"✓ All {len(files)} markdown file(s) valid")
        return 0
    else:
        print("✗ Validation failed", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
