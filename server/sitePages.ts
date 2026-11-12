// Server-side data layer for the CMS-driven site pages (About, Contact,
// Join our crew). Same approach as server/homepage.ts and server/service.ts:
//
//   • cached     — the fetch is cached under the page's tag; jmt-admin expires
//                  it on every save via POST /api/revalidate, and it also
//                  expires after SITE_PAGE_REVALIDATE_SECONDS (ISR).
//   • resilient  — the saved document is merged over the bundled copy
//                  (lib/sitePages/mergeContent.ts), and if jmt-admin is down
//                  or has nothing saved the bundled copy is served as-is.

import { cache } from "react";
import { ADMIN_TIMEOUT_MS, adminUrl } from "@/lib/adminApi";
import { getPreviewDraft } from "@/lib/preview";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepage/buildHomepage";
import { isPlainObject, mergeContent } from "@/lib/sitePages/mergeContent";
import {
  SITE_PAGE_DEFAULTS,
  SITE_PAGE_LOCKED,
  sitePageTag,
  type SitePageContent,
  type SitePageKey,
} from "@/lib/sitePages/registry";

export const SITE_PAGE_REVALIDATE_SECONDS = HOMEPAGE_REVALIDATE_SECONDS;

interface SavedSitePage {
  content: unknown;
  /** ISO time of the last save in jmt-admin. */
  updatedAt: string | null;
}

/** Deduped per request: generateMetadata, the page, the sitemap and server actions share one fetch. */
const fetchSitePage = cache(async (key: SitePageKey): Promise<SavedSitePage | null> => {
  // Previewing unsaved edits from the dashboard (lib/preview.ts).
  const preview = await getPreviewDraft();
  if (preview?.kind === "site-page" && preview.key === key) return { content: preview.content, updatedAt: null };
  try {
    const res = await fetch(adminUrl(`/api/site-pages/client/${key}`), {
      cache: "force-cache",
      next: { tags: [sitePageTag(key)], revalidate: SITE_PAGE_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(ADMIN_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body: unknown = await res.json();
    if (!isPlainObject(body) || !("page" in body)) throw new Error("unexpected response shape");
    if (!isPlainObject(body.page)) return null;
    return {
      content: body.page.content,
      updatedAt: typeof body.page.updatedAt === "string" ? body.page.updatedAt : null,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.error(`[site-pages] jmt-admin API unavailable for "${key}", using bundled content: ${reason}`);
    return null;
  }
});

const getSitePage = cache(async (key: SitePageKey): Promise<unknown> => {
  const raw = (await fetchSitePage(key))?.content;
  return raw == null ? SITE_PAGE_DEFAULTS[key] : mergeContent(raw, SITE_PAGE_DEFAULTS[key], SITE_PAGE_LOCKED[key]);
});

/** Last CMS save of a site page (sitemap <lastmod>); null when only the bundled copy exists. */
export const getSitePageUpdatedAt = async (key: SitePageKey) => (await fetchSitePage(key))?.updatedAt ?? null;

export const getAboutPage = async () => (await getSitePage("about")) as SitePageContent<"about">;
export const getContactPage = async () => (await getSitePage("contact")) as SitePageContent<"contact">;
export const getJoinPage = async () => (await getSitePage("join-our-crew")) as SitePageContent<"join-our-crew">;
