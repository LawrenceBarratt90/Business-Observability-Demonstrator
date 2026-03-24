#!/usr/bin/env python3
"""
Validate the asset ownership & metadata registry.

Reads docs/registry/assets.yaml and checks it for structural correctness,
field validity, enum values, and cross-references against the actual
filesystem under knowledge-base/.

Validation checks:
  - Structural:  Valid YAML, schema_version, expected sections
  - Per-asset:   Required fields, enum values, URL format, owner types
  - Cross-ref:   Assets on disk match registry entries (both directions)

Error vs Warning classification:
  - Errors:   Invalid YAML, missing required fields, invalid enum values,
              invalid URL format, stale entries (in registry but not on disk)
  - Warnings: Empty owner/capability fields, missing entries (on disk but
              not in registry), unexpected extra fields

Usage:
    python3 validate_asset_registry.py [--json] [--strict]

Options:
    --json      Output validation results as JSON
    --strict    Treat warnings as errors (for CI)

Example:
    python3 validate_asset_registry.py
    python3 validate_asset_registry.py --json
    python3 validate_asset_registry.py --strict
"""

import argparse
import json
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("❌ PyYAML is required. Install with: pip install pyyaml", file=sys.stderr)
    sys.exit(1)


# Valid enum values
VALID_CHANNELS = {"dynatrace", "dynatrace-internal-sfm"}
VALID_RELEASE_STATUSES = {"candidate", "planned", "released"}

# Expected sections under "assets"
EXPECTED_SECTIONS = ("skills", "agents", "commands")

# Required fields on every asset entry
REQUIRED_FIELDS = {
    "channel",
    "pm-owner",
    "pa-owner",
    "capability",
    "jira-project",
    "release-status",
    "test-environment-url",
}


def find_repo_root():
    """Find the repository root by walking up to find .git/ directory.

    Returns:
        Path: The repository root directory.

    Raises:
        SystemExit: If not inside a git repository.
    """
    current_dir = Path(__file__).resolve().parent
    repo_root = current_dir
    while not (repo_root / ".git").exists():
        if repo_root.parent == repo_root:
            print("❌ Not in a git repository", file=sys.stderr)
            sys.exit(1)
        repo_root = repo_root.parent
    return repo_root


def discover_filesystem_assets(repo_root):
    """Discover all assets on the filesystem under knowledge-base/.

    Returns:
        dict: {"skills": {name: channel}, "agents": ..., "packages": ..., "commands": ...}
    """
    kb_dir = repo_root / "knowledge-base"
    assets = {"skills": {}, "agents": {}, "packages": {}, "commands": {}}

    # Skills: knowledge-base/*/skills/*/SKILL.md
    for skill_md in sorted(kb_dir.glob("*/skills/*/SKILL.md")):
        name = skill_md.parent.name
        channel = skill_md.relative_to(kb_dir).parts[0]
        if channel not in VALID_CHANNELS:
            continue
        assets["skills"][name] = channel

    # Agents: knowledge-base/*/agents/*.md
    for agent_md in sorted(kb_dir.glob("*/agents/*.md")):
        name = agent_md.stem
        channel = agent_md.relative_to(kb_dir).parts[0]
        if channel not in VALID_CHANNELS:
            continue
        assets["agents"][name] = channel

    # Packages: knowledge-base/*/packages/*.package.json
    for pkg_file in sorted(kb_dir.glob("*/packages/*.package.json")):
        name = pkg_file.name
        if name.endswith(".package.json"):
            name = name[: -len(".package.json")]
        channel = pkg_file.relative_to(kb_dir).parts[0]
        if channel not in VALID_CHANNELS:
            continue
        assets["packages"][name] = channel

    # Commands: knowledge-base/*/commands/**/*.md
    for cmd_md in sorted(kb_dir.glob("*/commands/**/*.md")):
        channel = cmd_md.relative_to(kb_dir).parts[0]
        if channel not in VALID_CHANNELS:
            continue
        rel = cmd_md.relative_to(kb_dir)
        parts = rel.parts
        cmd_idx = parts.index("commands")
        command_path = "/".join(parts[cmd_idx + 1 :])
        if command_path.endswith(".md"):
            command_path = command_path[:-3]
        assets["commands"][command_path] = channel

    return assets


