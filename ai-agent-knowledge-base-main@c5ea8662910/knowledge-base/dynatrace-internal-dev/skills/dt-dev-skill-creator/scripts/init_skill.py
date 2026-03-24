#!/usr/bin/env python3
"""
Optional Skill Initializer - Creates a new skill from template

This helper is optional scaffold support for drafting a new skill directory.
It is NOT required for the dt-dev-skill-creator runtime validation workflow.

Usage:
    init_skill.py <skill-name> --path <path>

Examples:
    init_skill.py my-new-skill --path skills/public
    init_skill.py my-api-helper --path skills/private
    init_skill.py custom-skill --path /custom/location
"""

import sys
from pathlib import Path


# ============================================================================
# Skill Templates
# ============================================================================
# Standard template for all skills, and dt- specific template for Dynatrace skills

SKILL_TEMPLATE = """---
name: {skill_name}
description: "TODO: Complete and informative explanation of what the skill does and when to use it. Include WHEN to use this skill - specific scenarios, file types, or tasks that trigger it."
---

# {skill_title}

## Overview

[TODO: 1-2 sentences explaining what this skill enables]

## Structuring This Skill

[TODO: Choose the structure that best fits this skill's purpose. Common patterns:

**1. Workflow-Based** (best for sequential processes)
- Works well when there are clear step-by-step procedures
- Example: DOCX skill with "Workflow Decision Tree" → "Reading" → "Creating" → "Editing"
- Structure: ## Overview → ## Workflow Decision Tree → ## Step 1 → ## Step 2...

**2. Task-Based** (best for tool collections)
- Works well when the skill offers different operations/capabilities
- Example: PDF skill with "Quick Start" → "Merge PDFs" → "Split PDFs" → "Extract Text"
- Structure: ## Overview → ## Quick Start → ## Task Category 1 → ## Task Category 2...

**3. Reference/Guidelines** (best for standards or specifications)
- Works well for brand guidelines, coding standards, or requirements
- Example: Brand styling with "Brand Guidelines" → "Colors" → "Typography" → "Features"
- Structure: ## Overview → ## Guidelines → ## Specifications → ## Usage...

**4. Capabilities-Based** (best for integrated systems)
- Works well when the skill provides multiple interrelated features
- Example: Product Management with "Core Capabilities" → numbered capability list
- Structure: ## Overview → ## Core Capabilities → ### 1. Feature → ### 2. Feature...

Patterns can be mixed and matched as needed. Most skills combine patterns (e.g., start with task-based, add workflow for complex operations).

Delete this entire "Structuring This Skill" section when done - it's just guidance.]

## [TODO: Replace with the first main section based on chosen structure]

[TODO: Add content here. See examples in existing skills:
- Code samples for technical skills
- Decision trees for complex workflows
- Concrete examples with realistic user requests
- References to scripts/templates/references as needed]

## Resources

This skill includes example resource directories that demonstrate how to organize different types of bundled resources:

### scripts/
Executable code (Python/Bash/etc.) that can be run directly to perform specific operations.

**Examples from other skills:**
- PDF skill: `fill_fillable_fields.py`, `extract_form_field_info.py` - utilities for PDF manipulation
- DOCX skill: `document.py`, `utilities.py` - Python modules for document processing

**Appropriate for:** Python scripts, shell scripts, or any executable code that performs automation, data processing, or specific operations.

**Note:** Scripts may be executed without loading into context, but can still be read by Claude for patching or environment adjustments.

### references/
Documentation and reference material intended to be loaded into context to inform Claude's process and thinking.

**Examples from other skills:**
- Product management: `communication.md`, `context_building.md` - detailed workflow guides
- BigQuery: API reference documentation and query examples
- Finance: Schema documentation, company policies

**Appropriate for:** In-depth documentation, API references, database schemas, comprehensive guides, or any detailed information that Claude should reference while working.

### assets/
Files not intended to be loaded into context, but rather used within the output Claude produces.

**Examples from other skills:**
- Brand styling: PowerPoint template files (.pptx), logo files
- Frontend builder: HTML/React boilerplate project directories
- Typography: Font files (.ttf, .woff2)

**Appropriate for:** Templates, boilerplate code, document templates, images, icons, fonts, or any files meant to be copied or used in the final output.

---

**Any unneeded directories can be deleted.** Not every skill requires all three types of resources.
"""

