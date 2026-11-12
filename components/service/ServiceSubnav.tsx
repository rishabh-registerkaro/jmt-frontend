"use client";

import { useEffect, useRef, useState } from "react";
import type { ServiceSubnavLink } from "@/types/service";

interface ServiceSubnavProps {
  links: ServiceSubnavLink[];
  cta: string;
}

// Figma "Secondary nav (sticky, after hero)" 237:125 — 65px white bar under
// the main navbar; the link of the section being read gets the orange
// underline. Phones (Figma 242:102 "Section menu (sticky, swipe)"): a 52px
// row of swipeable chips, the current one filled brown and scrolled into view.
// Sticks right below the site header (64 / 69 / 80px tall).
const cls = {
  bar: "sticky top-[64px] z-40 border-b border-sand bg-white md:top-[69px] lg:top-[80px]",
  inner: "site-container flex items-center justify-between gap-[16px] max-md:px-0",
  list: [
    "hide-scrollbar relative m-0 flex min-w-0 list-none gap-[8px] overflow-x-auto p-0 max-md:px-[20px] max-md:py-[10px]",
    "md:-mb-px md:gap-[24px] lg:gap-[36px]",
  ].join(" "),
  link: [
    "block rounded-full px-[14px] py-[7px] text-[13.5px] leading-[normal] font-semibold whitespace-nowrap no-underline",
    "md:rounded-none md:border-b-3 md:px-0 md:pt-[22px] md:pb-[19px] md:text-[15px]",
    "transition-colors duration-160 focus-ring [--focus-offset:-3px]",
  ].join(" "),
  idle: "bg-input-bg text-ink md:border-transparent md:bg-transparent md:font-medium md:text-slate md:hover:text-ink",
  active: "bg-brown text-white md:border-orange md:bg-transparent md:text-ink",
  cta: "btn-primary hidden flex-none [--btn-h:40px] px-[20px] py-[8px] text-[15px] leading-[normal] md:inline-flex",
};

export default function ServiceSubnav({ links, cta }: ServiceSubnavProps) {
  const [active, setActive] = useState(links[0]?.id ?? "");
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    // A section counts as "current" once it crosses the band just below the
    // sticky bars; the topmost one in that band wins.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-150px 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links]);

  // Phones: keep the current chip visible in the swipe row. Scrolls the row
  // only (never the page), and only when the row actually overflows.
  useEffect(() => {
    const list = listRef.current;
    const chip = list?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!list || !chip || list.scrollWidth <= list.clientWidth) return;
    const left = chip.offsetLeft - (list.clientWidth - chip.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  return (
    <nav className={cls.bar} aria-label="On this page">
      <div className={cls.inner}>
        <ul ref={listRef} className={cls.list}>
          {links.map((link) => {
            const isActive = link.id === active;
            return (
              <li key={link.id} className="flex-none">
                <a
                  href={`#${link.id}`}
                  data-id={link.id}
                  className={`${cls.link} ${isActive ? cls.active : cls.idle}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => setActive(link.id)}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
        <a href="#contact" className={cls.cta}>
          {cta}
        </a>
      </div>
    </nav>
  );
}
