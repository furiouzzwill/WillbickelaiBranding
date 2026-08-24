/** Where users land after signing in when no destination was requested. */
export const DEFAULT_REDIRECT = "/dashboard";

/**
 * Narrows an untrusted redirect target to a same-origin relative path.
 *
 * Anything else — an absolute URL, a protocol-relative `//evil.com`, a
 * backslash variant that some parsers normalise to `//` — is discarded. Without
 * this, `?next=` is an open redirect that makes phishing links look like they
 * came from us.
 */
export function safeRelativePath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const path = value.trim();
  if (!path.startsWith("/")) return undefined;
  if (path.startsWith("//") || path.startsWith("/\\")) return undefined;
  if (path.includes("\\")) return undefined;

  return path;
}

/** A safe redirect target, falling back to the default destination. */
export function resolveRedirect(value: unknown): string {
  return safeRelativePath(value) ?? DEFAULT_REDIRECT;
}