def validate_owner_field(value, field_name, asset_name, section):
    """Validate a pm-owner or pa-owner field.

    Args:
        value: The field value to validate.
        field_name: 'pm-owner' or 'pa-owner'.
        asset_name: Name of the asset being validated.
        section: Section name (skills, agents, etc.).

    Returns:
        tuple: (errors, warnings) as lists of dicts.
    """
    errors = []
    warnings = []

    if isinstance(value, str):
        if value == "":
            warnings.append(
                {
                    "type": "empty_field",
                    "asset": asset_name,
                    "section": section,
                    "field": field_name,
                    "message": f"{asset_name} has empty {field_name}",
                }
            )
    elif isinstance(value, list):
        for i, item in enumerate(value):
            if not isinstance(item, str) or item == "":
                errors.append(
                    {
                        "type": "invalid_field",
                        "asset": asset_name,
                        "section": section,
                        "field": field_name,
                        "message": (
                            f"{asset_name}: {field_name}[{i}] must be a non-empty string"
                        ),
                    }
                )
    else:
        errors.append(
            {
                "type": "invalid_field",
                "asset": asset_name,
                "section": section,
                "field": field_name,
                "message": (
                    f"{asset_name}: {field_name} must be a string or list of strings"
                ),
            }
        )

    return errors, warnings


def validate_asset_entry(name, entry, section):
    """Validate a single asset entry for required fields and valid values.

    Args:
        name: The asset name / key.
        entry: The asset dict.
        section: The section name (skills, agents, etc.).

    Returns:
        tuple: (errors, warnings) as lists of dicts.
    """
    errors = []
    warnings = []

    if not isinstance(entry, dict):
        errors.append(
            {
                "type": "invalid_entry",
                "asset": name,
                "section": section,
                "field": None,
                "message": f"{name}: entry must be a mapping, got {type(entry).__name__}",
            }
        )
        return errors, warnings

    entry_keys = set(entry.keys()) - {"_missing"}

    # Check required fields exist
    for field in REQUIRED_FIELDS:
        if field not in entry:
            errors.append(
                {
                    "type": "missing_field",
                    "asset": name,
                    "section": section,
                    "field": field,
                    "message": f"{name}: missing required field '{field}'",
                }
            )

    # Warn on unexpected extra fields
    extra_fields = entry_keys - REQUIRED_FIELDS
    for field in sorted(extra_fields):
        warnings.append(
            {
                "type": "extra_field",
                "asset": name,
                "section": section,
                "field": field,
                "message": f"{name}: unexpected field '{field}'",
            }
        )

    # Validate channel
    if "channel" in entry:
        if entry["channel"] not in VALID_CHANNELS:
            errors.append(
                {
                    "type": "invalid_enum",
                    "asset": name,
                    "section": section,
                    "field": "channel",
                    "message": (
                        f"{name}: channel '{entry['channel']}' not in "
                        f"{sorted(VALID_CHANNELS)}"
                    ),
                }
            )

    # Validate release-status
    if "release-status" in entry:
        if entry["release-status"] not in VALID_RELEASE_STATUSES:
            errors.append(
                {
                    "type": "invalid_enum",
                    "asset": name,
                    "section": section,
                    "field": "release-status",
                    "message": (
                        f"{name}: release-status '{entry['release-status']}' not in "
                        f"{sorted(VALID_RELEASE_STATUSES)}"
                    ),
                }
            )

    # Validate owner fields
    for owner_field in ("pm-owner", "pa-owner"):
        if owner_field in entry:
            errs, warns = validate_owner_field(
                entry[owner_field], owner_field, name, section
            )
            errors.extend(errs)
            warnings.extend(warns)

    # Validate capability (must be string)
    if "capability" in entry:
        val = entry["capability"]
        if not isinstance(val, str):
            errors.append(
                {
                    "type": "invalid_field",
                    "asset": name,
                    "section": section,
                    "field": "capability",
                    "message": f"{name}: capability must be a string",
                }
            )
        elif val == "":
            warnings.append(
                {
                    "type": "empty_field",
                    "asset": name,
                    "section": section,
                    "field": "capability",
                    "message": f"{name} has empty capability",
                }
            )

    # Validate test-environment-url
    if "test-environment-url" in entry:
        val = entry["test-environment-url"]
        if not isinstance(val, str):
            errors.append(
                {
                    "type": "invalid_field",
                    "asset": name,
                    "section": section,
                    "field": "test-environment-url",
                    "message": f"{name}: test-environment-url must be a string",
                }
            )
        elif val != "" and not val.startswith("https://"):
            errors.append(
                {
                    "type": "invalid_url",
                    "asset": name,
                    "section": section,
                    "field": "test-environment-url",
                    "message": (
                        f"{name}: test-environment-url must start with https:// "
                        f"(got '{val}')"
                    ),
                }
            )

    return errors, warnings


