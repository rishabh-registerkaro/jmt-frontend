import Image from "next/image";
import type { AboutDetailIcon, AboutStandardsContent } from "@/types/about";
import { ABOUT_INNER, AboutSectionHeader } from "./shared";

const ICONS: Record<AboutDetailIcon, string> = {
  hammer: "/about/icon-hammer-17.svg",
  flag: "/about/icon-flag-17.svg",
  cal: "/about/icon-cal-17.svg",
  file: "/about/icon-file-17.svg",
};

// Figma "Our standards" — desktop 292:51, mobile 297:2.
// Headline standards: lg+ one ruled row of four (sand rules between);
// below lg four peach tiles (2×2 on phones).
// Details: lg+ four grey cards (badge beside the title, text below);
// below lg a stack of rows (badge beside title and text).
const cls = {
  inner: `${ABOUT_INNER} flex flex-col gap-[18px] pt-[16px] pb-[56px] md:gap-[32px] md:pb-[100px] lg:gap-[40px] lg:pt-[40px]`,
  headlines: [
    "m-0 grid list-none grid-cols-2 gap-[10px] p-0 md:grid-cols-4 md:gap-[16px]",
    "lg:gap-0 lg:border-y lg:border-sand",
  ].join(" "),
  headline: [
    "flex flex-col gap-[4px] rounded-[14px] bg-peach-100 px-[14px] py-[16px] leading-[normal]",
    "md:px-[20px] md:py-[22px]",
    "lg:gap-[6px] lg:rounded-none lg:border-r lg:border-sand lg:bg-transparent lg:px-[24px] lg:py-[28px] lg:first:pl-0 lg:last:border-r-0",
  ].join(" "),
  headlineTitle: "m-0 text-[22px] font-bold tracking-[-0.22px] whitespace-nowrap text-orange md:text-[28px] lg:text-[38px] lg:tracking-[-0.57px]",
  headlineText: "m-0 text-[12.5px] font-semibold text-slate md:text-[14px]",
  // lg: items-start — Figma lets each card keep its own height.
  details: "m-0 grid list-none grid-cols-1 gap-[10px] p-0 md:grid-cols-2 md:gap-[16px] lg:grid-cols-4 lg:items-start lg:gap-[20px]",
  detail: [
    "grid grid-cols-[34px_minmax(0,1fr)] content-start items-start gap-x-[12px] gap-y-[3px] rounded-[14px] bg-input-bg p-[14px]",
    "md:p-[18px] lg:gap-x-[10px] lg:gap-y-[10px] lg:rounded-[16px] lg:p-[22px]",
  ].join(" "),
  badge: "row-span-2 flex size-[34px] items-center justify-center rounded-[10px] bg-orange/12 lg:row-span-1",
  title: "m-0 text-[15px] leading-[normal] font-bold text-ink lg:self-center lg:text-[16.5px]",
  text: "m-0 text-[13.5px] leading-[20px] text-slate lg:col-span-2 lg:text-[14.5px] lg:leading-[22px]",
};

export default function AboutStandards({ content }: { content: AboutStandardsContent }) {
  return (
    <section id="standards" className="bg-white" aria-labelledby="about-standards-title">
      <div className={cls.inner}>
        <AboutSectionHeader id="about-standards-title" copy={content.copy} />

        <ul className={cls.headlines} data-reveal-stagger>
          {content.headlines.map((item, index) => (
            <li key={item.title} className={cls.headline} style={{ "--i": index } as React.CSSProperties}>
              <p className={cls.headlineTitle}>{item.title}</p>
              <p className={cls.headlineText}>{item.text}</p>
            </li>
          ))}
        </ul>

        <ul className={cls.details} data-reveal-stagger>
          {content.details.map((item, index) => (
            <li key={item.title} className={cls.detail} style={{ "--i": index } as React.CSSProperties}>
              <span className={cls.badge} aria-hidden="true">
                <Image src={ICONS[item.icon]} alt="" width={17} height={17} />
              </span>
              <h3 className={cls.title}>{item.title}</h3>
              <p className={cls.text}>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
