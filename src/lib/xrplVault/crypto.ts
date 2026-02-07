// ─── XRPL Vault Cryptographic Utilities ─────────────────────────────────────
// Uses Web Crypto API for real SHA-256 hashing.

/**
 * Canonicalize an object to a stable JSON string with sorted keys.
 */
export function canonicalize(obj: unknown): string {
  return JSON.stringify(sortKeys(obj));
}

function sortKeys(val: unknown): unknown {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return val.map(sortKeys);
  if (typeof val === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(val as Record<string, unknown>).sort()) {
      sorted[key] = sortKeys((val as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return val;
}

/**
 * Compute SHA-256 hex hash of a string using Web Crypto.
 */
export async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Hash a payload object: canonicalize → SHA-256.
 */
export async function hashPayload(payload: unknown): Promise<string> {
  const canonical = canonicalize(payload);
  return sha256(canonical);
}

/**
 * Verify that a hash matches its payload.
 */
export async function verifyHash(
  payload: unknown,
  expectedHash: string
): Promise<boolean> {
  const computed = await hashPayload(payload);
  return computed === expectedHash;
}
