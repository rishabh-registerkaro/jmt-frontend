import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { PREVIEW_COOKIE, PREVIEW_TOKEN_PATTERN } from "@/lib/preview";

// Opened by the jmt-admin dashboard's "Preview" button (lib/preview.ts):
//   /api/preview?token=<draft token>&path=/service/x  → preview on, go to the page
//   /api/preview?exit=1&path=/service/x               → preview off, back to the live page
// The token only lets this browser read one unsaved draft for a few hours;
// the draft itself is fetched server-to-server with the shared secret.

/** Only same-site paths, so this can't be used as an open redirect. */
function safePath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\") || raw.length > 300) return "/";
  return raw;
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const target = safePath(params.get("path"));
  const draft = await draftMode();
  const jar = await cookies();

  if (params.has("exit")) {
    draft.disable();
    jar.delete(PREVIEW_COOKIE);
    redirect(target);
  }

  const token = params.get("token") ?? "";
  if (!PREVIEW_TOKEN_PATTERN.test(token)) {
    return new Response("Invalid preview link", { status: 400, headers: { "X-Robots-Tag": "noindex" } });
  }

  draft.enable();
  jar.set(PREVIEW_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  redirect(target);
}
