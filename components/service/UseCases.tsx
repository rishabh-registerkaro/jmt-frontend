import Photo from "@/components/common/Photo";
import type { ServiceSectionCopy, UseCaseCard } from "@/types/service";
import SectionHeader, { SECTION_INNER } from "./SectionHeader";

interface UseCasesProps {
  id: string;
  copy: ServiceSectionCopy;
  cards: UseCaseCard[];
}

// Figma "When you'd use this" 237:141 — 460px tall cards.
// Three equal cards; the hovered, tapped or keyboard-focused one grows to the
// design's 560 : 336 ratio and the other two give up the room.
//   < lg: a column of fixed total height, so the card grows taller (tap = focus,
//         since phones have no hover; tapping elsewhere resets).
//   lg+:  a row, so the card grows wider.
const cls = {
  grid: [
    "flex list-none flex-col gap-[12px] p-0 m-0 h-[760px]",
    "md:gap-[24px] md:h-[900px]",
    "lg:flex-row lg:h-[460px] lg:@container",
  ].join(" "),
  card: [
    "relative isolate min-h-0 min-w-0 flex-[1_1_0] overflow-hidden rounded-[16px] bg-navy-card md:rounded-[20px]",
    "transition-[flex-grow] duration-500 ease-site motion-reduce:transition-none",
    // Desktop: hover or keyboard focus only, so a clicked card does not stay open.
    "hover:grow-[1.67] max-lg:focus:grow-[1.67] lg:focus-visible:grow-[1.67]",
    "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-orange",
  ].join(" "),
  shade: "absolute inset-0 bg-[linear-gradient(180deg,rgba(8,27,48,0)_30%,rgba(8,27,48,0.88)_100%)] md:bg-[linear-gradient(180deg,rgba(8,27,48,0)_25%,rgba(8,27,48,0.88)_100%)]",
  // lg: the caption keeps the width of a fully squeezed card (row minus the two
  // 24px gaps, ÷ 3.67 flex units), so it wraps once and never reflows while the
  // card grows or shrinks — the photo widens behind it instead.
  text: [
    "absolute inset-x-0 bottom-0 flex flex-col items-start gap-[6px] p-[18px] md:gap-[8px] md:p-[28px]",
    "lg:right-auto lg:w-[calc((100cqw-48px)/3.67)]",
  ].join(" "),
  num: "rounded-full bg-orange px-[9px] py-[3px] text-[11.5px] md:px-[10px] md:py-[4px] md:text-[12.5px] leading-[normal] font-bold text-white",
  title: "m-0 text-[20px] leading-[1.25] font-bold text-white md:text-[clamp(21px,19.9436619718px+0.2816901408vw,24px)]",
  copy: "m-0 text-[14px] leading-[21px] text-white/88 md:text-[15.5px] md:leading-[24px] md:text-white/85",
};

export default function UseCases({ id, copy, cards }: UseCasesProps) {
  return (
    <section id={id} className="scroll-mt-[65px] bg-white" aria-labelledby={`${id}-title`}>
      <div className={SECTION_INNER}>
        <SectionHeader id={`${id}-title`} copy={copy} />
        <ol className={cls.grid} data-reveal-stagger>
          {cards.map((card, index) => (
            // tabIndex: lets a tap (or Tab) focus the card, which expands it.
            <li key={card.title} className={cls.card} style={{ "--i": index } as React.CSSProperties} tabIndex={0}>
              <Photo
                image={card.image}
                // lg: any card can grow to ~45% of the row on hover.
                sizes={index === 0 ? "(min-width: 1024px) 45vw, 100vw" : "(min-width: 1024px) 45vw, (min-width: 768px) 50vw, 100vw"}
              />
              <span className={cls.shade} aria-hidden="true" />
              <div className={cls.text}>
                <span className={cls.num} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={cls.title}>{card.title}</h3>
                <p className={cls.copy}>{card.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
