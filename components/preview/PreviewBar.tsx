"use client";

// Shown only while previewing unsaved dashboard edits (lib/preview.ts).
// Tells the editor this is not the live site, follows their edits (polls the
// draft revision and re-renders the page when it changes, keeping scroll),
// and offers a way back to the live page.

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const POLL_MS = 1500;

export default function PreviewBar() {
  const router = useRouter();
  const pathname = usePathname();
  const known = useRef<number | null | undefined>(undefined);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let stopped = false;
    const check = async () => {
      if (stopped || document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/preview/version", { cache: "no-store" });
        if (!res.ok) return;
        const { rev } = (await res.json()) as { rev: number | null };
        setExpired(rev === null);
        if (rev !== null && known.current !== undefined && rev !== known.current) router.refresh();
        known.current = rev;
      } catch {
        // Offline or restarting — next tick.
      }
    };
    void check();
    const timer = window.setInterval(check, POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [router]);

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-20 z-[70] mx-auto flex max-w-xl items-center gap-3 rounded-full bg-ink/95 py-2 pr-2 pl-4 text-sm text-white shadow-lg backdrop-blur md:bottom-4"
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-orange" aria-hidden />
      <span className="min-w-0 flex-1 truncate">
        {expired ? (
          <>Preview expired — click <strong>Preview</strong> in the dashboard again</>
        ) : (
          <>
            <strong>Preview</strong> — unsaved changes, not on the live site
          </>
        )}
      </span>
      <a
        href={`/api/preview?exit=1&path=${encodeURIComponent(pathname || "/")}`}
        className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 font-semibold text-white no-underline hover:bg-white/25"
      >
        Exit preview
      </a>
    </div>
  );
}
