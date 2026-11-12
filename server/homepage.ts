// Server-side data layer for the public homepage.
//
// This project has no database access: the content comes from the jmt-admin
// API (GET /api/homepage/client), which reads MySQL and builds the full view
// model (jmt-admin/server/homepage.ts).
//
//   • cached     — the fetch is cached under the same tags jmt-admin expires
//                  on every save; it then calls this site's POST /api/revalidate
//                  (app/api/revalidate/route.ts), so edits show at once.
//   • deduped    — layout and page share one request via React `cache`.
//   • resilient  — if jmt-admin is down or answers badly, the page falls back
//                  to the bundled (Figma) content, built by the same code the
//                  admin uses (lib/homepage/buildHomepage.ts). Only HTTP 200
//                  responses are cached, so a fallback is never stored.

import { cache } from "react";
import { ADMIN_TIMEOUT_MS, adminUrl } from "@/lib/adminApi";
import {
  HOMEPAGE_REVALIDATE_SECONDS,
  HOMEPAGE_TAGS,
  buildHomepageData,
  buildSiteChrome,
} from "@/lib/homepage/buildHomepage";
import { mapChromeLinks, mapServiceCards } from "@/lib/siteLinks";
import type { HomepageData, SiteChrome, SwitcherLanguage } from "@/types/homepage";

export { HOMEPAGE_REVALIDATE_SECONDS, HOMEPAGE_TAGS } from "@/lib/homepage/buildHomepage";

/** Body of jmt-admin's GET /api/homepage/client. */
interface HomepageBundle {
  data: HomepageData;
  chrome: SiteChrome;
  version: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBundle(value: unknown): value is HomepageBundle {
  return (
    isRecord(value) &&
    isRecord(value.data) &&
    isRecord(value.data.enabled) &&
    Array.isArray(value.data.order) &&
    isRecord(value.data.contactCopy) &&
    isRecord(value.data.contactCopy.form) &&
    isRecord(value.chrome) &&
    isRecord(value.chrome.contact) &&
    isRecord(value.chrome.labels) &&
    isRecord(value.chrome.brand) &&
    Array.isArray(value.chrome.languages) &&
    typeof value.version === "string"
  );
}

function fallbackBundle(lang: SwitcherLanguage): HomepageBundle {
  return {
    data: buildHomepageData(null, [], lang),
    chrome: buildSiteChrome(null, null, null, lang),
    version: "",
  };
}

/**
 * Fills in any request-form label the admin response lacks (e.g. a field added
 * after the content was saved or cached, like "email") from the built-in
 * defaults in the same language, so a new field never renders without a label.
 */
function withFormLabelDefaults(bundle: HomepageBundle, lang: SwitcherLanguage): HomepageBundle {
  const form = bundle.data.contactCopy.form;
  const labels: Record<string, unknown> = isRecord(form.labels) ? form.labels : {};
  const defaults = buildHomepageData(null, [], lang).contactCopy.form.labels;
  const merged = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof typeof defaults)[]) {
    const value = labels[key];
    if (typeof value === "string" && value.trim() !== "") merged[key] = value;
  }
  return {
    ...bundle,
    data: {
      ...bundle.data,
      contactCopy: { ...bundle.data.contactCopy, form: { ...form, labels: merged } },
    },
  };
}

/**
 * Points homepage links at the service pages and makes the shared navbar and
 * footer anchors work from every page (lib/siteLinks.ts).
 */
function withSiteLinks(bundle: HomepageBundle, lang: SwitcherLanguage): HomepageBundle {
  return { ...bundle, data: mapServiceCards(bundle.data, lang), chrome: mapChromeLinks(bundle.chrome, lang) };
}

/** One cached request per language (the URL differs); all share the same tags. */
const getBundle = cache(async (lang: SwitcherLanguage): Promise<HomepageBundle> => withSiteLinks(await fetchBundle(lang), lang));

async function fetchBundle(lang: SwitcherLanguage): Promise<HomepageBundle> {
  try {
    const res = await fetch(adminUrl(`/api/homepage/client?locale=${lang}`), {
      cache: "force-cache",
      next: { tags: Object.values(HOMEPAGE_TAGS), revalidate: HOMEPAGE_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(ADMIN_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body: unknown = await res.json();
    if (!isBundle(body)) throw new Error("unexpected response shape");
    return withFormLabelDefaults(body, lang);
  } catch (error) {
    const reason = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.error(`[homepage] jmt-admin API unavailable, using fallback content: ${reason}`);
    return fallbackBundle(lang);
  }
}

/** Navbar, footer and contact details in `lang`. */
export async function getSiteChrome(lang: SwitcherLanguage): Promise<SiteChrome> {
  return (await getBundle(lang)).chrome;
}

/** Version stamp of the saved homepage ("" when none). Used by LiveRefresh. */
export async function getHomepageVersion(lang: SwitcherLanguage): Promise<string> {
  return (await getBundle(lang)).version;
}

/** All section content for the homepage in `lang`. */
export async function getHomepageData(lang: SwitcherLanguage): Promise<HomepageData> {
  return (await getBundle(lang)).data;
}
