"use client";

// Keeps an open homepage tab in sync with the CMS: when the admin saves in
// /dashboard/homepage, this re-renders the page with the new content — no
// manual reload. Two signals:
//   • a BroadcastChannel message from the editor (instant; same origin only, i.e. when both apps share a domain)
//   • a cheap version check when the tab regains focus, and every 30 s while
//     it is visible (works for every visitor; the endpoint is cache-backed)
// router.refresh() re-fetches the server components only, so scroll position
// and form input are kept.

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export const HOMEPAGE_CHANNEL = "jmt-homepage";
const POLL_MS = 30_000;

export default function LiveRefresh({ version }: { version: string }) {
  const router = useRouter();
  const known = useRef(version);

  // The server-rendered version is the truth after each refresh.
  useEffect(() => {
    known.current = version;
  }, [version]);

  useEffect(() => {
    let stopped = false;

    const check = async () => {
      if (stopped || document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/homepage/version", { cache: "no-store" });
        if (!res.ok) return;
        const data: { version?: string } = await res.json();
        if (typeof data.version === "string" && data.version !== known.current) {
          known.current = data.version;
          router.refresh();
        }
      } catch {
        // Offline or server restarting — try again on the next tick.
      }
    };

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(HOMEPAGE_CHANNEL);
      channel.onmessage = () => {
        router.refresh();
        void check();
      };
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    const timer = window.setInterval(check, POLL_MS);

    return () => {
      stopped = true;
      channel?.close();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.clearInterval(timer);
    };
  }, [router]);

  return null;
}
