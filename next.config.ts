import type { NextConfig } from "next";

/** "1" / "true" (any case, quotes and spaces ignored) turns an env switch on. */
const isOn = (value: string | undefined) => /^(1|true)$/i.test((value ?? "").trim().replace(/^['"]|['"]$/g, ""));

// Fail a Vercel *production* build that would ship localhost URLs in
// canonicals/sitemap or never reach jmt-admin. Preview and local builds are
// not affected (they fall back to localhost / fallback content).
if (process.env.VERCEL_ENV === "production") {
  const missing = ["ADMIN_API_URL", "REVALIDATE_SECRET", "SITE_URL"].filter(
    (name) => !process.env[name] || /localhost|127\.0\.0\.1/.test(process.env[name] ?? ""),
  );
  if (missing.length > 0) {
    throw new Error(`[next.config] Production build is missing or has localhost values for: ${missing.join(", ")}`);
  }
}

// Same check for production builds outside Vercel (Docker, VPS), opt-in with
// REQUIRE_PROD_ENV=1 so a plain local "npm run build" keeps working against
// localhost. REVALIDATE_SECRET is not checked: it is only needed at runtime.
if (process.env.NODE_ENV === "production" && isOn(process.env.REQUIRE_PROD_ENV)) {
  const missing = ["ADMIN_API_URL", "SITE_URL"].filter(
    (name) => !process.env[name] || /localhost|127\.0\.0\.1/.test(process.env[name] ?? ""),
  );
  if (missing.length > 0) {
    throw new Error(
      `[next.config] REQUIRE_PROD_ENV is set and these are missing or have localhost values: ${missing.join(", ")}`,
    );
  }
}

/**
 * Bundled images in public/ are not content-hashed, so Next serves them with
 * max-age=0. Cache them for a day and let browsers reuse a stale copy for a
 * week while they refetch. Only file URLs match: /about, /contact and
 * /service/<slug> are pages and keep their own caching.
 */
const PUBLIC_IMAGE_SOURCE = "/:dir(homepage|about|contact|join|service)/:file(.+\\.(?:avif|gif|ico|jpe?g|png|svg|webp))";
const PUBLIC_IMAGE_CACHE = "public, max-age=86400, stale-while-revalidate=604800";

/** Vercel preview / development deployments are public URLs: keep them out of search. */
const isNonProductionDeploy = Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== "production";

const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // upgrade-insecure-requests: CMS media URLs saved as http:// load over https
  // (no mixed content; the media host serves both and redirects http → https).
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests",
  },
];

const nextConfig: NextConfig = {
  // Hostinger's container reports the host machine's full CPU count (63), so
  // Next tries to spawn 63 build workers and hits the container's thread limit
  // ("OS can't spawn worker thread: Resource temporarily unavailable").
  // Pin it to the cores the plan actually provides.
  experimental: {
    cpus: 2,
  },
  poweredByHeader: false,
  // Image optimizer is off: its resized AVIF/WebP output looked blurred.
  // Every image (public/ and the CMS media host) is served exactly as
  // uploaded, so no remotePatterns allow-list is needed.
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: PUBLIC_IMAGE_SOURCE, headers: [{ key: "Cache-Control", value: PUBLIC_IMAGE_CACHE }] },
      // API routes are never search results, on any deployment.
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      ...(isNonProductionDeploy
        ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
        : []),
    ];
  },
};

export default nextConfig;
