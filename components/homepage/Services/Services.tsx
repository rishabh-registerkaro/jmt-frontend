import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ServiceCard, ServicesCopy } from "@/types/homepage";
import Photo from "@/components/common/Photo";

interface ServicesProps {
  services: ServiceCard[];
  copy: ServicesCopy;
}

// First card is the tall feature tile; the bento adapts to 1–4 services.
const CARD_SIZES = [
  "(min-width: 1024px) 35vw, (min-width: 768px) 100vw, 100vw",
  "(min-width: 1024px) 32vw, 50vw",
  "(min-width: 1024px) 32vw, 50vw",
  "(min-width: 1024px) 65vw, 100vw",
];

// ── Bento grid ──
// md: 2 cols; taller first row for the full-width feature card — a min-height
// on the card alone would spill past its 222px track and overlap the next row.
// lg: Figma 438 | 405 | 405 with 16px gaps, two 222px rows.
// Mobile (<768, Figma "Homepage — Mobile 390"): 2 columns, 12px gaps; each
// card sets its own height (MOBILE_ITEMS).
const BENTO = [
  "grid grid-cols-2 gap-3 md:gap-[16px]",
  "md:grid-cols-2 md:grid-rows-[300px] md:auto-rows-[222px]",
  "lg:grid-cols-[minmax(0,438fr)_minmax(0,405fr)_minmax(0,405fr)] lg:auto-rows-[unset]",
].join(" ");

// Per-count row template (lg) — literal strings so Tailwind generates them.
const BENTO_ROWS: Record<number, string> = {
  1: "lg:grid-rows-[460px]",
  2: "lg:grid-rows-[460px]",
  3: "lg:grid-rows-[222px_222px]",
  4: "lg:grid-rows-[222px_222px]",
};

// Placement of each card, keyed by card count then index (the resolved
// cascade of the former .bento / .bento--count-N child rules).
// Mobile placement + height + title size, keyed by card count then index.
const M_WIDE = "max-md:col-span-2 max-md:h-[230px]";
const M_HALF = "max-md:h-[190px]";
const M_FOOT = "max-md:col-span-2 max-md:h-[170px]";
const MOBILE_ITEMS: Record<number, string[]> = {
  1: [M_WIDE],
  2: [M_WIDE, M_FOOT],
  3: [M_WIDE, M_HALF, M_HALF],
  4: [M_WIDE, M_HALF, M_HALF, M_FOOT],
};
const MOBILE_TITLE: Record<string, string> = {
  [M_WIDE]: "max-md:text-[20px] max-md:leading-[27px]",
  [M_HALF]: "max-md:text-[15px] max-md:leading-[20px]",
  [M_FOOT]: "max-md:text-[18px] max-md:leading-[25px]",
};

const FEATURE = "md:col-[1/-1] md:row-[span_1] lg:col-1 lg:row-[1/span_2]";
const BENTO_ITEMS: Record<number, string[]> = {
  1: ["col-[1/-1] md:row-[span_1] lg:row-1"],
  2: ["md:col-auto md:row-[span_1] lg:row-1", "lg:col-[2/span_2]"],
  3: [FEATURE, "lg:col-[2/span_2] lg:row-1", "lg:col-[2/span_2] lg:row-2"],
  4: [FEATURE, "", "", "md:col-[1/-1] lg:col-[2/span_2] lg:row-2"],
};

