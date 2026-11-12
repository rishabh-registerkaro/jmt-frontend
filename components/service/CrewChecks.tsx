import { Check, Flag, HardHat, Hammer, IdCard, Info, List, User, type LucideIcon } from "lucide-react";
import Photo from "@/components/common/Photo";
import type { CheckIcon, CrewContent } from "@/types/service";
import SectionHeader from "./SectionHeader";

interface CrewChecksProps {
  id: string;
  content: CrewContent;
}

// 24px icons in 56px badges (md+), 20px in 44px badges on phones.
const CHECK_ICONS: Record<CheckIcon, LucideIcon> = {
  hammer: Hammer,
  id: IdCard,
  info: Info,
  hat: HardHat,
  user: User,
};

// Figma "Your crew (light band)" 237:384 — five checkpoints on an orange rail
// (240px columns, 20px gaps), then the sample crew list card (photo 420 | list).
// Phones (244:2): a vertical timeline (badge + line | card), and the crew list
// as compact rows with the four ticks grouped on the right.
const cls = {
  // Figma: rgba(252,211,176,0.31) over white = #fef1e7 (peach-100).
  section: "scroll-mt-[65px] bg-peach-100",
  inner: "site-container section-pad flex flex-col gap-[20px] max-md:px-[20px] md:gap-[40px] lg:gap-[56px]",
  intro: "m-0 text-[15px] leading-[24px] text-slate md:text-[18px] md:leading-[29px] lg:w-[440px] lg:flex-none",

  // The vertical timeline runs up to xl (at 1024 five columns were ~115px wide) (five cards never split unevenly).
  track: "m-0 grid list-none grid-cols-1 p-0 xl:grid-cols-5 xl:gap-[20px]",
  rail: [
    "pointer-events-none absolute top-[27px] right-[calc(20%-52px)] left-[52px] hidden h-[2px] xl:block",
    "bg-[linear-gradient(90deg,rgba(242,105,33,0.9),rgba(242,105,33,0.35))]",
  ].join(" "),
  step: "relative flex gap-[14px] not-last:pb-[12px] md:gap-[20px] md:not-last:pb-[16px] xl:flex-col xl:not-last:pb-0",
  badgeRow: "flex flex-col items-center self-stretch xl:flex-row xl:gap-[8px] xl:self-auto xl:pl-[24px]",
  badge: [
    "flex size-[44px] flex-none items-center justify-center rounded-full bg-orange",
    "md:size-[56px] md:border-6 md:border-[#fef0e5]",
  ].join(" "),
  line: "w-[2px] flex-1 bg-[rgba(242,105,33,0.35)] xl:hidden",
  cleared: [
    "items-center gap-[8px] rounded-full bg-orange py-[8px] pr-[14px] pl-[10px] md:pr-[12px]",
    "text-[13px] leading-[normal] font-bold whitespace-nowrap text-white md:text-[13.5px]",
  ].join(" "),
  clearedTick: "flex size-[20px] flex-none items-center justify-center rounded-full bg-white md:size-[22px]",
  card: [
    "flex min-w-0 flex-1 flex-col gap-[4px] rounded-[14px] border border-sand bg-white px-[16px] py-[14px]",
    "shadow-[0_10px_24px_rgba(99,36,0,0.07)]",
    "md:gap-[10px] md:rounded-[18px] md:px-[24px] md:pt-[24px] md:pb-[26px] md:shadow-[0_10px_28px_rgba(99,36,0,0.06)] xl:min-h-[229px]",
  ].join(" "),
  checkLabel: "m-0 text-[10.5px] leading-[normal] font-bold tracking-[1.05px] text-orange uppercase md:text-[12px] md:tracking-[1.44px]",
  checkTitle: "m-0 text-[16px] leading-[normal] font-bold text-ink md:text-[20px] md:leading-[26px]",
  checkText: "m-0 text-[13.5px] leading-[20px] text-slate md:text-[15px] md:leading-[23px]",

  sample: [
    "flex flex-col overflow-hidden rounded-[18px] border border-sand bg-white shadow-[0_10px_24px_rgba(99,36,0,0.07)]",
    "md:rounded-[24px] md:shadow-[0_16px_40px_rgba(99,36,0,0.08)] xl:flex-row",
  ].join(" "),
  sampleMedia: "relative h-[170px] flex-none bg-navy-card md:h-[340px] xl:h-auto xl:w-[33%] xl:max-w-[420px]",
  caption: [
    "absolute top-[12px] left-[12px] z-1 m-0 flex items-center gap-[6px] rounded-full bg-white/92 py-[6px] pr-[12px] pl-[8px]",
    "text-[12px] leading-[normal] font-semibold text-brown",
    "md:top-[20px] md:left-[20px] md:gap-[8px] md:py-[8px] md:pr-[14px] md:pl-[10px] md:text-[13.5px]",
  ].join(" "),
  smallBadge: "flex size-[20px] flex-none items-center justify-center rounded-full bg-orange md:size-[22px]",
  list: "flex min-w-0 flex-1 flex-col gap-[14px] px-[16px] py-[18px] md:gap-[20px] md:px-[36px] md:py-[32px]",
  kicker: "m-0 text-[12px] leading-[normal] font-semibold text-orange md:text-[13px] md:tracking-[0.78px]",
  sampleTitle: [
    "m-0 text-[16px] leading-[normal] font-bold text-ink",
    "md:text-[clamp(20px,18.5915492958px+0.3755868545vw,24px)] md:leading-[1.25] md:tracking-[-0.12px]",
  ].join(" "),
  stamp: [
    "flex-none rounded-[5px] border-[1.5px] border-orange px-[8px] py-[3px] text-[10.5px] leading-[normal] font-extrabold tracking-[1.47px] text-orange uppercase",
    "md:rounded-[6px] md:border-2 md:px-[12px] md:py-[5px] md:text-[13px] md:tracking-[2.08px]",
  ].join(" "),

  // md+: the full table.
  tableWrap: "hidden overflow-x-auto rounded-[14px] border border-sand md:block",
  th: "px-[8px] py-[12px] text-[11.5px] leading-[normal] font-bold tracking-[0.92px] text-brown uppercase first:pl-[16px] last:pr-[16px]",
  td: "px-[8px] py-[12px] text-[14.5px] leading-[normal] text-ink first:pl-[16px] last:pr-[16px]",
  num: "flex size-[30px] flex-none items-center justify-center rounded-full bg-peach-100 text-[11px] leading-[normal] font-bold text-brown",
  tick: "mx-auto flex size-[22px] items-center justify-center rounded-full bg-orange",
  lead: "flex flex-wrap items-center gap-x-[12px] gap-y-[6px] bg-peach-100 px-[16px] py-[14px]",

  // Phones: compact list (Figma 244:89).
  mList: "overflow-hidden rounded-[12px] border border-sand md:hidden",
  mHead: [
    "flex items-start justify-between bg-peach-100 px-[12px] py-[9px]",
    "text-[10.5px] leading-[normal] font-bold whitespace-nowrap text-brown uppercase",
  ].join(" "),
  mRow: "flex items-center justify-between px-[12px] py-[10px] odd:bg-white even:bg-input-bg",
  mTick: "flex size-[20px] items-center justify-center rounded-full bg-orange",

  footer: "flex flex-col items-stretch gap-[14px] md:flex-row md:flex-wrap md:items-center",
  cta: [
    "btn-primary [--btn-h:46px] gap-[8px] px-[18px] py-[12px] text-[15px] leading-[normal]",
    "md:[--btn-h:48px] md:pr-[22px] md:pl-[20px] md:text-[15.5px]",
  ].join(" "),
  note: "m-0 text-center text-[12.5px] leading-[normal] text-slate md:text-left md:text-[14px]",
};

