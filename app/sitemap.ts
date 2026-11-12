import type { MetadataRoute } from "next";
import { LOCALES, localePath, type Locale } from "@/lib/i18n";
import { IS_NON_PRODUCTION_DEPLOY, SITE_URL } from "@/lib/site";
import { contactPath, servicePath, sitePagePath } from "@/lib/siteLinks";
import { getHomepageUpdatedAt } from "@/server/homepage";
import { getServiceIndex } from "@/server/service";
import { getSitePageUpdatedAt } from "@/server/sitePages";

// /sitemap.xml — every indexable page in every language, each <url> carrying
// the full hreflang group (en, bn, hi, x-default → English). Same URLs as each
// page's `alternates` in generateMetadata (lib/seo.ts):
//
//   /                  homepage        /bn  /hi
//   /service/<slug>    each service    /bn/service/<slug>  /hi/service/<slug>
//   /about             About           /bn/about  /hi/about
//   /contact           Contact         /bn/contact  /hi/contact
//   /join-our-crew     Join our crew   /bn/join-our-crew  /hi/join-our-crew
//
// <lastmod> is the CMS row's updatedAt (homepage, service page, site page);
// it is omitted — never invented — when the CMS has no saved row.
// Redirect-only URLs (/services, /contact-us, /careers, … in proxy.ts),
// /api/*, admin and preview URLs are never listed.

// Matches SERVICE_REVALIDATE_SECONDS. The service index is fetched under the
// "jmt-service-list" tag, so publishing a page lists it at once.
export const revalidate = 600;

type PathFor = (lang: Locale) => string;

function group(pathFor: PathFor, priority: number, updatedAt: string | null | undefined): MetadataRoute.Sitemap {
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}${pathFor(l)}`]));
  languages["x-default"] = `${SITE_URL}${pathFor("en")}`;
  return LOCALES.map((lang) => ({
    url: `${SITE_URL}${pathFor(lang)}`,
    ...(updatedAt ? { lastModified: updatedAt } : {}),
    changeFrequency: "weekly" as const,
    priority: lang === "en" ? priority : Math.round(priority * 8) / 10,
    alternates: { languages },
  }));
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
    ...group(localePath, 1, homeUpdatedAt),
    ...services.flatMap((s) => group((l) => servicePath(l, s.slug), 0.9, s.updatedAt)),
    ...group((l) => sitePagePath(l, "about"), 0.8, aboutUpdatedAt),
    ...group(contactPath, 0.8, contactUpdatedAt),
    ...group((l) => sitePagePath(l, "join-our-crew"), 0.8, joinUpdatedAt),
  ];
}
