"use client";

import { useEffect, useRef, useState } from "react";
import { MANDALA_PATH } from "./mandalaPath";
import { INTRO_STORAGE_KEY } from "./introBoot";

// First-visit intro: the mandala outline draws itself, the brand name rises
// letter by letter and a 000→100 counter tracks the page load. At 100 the
// overlay splits open (brown up, orange down) and <html> gets `intro-done`,
// which starts the staggered hero reveal (.reveal / .reveal-zoom in
// styles/public.css).
//
// The inline script in app/[lang]/layout.tsx decides before first paint:
//   html.intro-play — play this intro (first visit in this tab session)
//   html.intro-skip — already seen, or prefers-reduced-motion; overlay hidden by CSS
// With JS off neither class is set, so the overlay never shows. A CSS
// failsafe hides it after a few seconds if this component never runs.

const MIN_MS = 1500; // never flash by faster than this
const MAX_MS = 3200; // never wait longer than this for window.load
const EXIT_MS = 900; // matches the curtain animation in public.css

export default function IntroLoader({ brandName }: { brandName: string }) {
  const [gone, setGone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    // Skipped (seen this session / reduced motion): CSS already hides the overlay.
    if (!html.classList.contains("intro-play")) return;

    html.classList.add("intro-lock");
    const start = performance.now();
    let shown = 0;
    let raf = 0;
    let exitTimer = 0;
    let loaded = document.readyState === "complete";
    const onLoad = () => {
      loaded = true;
    };
    window.addEventListener("load", onLoad);

    const paint = (v: number) => {
      const n = Math.round(v);
      if (countRef.current) countRef.current.textContent = String(n).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`;
    };

    const finish = () => {
      try {
        sessionStorage.setItem(INTRO_STORAGE_KEY, "1");
      } catch {
        /* private mode: intro just plays again next time */
      }
      setLeaving(true);
      html.classList.add("intro-done");
      exitTimer = window.setTimeout(() => {
        html.classList.remove("intro-lock");
        setGone(true);
      }, EXIT_MS);
    };

    const tick = (now: number) => {
      const t = now - start;
      const ready = (loaded && t >= MIN_MS) || t >= MAX_MS;
      // Ease toward 90 while loading, then run quickly to 100 once ready.
      const target = ready ? 100 : Math.min(90, (t / MIN_MS) * 90);
      shown += (target - shown) * (ready ? 0.18 : 0.08);
      if (ready && shown > 99.5) {
        paint(100);
        finish();
        return;
      }
      paint(shown);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(exitTimer);
      window.removeEventListener("load", onLoad);
      html.classList.remove("intro-lock");
    };
  }, []);

  if (gone) return null;

  const letters = Array.from(brandName);

  return (
    <div className={`intro${leaving ? " is-leaving" : ""}`} aria-hidden="true">
      <span className="intro-panel intro-panel--top" />
      <span className="intro-panel intro-panel--bottom" />

      <div className="intro-stage">
        <div className="intro-mark">
          <span className="intro-ring" />
          <span className="intro-ring intro-ring--late" />
          <svg viewBox="0 0 547.64 535.74" className="intro-mandala">
            <defs>
              <linearGradient id="intro-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#f26322" />
                <stop offset="1" stopColor="#fbac18" />
              </linearGradient>
            </defs>
            <path d={MANDALA_PATH} pathLength={1} className="intro-mandala-fill" fillRule="evenodd" />
            <path d={MANDALA_PATH} pathLength={1} className="intro-mandala-line" />
          </svg>
        </div>

        <p className="intro-name">
          {letters.map((ch, i) => (
            <span key={i} className="intro-letter-mask">
              <span className="intro-letter" style={{ "--i": i } as React.CSSProperties}>
                {ch === " " ? " " : ch}
              </span>
            </span>
          ))}
        </p>
      </div>

      <div className="intro-meta">
        <span className="intro-tag">Loading</span>
        <span className="intro-count">
          <span ref={countRef}>000</span>
          <sup>%</sup>
        </span>
      </div>
      <span className="intro-bar">
        <span ref={barRef} />
      </span>
    </div>
  );
}
