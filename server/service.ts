// Server-side data layer for the service pages (app/service/[slug]).
//
// Content is edited in jmt-admin (Dashboard → JMT Service Pages) and read
// through its public API, the same way as the homepage (server/homepage.ts):
//
//   • cached     — fetches are cached under SERVICE_TAGS; jmt-admin expires
//                  them on every save via POST /api/revalidate, and they also
//                  expire after SERVICE_REVALIDATE_SECONDS (ISR).
//   • resilient  — pages with built-in content (data/services/*) still render
//                  if jmt-admin is down or has not saved them yet. A page that
//                  only exists in the CMS throws instead, so ISR keeps serving
//                  the last good version rather than caching an error.

import { cache } from "react";
import { ADMIN_TIMEOUT_MS, adminUrl } from "@/lib/adminApi";
import { getPreviewDraft } from "@/lib/preview";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepage/buildHomepage";
import { SERVICE_SLUG_PATTERN, normalizeServicePage } from "@/lib/service/normalizeServicePage";
import { SITE_LABOUR_SUPPLY } from "@/data/services/siteLabourSupply";
import type { ServicePageContent } from "@/types/service";

export const SERVICE_REVALIDATE_SECONDS = HOMEPAGE_REVALIDATE_SECONDS;

/** Must match jmtServiceTags in jmt-admin/app/lib/utils/revalidateFrontend.ts. */
export const SERVICE_TAGS = {
  list: "jmt-service-list",
  page: (slug: string) => `jmt-service-${slug}`,
};

/** Pages shipped with the site; used until the CMS has a published version. */
const BUILT_IN: Record<string, ServicePageContent> = {
  [SITE_LABOUR_SUPPLY.slug]: SITE_LABOUR_SUPPLY,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const reason = (error: unknown) => (error instanceof Error ? error.message.split("\n")[0] : String(error));

async function adminJson(path: string, tags: string[]): Promise<unknown> {
  const res = await fetch(adminUrl(path), {
    cache: "force-cache",
    next: { tags, revalidate: SERVICE_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(ADMIN_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * A published service page, or null when no page has this slug.
 * Deduped per request (generateMetadata and the page share one fetch).
 */
export const getServicePage = cache(async (slug: string): Promise<ServicePageContent | null> => {
  if (!SERVICE_SLUG_PATTERN.test(slug)) return null;
  const builtIn = BUILT_IN[slug];
  // Previewing unsaved edits from the dashboard (lib/preview.ts) — drafts included.
  const preview = await getPreviewDraft();
  if (preview?.kind === "service" && preview.slug === slug) return normalizeServicePage(preview.content, slug, builtIn);
  try {
    const body = await adminJson(`/api/jmt-services/client/${slug}`, [SERVICE_TAGS.page(slug), SERVICE_TAGS.list]);
    if (!isRecord(body) || !("page" in body)) throw new Error("unexpected response shape");
    // Not published in the CMS → built-in content if this page ships with the site.
    if (!isRecord(body.page)) return builtIn ?? null;
    return normalizeServicePage(body.page.content, slug, builtIn);
  } catch (error) {
    if (builtIn) {
      console.error(`[service] jmt-admin API unavailable for "${slug}", using built-in content: ${reason(error)}`);
      return builtIn;
    }
    throw new Error(`[service] could not load "${slug}" from jmt-admin: ${reason(error)}`);
  }
});

export interface ServiceIndexEntry {
  slug: string;
  /** Last CMS change (ISO), when the page is saved in jmt-admin. Built-in-only pages have none. */
  updatedAt?: string;
}

/** Published CMS pages plus the built-in ones, with their last CMS change. */
export async function getServiceIndex(): Promise<ServiceIndexEntry[]> {
  const index = new Map<string, ServiceIndexEntry>(Object.keys(BUILT_IN).map((slug) => [slug, { slug }]));
  try {
    const body = await adminJson("/api/jmt-services/client", [SERVICE_TAGS.list]);
    if (isRecord(body) && Array.isArray(body.pages)) {
      for (const page of body.pages) {
        if (!isRecord(page) || typeof page.slug !== "string" || !SERVICE_SLUG_PATTERN.test(page.slug)) continue;
        const updatedAt = typeof page.updatedAt === "string" ? page.updatedAt : undefined;
        index.set(page.slug, { slug: page.slug, updatedAt });
      }
    } else if (isRecord(body) && Array.isArray(body.slugs)) {
      // Older jmt-admin builds answer with slugs only.
      for (const slug of body.slugs) {
        if (typeof slug === "string" && SERVICE_SLUG_PATTERN.test(slug) && !index.has(slug)) index.set(slug, { slug });
      }
    }
  } catch (error) {
    // Not fatal: pages not prerendered here are rendered on their first visit.
    console.error(`[service] could not list service pages from jmt-admin: ${reason(error)}`);
  }
  return [...index.values()];
}

/** Slugs to prerender at build time: published CMS pages plus the built-in ones. */
export async function getServiceSlugs(): Promise<string[]> {
  return (await getServiceIndex()).map((entry) => entry.slug);
}
