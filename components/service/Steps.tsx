import Photo from "@/components/common/Photo";
import type { ServiceSectionCopy, StepCard } from "@/types/service";
import SectionHeader, { SECTION_INNER } from "./SectionHeader";

interface StepsProps {
  id: string;
  copy: ServiceSectionCopy;
  steps: StepCard[];
}

// Figma "How it works" 237:647 — four 302px steps, photo 240px tall.
// Phones (244:241): bordered rows, 96px square thumb with the number on it,
// then a peach timing pill, title and text.
const cls = {
  grid: "m-0 grid list-none grid-cols-1 gap-[14px] p-0 sm:grid-cols-2 sm:gap-x-[24px] sm:gap-y-[32px] lg:grid-cols-4",
  item: [
    "flex items-center gap-[14px] rounded-[16px] border border-sand py-[10px] pr-[14px] pl-[10px]",
    "sm:flex-col sm:items-stretch sm:gap-[18px] sm:rounded-none sm:border-0 sm:p-0",
  ].join(" "),
  photo: "relative size-[96px] flex-none overflow-hidden rounded-[12px] bg-navy-card sm:h-[240px] sm:w-auto sm:rounded-[20px]",
  shade: "absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(8,27,48,0)_45%,rgba(8,27,48,0.6)_100%)] sm:block",
  num: [
    "absolute top-[6px] left-[6px] flex size-[28px] items-center justify-center rounded-full bg-orange",
    "text-[11px] leading-[normal] font-bold text-white",
    "sm:top-[18px] sm:left-[18px] sm:size-[48px] sm:text-[16px]",
  ].join(" "),
  timingIn: "absolute bottom-[18px] left-[18px] hidden rounded-full bg-white px-[12px] py-[6px] text-[13px] leading-[normal] font-bold text-brown sm:block",
  timingOut: "self-start rounded-full bg-peach-100 px-[9px] py-[3px] text-[11.5px] leading-[normal] font-bold text-orange sm:hidden",
  title: "m-0 text-[15.5px] leading-[normal] font-bold text-ink sm:text-[20px]",
  text: "m-0 text-[13px] leading-[19px] text-slate sm:max-w-[290px] sm:text-[15.5px] sm:leading-[24px]",
};

export default function Steps({ id, copy, steps }: StepsProps) {
  return (
    <section id={id} className="scroll-mt-[65px] bg-white" aria-labelledby={`${id}-title`}>
      <div className={SECTION_INNER}>
        <SectionHeader id={`${id}-title`} copy={copy} />
        <ol className={cls.grid} data-reveal-stagger>
          {steps.map((step, index) => (
            <li key={step.title} className={cls.item} style={{ "--i": index } as React.CSSProperties}>
              <div className={cls.photo}>
                <Photo image={step.image} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 50vw, 96px" />
                <span className={cls.shade} aria-hidden="true" />
                <span className={cls.num} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={cls.timingIn}>{step.timing}</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-[4px] sm:gap-[8px]">
                <span className={cls.timingOut}>{step.timing}</span>
                <h3 className={cls.title}>{step.title}</h3>
                <p className={cls.text}>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
