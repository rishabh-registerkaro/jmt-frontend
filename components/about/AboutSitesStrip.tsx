import type { AboutSiteIcon, AboutSiteStrip } from "@/types/about";
import { ABOUT_INNER, DualIcon, Responsive } from "./shared";

const ICONS: Record<AboutSiteIcon, string> = {
  bridge: "bridge",
  train: "train",
  station: "station",
  building: "building",
  road: "road",
};

// Figma "Sites we staff (strip)" — desktop 289:126 (one row, 56px apart),
// mobile 296:106 (short labels, wrapped and centered).
export default function AboutSitesStrip({ content }: { content: AboutSiteStrip }) {
  return (
    <section className="bg-white" aria-label={content.caption}>
      <div className={`${ABOUT_INNER} flex flex-col items-center gap-[16px] pt-[8px] pb-[40px] md:gap-[24px] md:pt-[40px] md:pb-[56px]`}>
        <p className="m-0 max-w-[300px] text-center text-[13px] leading-[normal] font-medium text-slate md:max-w-none md:text-[14px]" data-reveal>
          {content.caption}
        </p>
        <ul
          className="m-0 flex w-full list-none flex-wrap items-center justify-center gap-x-[18px] gap-y-[12px] p-0 md:gap-x-[56px] md:gap-y-[16px]"
          data-reveal-stagger
        >
          {content.sites.map((site, index) => (
            <li
              key={site.label.text}
              className="flex items-center gap-[6px] text-[12px] leading-[normal] font-bold tracking-[0.96px] whitespace-nowrap text-[#b9a99a] uppercase md:gap-[10px] md:text-[13.5px] md:tracking-[1.08px]"
              style={{ "--i": index } as React.CSSProperties}
            >
              <span aria-hidden="true" className="flex">
                <DualIcon sm={[`/about/m/site-${ICONS[site.icon]}-18.svg`, 18]} lg={[`/about/site-${ICONS[site.icon]}.svg`, 22]} />
              </span>
              <Responsive copy={site.label} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
