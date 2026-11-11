"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { SiteTypeCard } from "@/types/homepage";
import Photo from "@/components/common/Photo";
import { useLanguage } from "@/components/i18n/LanguageProvider";

interface SitesCarouselProps {
  sites: SiteTypeCard[];
  /** Server-rendered section heading, placed beside the controls. */
  children: ReactNode;
}

export default function SitesCarousel({ sites, children }: SitesCarouselProps) {
  const { t } = useLanguage();
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateBounds = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateBounds();
    track.addEventListener("scroll", updateBounds, { passive: true });
    const observer = new ResizeObserver(updateBounds);
    observer.observe(track);
    return () => {
      track.removeEventListener("scroll", updateBounds);
      observer.disconnect();
    };
  }, [updateBounds]);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>("li");
    if (!track || !card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({
      left: direction * (card.offsetWidth + gap),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <>
      <div className={cls.header}>
        {children}
        <div className={cls.controls} data-reveal="right">
          <button
            type="button"
            className={cls.control}
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label={t.sites.previous}
            aria-controls="sites-track"
          >
            <Image src="/homepage/icon-arrow-left-dark.svg" alt="" width={20} height={20} />
          </button>
          <button
            type="button"
            className={cls.control}
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label={t.sites.next}
            aria-controls="sites-track"
          >
            <Image src="/homepage/icon-arrow-right-dark.svg" alt="" width={20} height={20} />
          </button>
        </div>
      </div>

      <ul id="sites-track" ref={trackRef} className={cls.track} aria-label={t.sites.list} data-reveal-stagger>
        {sites.map((site) => (
          <li key={site.id} className={cls.site}>
            <div className={cls.media}>
              {site.image && (
                <>
                  <Photo image={site.image} sizes="(min-width: 768px) 320px, 78vw" />
                  {site.href && (
                    <span className={cls.arrow} aria-hidden="true">
                      <Image src="/homepage/icon-arrow-up-right-dark.svg" alt="" width={18} height={18} />
                    </span>
                  )}
                </>
              )}
            </div>
            <div className={cls.text}>
              <h3 className={cls.title}>
                {site.href ? (
                  <a href={site.href} className={cls.link}>
                    {site.title}
                  </a>
                ) : (
                  site.title
                )}
              </h3>
              <p className={cls.description}>{site.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

const cls = {
  header: [
    "site-container flex flex-wrap items-end justify-between gap-5",
    // Figma keeps the controls inside a 1232px header row.
    "xl:pr-[128px]",
  ].join(" "),
  controls: "flex gap-2.5",
  control: [
    "flex size-[50px] cursor-pointer items-center justify-center rounded-[50px] border border-sand-line bg-white",
    "transition-[background-color,opacity] duration-160 ease-[ease] focus-ring",
    "enabled:hover:bg-peach-100 disabled:cursor-not-allowed disabled:opacity-40",
  ].join(" "),
  // Starts aligned with the content column and bleeds off the right edge:
  // inset = max(gutter, (100% - 1280px content) / 2), mirrored in scroll-padding.
  track: [
    "hide-scrollbar flex gap-4 overflow-x-auto overscroll-x-contain snap-x snap-mandatory pb-1",
    "px-[max(16px,calc((100%_-_1280px)/2))] scroll-px-[max(16px,calc((100%_-_1280px)/2))]",
    "md:gap-5 md:px-[max(32px,calc((100%_-_1280px)/2))] md:scroll-px-[max(32px,calc((100%_-_1280px)/2))]",
    "lg:px-[max(48px,calc((100%_-_1280px)/2))] lg:scroll-px-[max(48px,calc((100%_-_1280px)/2))]",
    "xl:px-[max(80px,calc((100%_-_1280px)/2))] xl:scroll-px-[max(80px,calc((100%_-_1280px)/2))]",
  ].join(" "),
  site: "group relative flex flex-[0_0_min(78vw,320px)] snap-start flex-col gap-3.5 md:basis-[320px]",
  media: [
    "relative h-[360px] overflow-hidden rounded-[12px] bg-sand md:h-[426.7px]",
    "[&_img]:transition-transform [&_img]:duration-600 [&_img]:ease-site",
    "group-hover:[&_img]:scale-[1.03] motion-reduce:[&_img]:transition-none",
    // The card link's ::after covers the card, so its focus ring is drawn here.
    "group-has-[a:focus-visible]:[outline:2px_solid_var(--color-orange)] group-has-[a:focus-visible]:outline-offset-3",
  ].join(" "),
  arrow: [
    "absolute right-[18px] bottom-[18px] flex size-10 items-center justify-center rounded-[50px] bg-white",
    "[filter:drop-shadow(0_8px_10px_rgba(8,27,48,0.35))]",
  ].join(" "),
  text: "flex flex-col gap-1",
  title: "m-0 text-[21px] leading-[1.0523809524] font-bold tracking-[-0.4px] text-navy",
  link: "text-inherit no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none",
  description: "m-0 text-[14.5px] leading-[23.2px] text-slate",
};
