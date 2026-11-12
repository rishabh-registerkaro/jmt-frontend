import Image from "next/image";
import Photo from "@/components/common/Photo";
import type { AboutWhereContent } from "@/types/about";
import { ABOUT_INNER, AboutSectionHeader, DualIcon } from "./shared";

interface AboutWhereProps {
  content: AboutWhereContent;
  /** Site card target (the homepage "Sites we staff" section). */
  sitesHref: string;
}

// Figma "Where we work" — desktop 295:2 (peach base card + three 305×360
// site photos in one row), mobile 297:145 (compact base card, then the site
// photos as a 250×280 swipe row that runs to the screen edge).
const cls = {
  inner: `${ABOUT_INNER} flex flex-col gap-[18px] py-[56px] md:gap-[32px] md:py-[100px] lg:gap-[48px]`,
  body: "flex flex-col gap-[18px] md:gap-[24px] lg:grid lg:grid-cols-4 lg:gap-[20px]",
  base: [
    "flex items-center gap-[14px] rounded-[18px] bg-peach-100 p-[18px] md:p-[24px]",
    "lg:h-[360px] lg:flex-col lg:items-start lg:gap-[16px] lg:rounded-[20px] lg:p-[28px]",
  ].join(" "),
  pin: "flex size-[46px] flex-none items-center justify-center rounded-[12px] bg-orange lg:size-[52px] lg:rounded-[14px]",
  baseText: "flex min-w-0 flex-1 flex-col gap-[3px] leading-[normal] lg:flex-none lg:gap-[16px]",
  eyebrow: "m-0 text-[11px] font-bold tracking-[1.1px] text-orange lg:text-[12px] lg:tracking-[1.2px]",
  baseTitle: "m-0 text-[18px] font-bold text-ink lg:text-[24px] lg:leading-[30px]",
  address: "m-0 hidden text-[14.5px] text-slate lg:block",
  hours: "m-0 flex items-center gap-[8px] text-[13px] text-brown lg:text-[14px] lg:font-semibold",
  // Below lg: horizontal swipe row, bleeding past the right gutter.
  track: [
    "m-0 flex list-none gap-[12px] overflow-x-auto p-0 snap-x snap-mandatory hide-scrollbar",
    "-mr-[20px] pr-[20px] md:-mr-[32px] md:pr-[32px] md:gap-[20px]",
    "lg:contents",
  ].join(" "),
  site: [
    "relative isolate h-[280px] w-[250px] flex-none snap-start overflow-hidden rounded-[18px] bg-navy-card",
    "md:h-[360px] md:w-[305px] md:rounded-[20px] lg:w-auto",
  ].join(" "),
  link: "group absolute inset-0 z-1 rounded-[inherit] text-white no-underline focus-ring [--focus-offset:-3px] [--focus-color:#fff]",
  shade: "pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,27,48,0)_40%,rgba(8,27,48,0.85)_100%)]",
  caption: "absolute inset-x-0 bottom-0 flex flex-col items-start gap-[3px] px-[16px] pb-[16px] leading-[normal] md:gap-[4px] md:px-[20px] md:pb-[20px]",
  siteEyebrow: "hidden text-[11px] font-bold tracking-[1.1px] text-peach-200 lg:block",
  siteTitle: "m-0 text-[17px] font-bold text-white md:text-[19px]",
  siteText: "text-[12.5px] text-white/85 md:text-[13.5px]",
  arrow: [
    "absolute top-[16px] right-[16px] hidden size-[36px] items-center justify-center rounded-full bg-white lg:flex",
    "transition-transform duration-240 ease-site group-hover:-translate-y-[2px] group-hover:translate-x-[2px]",
  ].join(" "),
};

export default function AboutWhere({ content, sitesHref }: AboutWhereProps) {
  const { base } = content;
  return (
    <section id="where-we-work" className="overflow-hidden bg-white" aria-labelledby="about-where-title">
      <div className={cls.inner}>
        <AboutSectionHeader id="about-where-title" copy={content.copy} />

        <div className={cls.body}>
          <div className={cls.base} data-reveal>
            <span className={cls.pin} aria-hidden="true">
              <DualIcon sm={["/about/m/pin-22.svg", 22]} lg={["/about/icon-pin-24.svg", 24]} breakpoint="lg" />
            </span>
            <div className={cls.baseText}>
              <p className={cls.eyebrow}>{base.eyebrow}</p>
              <h3 className={cls.baseTitle}>{base.title}</h3>
              {base.address && <p className={cls.address}>{base.address}</p>}
              <p className={cls.hours}>
                <Image src="/about/icon-clock-16.svg" alt="" width={16} height={16} className="hidden flex-none lg:block" />
                {base.hours}
              </p>
            </div>
          </div>

          <ul className={cls.track} data-reveal-stagger>
            {content.sites.map((site, index) => (
              <li key={site.title} className={cls.site} style={{ "--i": index } as React.CSSProperties}>
                <Photo image={site.image} sizes="(min-width: 1024px) 22vw, (min-width: 768px) 305px, 250px" />
                <span className={cls.shade} aria-hidden="true" />
                <a href={sitesHref} className={cls.link}>
                  <span className={cls.caption}>
                    <span className={cls.siteEyebrow}>{content.siteEyebrow}</span>
                    <span className={cls.siteTitle}>{site.title}</span>
                    <span className={cls.siteText}>{site.text}</span>
                  </span>
                  <span className={cls.arrow} aria-hidden="true">
                    <Image src="/about/icon-arrow-ur-16.svg" alt="" width={16} height={16} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
