// Preview of UNSAVED edits from the jmt-admin dashboard ("Preview" button).
//
// The dashboard stores the draft in jmt-admin and opens /api/preview here,
// which turns on Next.js Draft Mode for that one browser and remembers the
// draft token in the `jmt-preview` cookie. While Draft Mode is on, the server
// data layer (server/homepage.ts, server/service.ts, server/sitePages.ts)
// renders the draft instead of the published content. Every other visitor
// keeps getting the cached, published pages.
//
// Server-only.

import { cache } from "react";
import { cookies, draftMode } from "next/headers";
import { ADMIN_TIMEOUT_MS, adminUrl, sharedSecret } from "@/lib/adminApi";

export const PREVIEW_COOKIE = "jmt-preview";
/** Must match TOKEN_PATTERN in jmt-admin/app/lib/server/previewStore.ts. */
export const PREVIEW_TOKEN_PATTERN = /^[a-f0-9]{32}$/;

/** Body of jmt-admin's GET /api/preview/[token] (draft part). */
export type PreviewDraft =
  | { kind: "homepage"; bundle: unknown }
  | { kind: "service"; slug: string; content: unknown }
  | { kind: "site-page"; key: string; content: unknown };

/** The preview token of this request, or null when not previewing. */
export async function getPreviewToken(): Promise<string | null> {
  // draftMode() is safe during static rendering (always off there), so
  // cookies() — which would make the page dynamic — is only read in preview.
  if (!(await draftMode()).isEnabled) return null;
  const token = (await cookies()).get(PREVIEW_COOKIE)?.value ?? "";
  return PREVIEW_TOKEN_PATTERN.test(token) ? token : null;
}

/** Reads a draft (or just its revision with `revOnly`) from jmt-admin; null when unknown/expired/unreachable. */
export async function fetchPreview(token: string, query: string): Promise<{ rev: number | null; draft: PreviewDraft | null }> {
  try {
    const res = await fetch(adminUrl(`/api/preview/${token}?${query}`), {
      cache: "no-store",
      headers: { "x-revalidate-secret": sharedSecret() },
      signal: AbortSignal.timeout(ADMIN_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { rev?: unknown; draft?: unknown };
    const draft = typeof body.draft === "object" && body.draft !== null ? (body.draft as PreviewDraft) : null;
    return { rev: typeof body.rev === "number" ? body.rev : null, draft };
  } catch (error) {
    console.error(`[preview] could not read the draft from jmt-admin: ${error instanceof Error ? error.message : error}`);
    return { rev: null, draft: null };
  }
}

/**
 * The editor's unsaved draft for this request, or null (not previewing, or
 * the preview expired).
 * Deduped per request.
 */
export const getPreviewDraft = cache(async (): Promise<PreviewDraft | null> => {
  const token = await getPreviewToken();
  if (!token) return null;
  return (await fetchPreview(token, "locale=en")).draft;
});
