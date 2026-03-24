#!/usr/bin/env python3
"""Lightweight local validation for skill-creator eval assets.

Validates repository-local eval artifacts used by skill-creator workflows:
- evals/evals.json (prompt + expectation/assertion structure)
- trigger-eval sets (query + should_trigger entries)

This script performs static structure checks only. It does not run evals.
"""

import argparse
import json
import sys
from pathlib import Path


def _is_non_empty_string(value) -> bool:
    return isinstance(value, str) and bool(value.strip())


def detect_asset_type(path: Path, data) -> str:
    """Detect eval asset type from filename and shape."""
    name = path.name.lower()
    if name == "evals.json":
        return "evals"

    if isinstance(data, list):
        if all(
            isinstance(item, dict) and "query" in item and "should_trigger" in item
            for item in data
        ):
            return "trigger_eval"

    if isinstance(data, dict) and isinstance(data.get("evals"), list):
        return "evals"

    return "unknown"


def validate_trigger_eval(path: Path, data) -> tuple[bool, list[str], dict]:
    errors: list[str] = []
    warnings: list[str] = []
    summary = {"total": 0, "should_trigger": 0, "should_not_trigger": 0}

    if not isinstance(data, list):
        errors.append("Trigger eval set must be a JSON array")
        return False, errors, {"warnings": warnings, **summary}

    summary["total"] = len(data)
    if not data:
        errors.append("Trigger eval set is empty")

    for idx, item in enumerate(data):
        label = f"item[{idx}]"
        if not isinstance(item, dict):
            errors.append(f"{label} must be an object")
            continue

        if not _is_non_empty_string(item.get("query")):
            errors.append(f"{label}.query must be a non-empty string")

        should_trigger = item.get("should_trigger")
        if not isinstance(should_trigger, bool):
            errors.append(f"{label}.should_trigger must be boolean")
        else:
            if should_trigger:
                summary["should_trigger"] += 1
            else:
                summary["should_not_trigger"] += 1

    if summary["total"] > 0:
        if summary["should_trigger"] == 0:
            warnings.append("No should_trigger=true cases found")
        if summary["should_not_trigger"] == 0:
            warnings.append("No should_trigger=false cases found")

    return len(errors) == 0, errors, {"warnings": warnings, **summary}


def _validate_assertion_list(
    assertions, field_name: str, label: str, errors: list[str]
) -> int:
    if not isinstance(assertions, list):
        errors.append(f"{label}.{field_name} must be an array when present")
        return 0

    valid_count = 0
    for i, assertion in enumerate(assertions):
        assertion_label = f"{label}.{field_name}[{i}]"
        if isinstance(assertion, str):
            if not assertion.strip():
                errors.append(f"{assertion_label} must not be empty")
            else:
                valid_count += 1
            continue

        if isinstance(assertion, dict):
            text = assertion.get("text") or assertion.get("name")
            if not _is_non_empty_string(text):
                errors.append(
                    f"{assertion_label} object must include non-empty 'text' (or 'name')"
                )
            else:
                valid_count += 1
            continue

        errors.append(f"{assertion_label} must be a string or object")

    return valid_count


def validate_evals_json(path: Path, data) -> tuple[bool, list[str], dict]:
    errors: list[str] = []
    warnings: list[str] = []
    summary = {
        "total": 0,
        "unique_ids": 0,
        "with_expectations": 0,
        "with_assertions": 0,
        "total_assertion_items": 0,
    }

    if not isinstance(data, dict):
        errors.append("evals.json must be a JSON object")
        return False, errors, {"warnings": warnings, **summary}

    evals = data.get("evals")
    if not isinstance(evals, list):
        errors.append("Missing or invalid top-level 'evals' array")
        return False, errors, {"warnings": warnings, **summary}

    summary["total"] = len(evals)
    if not evals:
        errors.append("'evals' array is empty")

    ids: list[int] = []
    for idx, item in enumerate(evals):
        label = f"evals[{idx}]"
        if not isinstance(item, dict):
            errors.append(f"{label} must be an object")
            continue

        eval_id = item.get("id")
        if not isinstance(eval_id, int):
            errors.append(f"{label}.id must be an integer")
        else:
            ids.append(eval_id)

        if not _is_non_empty_string(item.get("prompt")):
            errors.append(f"{label}.prompt must be a non-empty string")

        if "expected_output" in item and not _is_non_empty_string(
            item.get("expected_output")
        ):
            errors.append(
                f"{label}.expected_output must be a non-empty string when present"
            )

        expectations = item.get("expectations")
        assertions = item.get("assertions")

        has_expectations = expectations is not None
        has_assertions = assertions is not None

        if has_expectations:
            summary["with_expectations"] += 1
            summary["total_assertion_items"] += _validate_assertion_list(
                expectations, "expectations", label, errors
            )

        if has_assertions:
            summary["with_assertions"] += 1
            summary["total_assertion_items"] += _validate_assertion_list(
                assertions, "assertions", label, errors
            )

        if not has_expectations and not has_assertions:
            warnings.append(
                f"{label} has no expectations/assertions yet (allowed early, but add before benchmark grading)"
            )

    summary["unique_ids"] = len(set(ids))
    if len(ids) != len(set(ids)):
        errors.append("Duplicate eval IDs found in evals[].id")

    if summary["total"] > 0 and summary["total_assertion_items"] == 0:
        warnings.append("No expectations/assertions detected in evals.json")

    return len(errors) == 0, errors, {"warnings": warnings, **summary}


