// SEO & Scripts from jmt-admin (Dashboard → SEO & Scripts): Google Tag
// Manager, custom script snippets and JSON-LD, site-wide and per page.
// Rendered by components/seo/* from app/layout.tsx (site-wide) and each
// page's <PageSeo path=… /> (that page only).
//
//   • cached     — one fetch for the whole site under SEO_TAG; jmt-admin
//                  expires it on every save via POST /api/revalidate.
//   • optional   — if jmt-admin can't be reached the site renders without
//                  these extras instead of failing.
//   • re-checked — jmt-admin validates on save; the same allow-list is applied
//                  here again, so nothing outside it is ever rendered.

import { cache } from "react";
import { ADMIN_TIMEOUT_MS, adminUrl } from "@/lib/adminApi";
import { HOMEPAGE_REVALIDATE_SECONDS } from "@/lib/homepage/buildHomepage";

/** Must match JMT_SEO_TAG in jmt-admin/app/lib/utils/cacheTags.ts. */
export const SEO_TAG = "jmt-seo";

export type ScriptTiming = "early" | "default" | "lazy";

type Attrs = Record<string, string>;
export type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

export type SeoNode =
  | { tag: "script"; attrs: Attrs; inner?: string }
  | { tag: "noscript"; inner: string }
  | { tag: "meta"; attrs: Attrs }
  | { tag: "link"; attrs: Attrs }
  | { tag: "jsonld"; data: JsonLdData };

export interface SeoScript {
  id: string;
  timing: ScriptTiming;
  nodes: SeoNode[];
}

export interface SeoEntry {
  schemas: Record<string, unknown>[];
  scripts: SeoScript[];
}

export interface SeoConfig {
  gtmId: string | null;
  global: SeoEntry;
  pages: Record<string, SeoEntry>;
}

const EMPTY_ENTRY: SeoEntry = { schemas: [], scripts: [] };
const EMPTY: SeoConfig = { gtmId: null, global: EMPTY_ENTRY, pages: {} };

// ── Validation (same allow-list as jmt-admin app/lib/content/seo.ts) ─────────

