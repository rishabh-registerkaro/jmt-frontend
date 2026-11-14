import type { MetadataRoute } from "next";
import { IS_NON_PRODUCTION_DEPLOY, SITE_URL } from "@/lib/site";

// /robots.txt — production: everything is public except the API routes
// (revalidation and version endpoints), and crawlers are pointed at
// app/sitemap.ts. Vercel preview deployments: nothing may be crawled (they are
// public URLs; next.config.ts also sends X-Robots-Tag: noindex there).

// Rendered per request, not prerendered: a build without SITE_URL (a Docker
// image built once, configured at runtime) would otherwise bake
// "Sitemap: http://localhost:3002/sitemap.xml" into the file.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (IS_NON_PRODUCTION_DEPLOY) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