def validate_structure(data):
    """Validate the top-level structure of the registry.

    Args:
        data: Parsed YAML data.

    Returns:
        tuple: (errors, warnings, schema_version) where schema_version may be None.
    """
    errors = []
    warnings = []
    schema_version = None

    if not isinstance(data, dict):
        errors.append(
            {
                "type": "invalid_structure",
                "asset": None,
                "section": None,
                "field": None,
                "message": "Registry root must be a YAML mapping",
            }
        )
        return errors, warnings, schema_version

    # Check schema_version
    if "schema_version" not in data:
        errors.append(
            {
                "type": "missing_field",
                "asset": None,
                "section": None,
                "field": "schema_version",
                "message": "Missing required top-level field 'schema_version'",
            }
        )
    else:
        schema_version = str(data["schema_version"])
        if schema_version != "1.0":
            errors.append(
                {
                    "type": "invalid_field",
                    "asset": None,
                    "section": None,
                    "field": "schema_version",
                    "message": (
                        f"Expected schema_version '1.0', got '{schema_version}'"
                    ),
                }
            )

    # Check assets key
    if "assets" not in data:
        errors.append(
            {
                "type": "missing_field",
                "asset": None,
                "section": None,
                "field": "assets",
                "message": "Missing required top-level field 'assets'",
            }
        )
    elif not isinstance(data["assets"], dict):
        errors.append(
            {
                "type": "invalid_structure",
                "asset": None,
                "section": None,
                "field": "assets",
                "message": "'assets' must be a mapping",
            }
        )
    else:
        for section in EXPECTED_SECTIONS:
            if section not in data["assets"]:
                errors.append(
                    {
                        "type": "missing_section",
                        "asset": None,
                        "section": section,
                        "field": None,
                        "message": f"Missing expected section 'assets.{section}'",
                    }
                )
            elif data["assets"][section] is not None and not isinstance(
                data["assets"][section], dict
            ):
                errors.append(
                    {
                        "type": "invalid_structure",
                        "asset": None,
                        "section": section,
                        "field": None,
                        "message": f"'assets.{section}' must be a mapping (or empty/null)",
                    }
                )

    return errors, warnings, schema_version


def validate_cross_references(data, fs_assets):
    """Cross-reference registry entries against the filesystem.

    Args:
        data: Parsed registry YAML data.
        fs_assets: Filesystem assets from discover_filesystem_assets().

    Returns:
        tuple: (errors, warnings)
    """
    errors = []
    warnings = []

    registry_assets = data.get("assets", {})

    for section in EXPECTED_SECTIONS:
        registry_section = registry_assets.get(section, {}) or {}
        fs_section = fs_assets.get(section, {})

        # Check registry entries exist on filesystem
        for name, entry in registry_section.items():
            if name not in fs_section:
                errors.append(
                    {
                        "type": "stale_entry",
                        "asset": name,
                        "section": section,
                        "field": None,
                        "message": (
                            f"{name}: in registry but not found on filesystem "
                            f"(stale entry)"
                        ),
                    }
                )
            elif isinstance(entry, dict) and "channel" in entry:
                # Verify channel matches actual directory
                actual_channel = fs_section[name]
                if entry["channel"] != actual_channel:
                    errors.append(
                        {
                            "type": "channel_mismatch",
                            "asset": name,
                            "section": section,
                            "field": "channel",
                            "message": (
                                f"{name}: channel is '{entry['channel']}' but asset "
                                f"is in '{actual_channel}' on filesystem"
                            ),
                        }
                    )

        # Check filesystem assets exist in registry
        for name in fs_section:
            if name not in registry_section:
                warnings.append(
                    {
                        "type": "missing_entry",
                        "asset": name,
                        "section": section,
                        "field": None,
                        "message": (
                            f"{name}: found on filesystem but not in registry "
                            f"(missing entry)"
                        ),
                    }
                )

    return errors, warnings


