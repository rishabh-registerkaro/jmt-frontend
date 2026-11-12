import { MapPin } from "lucide-react";
import { SITE_ICONS, SITE_ICON_STROKE } from "@/components/common/siteIcons";
import Photo from "@/components/common/Photo";
import { Responsive } from "@/components/about/shared";
import { JOIN_PAGE, type SiteIcon } from "@/data/joinPage";
import { JOIN_INNER, JoinSectionHeader } from "./shared";

function SiteGlyph({ icon }: { icon: SiteIcon }) {
  const Glyph = SITE_ICONS[icon];
  // Figma stroke 1.35 on an 18 viewBox = 1.8 on a 24 grid.
  return <Glyph size={18} strokeWidth={SITE_ICON_STROKE} className="flex-none text-brown" aria-hidden="true" />;
}

// Figma "3 · The work we do" — desktop 311:171 (four 305×400 photo cards and a
// white "Where you'll work" bar with icons), mobile 313:153 (2×2 grid of
// 169×220 cards, then one line: "Bridges · Metro · …").
const cls = {
  inner: `${JOIN_INNER} flex flex-col gap-[16px] md:gap-[28px] lg:gap-[36px]`,
  grid: "m-0 grid list-none grid-cols-2 gap-[12px] p-0 md:gap-[20px] lg:grid-cols-4",
  card: "relative isolate h-[220px] overflow-hidden rounded-[16px] bg-navy-card md:h-[340px] md:rounded-[20px] lg:h-[400px]",
  shade: [
    "pointer-events-none absolute inset-0",
    "bg-[linear-gradient(180deg,rgba(8,27,48,0)_35%,rgba(8,27,48,0.9)_100%)]",
    "md:bg-[linear-gradient(180deg,rgba(8,27,48,0)_40%,rgba(8,27,48,0.88)_100%)]",
  ].join(" "),
  caption: "absolute inset-x-0 bottom-0 flex flex-col gap-[2px] px-[12px] pb-[12px] md:gap-[4px] md:px-[22px] md:pb-[22px]",
  title: "m-0 text-[15px] leading-[19px] font-bold text-white md:text-[21px] md:leading-[normal]",
  text: "m-0 text-[11.5px] leading-[normal] text-white/85 md:text-[14px]",
  where: [
    "flex items-center gap-[6px] rounded-[14px] bg-white px-[14px] py-[12px]",
    "md:flex-wrap md:gap-x-[34px] md:gap-y-[12px] md:rounded-[16px] md:px-[28px] md:py-[20px]",
  ].join(" "),
  site: "flex items-center gap-[8px] text-[14px] leading-[normal] font-semibold whitespace-nowrap text-brown",
};

export default function JoinWork({ content }: { content: (typeof JOIN_PAGE)["work"] }) {
  const { where } = content;
  return (
    <section id="the-work" className="bg-input-bg" aria-labelledby="join-work-title">
      <div className={cls.inner}>
        <JoinSectionHeader id="join-work-title" copy={content.copy} />
        <ul className={cls.grid} data-reveal-stagger>
          {content.cards.map((card, index) => (
            <li key={card.title.text} className={cls.card} style={{ "--i": index } as React.CSSProperties}>
              <Photo image={card.image} sizes="(min-width: 1024px) 22vw, 50vw" />
              <span className={cls.shade} aria-hidden="true" />
              <div className={cls.caption}>
                <h3 className={cls.title}>
                  <Responsive copy={card.title} />
                </h3>
                <p className={cls.text}>
                  <Responsive copy={card.text} />
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className={cls.where} data-reveal>
          <p className="m-0 flex flex-none items-center gap-[8px]">
            <MapPin className="size-[15px] flex-none text-orange md:size-[17px]" aria-hidden="true" />
            <span className="max-md:sr-only text-[14.5px] leading-[normal] font-bold whitespace-nowrap text-ink">{where.label}</span>
          </p>
          {/* Phones: one dotted line of short names (Figma "Bridges · Metro · …"). */}
          <p className="m-0 text-[12.5px] leading-[normal] font-semibold text-brown md:hidden">
            {where.sites.map((site) => site.label.short || site.label.text).join(" · ")}
          </p>
          <ul className="m-0 hidden list-none flex-wrap gap-x-[34px] gap-y-[12px] p-0 md:contents">
            {where.sites.map((site) => (
              <li key={site.label.text} className={cls.site}>
                <SiteGlyph icon={site.icon} />
                {site.label.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
