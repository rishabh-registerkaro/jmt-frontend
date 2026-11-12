import { Star } from "lucide-react";
import Photo from "@/components/common/Photo";
import type { PlansContent } from "@/types/service";
import SectionHeader, { SECTION_INNER } from "./SectionHeader";
import SwipeTrack from "./SwipeTrack";

interface PlansProps {
  id: string;
  content: PlansContent;
}

// Figma "Plans — How you can engage us" 237:586 — three 410×543 cards.
// Phones (244:174): peach band, 290px cards in a swipe row that runs to the
// screen edge, the "Start here" plan outlined in orange, page dots below.
const cls = {
  track: [
    "hide-scrollbar relative m-0 flex list-none snap-x snap-mandatory gap-[12px] overflow-x-auto p-0",
    // Bleeds to the screen edge; swipes up to lg so three plans never split 2 + 1.
    "-mr-[20px] pr-[20px] md:-mr-[32px] md:gap-[20px] md:pr-[32px]",
    "lg:mr-0 lg:grid lg:snap-none lg:grid-cols-3 lg:gap-[24px] lg:overflow-visible lg:pr-0",
  ].join(" "),
  card: [
    "flex w-[290px] flex-none snap-start flex-col overflow-hidden rounded-[16px] bg-white md:w-[340px] lg:w-auto",
    "md:rounded-[20px] md:border-[2.5px] md:border-[rgba(242,105,33,0.21)]",
  ].join(" "),
  highlight: "border-2 border-orange",
  photo: "relative h-[140px] flex-none overflow-hidden bg-navy-card md:h-[210px]",
  shade: "absolute inset-0 hidden bg-[linear-gradient(180deg,rgba(8,27,48,0)_40%,rgba(8,27,48,0.55)_100%)] md:block",
  pill: [
    "absolute top-[12px] z-1 rounded-full py-[4px] text-[11.5px] leading-[normal] font-bold",
    "md:top-[20px] md:py-[5px] md:text-[12.5px]",
  ].join(" "),
  duration: "left-[12px] bg-white px-[10px] text-brown md:left-[20px] md:px-[12px]",
  star: "right-[12px] flex items-center gap-[5px] bg-orange pr-[10px] pl-[8px] text-white md:right-[20px] md:gap-[6px] md:pr-[12px] md:pl-[10px]",
  body: "flex flex-1 flex-col gap-[12px] px-[18px] pt-[16px] pb-[18px] md:gap-[16px] md:px-[28px] md:pt-[24px] md:pb-[28px]",
  name: "m-0 text-[19px] leading-[normal] font-bold text-ink md:text-[clamp(21px,19.9436619718px+0.2816901408vw,24px)]",
  label: "m-0 text-[11px] leading-[normal] font-bold tracking-[0.88px] text-brown uppercase md:text-[12px] md:tracking-[0.96px]",
  text: "m-0 text-[14px] leading-[21px] text-slate md:text-[15.5px] md:leading-[24px]",
  rate: [
    "m-0 rounded-[10px] bg-peach-100 px-[12px] py-[10px] text-[12.5px] leading-[18px] font-medium text-brown",
    "md:rounded-[12px] md:px-[14px] md:py-[12px] md:text-[14px] md:leading-[20px]",
  ].join(" "),
};

export default function Plans({ id, content }: PlansProps) {
  const { labels } = content;
  return (
    <section id={id} className="scroll-mt-[65px] bg-peach-100 md:bg-white" aria-labelledby={`${id}-title`}>
      <div className={SECTION_INNER}>
        <SectionHeader id={`${id}-title`} copy={content.copy} />
        <SwipeTrack count={content.plans.length} dotLabel="Show plan" className={cls.track} dotsClassName="lg:hidden">
          {content.plans.map((plan) => (
            <li key={plan.name} className={`${cls.card} ${plan.highlight ? cls.highlight : ""}`}>
              <div className={cls.photo}>
                <Photo image={plan.image} sizes="(min-width: 1024px) 32vw, (min-width: 768px) 340px, 290px" />
                <span className={cls.shade} aria-hidden="true" />
                <span className={`${cls.pill} ${cls.duration}`}>{plan.duration}</span>
                {plan.highlight && (
                  <span className={`${cls.pill} ${cls.star}`}>
                    <Star strokeWidth={2.4} className="size-[11px] text-white md:size-[13px]" aria-hidden="true" />
                    {plan.highlight}
                  </span>
                )}
              </div>
              <div className={cls.body}>
                <h3 className={cls.name}>{plan.name}</h3>
                <div className="flex flex-col gap-[3px] md:gap-[4px]">
                  <p className={cls.label}>{labels.suits}</p>
                  <p className={cls.text}>{plan.suits}</p>
                </div>
                <div className="flex flex-col gap-[3px] md:gap-[4px]">
                  <p className={cls.label}>{labels.how}</p>
                  <p className={cls.text}>{plan.how}</p>
                </div>
                <p className={cls.rate}>{labels.rate}</p>
              </div>
            </li>
          ))}
        </SwipeTrack>
      </div>
    </section>
  );
}
