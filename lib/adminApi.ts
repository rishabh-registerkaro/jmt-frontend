// jmt-admin is this site's backend: every read and write goes through its API.
// Server-only — these values are never sent to the browser.

// Hosting dashboards often end up with surrounding quotes or stray whitespace
// pasted into env values (dotenv strips quotes, dashboard UIs don't). Normalize
// so both projects compare the same secret regardless.
// Must match normalizeSecret in jmt-admin/app/lib/utils/revalidateFrontend.ts.
export const normalizeSecret = (v: string | null | undefined) =>
  (v ?? "").trim().replace(/^['"]|['"]$/g, "");

/** Origin of the jmt-admin project, e.g. http://localhost:3000. */
const ADMIN_API_URL = normalizeSecret(process.env.ADMIN_API_URL).replace(/\/+$/, "") || "http://localhost:3000";

/** Absolute URL of a jmt-admin API path ("/api/..."). */
export function adminUrl(path: string): string {
  return `${ADMIN_API_URL}${path}`;
}

/** Shared secret (same value as REVALIDATE_SECRET in jmt-admin). */
export function sharedSecret(): string {
  return normalizeSecret(process.env.REVALIDATE_SECRET);
}

/** How long to wait for jmt-admin before giving up. */
export const ADMIN_TIMEOUT_MS = 10_000;