def run_validation(repo_root):
    """Run the full validation pipeline.

    Args:
        repo_root: Path to the repository root.

    Returns:
        dict: Validation results with "valid", "errors", "warnings", "summary" keys.
    """
    registry_path = repo_root / "docs" / "registry" / "assets.yaml"
    all_errors = []
    all_warnings = []
    summary = {}

    # Check file exists
    if not registry_path.exists():
        all_errors.append(
            {
                "type": "file_not_found",
                "asset": None,
                "section": None,
                "field": None,
                "message": (
                    f"Registry file not found: {registry_path.relative_to(repo_root)}"
                ),
            }
        )
        return {
            "valid": False,
            "errors": all_errors,
            "warnings": all_warnings,
            "summary": {},
        }

    # Parse YAML
    try:
        with open(registry_path, "r") as f:
            data = yaml.safe_load(f)
    except yaml.YAMLError as e:
        all_errors.append(
            {
                "type": "invalid_yaml",
                "asset": None,
                "section": None,
                "field": None,
                "message": f"Invalid YAML: {e}",
            }
        )
        return {
            "valid": False,
            "errors": all_errors,
            "warnings": all_warnings,
            "summary": {},
        }

    # Structural validation
    struct_errors, struct_warnings, schema_version = validate_structure(data)
    all_errors.extend(struct_errors)
    all_warnings.extend(struct_warnings)

    # If structure is fundamentally broken, stop here
    if not isinstance(data, dict) or "assets" not in data:
        return {
            "valid": False,
            "errors": all_errors,
            "warnings": all_warnings,
            "summary": {},
        }

    assets = data.get("assets", {})
    if not isinstance(assets, dict):
        return {
            "valid": False,
            "errors": all_errors,
            "warnings": all_warnings,
            "summary": {},
        }

    # Per-asset field validation
    for section in EXPECTED_SECTIONS:
        section_data = assets.get(section, {}) or {}
        if not isinstance(section_data, dict):
            continue

        section_errors = 0
        for name, entry in section_data.items():
            entry_errors, entry_warnings = validate_asset_entry(name, entry, section)
            all_errors.extend(entry_errors)
            all_warnings.extend(entry_warnings)
            if entry_errors:
                section_errors += 1

        summary[section] = {
            "count": len(section_data),
            "valid": len(section_data) - section_errors,
            "errors": section_errors,
        }

    # Cross-reference validation
    fs_assets = discover_filesystem_assets(repo_root)
    xref_errors, xref_warnings = validate_cross_references(data, fs_assets)
    all_errors.extend(xref_errors)
    all_warnings.extend(xref_warnings)

    return {
        "valid": len(all_errors) == 0,
        "errors": all_errors,
        "warnings": all_warnings,
        "summary": summary,
    }


