import type { AboutSiteStrip } from "@/types/about";
import { SITE_ICONS, SITE_ICON_STROKE } from "@/components/common/siteIcons";
import { ABOUT_INNER, Responsive } from "./shared";

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
              {(() => {
                const Glyph = SITE_ICONS[site.icon];
                return <Glyph strokeWidth={SITE_ICON_STROKE} className="size-[18px] flex-none md:size-[22px]" aria-hidden="true" />;
              })()}
              <Responsive copy={site.label} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
