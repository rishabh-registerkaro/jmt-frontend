"use client";

import { useEffect } from "react";

// Scroll-driven entrances for the whole site. Mark elements in any server
// component — no client code needed there:
//
//   data-reveal              fade up (default)
//   data-reveal="clip"       heading wipes up from a mask
//   data-reveal="left|right" slide in from that side
//   data-reveal="zoom"       settle from slightly larger
//   data-reveal="img"        photo frame: curtain wipe + image settles
//   data-reveal-stagger      on a list/grid: its children come in one by one
//   style={{"--rd": "150ms"}} optional extra delay
//
// Each element animates once, when ~15% of it enters the viewport. While the
// first-visit intro is playing, nothing starts until it finishes. Styles live
// in styles/public.css ("Scroll reveal"). The boot script adds
// html.reveal-ready (skipped for reduced motion); this component adds
// html.reveal-armed, and without it a CSS failsafe shows everything anyway.

const SELECTOR = "[data-reveal], [data-reveal-stagger]";
const MAX_STAGGER = 8;

export default function ScrollReveal() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("reveal-ready")) return;
    html.classList.add("reveal-armed");

    const seen = new WeakSet<Element>();
    let started = false;
    const pending: Element[] = [];

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-inview");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    const register = (el: Element) => {
      if (seen.has(el)) return;
      seen.add(el);
      if (el.hasAttribute("data-reveal-stagger")) {
        Array.from(el.children).forEach((child, i) => {
          (child as HTMLElement).style.setProperty("--i", String(Math.min(i, MAX_STAGGER)));
        });
      }
      if (started) io.observe(el);
      else pending.push(el);
    };

    const scan = (root: ParentNode) => {
      if (root instanceof Element && root.matches(SELECTOR)) register(root);
      root.querySelectorAll(SELECTOR).forEach(register);
    };

    const start = () => {
      if (started) return;
      started = true;
      pending.splice(0).forEach((el) => io.observe(el));
    };

    scan(document);

    // New content (language switch, admin live refresh, client navigation).
    const mo = new MutationObserver((records) => {
      for (const r of records) r.addedNodes.forEach((n) => n instanceof Element && scan(n));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Hold everything until the intro curtain opens.
    let classWatch: MutationObserver | undefined;
    if (html.classList.contains("intro-play") && !html.classList.contains("intro-done")) {
      classWatch = new MutationObserver(() => {
        if (html.classList.contains("intro-done")) {
          classWatch?.disconnect();
          start();
        }
      });
      classWatch.observe(html, { attributes: true, attributeFilter: ["class"] });
    } else {
      start();
    }

    return () => {
      io.disconnect();
      mo.disconnect();
      classWatch?.disconnect();
    };
  }, []);

  return null;
}