def print_human(results, repo_root):
    """Print validation results in human-readable format.

    Args:
        results: Validation results dict.
        repo_root: Path to the repository root.
    """
    registry_rel = "docs/registry/assets.yaml"
    print(f"\n📋 Validating {registry_rel}...\n")

    # Early exit for file-level errors
    if not results["summary"]:
        for err in results["errors"]:
            print(f"❌ {err['message']}")
        print(f"\nResult: {len(results['errors'])} error(s), 0 warning(s)")
        return

    # Structure check
    struct_errors = [
        e
        for e in results["errors"]
        if e["type"] in ("invalid_structure", "missing_section", "invalid_yaml")
        and e.get("asset") is None
    ]
    schema_errors = [e for e in results["errors"] if e.get("field") == "schema_version"]
    if struct_errors or schema_errors:
        for err in struct_errors + schema_errors:
            print(f"❌ Structure: {err['message']}")
    else:
        print("✅ Structure: Valid YAML, schema_version 1.0")

    # Per-section summaries
    for section in EXPECTED_SECTIONS:
        if section not in results["summary"]:
            continue
        info = results["summary"][section]
        section_errors = [
            e
            for e in results["errors"]
            if e.get("section") == section
            and e["type"] not in ("stale_entry", "channel_mismatch")
        ]
        section_warnings = [
            w
            for w in results["warnings"]
            if w.get("section") == section and w["type"] not in ("missing_entry",)
        ]

        if info["count"] == 0:
            print(f"✅ {section.capitalize()}: empty section (valid)")
        elif section_errors:
            print(
                f"❌ {section.capitalize()}: {info['count']} entries, "
                f"{len(section_errors)} error(s)"
            )
            for err in section_errors:
                print(f"   ❌ {err['message']}")
        elif section_warnings:
            print(
                f"⚠  {section.capitalize()}: {info['count']} entries, "
                f"{len(section_warnings)} warning(s)"
            )
            for warn in section_warnings:
                print(f"   ⚠  {warn['message']}")
        else:
            print(
                f"✅ {section.capitalize()}: {info['count']} entries, all fields valid"
            )

    # Cross-reference results
    print("\nCross-reference:")
    xref_errors = [
        e for e in results["errors"] if e["type"] in ("stale_entry", "channel_mismatch")
    ]
    xref_warnings = [w for w in results["warnings"] if w["type"] == "missing_entry"]

    # Per-section cross-ref summaries
    for section in EXPECTED_SECTIONS:
        section_stale = [e for e in xref_errors if e.get("section") == section]
        section_missing = [w for w in xref_warnings if w.get("section") == section]
        section_info = results["summary"].get(section, {})
        count = section_info.get("count", 0)

        if count == 0 and not section_missing:
            continue

        if not section_stale and not section_missing:
            fs_label = section.capitalize()
            if section == "skills":
                fs_label = "skills"
            elif section == "agents":
                fs_label = "agents"
            elif section == "packages":
                fs_label = "packages"
            elif section == "commands":
                fs_label = "commands"
            print(f"✅ All {count} {fs_label} found on filesystem")

    for warn in xref_warnings:
        print(
            f"⚠  Missing from registry: {warn['asset']} (found on filesystem but not in assets.yaml)"
        )
    for err in xref_errors:
        if err["type"] == "stale_entry":
            print(f"❌ Stale entry: {err['asset']} (in registry but not on filesystem)")
        elif err["type"] == "channel_mismatch":
            print(f"❌ Channel mismatch: {err['message']}")

    # Final summary
    total_errors = len(results["errors"])
    total_warnings = len(results["warnings"])
    print(f"\nResult: {total_errors} error(s), {total_warnings} warning(s)")


def print_json(results):
    """Print validation results as JSON.

    Args:
        results: Validation results dict.
    """
    print(json.dumps(results, indent=2))


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Validate the asset ownership & metadata registry"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output validation results as JSON",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat warnings as errors (for CI)",
    )

    args = parser.parse_args()

    # Find repo root
    repo_root = find_repo_root()

    # Run validation
    results = run_validation(repo_root)

    # In strict mode, warnings become errors
    if args.strict and results["warnings"]:
        results["errors"].extend(results["warnings"])
        results["warnings"] = []
        results["valid"] = len(results["errors"]) == 0

    # Output
    if args.json:
        print_json(results)
    else:
        print_human(results, repo_root)

    # Exit code
    return 0 if results["valid"] else 1


if __name__ == "__main__":
    sys.exit(main())
