// Which URLs this site uses: localhost on a developer's machine, the real
// domains once deployed. Server-only.
//
//   next dev / a local build → the value in .env (localhost)
//   deployed                 → the configured URL; a localhost value is ignored
//
// "Deployed" means Vercel, or REQUIRE_PROD_ENV=1 (set it on Hostinger).

/** Where the public site is deployed when SITE_URL is not configured. */
export const DEPLOYED_SITE_URL = "https://jmt-frontend-eight.vercel.app";

/** Trims whitespace, surrounding quotes and trailing slashes from an env value. */
export const cleanOrigin = (value: string | null | undefined) =>
  (value ?? "").trim().replace(/^['"]|['"]$/g, "").trim().replace(/\/+$/, "");

export const isLocalUrl = (url: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:|\/|$)/i.test(url);

/** True on a real deployment, as opposed to a developer's machine. */
export const IS_HOSTED =
  Boolean(process.env.VERCEL) || /^(1|true)$/i.test(cleanOrigin(process.env.REQUIRE_PROD_ENV));

/**
 * The origin to use for a configured env value.
 * `deployed` may be "" when there is no safe default: callers then fail and use
 * their fallback content rather than call localhost.
 */
export function resolveOrigin(
  value: string | null | undefined,
  defaults: { local: string; deployed: string },
): string {
  const url = cleanOrigin(value);
  if (url && !isLocalUrl(url)) return url;
  if (IS_HOSTED) return defaults.deployed;
  if (url) return url;
  return process.env.NODE_ENV === "production" ? defaults.deployed : defaults.local;
}
