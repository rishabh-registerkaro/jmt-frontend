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
import type { HomepageData, SiteChrome } from "@/types/homepage";

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
    isRecord(value.chrome) &&
    isRecord(value.chrome.contact) &&
    typeof value.version === "string"
  );
}

function fallbackBundle(): HomepageBundle {
  return {
    data: buildHomepageData(null, [], []),
    chrome: buildSiteChrome(null, null, null),
    version: "",
  };
}

const getBundle = cache(async (): Promise<HomepageBundle> => {
  try {
    const res = await fetch(adminUrl("/api/homepage/client"), {
      cache: "force-cache",
      next: { tags: Object.values(HOMEPAGE_TAGS), revalidate: HOMEPAGE_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(ADMIN_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body: unknown = await res.json();
    if (!isBundle(body)) throw new Error("unexpected response shape");
    return body;
  } catch (error) {
    const reason = error instanceof Error ? error.message.split("\n")[0] : String(error);
    console.error(`[homepage] jmt-admin API unavailable, using fallback content: ${reason}`);
    return fallbackBundle();
  }
});

/** Navbar, footer and contact details. */
export async function getSiteChrome(): Promise<SiteChrome> {
  return (await getBundle()).chrome;
}

/** Version stamp of the saved homepage ("" when none). Used by LiveRefresh. */
export async function getHomepageVersion(): Promise<string> {
  return (await getBundle()).version;
}

/** All section content for the homepage. */
export async function getHomepageData(): Promise<HomepageData> {
  return (await getBundle()).data;
}
