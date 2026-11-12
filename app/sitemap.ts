import type { MetadataRoute } from "next";
import { IS_NON_PRODUCTION_DEPLOY, SITE_URL } from "@/lib/site";
import { contactPath, servicePath, sitePagePath } from "@/lib/siteLinks";
import { getHomepageUpdatedAt } from "@/server/homepage";
import { getServiceIndex } from "@/server/service";
import { getSitePageUpdatedAt } from "@/server/sitePages";

// /sitemap.xml — every indexable page. Same URLs as each page's canonical in
// generateMetadata (lib/seo.ts):
//
//   /                  homepage
//   /service/<slug>    each service
//   /about             About
//   /contact           Contact
//   /join-our-crew     Join our crew
//
// <lastmod> is the CMS row's updatedAt (homepage, service page, site page);
// it is omitted — never invented — when the CMS has no saved row.
// Redirect-only URLs (/services, /contact-us, /careers, … in proxy.ts),
// /api/*, admin and preview URLs are never listed.

// Matches SERVICE_REVALIDATE_SECONDS. The service index is fetched under the
// "jmt-service-list" tag, so publishing a page lists it at once.
export const revalidate = 600;

function entry(path: string, priority: number, updatedAt: string | null | undefined): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path}`,
    ...(updatedAt ? { lastModified: updatedAt } : {}),
    changeFrequency: "weekly",
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A preview deployment lists nothing (robots.txt disallows it too).
  if (IS_NON_PRODUCTION_DEPLOY) return [];

  const [homeUpdatedAt, services, aboutUpdatedAt, contactUpdatedAt, joinUpdatedAt] = await Promise.all([
    getHomepageUpdatedAt(),
    getServiceIndex(),
    getSitePageUpdatedAt("about"),
    getSitePageUpdatedAt("contact"),
    getSitePageUpdatedAt("join-our-crew"),
  ]);

  return [
    entry("/", 1, homeUpdatedAt),
    ...services.map((s) => entry(servicePath(s.slug), 0.9, s.updatedAt)),
    entry(sitePagePath("about"), 0.8, aboutUpdatedAt),
    entry(contactPath(), 0.8, contactUpdatedAt),
    entry(sitePagePath("join-our-crew"), 0.8, joinUpdatedAt),
  ];
}
