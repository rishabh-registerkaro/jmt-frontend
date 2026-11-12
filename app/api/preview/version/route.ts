import { NextResponse } from "next/server";
import { fetchPreview, getPreviewToken } from "@/lib/preview";

// Polled by the preview bar (components/preview/PreviewBar.tsx): the revision
// of the draft being previewed. It goes up each time the editor changes the
// form, and the bar then re-renders the page. { rev: null } = expired / not previewing.
export const dynamic = "force-dynamic";

export async function GET() {
  const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  const token = await getPreviewToken();
  if (!token) return NextResponse.json({ rev: null }, { headers });
  const { rev } = await fetchPreview(token, "rev=1");
  return NextResponse.json({ rev }, { headers });
}