# dt- Specific Template for Dynatrace Skills
# This template is used when skill name starts with 'dt-'
# See docs/DT_VALIDATION_DESIGN.md for dt- skill requirements
DT_SKILL_TEMPLATE = """---
name: {skill_name}
description: "TODO: Add description mentioning Dynatrace or dtctl context. Include 'Use when...' triggers for specific dtctl operations or DQL scenarios."
---

# {skill_title}

[TODO: Brief introduction explaining what this dt- skill does with Dynatrace/dtctl.]

## Prerequisites

- dtctl CLI installed and configured
- Authentication with required OAuth scopes (list specific scopes if known)
- Access to Dynatrace environment

## Quick Reference

[TODO: Add common dtctl command patterns for this skill]

Example dtctl commands:
```bash
# List resources
dtctl get <resource> --mine --plain

# Inspect resource details
dtctl describe <resource> <id> --plain

# Query data with DQL
dtctl query "fetch logs | limit 10" --plain
```

## Usage

[TODO: Core dtctl operations and workflows for this skill]

### Basic Operations

[TODO: Add step-by-step instructions using dtctl]

### DQL Query Patterns

[TODO: Add DQL query examples if relevant]

```dql
fetch logs
| filter loglevel == "ERROR"
| limit 100
```

## Safety Notes

- Always verify context before operations: `dtctl config current-context`
- Use `--plain` flag for machine/AI consumption
- Test with read-only operations first (get, describe, query)
- Use `--dry-run` flag for apply operations when available

## References

- **Dynatrace Control** — Load the Dynatrace control skill for dtctl command reference
- **dtctl documentation**: https://github.com/dynatrace-oss/dtctl

---

[TODO: Delete this guidance section after reading. Keep sections above and customize them.]

## Structuring This dt- Skill

Follow these guidelines for dt- skill validation:

1. Keep SKILL.md under 500 lines - move detailed content to references/
2. Use progressive disclosure patterns - simple overview, detailed examples in references/
3. Validate all dtctl commands and DQL queries before distribution
4. Load the Dynatrace control skill for dtctl fundamentals

### dt- Validation Requirements

Your dt- skill must:
- Mention "Dynatrace" or "dtctl" in the description
- Have a descriptive name after "dt-" (not just "dt-")
- Use valid dtctl command syntax in code blocks
- Start DQL queries with 'fetch' or 'timeseries'

See: Load the dt- skill validation skill for validation requirements.
"""

EXAMPLE_SCRIPT = '''#!/usr/bin/env python3
"""
Example helper script for {skill_name}

This is a placeholder script that can be executed directly.
Replace with actual implementation or delete if not needed.

Example real scripts from other skills:
- pdf/scripts/fill_fillable_fields.py - Fills PDF form fields
- pdf/scripts/convert_pdf_to_images.py - Converts PDF pages to images
"""

def main():
    print("This is an example script for {skill_name}")
    # TODO: Add actual script logic here
    # This could be data processing, file conversion, API calls, etc.

if __name__ == "__main__":
    main()
'''

EXAMPLE_REFERENCE = """# Reference Documentation for {skill_title}

This is a placeholder for detailed reference documentation.
Replace with actual reference content or delete if not needed.

Example real reference docs from other skills:
- product-management/references/communication.md - Comprehensive guide for status updates
- product-management/references/context_building.md - Deep-dive on gathering context
- bigquery/references/ - API references and query examples

## When Reference Docs Are Useful

Reference docs are ideal for:
- Comprehensive API documentation
- Detailed workflow guides
- Complex multi-step processes
- Information too lengthy for main SKILL.md
- Content that's only needed for specific use cases

## Structure Suggestions

### API Reference Example
- Overview
- Authentication
- Endpoints with examples
- Error codes
- Rate limits

### Workflow Guide Example
- Prerequisites
- Step-by-step instructions
- Common patterns
- Troubleshooting
- Best practices
"""

EXAMPLE_ASSET = """# Example Asset File

This placeholder represents where asset files would be stored.
Replace with actual asset files (templates, images, fonts, etc.) or delete if not needed.

Asset files are NOT intended to be loaded into context, but rather used within
the output Claude produces.

Example asset files from other skills:
- Brand guidelines: logo.png, slides_template.pptx
- Frontend builder: hello-world/ directory with HTML/React boilerplate
- Typography: custom-font.ttf, font-family.woff2
- Data: sample_data.csv, test_dataset.json

## Common Asset Types

- Templates: .pptx, .docx, boilerplate directories
- Images: .png, .jpg, .svg, .gif
- Fonts: .ttf, .otf, .woff, .woff2
- Boilerplate code: Project directories, starter files
- Icons: .ico, .svg
- Data files: .csv, .json, .xml, .yaml

Note: This is a text placeholder. Actual assets can be any file type.
"""

# dt- Reference Template for dtctl Examples
# This is created in addition to standard reference files for dt- skills
DT_REFERENCE_TEMPLATE = """# dtctl Examples for {skill_title}

[TODO: Add dtctl command examples specific to this skill]

## Common Operations

### Listing Resources

```bash
# List all resources of a type
dtctl get <resource> --plain

# List only your resources
dtctl get <resource> --mine --plain

# Get detailed output in JSON format
dtctl get <resource> -o json
```

### Inspecting Resources

```bash
# Describe a specific resource
dtctl describe <resource> <id> --plain

# Get resource details in JSON
dtctl describe <resource> <id> -o json
```

### Querying Data with DQL

```bash
# Query logs
dtctl query "fetch logs | limit 10" --plain

# Query with time range
dtctl query "fetch logs | filter timestamp > now() - 1h" --plain

# Query metrics
dtctl query "timeseries avg(dt.host.cpu.usage), by: {{dt.entity.host}}" --plain
```

### Applying Configuration

```bash
# Apply from file
dtctl apply -f resource.yaml

# Apply with dry-run (validation only)
dtctl apply -f resource.yaml --dry-run
```

## Testing Commands

[TODO: Add commands for testing this skill's functionality]

```bash
# Verify context before operations
dtctl config current-context

# Test read-only operations first
dtctl get <resource> --plain
```

## References

- **Dynatrace Control** — Load the Dynatrace control skill for dtctl command reference
- **dtctl GitHub**: https://github.com/dynatrace-oss/dtctl
- **DQL Documentation**: https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language
"""


