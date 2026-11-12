// Public origin of this site and whether this deployment may be indexed.
// Server-only (no NEXT_PUBLIC_): read by metadata, sitemap.ts and robots.ts.

const trimOrigin = (value: string | undefined) => (value ?? "").trim().replace(/^['"]|['"]$/g, "").replace(/\/+$/, "");

/**
 * Absolute origin used for canonicals, hreflang, og:url/og:image, the sitemap
 * and robots.txt. Order: SITE_URL, then Vercel's production domain (so a
 * preview still points canonicals at production, never at itself), then the
 * local dev server.
 */
export const SITE_URL =
  trimOrigin(process.env.SITE_URL) ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${trimOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL)}` : "") ||
  "http://localhost:3002";

/**
 * True on Vercel preview/development deployments. Those get noindex
 * (X-Robots-Tag in next.config.ts, <meta robots> here, Disallow in robots.ts).
 * Off Vercel (local, Docker, Hostinger) VERCEL_ENV is unset → indexable.
 */
export const IS_NON_PRODUCTION_DEPLOY = Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== "production";

/**
 * Absolute URL for metadata/JSON-LD. Remote http:// URLs (older CMS media
 * rows) are upgraded to https://, except local dev hosts.
 */
export const absoluteUrl = (path: string) => {
  if (/^http:\/\//i.test(path) && !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(path)) {
    return `https://${path.slice("http://".length)}`;
  }
  return /^https?:\/\//i.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
