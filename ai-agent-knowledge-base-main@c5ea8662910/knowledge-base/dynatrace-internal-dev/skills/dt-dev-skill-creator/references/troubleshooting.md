# Troubleshooting

Dynatrace-specific troubleshooting for dtctl and tenant connectivity issues.

For general tool installation (yamllint, jq, shellcheck), load a skill for general skill validation.

## Contents

- [mdformat](#mdformat)
- [dtctl Installation](#dtctl-installation)
- [Authentication Issues](#authentication-issues)
- [Connection Issues](#connection-issues)
- [Common dtctl Errors](#common-dtctl-errors)
- [Verifying Setup](#verifying-setup)

## mdformat

### Installation

Install mdformat with the required plugins:

```bash
pip install mdformat mdformat-gfm mdformat-frontmatter
```

All three packages are needed: `mdformat` (base), `mdformat-gfm` (GitHub Flavored Markdown tables and task lists), and `mdformat-frontmatter` (YAML front matter in skills).

### File Formatting Fails

**Symptom:** mdformat errors on a file or exits non-zero unexpectedly.

**Causes:**

1. Missing plugin — tables or front matter won't parse without the GFM/frontmatter plugins
2. Malformed YAML front matter — mdformat-frontmatter requires valid YAML

**Solutions:**

```bash
# Verify all plugins are installed
pip show mdformat-gfm mdformat-frontmatter

# Run on a single file to isolate the problem
mdformat --check path/to/file.md

# Check for YAML syntax errors in the front matter block
```

## dtctl Installation

### Command Not Found

**Symptom:**

```
command not found: dtctl
```

**Causes:**

1. dtctl is not installed
2. dtctl is not in PATH

**Solutions:**

```bash
# Check if dtctl is installed somewhere
find /usr -name "dtctl" 2>/dev/null
find ~/.local -name "dtctl" 2>/dev/null

# Install dtctl (see official docs)
# https://github.com/dynatrace-oss/dtctl

# Add to PATH if installed but not found
export PATH="$PATH:/path/to/dtctl"
```

### Version Mismatch

**Symptom:** Commands fail with unexpected errors or unrecognized flags.

**Solution:**

```bash
# Check current version
dtctl version

# Update to latest
# Follow upgrade instructions at https://github.com/dynatrace-oss/dtctl
```

## Authentication Issues

### Token Expired

**Symptom:**

```
Error: authentication failed: token expired
```

**Solution:**

```bash
# Re-authenticate
dtctl auth login

# Or refresh token
dtctl auth refresh
```

### Missing OAuth Scopes

**Symptom:**

```
Error: insufficient permissions
Error: scope not authorized
```

**Solution:**

1. Check required scopes for your operation
2. Re-authenticate with additional scopes:

```bash
dtctl auth login --scopes "storage:logs:read,storage:metrics:read"
```

Common scopes:

- `storage:logs:read` — Query logs
- `storage:metrics:read` — Query metrics
- `automation:workflows:read` — List workflows
- `automation:workflows:write` — Create/update workflows
- `document:documents:read` — Read dashboards, notebooks
- `document:documents:write` — Create/update dashboards, notebooks

### Keyring Issues

**Symptom:**

```
Error: failed to access keyring
Error: keyring not available
```

**Causes:** OS keyring service unavailable or misconfigured.

**Solutions:**

```bash
# Linux: Ensure keyring service is running
# For headless systems, use file-based token storage:
dtctl auth login --token-storage file

# macOS: Keychain access may require unlocking
security unlock-keychain

# Windows: Credential Manager should work automatically
# If not, try file-based storage
```

## Connection Issues

### Tenant Unreachable

**Symptom:**

```
Error: connection refused
Error: no such host
Error: timeout
```

**Causes:**

1. Network connectivity issues
2. Incorrect environment URL
3. Firewall blocking connection
4. VPN required but not connected

**Solutions:**

```bash
# Test basic connectivity
curl -I https://your-tenant.apps.dynatrace.com

# Check DNS resolution
nslookup your-tenant.apps.dynatrace.com

# Verify environment URL in context
dtctl config describe-context

# If behind VPN, ensure VPN is connected
```

### SSL Certificate Errors

**Symptom:**

```
Error: certificate verify failed
Error: SSL handshake failed
```

**Causes:**

1. Corporate proxy intercepting HTTPS
2. Self-signed certificates
3. Outdated CA certificates

**Solutions:**

```bash
# If corporate proxy, configure proxy settings
export HTTPS_PROXY=http://proxy.company.com:8080

# For self-signed certs (NOT recommended for production)
dtctl --insecure-skip-verify ...

# Update CA certificates
# macOS: brew install ca-certificates
# Linux: apt update && apt install ca-certificates
```

### Wrong Context

**Symptom:** Commands succeed but return unexpected data or "resource not found" for known resources.

**Cause:** Wrong dtctl context selected.

**Solution:**

```bash
# Check current context
dtctl config current-context

# List all contexts
dtctl config get-contexts

# Switch context
dtctl config use-context <context-name>

# Verify context details
dtctl config describe-context
```

## Common dtctl Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `command not found: dtctl` | Not installed or not in PATH | Install dtctl, check PATH |
| `authentication failed` | Token expired or invalid | `dtctl auth login` |
| `context not found` | No context configured | `dtctl config set-context` |
| `resource not found` | Wrong resource name (plural vs singular) | Use singular for describe/delete: `workflow` not `workflows` |
| `insufficient permissions` | Missing OAuth scopes | Re-authenticate with required scopes |
| `connection refused` | Network issue or wrong URL | Check connectivity, verify environment URL |
| `timeout` | Slow network or large response | Increase timeout or add filters to reduce response size |

## Verifying Setup

Run these commands to verify your dtctl setup:

```bash
# 1. Check dtctl is installed
dtctl version

# 2. Check authentication
dtctl auth status

# 3. Check current context
dtctl config current-context

# 4. Test connectivity with a simple query
dtctl query "fetch logs | limit 1" --plain
```

If all commands succeed, your setup is ready for validation.
