import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { normalizeSecret, sharedSecret } from "@/lib/adminApi";

// Called by jmt-admin after every content save (and by its manual
// "revalidate" button) — see jmt-admin/app/lib/utils/revalidateFrontend.ts.
// Expires the cached admin API reads tagged with `tags` (server/homepage.ts)
// and the rendered homepage, so the next visit shows the new content.

const TAG_PATTERN = /^[a-z0-9_-]{1,100}$/i;

export async function POST(req: NextRequest) {
  const expected = sharedSecret();
  const provided = normalizeSecret(req.headers.get("x-revalidate-secret"));
  if (!expected || provided !== expected) {
    return NextResponse.json({ success: false, message: "Invalid revalidate secret" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const tags: unknown = body?.tags;
  if (
    !Array.isArray(tags) ||
    tags.length === 0 ||
    tags.length > 50 ||
    !tags.every((t) => typeof t === "string" && TAG_PATTERN.test(t))
  ) {
    return NextResponse.json({ success: false, message: "tags array required" }, { status: 400 });
  }

  for (const tag of tags as string[]) revalidateTag(tag, { expire: 0 });
  revalidatePath("/");

  return NextResponse.json({ success: true, revalidated: tags });
}
