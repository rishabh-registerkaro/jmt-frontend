import Photo from "@/components/common/Photo";
import type { ServiceSectionCopy, UseCaseCard } from "@/types/service";
import SectionHeader, { SECTION_INNER } from "./SectionHeader";

interface UseCasesProps {
  id: string;
  copy: ServiceSectionCopy;
  cards: UseCaseCard[];
}

// Figma "When you'd use this" 237:141 — cards 560 | 336 | 336 × 460.
const cls = {
  grid: [
    "grid list-none grid-cols-1 gap-[12px] p-0 m-0 auto-rows-[300px]",
    "md:grid-cols-2 md:gap-[24px] md:auto-rows-[420px]",
    "lg:grid-cols-[minmax(0,560fr)_minmax(0,336fr)_minmax(0,336fr)] lg:auto-rows-[460px]",
  ].join(" "),
  card: "relative isolate overflow-hidden rounded-[16px] bg-navy-card md:rounded-[20px] first:md:col-span-2 first:lg:col-span-1",
  shade: "absolute inset-0 bg-[linear-gradient(180deg,rgba(8,27,48,0)_30%,rgba(8,27,48,0.88)_100%)] md:bg-[linear-gradient(180deg,rgba(8,27,48,0)_25%,rgba(8,27,48,0.88)_100%)]",
  text: "absolute inset-x-0 bottom-0 flex flex-col items-start gap-[6px] p-[18px] md:gap-[8px] md:p-[28px]",
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
            <li key={card.title} className={cls.card} style={{ "--i": index } as React.CSSProperties}>
              <Photo
                image={card.image}
                sizes={index === 0 ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 1024px) 24vw, (min-width: 768px) 50vw, 100vw"}
              />
              <span className={cls.shade} aria-hidden="true" />
              <div className={cls.text}>
                <span className={cls.num} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className={cls.title}>{card.title}</h3>
                <p className={`${cls.copy} ${index === 0 ? "lg:max-w-[504px]" : ""}`}>{card.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