const cls = {
  services: "bg-white",
  inner: "site-container section-pad flex flex-col gap-6 md:gap-[32px] lg:gap-[24px]",
  header: "split-header [--aside-w:440px] max-md:gap-6",
  title:
    "m-0 flex-[1_1_0] text-[30px] leading-[34px] font-bold tracking-[-0.45px] text-heading md:text-[clamp(30px,23.661971831px+1.6901408451vw,48px)] md:leading-[1.0791666667] md:font-semibold md:tracking-[-1.4px]",
  accent: "text-orange max-md:accent-underline",
  aside: "flex flex-col items-start gap-[18px]",
  copy: "m-0 text-[15px] leading-[24px] text-slate md:text-[16.5px] md:leading-[27.2px]",
  // Mobile: the CTA moves below the cards as a full-width button.
  cta: "btn-primary [--btn-h:46px] text-[15px] leading-[24px] max-md:hidden",
  ctaMobile:
    "btn-primary w-full py-[14px] text-[15.5px] leading-[21px] [--btn-h:49px] md:hidden",

  // ── Card ──
  card: [
    "group/card relative isolate overflow-hidden rounded-[16px] bg-navy-card",
    "[&_img]:transition-[transform] [&_img]:duration-[600ms] [&_img]:ease-site motion-reduce:[&_img]:transition-none",
    "hover:[&_img]:[transform:scale(1.03)] focus-within:[&_img]:[transform:scale(1.03)]",
    // The stretched link drops its own outline; the card shows it instead.
    "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-[3px] has-[a:focus-visible]:outline-orange",
  ].join(" "),
  shade: "caption-shade [--shade-bottom:-45px] max-md:hidden",
  // Mobile scrim (Figma: navy fade from 35% + 20% navy wash).
  scrim: "card-scrim md:hidden",
  caption:
    "absolute right-4 bottom-4 left-4 z-1 flex flex-col items-start gap-[6px] md:right-[80px] md:bottom-[22px] md:left-[22px] md:gap-[4px]",
  // Mobile: frosted pill tag.
  eyebrow:
    "m-0 rounded-full bg-white/16 px-[10px] py-[4px] text-[11.5px] leading-[16px] font-semibold text-white md:rounded-none md:bg-transparent md:p-0 md:text-[13px] md:leading-[20.8px] md:font-normal md:text-mist-light",
  badge:
    "inline-block rounded-full bg-orange px-[10px] py-[4px] text-[11.5px] leading-[16px] font-semibold text-white md:bg-gold md:pt-[3.5px] md:pb-[4px] md:leading-[1.6] md:font-bold md:tracking-[0.9px] md:text-navy md:uppercase",
  title3:
    "m-0 font-semibold text-white md:text-[clamp(19px,17.9436619718px+0.2816901408vw,22px)] md:leading-[1.25] md:tracking-[-0.2px]",
  // Stretch the link over the whole card.
  link: "text-inherit no-underline after:absolute after:inset-[-999px] after:z-2 after:content-[''] focus-visible:outline-none",
  arrow:
    "glass-arrow absolute right-[18px] bottom-[18px] z-1 group-hover/card:bg-[rgba(255,255,255,0.28)] max-md:hidden",
};

export default function Services({ services, copy }: ServicesProps) {
  const cards = services.slice(0, 4);
  const rowsClass = BENTO_ROWS[cards.length] ?? BENTO_ROWS[4];
  const itemClasses = BENTO_ITEMS[cards.length] ?? [];
  const mobileItems = MOBILE_ITEMS[cards.length] ?? [];

  return (
    <section id="services" className={cls.services} aria-labelledby="services-title">
      <div className={cls.inner}>
        <div className={cls.header}>
          <h2 id="services-title" className={cls.title} data-reveal="clip">
            {copy.heading.lead}{" "}
            {copy.heading.accent && <span className={cls.accent}>{copy.heading.accent}</span>}
          </h2>
          <div className={cls.aside} data-reveal style={{ "--rd": "150ms" } as React.CSSProperties}>
            {copy.intro && <p className={cls.copy}>{copy.intro}</p>}
            {copy.cta.label && (
              <a href={copy.cta.href} className={cls.cta}>
                {copy.cta.label}
                <ArrowUpRight size={18} className="text-white" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        <ul className={`${BENTO} ${rowsClass}`} data-reveal-stagger>
          {cards.map((service, index) => (
            <li
              key={service.id}
              className={`${cls.card} ${itemClasses[index] ?? ""} ${mobileItems[index] ?? ""} max-md:rounded-[14px]`}
            >
              <Photo image={service.image} sizes={CARD_SIZES[index] ?? CARD_SIZES[1]} />
              <span className={cls.shade} aria-hidden="true" />
              <span className={cls.scrim} aria-hidden="true" />
              <div className={cls.caption}>
                {service.badge && <span className={cls.badge}>{service.badge}</span>}
                {service.eyebrow && <p className={cls.eyebrow}>{service.eyebrow}</p>}
                <h3 className={`${cls.title3} ${MOBILE_TITLE[mobileItems[index] ?? ""] ?? ""}`}>
                  {service.href ? (
                    <a href={service.href} className={cls.link}>
                      {service.title}
                    </a>
                  ) : (
                    service.title
                  )}
                </h3>
              </div>
              <span className={cls.arrow} aria-hidden="true">
                <ArrowUpRight size={18} className="text-white" aria-hidden="true" />
              </span>
            </li>
          ))}
        </ul>

        {copy.cta.label && (
          <a href={copy.cta.href} className={cls.ctaMobile}>
            {copy.cta.label}
            <ArrowRight size={18} className="text-white" aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  );
}