def gather_files(skill_root: Path) -> list[Path]:
    """Find likely eval assets in the skill directory."""
    files: list[Path] = []

    evals_file = skill_root / "evals" / "evals.json"
    if evals_file.exists():
        files.append(evals_file)

    patterns = [
        "**/*trigger*eval*.json",
        "**/eval_set*.json",
        "**/*trigger*set*.json",
    ]
    seen = {f.resolve() for f in files}
    for pattern in patterns:
        for match in skill_root.glob(pattern):
            if not match.is_file():
                continue
            resolved = match.resolve()
            if resolved in seen:
                continue
            files.append(match)
            seen.add(resolved)

    return sorted(files)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate skill-creator eval assets")
    parser.add_argument(
        "skill_root",
        nargs="?",
        default=".",
        help="Path to skill root directory (default: current directory)",
    )
    parser.add_argument(
        "-f",
        "--file",
        help="Validate a specific eval asset file instead of auto-discovery",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Verbose output",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output machine-readable JSON results",
    )
    args = parser.parse_args()

    skill_root = Path(args.skill_root).resolve()
    if not skill_root.exists() or not skill_root.is_dir():
        msg = f"Skill root directory does not exist: {skill_root}"
        if args.json:
            print(json.dumps({"ok": False, "error": msg}, indent=2))
        else:
            print(f"Error: {msg}", file=sys.stderr)
        return 1

    if args.file:
        files = [Path(args.file).resolve()]
        if not files[0].exists() or not files[0].is_file():
            msg = f"File does not exist: {files[0]}"
            if args.json:
                print(json.dumps({"ok": False, "error": msg}, indent=2))
            else:
                print(f"Error: {msg}", file=sys.stderr)
            return 1
    else:
        files = gather_files(skill_root)

    if not files:
        msg = (
            "No eval assets found (checked evals/evals.json and trigger-eval patterns)"
        )
        if args.json:
            print(
                json.dumps(
                    {"ok": True, "warning": msg, "files": [], "summary": {"total": 0}},
                    indent=2,
                )
            )
        else:
            print(msg)
        return 0

    results = []
    any_errors = False
    for file_path in files:
        rel_path = (
            str(file_path.relative_to(skill_root))
            if file_path.is_relative_to(skill_root)
            else str(file_path)
        )
        try:
            data = json.loads(file_path.read_text(encoding="utf-8"))
        except Exception as e:
            result = {
                "file": rel_path,
                "asset_type": "unknown",
                "valid": False,
                "errors": [f"Invalid JSON: {e}"],
                "warnings": [],
                "summary": {},
            }
            any_errors = True
            results.append(result)
            continue

        asset_type = detect_asset_type(file_path, data)
        if asset_type == "evals":
            valid, errors, detail = validate_evals_json(file_path, data)
        elif asset_type == "trigger_eval":
            valid, errors, detail = validate_trigger_eval(file_path, data)
        else:
            valid = False
            errors = [
                "Unsupported eval asset shape. Expected evals.json object with 'evals' array, "
                "or trigger eval array with query/should_trigger items."
            ]
            detail = {"warnings": []}

        result = {
            "file": rel_path,
            "asset_type": asset_type,
            "valid": valid,
            "errors": errors,
            "warnings": detail.get("warnings", []),
            "summary": {k: v for k, v in detail.items() if k != "warnings"},
        }
        any_errors = any_errors or not valid
        results.append(result)

        if args.verbose and not args.json:
            status = "✓" if valid else "✗"
            print(f"{status} {rel_path} [{asset_type}]")
            for warning in result["warnings"]:
                print(f"  ⚠ {warning}")
            for error in errors:
                print(f"  ✗ {error}")

    payload = {
        "ok": not any_errors,
        "skill_root": str(skill_root),
        "files": results,
        "summary": {
            "total": len(results),
            "valid": sum(1 for r in results if r["valid"]),
            "invalid": sum(1 for r in results if not r["valid"]),
            "warning_files": sum(1 for r in results if r["warnings"]),
        },
    }

    if args.json:
        print(json.dumps(payload, indent=2))
    else:
        if not args.verbose:
            for r in results:
                if not r["valid"]:
                    print(f"✗ {r['file']} [{r['asset_type']}]")
                    for e in r["errors"]:
                        print(f"  ✗ {e}")
                elif r["warnings"]:
                    print(f"⚠ {r['file']} [{r['asset_type']}]")
                    for w in r["warnings"]:
                        print(f"  ⚠ {w}")
                else:
                    print(f"✓ {r['file']} [{r['asset_type']}]")

        s = payload["summary"]
        if any_errors:
            print(
                f"\n✗ {s['total']} file(s): {s['valid']} valid, {s['invalid']} invalid"
            )
        else:
            print(f"\n✓ {s['total']} file(s): all structurally valid")

    return 1 if any_errors else 0


if __name__ == "__main__":
    sys.exit(main())