export default function CrewChecks({ id, content }: CrewChecksProps) {
  const { sample } = content;
  const last = content.checks.length - 1;
  const ticksLabel = `${sample.columns.checks.join(", ")}: done`;

  const cleared = (className: string) => (
    <span className={`${cls.cleared} ${className}`}>
      <span className={cls.clearedTick} aria-hidden="true">
        <Check strokeWidth={3} className="size-[11px] text-orange md:size-[12px] md:text-online" aria-hidden="true" />
      </span>
      {content.clearedLabel}
    </span>
  );

  return (
    <section id={id} className={cls.section} aria-labelledby={`${id}-title`}>
      <div className={cls.inner}>
        <SectionHeader id={`${id}-title`} copy={content.copy} titleWidth="lg:max-w-[720px]" introClassName={cls.intro} />

        <div className="flex flex-col gap-[20px]">
          <div className="relative">
            <span className={cls.rail} aria-hidden="true" />
            <ol className={cls.track} data-reveal-stagger>
              {content.checks.map((check, index) => {
                const CheckIconGlyph = CHECK_ICONS[check.icon];
                return (
                  <li key={check.title} className={cls.step} style={{ "--i": index } as React.CSSProperties}>
                    <div className={`${cls.badgeRow} ${index === last ? "xl:pl-[20px]" : ""}`}>
                      <span className={cls.badge} aria-hidden="true">
                        <CheckIconGlyph strokeWidth={1.9} className="size-[20px] text-white md:size-[24px]" aria-hidden="true" />
                      </span>
                      <span className={cls.line} aria-hidden="true" />
                      {index === last && cleared("hidden xl:flex")}
                    </div>
                    <div className={cls.card}>
                      <p className={cls.checkLabel}>{check.label}</p>
                      <h3 className={cls.checkTitle}>{check.title}</h3>
                      <p className={cls.checkText}>{check.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
          {cleared("flex self-start xl:hidden")}
        </div>

        <div className={cls.sample} data-reveal>
          <div className={cls.sampleMedia}>
            <Photo image={sample.image} sizes="(min-width: 1280px) 420px, 100vw" />
            <p className={cls.caption}>
              <span className={cls.smallBadge} aria-hidden="true">
                <User strokeWidth={2.4} className="size-[11px] text-white md:size-[12px]" aria-hidden="true" />
              </span>
              {sample.caption}
            </p>
          </div>

          <div className={cls.list}>
            <div className="flex items-center justify-between gap-[16px]">
              <div className="flex flex-col gap-[2px] md:gap-[4px]">
                <p className={cls.kicker}>{sample.kicker}</p>
                <h3 className={cls.sampleTitle}>{sample.title}</h3>
              </div>
              <span className={cls.stamp}>{sample.stamp}</span>
            </div>

            {/* Phones */}
            <div className={cls.mList}>
              <p className={`${cls.mHead} m-0`} aria-hidden="true">
                <span className="tracking-[0.84px]">{sample.columns.worker}</span>
                <span className="tracking-[0.42px]">{sample.checksShort}</span>
              </p>
              <ul className="m-0 list-none p-0">
                {sample.workers.map((worker) => (
                  <li key={worker.name} className={cls.mRow}>
                    <span className="flex flex-col gap-px leading-[normal] whitespace-nowrap">
                      <span className="text-[13.5px] font-semibold text-ink">{worker.name}</span>
                      <span className="text-[12px] text-slate">{worker.trade}</span>
                    </span>
                    <span className="flex gap-[8px]" role="img" aria-label={ticksLabel}>
                      {sample.columns.checks.map((label) => (
                        <span key={label} className={cls.mTick}>
                          <Check size={11} strokeWidth={3} className="text-white" aria-hidden="true" />
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-[10px] bg-peach-100 px-[12px] py-[11px]">
                <span className="flex size-[26px] flex-none items-center justify-center rounded-full bg-orange" aria-hidden="true">
                  <Flag size={13} className="text-white" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col gap-px leading-[normal]">
                  <span className="text-[13px] font-semibold text-brown">{sample.lead.title}</span>
                  <span className="text-[11.5px] text-slate">{sample.lead.duties}</span>
                </span>
              </div>
            </div>

            {/* md+ */}
            <div className={cls.tableWrap}>
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead className="bg-peach-100">
                  <tr>
                    <th scope="col" className={`${cls.th} w-[210px]`}>
                      {sample.columns.worker}
                    </th>
                    <th scope="col" className={`${cls.th} w-[150px]`}>
                      {sample.columns.trade}
                    </th>
                    {sample.columns.checks.map((label) => (
                      <th key={label} scope="col" className={`${cls.th} w-[88px] text-center`}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sample.workers.map((worker, index) => (
                    <tr key={worker.name} className="odd:bg-white even:bg-input-bg">
                      <th scope="row" className={`${cls.td} font-semibold`}>
                        <span className="flex items-center gap-[10px] whitespace-nowrap">
                          <span className={cls.num} aria-hidden="true">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {worker.name}
                        </span>
                      </th>
                      <td className={`${cls.td} whitespace-nowrap`}>{worker.trade}</td>
                      {sample.columns.checks.map((label) => (
                        <td key={label} className={cls.td}>
                          <span className={cls.tick}>
                            <Check size={12} strokeWidth={3} className="text-white" role="img" aria-label={`${label} done`} />
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2 + sample.columns.checks.length} className="p-0">
                      <div className={cls.lead}>
                        <span className="flex size-[30px] flex-none items-center justify-center rounded-full bg-orange" aria-hidden="true">
                          <Flag size={15} className="text-white" aria-hidden="true" />
                        </span>
                        <span className="text-[14.5px] leading-[normal] font-semibold text-brown">{sample.lead.title}</span>
                        <span className="ml-auto text-[13.5px] leading-[normal] text-slate">{sample.lead.duties}</span>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className={cls.footer}>
              <a href="#contact" className={cls.cta}>
                <List className="size-[16px] text-white md:size-[17px]" aria-hidden="true" />
                {sample.cta}
              </a>
              <p className={cls.note}>{sample.note}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
