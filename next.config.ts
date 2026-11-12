import type { NextConfig } from "next";

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

/**
 * Hostnames of jmt-admin's HOSTINGER_MEDIA_URL (comma-separated, no scheme),
 * e.g. "media.example.com". Set → next/image optimizes; unset → served as-is.
 * Read at build time: changing it needs a rebuild.
 */
const MEDIA_HOSTNAMES = (process.env.MEDIA_HOSTNAMES ?? "")
  .split(",")
  .map((h) => h.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
  .filter(Boolean);

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
    // The root layout lives under app/[lang], so unknown URLs need their own
    // 404 document: app/global-not-found.tsx.
    globalNotFound: true,
  },
  images: MEDIA_HOSTNAMES.length > 0
    ? {
        // Optimizer on: AVIF/WebP, srcset from each Photo's `sizes`. Every CMS
        // image host must be listed in MEDIA_HOSTNAMES or next/image refuses it.
        formats: ["image/avif", "image/webp"],
        // Any protocol: older CMS rows store http:// URLs for the same host.
        remotePatterns: MEDIA_HOSTNAMES.map((hostname) => ({ hostname })),
      }
    : {
        // Images come from public/homepage and from the CMS media host (any domain
        // set in jmt-admin's HOSTINGER_MEDIA_URL), served as-is — no optimizer, so
        // no remotePatterns allow-list is needed.
        unoptimized: true,
      },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      // API routes are never search results, on any deployment.
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      ...(isNonProductionDeploy
        ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
        : []),
    ];
  },
};

export default nextConfig;