export const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,12}$/;
const TIMINGS = new Set<ScriptTiming>(["early", "default", "lazy"]);
const ATTRS: Record<"script" | "meta" | "link", Set<string>> = {
  script: new Set(["src", "async", "defer", "type", "id", "crossorigin", "integrity", "referrerpolicy", "nomodule", "charset"]),
  meta: new Set(["name", "property", "content", "itemprop"]),
  link: new Set(["rel", "href", "as", "crossorigin", "type", "sizes", "media", "hreflang", "title", "referrerpolicy", "integrity"]),
};
const SCRIPT_TYPES = new Set(["", "text/javascript", "application/javascript", "module"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const isHttps = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

function readAttrs(tag: keyof typeof ATTRS, raw: unknown): Attrs | null {
  if (!isRecord(raw)) return null;
  const attrs: Attrs = {};
  for (const [name, value] of Object.entries(raw)) {
    if (typeof value !== "string" || name.startsWith("on")) return null;
    if (!ATTRS[tag].has(name) && !/^data-[a-z0-9-]+$/.test(name)) continue;
    if ((name === "src" || name === "href") && !isHttps(value)) return null;
    attrs[name] = value;
  }
  return attrs;
}

/**
 * Tags this site already writes from each page's own SEO fields (pageMetadata
 * in lib/seo.ts) or the layout. A copy from jmt-admin is dropped so it can
 * never duplicate or override them. Same rule as reservedTagReason in
 * jmt-admin app/lib/content/seo.ts, which refuses them on save.
 */
const RESERVED_META_NAMES = new Set(["description", "robots", "googlebot", "bingbot", "viewport"]);
function isReservedTag(tag: "meta" | "link", attrs: Attrs): boolean {
  if (tag === "meta") {
    const name = (attrs.name ?? "").trim().toLowerCase();
    const property = (attrs.property ?? "").trim().toLowerCase();
    return RESERVED_META_NAMES.has(name) || /^(og|twitter):/.test(name) || /^(og|twitter):/.test(property);
  }
  const rels = (attrs.rel ?? "").toLowerCase().split(/\s+/);
  return rels.includes("canonical") || rels.includes("alternate");
}

/** A JSON-LD object: has @type or @graph. */
const isSchema = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && ("@type" in value || "@graph" in value);

function readNode(raw: unknown): SeoNode | null {
  if (!isRecord(raw)) return null;
  switch (raw.tag) {
    case "script": {
      const attrs = readAttrs("script", raw.attrs);
      if (!attrs || !SCRIPT_TYPES.has((attrs.type ?? "").toLowerCase())) return null;
      const inner = typeof raw.inner === "string" && raw.inner.trim() ? raw.inner : undefined;
      // Either an external file or inline code, never both or neither.
      if (Boolean(attrs.src) === Boolean(inner)) return null;
      if (inner && /<\/script/i.test(inner)) return null;
      return { tag: "script", attrs, inner };
    }
    case "noscript":
      return typeof raw.inner === "string" && raw.inner.trim() && !/<script/i.test(raw.inner)
        ? { tag: "noscript", inner: raw.inner }
        : null;
    case "meta":
    case "link": {
      const attrs = readAttrs(raw.tag, raw.attrs);
      return attrs && !isReservedTag(raw.tag, attrs) ? { tag: raw.tag, attrs } : null;
    }
    case "jsonld": {
      const data = raw.data;
      if (isSchema(data)) return { tag: "jsonld", data };
      if (Array.isArray(data) && data.length > 0 && data.every(isSchema)) return { tag: "jsonld", data };
      return null;
    }
    default:
      return null;
  }
}

function readEntry(raw: unknown, { global }: { global: boolean }): SeoEntry {
  if (!isRecord(raw)) return EMPTY_ENTRY;
  const schemas = Array.isArray(raw.schemas) ? raw.schemas.filter(isSchema) : [];
  const scripts: SeoScript[] = [];
  for (const script of Array.isArray(raw.scripts) ? raw.scripts : []) {
    if (!isRecord(script) || typeof script.id !== "string" || !/^[a-z0-9]{4,16}$/.test(script.id)) continue;
    let timing: ScriptTiming = TIMINGS.has(script.timing as ScriptTiming) ? (script.timing as ScriptTiming) : "default";
    // "Early" (beforeInteractive) only works from the root layout.
    if (timing === "early" && !global) timing = "default";
    const nodes = (Array.isArray(script.nodes) ? script.nodes : []).map(readNode).filter((n): n is SeoNode => n !== null);
    if (nodes.length) scripts.push({ id: script.id, timing, nodes });
  }
  return { schemas, scripts };
}

function readConfig(body: unknown): SeoConfig {
  if (!isRecord(body)) throw new Error("unexpected response shape");
  const gtmId = typeof body.gtmId === "string" && GTM_ID_PATTERN.test(body.gtmId) ? body.gtmId : null;
  const pages: Record<string, SeoEntry> = {};
  if (isRecord(body.pages)) {
    for (const [path, entry] of Object.entries(body.pages)) pages[path] = readEntry(entry, { global: false });
  }
  return { gtmId, global: readEntry(body.global, { global: true }), pages };
}

// ── Data ─────────────────────────────────────────────────────────────────────

const reason = (error: unknown) => (error instanceof Error ? error.message.split("\n")[0] : String(error));

/** The whole config, deduped per request (the layout and the page share one fetch). */
export const getSeoConfig = cache(async (): Promise<SeoConfig> => {
  try {
    const res = await fetch(adminUrl("/api/seo/client"), {
      cache: "force-cache",
      next: { tags: [SEO_TAG], revalidate: HOMEPAGE_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(ADMIN_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return readConfig(await res.json());
  } catch (error) {
    console.error(`[seo] jmt-admin SEO settings unavailable, rendering without them: ${reason(error)}`);
    return EMPTY;
  }
});

/** Normalized form of a page path, as keys are saved in jmt-admin ("/About/" → "/about"). */
export const seoPathKey = (path: string) => path.trim().toLowerCase().replace(/\/+$/, "") || "/";

/** One page's own SEO entry (empty when nothing is saved for it). */
export async function getPageSeo(path: string): Promise<SeoEntry> {
  const config = await getSeoConfig();
  return config.pages[seoPathKey(path)] ?? EMPTY_ENTRY;
}
