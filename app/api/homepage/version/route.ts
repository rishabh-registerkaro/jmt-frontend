import { NextResponse } from "next/server";
import { ADMIN_TIMEOUT_MS, adminUrl } from "@/lib/adminApi";
import { HOMEPAGE_REVALIDATE_SECONDS, HOMEPAGE_TAGS } from "@/lib/homepage/buildHomepage";

// Public, tiny: lets open homepage tabs notice a new save and refresh
// themselves (components/homepage/LiveRefresh.tsx). Forwards to
// jmt-admin's /api/homepage/version through a fetch cached under the
// "homepage" tag, so polling costs nothing until the admin saves (the save
// expires the tag via app/api/revalidate).
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(adminUrl("/api/homepage/version"), {
      cache: "force-cache",
      next: { tags: [HOMEPAGE_TAGS.homePage], revalidate: HOMEPAGE_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(ADMIN_TIMEOUT_MS),
    });
    if (res.ok) {
      const data: { version?: unknown } = await res.json();
      if (typeof data.version === "string") {
        return NextResponse.json({ version: data.version }, { headers: { "Cache-Control": "no-store" } });
      }
    }
  } catch {
    // Fall through to 503 below.
  }
  // jmt-admin unreachable: a non-OK status makes LiveRefresh skip this tick
  // instead of treating "no version" as a change.
  return NextResponse.json({ version: null }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