def title_case_skill_name(skill_name):
    """Convert hyphenated skill name to Title Case for display."""
    return " ".join(word.capitalize() for word in skill_name.split("-"))


def init_skill(skill_name, path):
    """
    Initialize a new skill directory with template SKILL.md.

    Args:
        skill_name: Name of the skill
        path: Path where the skill directory should be created

    Returns:
        Path to created skill directory, or None if error
    """
    # Determine skill directory path
    skill_dir = Path(path).resolve() / skill_name

    # Check if directory already exists
    if skill_dir.exists():
        print(f"❌ Error: Skill directory already exists: {skill_dir}")
        return None

    # Create skill directory
    try:
        skill_dir.mkdir(parents=True, exist_ok=False)
        print(f"✅ Created skill directory: {skill_dir}")
    except Exception as e:
        print(f"❌ Error creating directory: {e}")
        return None

    # Create SKILL.md from template
    # ====== EXTENSION POINT: Template Selection ======
    # Use dt- specific template for Dynatrace skills
    skill_title = title_case_skill_name(skill_name)
    if skill_name.startswith("dt-"):
        template = DT_SKILL_TEMPLATE
        print("📋 Using dt- skill template (Dynatrace-specific)")
    else:
        template = SKILL_TEMPLATE

    skill_content = template.format(skill_name=skill_name, skill_title=skill_title)

    skill_md_path = skill_dir / "SKILL.md"
    try:
        skill_md_path.write_text(skill_content)
        print("✅ Created SKILL.md")
    except Exception as e:
        print(f"❌ Error creating SKILL.md: {e}")
        return None

    # Create resource directories with example files
    try:
        # Create scripts/ directory with example script
        scripts_dir = skill_dir / "scripts"
        scripts_dir.mkdir(exist_ok=True)
        example_script = scripts_dir / "example.py"
        example_script.write_text(EXAMPLE_SCRIPT.format(skill_name=skill_name))
        example_script.chmod(0o755)
        print("✅ Created scripts/example.py")

        # Create references/ directory with example reference doc
        references_dir = skill_dir / "references"
        references_dir.mkdir(exist_ok=True)
        example_reference = references_dir / "api_reference.md"
        example_reference.write_text(EXAMPLE_REFERENCE.format(skill_title=skill_title))
        print("✅ Created references/api_reference.md")

        # Create assets/ directory with example asset placeholder
        assets_dir = skill_dir / "assets"
        assets_dir.mkdir(exist_ok=True)
        example_asset = assets_dir / "example_asset.txt"
        example_asset.write_text(EXAMPLE_ASSET)
        print("✅ Created assets/example_asset.txt")

        # ====== EXTENSION POINT: dt- Reference File ======
        # Create dt- specific reference file for Dynatrace skills
        if skill_name.startswith("dt-"):
            dt_reference_file = references_dir / "dtctl-examples.md"
            dt_reference_content = DT_REFERENCE_TEMPLATE.format(
                skill_name=skill_name, skill_title=skill_title
            )
            dt_reference_file.write_text(dt_reference_content)
            print("✅ Created references/dtctl-examples.md (dt- specific)")
    except Exception as e:
        print(f"❌ Error creating resource directories: {e}")
        return None

    # Print next steps
    print(f"\n✅ Skill '{skill_name}' initialized successfully at {skill_dir}")
    print("\nNext steps:")
    print("1. Edit SKILL.md to complete the TODO items and update the description")
    print(
        "2. Customize or delete the example files in scripts/, references/, and assets/"
    )
    print("3. Run the validator when ready to check the skill structure")

    return skill_dir


def main():
    if len(sys.argv) < 4 or sys.argv[2] != "--path":
        print("Usage: init_skill.py <skill-name> --path <path>")
        print("\nSkill name requirements:")
        print("  - Hyphen-case identifier (e.g., 'data-analyzer')")
        print("  - Lowercase letters, digits, and hyphens only")
        print("  - Max 40 characters")
        print("  - Must match directory name exactly")
        print("\nExamples:")
        print("  init_skill.py my-new-skill --path skills/public")
        print("  init_skill.py my-api-helper --path skills/private")
        print("  init_skill.py custom-skill --path /custom/location")
        sys.exit(1)

    skill_name = sys.argv[1]
    path = sys.argv[3]

    print(f"🚀 Initializing skill: {skill_name}")
    print(f"   Location: {path}")
    print()

    result = init_skill(skill_name, path)

    if result:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
