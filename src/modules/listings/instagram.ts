/**
 * Instagram handles, stored without the "@" and without a URL.
 *
 * Only the handle is persisted and the link is rebuilt from it at render time,
 * so nothing a user pastes can become the href: no `javascript:`, no redirect
 * to a lookalike domain. Input is generous on purpose — people paste whatever
 * the app gave them ("@joao", "instagram.com/joao/?igsh=...") and all of it
 * means the same profile.
 */

const HANDLE_PATTERN = /^[a-z0-9._]{1,30}$/;
const INSTAGRAM_HOSTS = new Set(["instagram.com", "www.instagram.com"]);

export const INSTAGRAM_INPUT_MAX_LENGTH = 200;

function handleFromUrlLike(value: string): string | null {
  // Accept a bare "instagram.com/joao" too, which `new URL` rejects.
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return null;
  }
  if (!INSTAGRAM_HOSTS.has(url.hostname.toLowerCase())) return null;
  // Query strings are share-tracking noise; the first path segment is the profile.
  return url.pathname.split("/").filter(Boolean)[0] ?? null;
}

/**
 * Normalizes any accepted form to a bare lowercase handle, or null when the
 * value is not a usable Instagram profile.
 */
export function extractInstagramHandle(input: string): string | null {
  const trimmed = input.trim();
  if (trimmed === "" || trimmed.length > INSTAGRAM_INPUT_MAX_LENGTH) return null;

  const candidate = trimmed.includes("/")
    ? handleFromUrlLike(trimmed)
    : trimmed.replace(/^@/, "");

  if (candidate === null) return null;

  const handle = candidate.replace(/^@/, "").toLowerCase();
  return HANDLE_PATTERN.test(handle) ? handle : null;
}

/** Public profile URL for a stored handle. */
export function instagramProfileUrl(handle: string): string {
  return `https://www.instagram.com/${handle}`;
}
