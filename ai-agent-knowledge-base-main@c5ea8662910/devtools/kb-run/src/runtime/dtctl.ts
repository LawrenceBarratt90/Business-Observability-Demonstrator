/**
 * Shared dtctl context helpers for kb-run runtimes.
 *
 * These helpers extract environment metadata from a named dtctl context so
 * runtimes can derive tenant-specific settings without requiring users to
 * duplicate them in shell environment variables.
 */

import { execSync } from 'child_process';

/**
 * Normalized tenant metadata extracted from a dtctl context.
 */
export interface DtctlContextDetails {
  tenantUrl: string;
  tenantHost: string;
  tenant: string;
  tokenRef: string;
}

async function extractLinuxTokenFromKeyring(tokenRef: string): Promise<string | undefined> {
  const script = `
import secretstorage
bus = secretstorage.dbus_init()
col = secretstorage.get_default_collection(bus)
for item in col.get_all_items():
    attrs = item.get_attributes()
    if attrs.get("service") == "dtctl" and attrs.get("username") == "${tokenRef}":
        print(item.get_secret().decode())
        break
`;

  try {
    const result = execSync(`python3 -c '${script}'`, {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    return result || undefined;
  } catch {
    return undefined;
  }
}

function extractMacosTokenFromKeychain(tokenRef: string): string | undefined {
  try {
    const result = execSync(
      `security find-generic-password -s dtctl -a "${tokenRef}" -w`,
      {
        encoding: 'utf-8',
        timeout: 5000,
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    ).trim();
    return result || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Attempts to extract a token from the platform credential store using the
 * dtctl token reference.
 *
 * Supported backends:
 * - Linux: Secret Service / gnome-keyring via python secretstorage
 * - macOS: Keychain via `security find-generic-password`
 *
 * @param tokenRef - dtctl token reference.
 * @returns The resolved token, or undefined when unavailable.
 */
export async function extractTokenFromKeyring(tokenRef: string): Promise<string | undefined> {
  if (process.platform === 'darwin') {
    return extractMacosTokenFromKeychain(tokenRef);
  }

  if (process.platform === 'linux') {
    return extractLinuxTokenFromKeyring(tokenRef);
  }

  return undefined;
}

/**
 * Resolves a token for a dtctl context.
 *
 * Precedence:
 * 1. Explicit env var value
 * 2. Token resolved from dtctl token-ref in the OS credential store
 *
 * @param context - dtctl context name.
 * @param envToken - Optional explicit token from environment.
 * @returns Resolved token.
 * @throws Error when no token can be resolved.
 */
export async function resolveDtctlContextToken(
  context: string,
  envToken?: string,
): Promise<string> {
  if (envToken && envToken.length > 0) {
    return envToken;
  }

  const details = getDtctlContextDetails(context);
  const keyringToken = await extractTokenFromKeyring(details.tokenRef);
  if (keyringToken) {
    return keyringToken;
  }

  throw new Error(
    `TOKEN not found for dtctl context '${context}'. Tried:\n` +
      `  1. TOKEN environment variable — not set\n` +
      `  2. OS credential store (dtctl token-ref: ${details.tokenRef}) — not found or unavailable\n\n` +
      `To fix, either:\n` +
      `  • Set the environment variable: export TOKEN=dt0s16.YOUR_TOKEN\n` +
      `  • Or log in with dtctl: dtctl auth login --context=${context}`,
  );
}

interface DtctlConfigView {
  Contexts?: Array<{
    Name: string;
    Context: {
      Environment?: string;
      TokenRef?: string;
    };
  }>;
}

/**
 * Derives host and tenant identifier from a tenant URL.
 *
 * The tenant identifier is the first DNS label of the configured Environment
 * hostname (for example `abc12345` from `https://abc12345.live.dynatrace.com`).
 *
 * @param tenantUrl - Full Environment URL from dtctl config.
 * @returns Parsed host and tenant identifier.
 * @throws Error if the URL is invalid or the hostname cannot produce a tenant id.
 */
export function extractTenantMetadataFromUrl(
  tenantUrl: string,
): Pick<DtctlContextDetails, 'tenantHost' | 'tenant'> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(tenantUrl);
  } catch {
    throw new Error(`dtctl Environment is not a valid URL: ${tenantUrl}`);
  }

  const tenantHost = parsedUrl.host;
  const tenant = parsedUrl.hostname.split('.')[0];

  if (!tenant || tenant.trim().length === 0) {
    throw new Error(`Could not derive tenant identifier from dtctl Environment URL: ${tenantUrl}`);
  }

  return {
    tenantHost,
    tenant,
  };
}

/**
 * Reads tenant metadata from a named dtctl context.
 *
 * @param context - dtctl context name.
 * @returns Normalized tenant metadata.
 * @throws Error when dtctl config cannot be read or the context is incomplete.
 */
export function getDtctlContextDetails(context: string): DtctlContextDetails {
  try {
    const output = execSync(`dtctl config view --context=${context} -o json`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 10000,
    });

    const parsed = JSON.parse(output) as DtctlConfigView;
    const contexts = parsed.Contexts ?? [];
    const entry = contexts.find((candidate) => candidate.Name === context);

    if (!entry) {
      const available = contexts.map((candidate) => candidate.Name).join(', ');
      throw new Error(
        `Context '${context}' not found in dtctl config.\n` +
          `Available contexts: ${available || '(none)'}\n` +
          `Run: dtctl auth login --context=${context}`,
      );
    }

    const tenantUrl = entry.Context.Environment;
    if (!tenantUrl) {
      throw new Error(`Context '${context}' has no Environment URL in dtctl config.`);
    }

    const { tenantHost, tenant } = extractTenantMetadataFromUrl(tenantUrl);

    return {
      tenantUrl,
      tenantHost,
      tenant,
      tokenRef: entry.Context.TokenRef || context,
    };
  } catch (error: any) {
    if (
      error.message.includes('not found in dtctl') ||
      error.message.includes('has no Environment') ||
      error.message.includes('dtctl Environment is not a valid URL') ||
      error.message.includes('Could not derive tenant identifier')
    ) {
      throw error;
    }

    throw new Error(
      `Failed to extract tenant details from dtctl context '${context}': ${error.message}`,
    );
  }
}
