import { Check, FileText, HardHat, Phone, type LucideIcon } from "lucide-react";
import type { AboutValueIcon, AboutValuesContent } from "@/types/about";
import { ABOUT_H2, ABOUT_INNER, AccentText, Pill, reveal } from "./shared";

const ICONS: Record<AboutValueIcon, LucideIcon> = {
  phone: Phone,
  file: FileText,
  hat: HardHat,
};

/** Orange value glyph: 20px on phones, 22px from md. */
function ValueIcon({ icon }: { icon: AboutValueIcon }) {
  const Icon = ICONS[icon];
  return <Icon aria-hidden="true" className="size-[20px] flex-none text-orange md:size-[22px]" />;
}

// Figma "Values" — desktop 289:236 (three 410×268 cards in a row), mobile
// 296:183 (stacked full-width cards).
const cls = {
  inner: `${ABOUT_INNER} flex flex-col items-center gap-[20px] py-[56px] md:gap-[44px] md:py-[100px]`,
  title: `${ABOUT_H2} max-w-[350px] text-center md:max-w-[880px]`,
  grid: "m-0 grid w-full list-none grid-cols-1 gap-[12px] p-0 md:gap-[20px] lg:grid-cols-3 lg:gap-[24px]",
  card: [
    "flex flex-col gap-[12px] rounded-[18px] border border-sand bg-white px-[20px] pt-[20px] pb-[18px]",
    "shadow-[0_10px_26px_0_rgba(99,36,0,0.07)]",
    "md:gap-[16px] md:rounded-[20px] md:px-[28px] md:pt-[28px] md:pb-[24px] md:shadow-[0_14px_36px_0_rgba(99,36,0,0.07)] lg:min-h-[268px]",
  ].join(" "),
  top: "flex items-center justify-between",
  badge: "flex size-[42px] items-center justify-center rounded-[12px] bg-orange/12 md:size-[48px] md:rounded-[14px]",
  num: "text-[34px] leading-[34px] font-extrabold text-peach-200 md:text-[44px] md:leading-[44px]",
  name: "m-0 text-[18px] leading-[normal] font-bold text-ink md:text-[21px]",
  text: "m-0 text-[14.5px] leading-[23px] text-slate md:text-[15.5px] md:leading-[25px]",
  proof: "mt-auto flex items-center gap-[8px] border-t border-sand pt-[12px] md:gap-[10px] md:pt-[16px]",
  check: "flex size-[20px] flex-none items-center justify-center rounded-full bg-orange md:size-[22px]",
  proofText: "m-0 text-[13.5px] leading-[normal] font-semibold text-brown md:text-[14px]",
};

export default function AboutValues({ content }: { content: AboutValuesContent }) {
  return (
    <section id="values" className="bg-white" aria-labelledby="about-values-title">
      <div className={cls.inner}>
        <div data-reveal>
          <Pill tone="peach">{content.pill}</Pill>
        </div>
        <h2 id="about-values-title" className={cls.title} data-reveal="clip" style={reveal(80)}>
          <AccentText heading={content.heading} />
        </h2>
        <ol className={cls.grid} data-reveal-stagger>
          {content.values.map((value, index) => (
            <li key={value.title} className={cls.card} style={{ "--i": index } as React.CSSProperties}>
              <div className={cls.top}>
                <span className={cls.badge} aria-hidden="true">
                  <ValueIcon icon={value.icon} />
                </span>
                <span className={cls.num} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className={cls.name}>{value.title}</h3>
              <p className={cls.text}>{value.text}</p>
              <p className={cls.proof}>
                <span className={cls.check} aria-hidden="true">
                  <Check aria-hidden="true" className="size-[11px] flex-none text-white md:size-[12px]" />
                </span>
                <span className={cls.proofText}>{value.proof}</span>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
