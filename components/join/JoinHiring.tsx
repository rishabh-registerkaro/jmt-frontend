import { FileText, Hammer, HardHat, IdCard, Landmark, Phone, type LucideIcon } from "lucide-react";
import { JOIN_PAGE, type ReadyIcon, type StepIcon } from "@/data/joinPage";
import { JOIN_INNER, JoinSectionHeader } from "./shared";

// Figma strokes: 1.9 (Lucide units) on the step badges, Lucide default on the ready list.
const STEP_ICONS: Record<StepIcon, LucideIcon> = {
  file: FileText,
  phone: Phone,
  hammer: Hammer,
  hat: HardHat,
};

const READY_ICONS: Record<ReadyIcon, LucideIcon> = {
  id: IdCard,
  bank: Landmark,
  phone: Phone,
};

// Figma "4 · How hiring works" — desktop 312:2 (a track: four ringed badges
// on one line, a peach card under each), mobile 313:189 (a vertical timeline:
// badge + rail on the left, peach card on the right). Last step brown.
const cls = {
  inner: `${JOIN_INNER} flex flex-col gap-[16px] md:gap-[28px] lg:gap-[36px]`,
  // Below lg: timeline.
  list: "m-0 flex list-none flex-col p-0 lg:hidden",
  item: "flex gap-[14px] pb-[10px] last:pb-0",
  rail: "flex flex-none flex-col items-center self-stretch",
  line: "w-[2px] flex-1 bg-orange/35",
  badgeSm: "flex size-[44px] flex-none items-center justify-center rounded-full",
  cardSm: "flex min-w-0 flex-1 flex-col gap-[3px] rounded-[14px] bg-peach-100 px-[16px] py-[14px] leading-[normal] md:px-[20px] md:py-[18px]",
  // lg+: track.
  track: "relative m-0 hidden list-none grid-cols-4 gap-[20px] p-0 lg:grid",
  trackLine: "pointer-events-none absolute top-[27px] left-[52px] h-[2px] w-[calc(75%+15px)] bg-orange/35",
  badgeLg: "relative ml-[24px] flex size-[56px] items-center justify-center rounded-full border-[6px] border-white",
  cardLg: "mt-[18px] flex min-h-[149px] flex-col gap-[8px] rounded-[18px] bg-peach-100 px-[24px] pt-[22px] pb-[24px] leading-[normal]",
  step: "text-[10.5px] font-bold tracking-[1.05px] text-orange md:text-[11.5px] md:tracking-[1.15px]",
  title: "m-0 text-[16px] font-bold text-ink md:text-[18px] lg:text-[20px]",
  text: "m-0 text-[13.5px] leading-[20px] text-slate md:text-[14.5px] md:leading-[22px]",
  ready: [
    "flex flex-col items-start gap-[8px] rounded-[14px] border border-sand px-[16px] py-[14px]",
    "md:rounded-[16px] lg:flex-row lg:flex-wrap lg:items-center lg:gap-[16px] lg:px-[22px] lg:py-[16px]",
  ].join(" "),
  readyLabel: "m-0 text-[11px] leading-[normal] font-bold tracking-[1.1px] text-orange lg:text-[12px] lg:tracking-[1.2px]",
  readyItem: "flex items-center gap-[8px] text-[13.5px] leading-[normal] font-semibold text-ink md:text-[14.5px]",
};

export default function JoinHiring({ content }: { content: (typeof JOIN_PAGE)["hiring"] }) {
  const last = content.steps.length - 1;
  const num = (index: number) => `${content.stepLabel} ${String(index + 1).padStart(2, "0")}`;
  const tone = (index: number) => (index === last ? "bg-brown" : "bg-orange");

  return (
    <section id="how-hiring-works" className="bg-white" aria-labelledby="join-hiring-title">
      <div className={cls.inner}>
        <JoinSectionHeader id="join-hiring-title" copy={content.copy} />

        <ol className={cls.list} data-reveal-stagger>
          {content.steps.map((step, index) => {
            const Icon = STEP_ICONS[step.icon];
            return (
            <li key={step.title} className={cls.item} style={{ "--i": index } as React.CSSProperties}>
              <div className={cls.rail} aria-hidden="true">
                <span className={`${cls.badgeSm} ${tone(index)}`}>
                  <Icon size={20} strokeWidth={1.9} className="text-white" aria-hidden="true" />
                </span>
                {index !== last && <span className={cls.line} />}
              </div>
              <div className={cls.cardSm}>
                <span className={cls.step}>{num(index)}</span>
                <h3 className={cls.title}>{step.title}</h3>
                <p className={cls.text}>{step.text}</p>
              </div>
            </li>
            );
          })}
        </ol>

        <div className="relative hidden lg:block">
        <span className={cls.trackLine} aria-hidden="true" />
        <ol className={cls.track} data-reveal-stagger>
          {content.steps.map((step, index) => {
            const Icon = STEP_ICONS[step.icon];
            return (
            <li key={step.title} className="relative min-w-0" style={{ "--i": index } as React.CSSProperties}>
              <span className={`${cls.badgeLg} ${tone(index)}`} aria-hidden="true">
                <Icon size={24} strokeWidth={1.9} className="text-white" aria-hidden="true" />
              </span>
              <div className={cls.cardLg}>
                <span className={cls.step}>{num(index)}</span>
                <h3 className={cls.title}>{step.title}</h3>
                <p className={cls.text}>{step.text}</p>
              </div>
            </li>
            );
          })}
        </ol>
        </div>

        <div className={cls.ready} data-reveal>
          <p className={cls.readyLabel}>{content.keepReady.label}</p>
          <ul className="m-0 flex list-none flex-col gap-[8px] p-0 lg:flex-row lg:flex-wrap lg:gap-[16px]">
            {content.keepReady.items.map((item) => {
              const Icon = READY_ICONS[item.icon];
              return (
              <li key={item.text} className={cls.readyItem}>
                <Icon className="size-[16px] flex-none text-brown lg:size-[17px]" aria-hidden="true" />
                {item.text}
              </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
