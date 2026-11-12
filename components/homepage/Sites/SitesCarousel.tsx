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
  const [active, setActive] = useState(0);

  const updateBounds = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft < maxScroll - 4);
    // Mobile dots: the card nearest the start edge (last one once scrolled to the end).
    const card = track.querySelector<HTMLElement>("li");
    if (card) {
      const step = card.offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
      const count = track.children.length;
      setActive(track.scrollLeft >= maxScroll - 4 ? count - 1 : Math.min(count - 1, Math.round(track.scrollLeft / step)));
    }
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
            <Image src="/homepage/icon-arrow-left-dark.svg" alt="" width={20} height={20} className="size-4 md:size-5" />
          </button>
          <button
            type="button"
            className={`${cls.control} ${cls.controlNext}`}
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label={t.sites.next}
            aria-controls="sites-track"
          >
            <Image src="/homepage/icon-arrow-right-white.svg" alt="" width={16} height={16} className="md:hidden" />
            <Image src="/homepage/icon-arrow-right-dark.svg" alt="" width={20} height={20} className="hidden md:block" />
          </button>
        </div>
      </div>

      <ul id="sites-track" ref={trackRef} className={cls.track} aria-label={t.sites.list} data-reveal-stagger>
        {sites.map((site) => (
          <li key={site.id} className={cls.site}>
            <div className={cls.media}>
              {site.image && (
                <>
                  <Photo image={site.image} sizes="(min-width: 768px) 320px, 250px" />
                  {site.href && (
                    <span className={cls.arrow} aria-hidden="true">
                      <Image
                        src="/homepage/icon-arrow-up-right-dark.svg"
                        alt=""
                        width={18}
                        height={18}
                        className="size-[15px] md:size-[18px]"
                      />
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

      {sites.length > 1 && (
        <div className={cls.dots} aria-hidden="true">
          {sites.map((site, i) => (
            <span key={site.id} className={`${cls.dot} ${i === active ? cls.dotActive : cls.dotIdle}`} />
          ))}
        </div>
      )}
    </>
  );
}

const cls = {
  header: [
    "site-container flex flex-wrap items-end justify-between gap-5 max-md:flex-nowrap",
    // Figma keeps the controls inside a 1232px header row.
    "xl:pr-[128px]",
  ].join(" "),
  controls: "flex flex-none gap-2 md:gap-2.5",
  // Mobile (Figma "Homepage — Mobile 390"): 36px circles, next button filled orange.
  control: [
    "flex size-[36px] cursor-pointer md:size-[50px] items-center justify-center rounded-[50px] border border-sand-line bg-white",
    "transition-[background-color,opacity] duration-160 ease-[ease] focus-ring",
    "enabled:hover:bg-peach-100 disabled:cursor-not-allowed disabled:opacity-40",
    "max-md:border-sand",
  ].join(" "),
  controlNext: "max-md:border-orange max-md:bg-orange max-md:enabled:hover:bg-orange-hover",
  dots: "site-container flex gap-[6px] md:hidden",
  dot: "h-[6px] rounded-[3px] transition-[width,background-color] duration-240 ease-site",
  dotIdle: "w-[6px] bg-sand",
  dotActive: "w-[20px] bg-orange",
  // Starts aligned with the content column and bleeds off the right edge:
  // inset = max(gutter, (100% - 1280px content) / 2), mirrored in scroll-padding.
  track: [
    "hide-scrollbar flex gap-3 overflow-x-auto overscroll-x-contain snap-x snap-mandatory pb-1",
    "px-[max(20px,calc((100%_-_1280px)/2))] scroll-px-[max(20px,calc((100%_-_1280px)/2))]",
    "md:gap-5 md:px-[max(32px,calc((100%_-_1280px)/2))] md:scroll-px-[max(32px,calc((100%_-_1280px)/2))]",
    "lg:px-[max(48px,calc((100%_-_1280px)/2))] lg:scroll-px-[max(48px,calc((100%_-_1280px)/2))]",
    "xl:px-[max(80px,calc((100%_-_1280px)/2))] xl:scroll-px-[max(80px,calc((100%_-_1280px)/2))]",
  ].join(" "),
  site: "group relative flex flex-[0_0_250px] snap-start flex-col gap-[10px] md:basis-[320px] md:gap-3.5",
  media: [
    "relative h-[250px] overflow-hidden rounded-[14px] bg-sand md:h-[426.7px] md:rounded-[12px]",
    "[&_img]:transition-transform [&_img]:duration-600 [&_img]:ease-site",
    "group-hover:[&_img]:scale-[1.03] motion-reduce:[&_img]:transition-none",
    // The card link's ::after covers the card, so its focus ring is drawn here.
    "group-has-[a:focus-visible]:[outline:2px_solid_var(--color-orange)] group-has-[a:focus-visible]:outline-offset-3",
  ].join(" "),
  arrow: [
    "absolute right-3 bottom-3 flex size-[34px] items-center justify-center rounded-[50px] bg-white",
    "md:right-[18px] md:bottom-[18px] md:size-10 md:[filter:drop-shadow(0_8px_10px_rgba(8,27,48,0.35))]",
  ].join(" "),
  text: "flex flex-col gap-[10px] md:gap-1",
  title:
    "m-0 text-[16px] leading-[22px] font-semibold text-ink md:text-[21px] md:leading-[1.0523809524] md:font-bold md:tracking-[-0.4px] md:text-navy",
  link: "text-inherit no-underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-none",
  description: "m-0 text-[13.5px] leading-[18px] text-slate md:text-[14.5px] md:leading-[23.2px]",
};
