# Troubleshooting

Tool installation for validation prerequisites. If a required tool is missing, validation **FAILS**.

## Contents

- [Required Tools](#required-tools)
- [Built-in Tools](#built-in-tools)
- [Common Issues](#common-issues)

## Required Tools

### Python 3

Required for running the markdown validation script.

**Verify:**

```bash
python3 --version
```

Most systems have Python 3 pre-installed. If not:

```bash
# macOS
brew install python3

# Ubuntu/Debian
apt install python3

# Windows
# Download from python.org
```

**Documentation:** <https://www.python.org/>

### markdown-it-py

Python markdown parser. Required by the validation script.

**Install:**

```bash
pip install markdown-it-py
```

**Verify:**

```bash
python3 -c "import markdown_it; print('markdown-it-py installed')"
```

**Documentation:** <https://github.com/executablebooks/markdown-it-py>

### yamllint

YAML linter. Required by [code-validation.md](code-validation.md).

**Install:**

```bash
# pip
pip install yamllint

# Or system package manager
# macOS: brew install yamllint
# Ubuntu/Debian: apt install yamllint
```

**Verify:** `yamllint --version`

**Documentation:** <https://github.com/adrienverge/yamllint>

### jq

JSON processor. Required by [code-validation.md](code-validation.md).

**Install:**

```bash
# macOS
brew install jq

# Ubuntu/Debian
apt install jq

# Windows (scoop)
scoop install jq
```

**Verify:** `jq --version`

**Documentation:** <https://github.com/jqlang/jq>

### shellcheck

Shell script linter. Required by [code-validation.md](code-validation.md).

**Install:**

```bash
# macOS
brew install shellcheck

# Ubuntu/Debian
apt install shellcheck

# Windows (scoop)
scoop install shellcheck
```

**Verify:** `shellcheck --version`

**Documentation:** <https://github.com/koalaman/shellcheck>

## Built-in Tools

These tools are typically available without additional installation:

### Python (py_compile)

```bash
# Verify Python is available
python3 --version

# Syntax check
python3 -m py_compile script.py
```

### Node.js (--check)

```bash
# Verify Node.js is available
node --version

# Syntax check
node --check script.js
```

## Common Issues

### markdown-it-py not found

**Error:**

```
ModuleNotFoundError: No module named 'markdown_it'
```

**Solution:**

```bash
pip install markdown-it-py
```

### Permission denied when running script

**Error:**

```
bash: ./scripts/validate-markdown.py: Permission denied
```

**Solution:**

```bash
chmod +x scripts/validate-markdown.py
```

Or run with Python directly:

```bash
python3 scripts/validate-markdown.py
```
