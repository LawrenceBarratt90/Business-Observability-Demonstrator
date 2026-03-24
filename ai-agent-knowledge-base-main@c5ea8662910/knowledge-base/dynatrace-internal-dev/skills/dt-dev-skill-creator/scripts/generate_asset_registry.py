#!/usr/bin/env python3
"""
Generate or update the asset ownership & metadata registry.

Scans the knowledge-base/ filesystem to auto-discover all assets (skills,
agents, packages, commands) and generates/updates docs/registry/assets.yaml
with known fields filled in and unknown fields left empty for manual entry.

Discovery logic:
  - Skills:    knowledge-base/*/skills/*/SKILL.md
  - Agents:    knowledge-base/*/agents/*.md
  - Packages:  knowledge-base/*/packages/*.package.json
  - Commands:  knowledge-base/*/commands/**/*.md

Merge behavior:
  - Existing entries are NEVER overwritten (preserves manual data)
  - New assets are added with safe defaults
  - Assets in registry but missing from filesystem get a _missing flag

Usage:
    python3 generate_asset_registry.py [--dry-run] [--json]

Options:
    --dry-run   Show what would be generated/changed without writing
    --json      Output discovered assets as JSON (don't write YAML file)

Example:
    python3 generate_asset_registry.py --dry-run
    python3 generate_asset_registry.py --json
    python3 generate_asset_registry.py
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import yaml
except ImportError:
    print("❌ PyYAML is required. Install with: pip install pyyaml", file=sys.stderr)
    sys.exit(1)


# Only these channels are tracked in docs/registry/assets.yaml
INCLUDED_CHANNELS = {"dynatrace", "dynatrace-internal-sfm"}

# Default URLs by tracked channel
DEFAULT_TEST_ENVIRONMENT_URLS = {
    "dynatrace": "https://umsaywsjuo.dev.apps.dynatracelabs.com",
    "dynatrace-internal-sfm": "https://dre63214.apps.dynatrace.com/",
}

# Default field values for newly discovered assets
DEFAULT_FIELDS = {
    "pm-owner": "",
    "pa-owner": "",
    "capability": "",
    "jira-project": "",
    "release-status": "candidate",
}

# YAML header comment
YAML_HEADER = """\
# Asset Ownership & Metadata Registry
# Registry scope: only channel=dynatrace and channel=dynatrace-internal-sfm
# Auto-generated fields: channel, release-status, test-environment-url (channel defaults)
# Manual fields: pm-owner, pa-owner, capability, jira-project
# release-status values:
#   - candidate: tracked, but not yet ready to ship broadly
#   - planned: approved and intended for release
#   - released: already shipped
# Default test-environment-url values:
#   - dynatrace: https://umsaywsjuo.dev.apps.dynatracelabs.com
#   - dynatrace-internal-sfm: https://dre63214.apps.dynatrace.com/
# See README.md for schema documentation
#
# Last generated: {timestamp}
"""


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


def derive_channel(path, repo_root):
    """Derive the channel name from a path relative to knowledge-base/.

    The channel is the directory name immediately under knowledge-base/.
    E.g., knowledge-base/dynatrace/skills/... -> 'dynatrace'

    Args:
        path: Absolute path to the discovered asset file.
        repo_root: Absolute path to the repository root.

    Returns:
        str: The channel name.
    """
    rel = path.relative_to(repo_root / "knowledge-base")
    return rel.parts[0]


def is_included_channel(channel):
    """Return whether the channel is tracked in the registry."""
    return channel in INCLUDED_CHANNELS


def discover_skills(repo_root):
    """Discover skills by finding directories containing SKILL.md.

    Args:
        repo_root: Absolute path to the repository root.

    Returns:
        dict: Mapping of skill name -> {"channel": str}
    """
    skills = {}
    kb_dir = repo_root / "knowledge-base"
    for skill_md in sorted(kb_dir.glob("*/skills/*/SKILL.md")):
        name = skill_md.parent.name
        channel = derive_channel(skill_md, repo_root)
        if not is_included_channel(channel):
            continue
        skills[name] = {"channel": channel}
    return skills


def discover_agents(repo_root):
    """Discover agents by finding .md files in agents/ directories.

    Args:
        repo_root: Absolute path to the repository root.

    Returns:
        dict: Mapping of agent name -> {"channel": str}
    """
    agents = {}
    kb_dir = repo_root / "knowledge-base"
    for agent_md in sorted(kb_dir.glob("*/agents/*.md")):
        name = agent_md.stem  # filename without .md
        channel = derive_channel(agent_md, repo_root)
        if not is_included_channel(channel):
            continue
        agents[name] = {"channel": channel}
    return agents


def discover_packages(repo_root):
    """Discover packages by finding .package.json files in packages/ directories.

    Args:
        repo_root: Absolute path to the repository root.

    Returns:
        dict: Mapping of package name -> {"channel": str}
    """
    packages = {}
    kb_dir = repo_root / "knowledge-base"
    for pkg_file in sorted(kb_dir.glob("*/packages/*.package.json")):
        # Remove .package.json suffix
        name = pkg_file.name
        if name.endswith(".package.json"):
            name = name[: -len(".package.json")]
        channel = derive_channel(pkg_file, repo_root)
        if not is_included_channel(channel):
            continue
        packages[name] = {"channel": channel}
    return packages


def discover_commands(repo_root):
    """Discover commands by finding .md files in commands/ directories.

    Args:
        repo_root: Absolute path to the repository root.

    Returns:
        dict: Mapping of command path -> {"channel": str}
    """
    commands = {}
    kb_dir = repo_root / "knowledge-base"
    for cmd_md in sorted(kb_dir.glob("*/commands/**/*.md")):
        channel = derive_channel(cmd_md, repo_root)
        if not is_included_channel(channel):
            continue
        # Asset name = relative path from commands/ without .md
        rel = cmd_md.relative_to(repo_root / "knowledge-base")
        # rel looks like: dynatrace/commands/dt/critical-incident/initial-assessment.md
        # We want everything after "commands/" without .md
        parts = rel.parts
        # Find index of "commands" in the path
        cmd_idx = parts.index("commands")
        command_path = "/".join(parts[cmd_idx + 1 :])
        if command_path.endswith(".md"):
            command_path = command_path[:-3]
        commands[command_path] = {"channel": channel}
    return commands


def discover_all(repo_root):
    """Discover all asset types in the knowledge-base.

    Args:
        repo_root: Absolute path to the repository root.

    Returns:
        dict: {"skills": {...}, "agents": {...}, "packages": {...}, "commands": {...}}
    """
    return {
        "skills": discover_skills(repo_root),
        "agents": discover_agents(repo_root),
        "packages": discover_packages(repo_root),
        "commands": discover_commands(repo_root),
    }


def build_asset_entry(channel):
    """Build a new asset entry with defaults.

    Args:
        channel: The channel name for this asset.

    Returns:
        dict: Asset entry with channel and default fields.
    """
    entry = {"channel": channel}
    entry.update(DEFAULT_FIELDS)
    entry["test-environment-url"] = DEFAULT_TEST_ENVIRONMENT_URLS[channel]
    return entry


def merge_registry(existing, discovered):
    """Merge discovered assets into existing registry data.

    Rules:
      - Existing entries are NEVER overwritten (preserves manual data)
      - New assets are added with auto-filled defaults
      - Assets in registry but missing from filesystem get _missing: true

    Args:
        existing: Existing registry data (may be None or empty).
        discovered: Freshly discovered asset data.

    Returns:
        tuple: (merged_data, stats) where stats tracks adds/keeps/missing counts.
    """
    if existing is None:
        existing = {}

    existing_assets = existing.get("assets", {})
    merged_assets = {}
    stats = {"added": 0, "kept": 0, "missing": 0}

    for asset_type in ("skills", "agents", "packages", "commands"):
        discovered_items = discovered.get(asset_type, {})
        existing_items = existing_assets.get(asset_type, {}) or {}
        merged_items = {}

        # Process discovered assets
        for name, info in discovered_items.items():
            if name in existing_items:
                # KEEP existing values — never overwrite user data
                entry = dict(existing_items[name])
                # Remove _missing flag if it was previously set
                entry.pop("_missing", None)
                merged_items[name] = entry
                stats["kept"] += 1
            else:
                # NEW asset — add with defaults
                merged_items[name] = build_asset_entry(info["channel"])
                stats["added"] += 1

        # Check for assets in registry but not on filesystem
        for name, entry in existing_items.items():
            if name not in discovered_items:
                entry_copy = dict(entry)
                entry_copy["_missing"] = True
                merged_items[name] = entry_copy
                stats["missing"] += 1

        merged_assets[asset_type] = merged_items

    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
    merged = {
        "schema_version": "1.0",
        "assets": merged_assets,
    }

    return merged, stats, timestamp


def load_existing_registry(registry_path):
    """Load existing registry YAML file if it exists.

    Args:
        registry_path: Path to the assets.yaml file.

    Returns:
        dict or None: Parsed YAML data, or None if file doesn't exist.
    """
    if not registry_path.exists():
        return None

    with open(registry_path, "r") as f:
        data = yaml.safe_load(f)

    return data


def write_registry(registry_path, data, timestamp):
    """Write registry data to YAML file with header comment.

    Args:
        registry_path: Path to write the assets.yaml file.
        data: Registry data dict to serialize.
        timestamp: ISO timestamp for the header.
    """
    # Ensure parent directory exists
    registry_path.parent.mkdir(parents=True, exist_ok=True)

    header = YAML_HEADER.format(timestamp=timestamp)
    yaml_content = yaml.dump(data, default_flow_style=False, sort_keys=False)

    with open(registry_path, "w") as f:
        f.write(header)
        f.write(yaml_content)


def print_summary(discovered, stats, dry_run=False):
    """Print a human-readable summary of discovered assets and changes.

    Args:
        discovered: Dict of discovered assets by type.
        stats: Dict with added/kept/missing counts.
        dry_run: Whether this is a dry-run (no files written).
    """
    prefix = "[DRY RUN] " if dry_run else ""

    print(f"\n{prefix}Asset Discovery Summary")
    print("=" * 50)

    for asset_type in ("skills", "agents", "packages", "commands"):
        items = discovered.get(asset_type, {})
        count = len(items)
        print(f"\n  {asset_type.capitalize()}: {count}")
        for name in sorted(items.keys()):
            channel = items[name]["channel"]
            print(f"    - {name} ({channel})")

    total = sum(len(v) for v in discovered.values())
    print(f"\n{'=' * 50}")
    print(f"  Total discovered: {total}")
    print(f"  New entries:      {stats['added']}")
    print(f"  Existing kept:    {stats['kept']}")
    print(f"  Missing flagged:  {stats['missing']}")
    print()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Generate or update the asset ownership & metadata registry"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be generated/changed without writing",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output discovered assets as JSON (don't write YAML file)",
    )

    args = parser.parse_args()

    # Find repo root
    repo_root = find_repo_root()
    registry_path = repo_root / "docs" / "registry" / "assets.yaml"

    # Discover all assets
    discovered = discover_all(repo_root)

    # JSON mode — just output discovered assets and exit
    if args.json:
        output = {}
        for asset_type, items in discovered.items():
            output[asset_type] = {}
            for name, info in sorted(items.items()):
                output[asset_type][name] = build_asset_entry(info["channel"])
        print(json.dumps(output, indent=2))
        return 0

    # Load existing registry (if any)
    existing = load_existing_registry(registry_path)

    # Merge discovered with existing
    merged, stats, timestamp = merge_registry(existing, discovered)

    # Print summary
    print_summary(discovered, stats, dry_run=args.dry_run)

    if args.dry_run:
        print("⚠  Dry run — no files written")
        return 0

    # Write the registry
    write_registry(registry_path, merged, timestamp)
    print(f"✅ Registry written to: {registry_path.relative_to(repo_root)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
