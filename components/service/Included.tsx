import { Check, ShieldCheck, type LucideIcon } from "lucide-react";
import Photo from "@/components/common/Photo";
import type { IncludedChipIcon, IncludedContent } from "@/types/service";
import SectionHeader, { SECTION_INNER } from "./SectionHeader";

interface IncludedProps {
  id: string;
  content: IncludedContent;
}

const CHIP_ICONS: Record<IncludedChipIcon, LucideIcon> = {
  check: Check,
  shield: ShieldCheck,
};

// Chip spots. md+ on the 520×644 photo (Figma: x −28 / 300 / −20, y 64 / 250 /
// 480); they hang off the left edge only where the gutter has room (lg+).
// Phones on the 350×280 photo (Figma 242:153: x 14 / 190 / 14, y 16 / 130 / 228).
const CHIP_POSITIONS = [
  "top-[16px] left-[14px] md:top-[10%] md:left-[12px] lg:left-[-28px]",
  "top-[130px] right-[12px] md:top-[39%] lg:right-[14%]",
  "bottom-[14px] left-[14px] md:top-[74.5%] md:bottom-auto md:left-[12px] lg:left-[-20px]",
];

// Figma "Included / you provide" 237:174 — photo 520 | lists 736.
// Phones (242:147): stacked; one-column checklist, plain bullet list.
const cls = {
  split: "grid grid-cols-1 gap-[20px] md:gap-[24px] lg:grid-cols-[minmax(0,520fr)_minmax(0,736fr)] lg:items-start",
  media: "relative h-[280px] md:h-[520px] lg:h-[644px]",
  photo: "absolute inset-0 overflow-hidden rounded-[16px] bg-navy-card md:rounded-[20px]",
  chip: [
    "absolute z-1 flex items-center gap-[8px] rounded-full bg-white py-[8px] pr-[12px] pl-[8px]",
    "text-[13px] leading-[normal] font-semibold whitespace-nowrap text-ink",
    "md:gap-[10px] md:py-[12px] md:pr-[18px] md:pl-[12px] md:text-[15px] md:shadow-[0_10px_28px_rgba(26,10,0,0.18)]",
  ].join(" "),
  chipBadge: "flex size-[22px] flex-none items-center justify-center rounded-full bg-orange md:size-[30px]",
  card: "flex flex-col gap-[14px] rounded-[16px] bg-white p-[20px] md:gap-[18px] md:rounded-[20px] md:p-[32px]",
  head: "flex items-center gap-[10px] md:gap-[12px]",
  title: "m-0 text-[18px] leading-[normal] font-bold text-ink md:text-[clamp(19px,17.9436619718px+0.2816901408vw,22px)]",
  badge: [
    "flex size-[32px] flex-none items-center justify-center rounded-full text-[10px] leading-[normal] font-bold uppercase",
    "md:size-[36px] md:text-[11px]",
  ].join(" "),
  checklist: "m-0 grid list-none grid-cols-1 gap-[14px] p-0 sm:grid-cols-2",
  checkItem: "flex items-start gap-[10px] text-[14.5px] leading-[21px] font-medium text-ink md:gap-[12px] md:text-[16px] md:leading-[24px]",
  checkBadge: "flex size-[22px] flex-none items-center justify-center rounded-full bg-[rgba(242,105,33,0.14)] md:size-[26px]",
  pills: "m-0 flex list-none flex-col gap-[12px] p-0 md:flex-row md:flex-wrap md:gap-[10px]",
  pill: [
    "flex items-center gap-[10px] text-[14.5px] leading-[21px] font-medium text-ink",
    "md:gap-[8px] md:rounded-full md:bg-peach-100 md:py-[9px] md:pr-[14px] md:pl-[12px] md:text-[15px] md:leading-[normal]",
  ].join(" "),
  agreed: [
    "m-0 flex flex-col gap-[2px] rounded-[12px] bg-orange px-[14px] py-[12px] text-white",
    "md:flex-row md:flex-wrap md:items-center md:gap-x-[10px] md:gap-y-[4px] md:px-[16px]",
  ].join(" "),
};

export default function Included({ id, content }: IncludedProps) {
  const { provides, yours } = content;
  return (
    <section id={id} className="scroll-mt-[65px] bg-peach-100" aria-labelledby={`${id}-title`}>
      <div className={SECTION_INNER}>
        <SectionHeader id={`${id}-title`} copy={content.copy} />

        <div className={cls.split}>
          <div className={cls.media} data-reveal="left">
            <div className={cls.photo}>
              <Photo image={content.image} sizes="(min-width: 1024px) 38vw, 100vw" />
            </div>
            <ul className="m-0 list-none p-0">
              {content.chips.map((chip, index) => {
                const ChipIcon = CHIP_ICONS[chip.icon];
                return (
                  <li key={chip.label} className={`${cls.chip} ${CHIP_POSITIONS[index] ?? ""}`}>
                    <span className={cls.chipBadge} aria-hidden="true">
                      {/* Phones use a check on every chip (Figma 242:153). */}
                      {ChipIcon === Check ? (
                        <Check
                          strokeWidth={3}
                          className="size-[12px] text-white md:size-[15px] md:[stroke-width:2.6]"
                          aria-hidden="true"
                        />
                      ) : (
                        <>
                          <Check strokeWidth={3} className="size-[12px] text-white md:hidden" aria-hidden="true" />
                          <ChipIcon strokeWidth={2.6} className="hidden size-[15px] text-white md:block" aria-hidden="true" />
                        </>
                      )}
                    </span>
                    {chip.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex min-w-0 flex-col gap-[20px] md:gap-[24px]" data-reveal="right">
            <div className={cls.card}>
              <div className={cls.head}>
                <span className={`${cls.badge} bg-orange text-white`} aria-hidden="true">
                  {provides.badge}
                </span>
                <h3 className={cls.title}>{provides.title}</h3>
              </div>
              <ul className={cls.checklist}>
                {provides.items.map((item) => (
                  <li key={item} className={cls.checkItem}>
                    <span className={cls.checkBadge} aria-hidden="true">
                      <Check strokeWidth={3} className="size-[12px] text-orange md:size-[14px]" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`${cls.card.replace("gap-[14px]", "gap-[12px]")} border border-sand`}>
              <div className={cls.head}>
                <span className={`${cls.badge} bg-peach-200 text-brown`} aria-hidden="true">
                  {yours.badge}
                </span>
                <h3 className={cls.title}>{yours.title}</h3>
              </div>
              <ul className={cls.pills}>
                {yours.items.map((item) => (
                  <li key={item} className={cls.pill}>
                    <span className="size-[7px] flex-none rounded-full bg-brown md:size-[6px]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className={cls.agreed}>
                <span className="text-[11px] leading-[normal] font-bold tracking-[0.88px] uppercase md:text-[12px] md:tracking-[0.96px]">
                  {yours.agreed.label}
                </span>
                <span className="text-[14.5px] leading-[normal] font-semibold md:text-[15px]">{yours.agreed.text}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
