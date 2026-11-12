import Image from "next/image";
import type { ProcessCopy, ProcessIcon, ProcessStep } from "@/types/homepage";
import type { Dictionary } from "@/lib/i18n";

interface HowToProps {
  steps: ProcessStep[];
  copy: ProcessCopy;
  t: Dictionary;
}

const STEP_ICONS: Record<ProcessIcon, string> = {
  requirement: "/homepage/icon-step-requirement.svg",
  "site-visit": "/homepage/icon-step-site-visit.svg",
  crew: "/homepage/icon-step-crew.svg",
  records: "/homepage/icon-step-records.svg",
};

// 16px outline icons beside the step title on phones (Figma "Homepage — Mobile 390").
const STEP_ICONS_MOBILE: Record<ProcessIcon, string> = {
  requirement: "/homepage/m/step-file.svg",
  "site-visit": "/homepage/m/step-pin.svg",
  crew: "/homepage/m/step-user.svg",
  records: "/homepage/m/step-shield.svg",
};

// ≥ 1024px each step's rail/body/outcome is pinned to the step's column of the
// shared grid (max 4 steps). Literal strings so Tailwind generates them.
const STEP_COL = ["lg:col-1", "lg:col-2", "lg:col-3", "lg:col-4"];

const cls = {
  process: "bg-peach-100",
  inner: "site-container section-pad flex flex-col gap-6 md:gap-[32px] lg:gap-[44px]",
  header: "split-header [--aside-w:460px] max-md:gap-4",
  // Phones only: "— HOW WE WORK" eyebrow above the heading.
  eyebrow:
    "m-0 flex items-center gap-[10px] text-[11.5px] leading-[16px] font-semibold tracking-[1.38px] text-slate uppercase md:hidden",
  eyebrowRule: "h-[2px] w-[20px] flex-none bg-[#a9822a]",
  title: "heading-xl flex-[1_1_0]",
  accent: "accent-underline",
  copy: "body-lg lg:pr-[12px]",

  // ── Steps ──
  // < 1024px: each step is its own card (1 col → 2 cols at tablet).
  // ≥ 1024px: steps dissolve (display: contents) into one 4×3 grid so the rail,
  // white panel and brown outcome strip line up across columns like the design.
  steps: [
    "grid grid-cols-1 gap-[14px] md:grid-cols-2 md:gap-[16px]",
    "lg:grid-cols-4 lg:grid-rows-[44px_1fr_auto] lg:gap-0",
    // The white panel behind rows 2–3, with the design's soft shadow.
    "lg:before:col-[1/-1] lg:before:row-[2/4] lg:before:mt-[20px] lg:before:rounded-[12px] lg:before:bg-white lg:before:shadow-panel lg:before:content-['']",
  ].join(" "),
  step: [
    "grid grid-cols-[auto_minmax(0,1fr)] gap-x-[14px] overflow-hidden rounded-[14px] bg-white shadow-[0_10px_24px_rgba(99,36,0,0.07)]",
    "md:flex md:flex-col md:gap-x-0 md:rounded-[12px] md:shadow-panel lg:contents",
  ].join(" "),
  rail: "flex items-start pt-[18px] pl-[18px] md:items-center md:px-[24px] md:pt-[24px] md:pb-0 lg:row-1 lg:h-[44px] lg:overflow-hidden lg:p-0 lg:pl-[32px]",
  number:
    "flex size-[40px] flex-none items-center justify-center rounded-full bg-orange text-[13px] font-bold text-white md:size-[44px] md:text-[14px]",
  line: "hidden lg:flex lg:min-w-0 lg:flex-[1_1_0] lg:overflow-hidden lg:[&_img]:flex-none",
  body: [
    "flex flex-auto flex-col pt-[18px] pr-[18px] pb-[16px] md:gap-[24px] md:px-[24px] md:pt-[20px] md:pb-[28px]",
    "lg:relative lg:row-2 lg:mt-[20px] lg:px-[32px] lg:pt-[32px] lg:pb-[36px]",
  ].join(" "),
  bodyDivider: "lg:border-r lg:border-peach-line",
  icon: "hidden size-[56px] items-center justify-center rounded-[12px] bg-peach-100 md:flex",
  text: "flex flex-col gap-[6px] md:gap-[10px]",
  title3:
    "m-0 flex items-center gap-2 text-[16px] leading-[22px] font-semibold text-ink md:block md:text-[20px] md:leading-[28px]",
  description: "m-0 text-[14px] leading-[21px] text-slate md:text-[15px] md:leading-[24px]",
  outcome: [
    "col-span-2 flex flex-col gap-[4px] bg-brown px-[18px] pt-[12px] pb-[14px] md:gap-[8px] md:px-[24px] md:pt-[20px] md:pb-[24px]",
    "lg:relative lg:row-3 lg:min-h-[124px] lg:px-[32px] lg:pt-[24px] lg:pb-[28px]",
  ].join(" "),
  outcomeDivider: "lg:border-r lg:border-[rgba(255,255,255,0.16)]",
  outcomeLabel:
    "m-0 text-[11px] leading-[15px] font-bold tracking-[1.1px] text-peach-200 uppercase md:text-[12px] md:leading-normal md:tracking-[0.96px]",
  outcomeText: "m-0 text-[14px] leading-[20px] font-semibold text-white md:text-[16px] md:leading-[24px]",
};

export default function HowTo({ steps, copy, t }: HowToProps) {
  return (
    <section id="how-we-work" className={cls.process} aria-labelledby="process-title">
      <div className={cls.inner}>
        <div className={cls.header}>
          <p className={cls.eyebrow} data-reveal>
            <span className={cls.eyebrowRule} aria-hidden="true" />
            {t.process.eyebrow}
          </p>
          <h2 id="process-title" className={cls.title} data-reveal="clip">
            {copy.heading.lead}{" "}
            {copy.heading.accent && <span className={cls.accent}>{copy.heading.accent}</span>}
          </h2>
          {copy.intro && <p className={cls.copy} data-reveal style={{ "--rd": "150ms" } as React.CSSProperties}>{copy.intro}</p>}
        </div>

        <ol className={cls.steps} data-reveal-stagger="contents">
          {steps.map((step, index) => {
            const col = STEP_COL[index] ?? "";
            const isFirst = index === 0;
            const isLast = index === steps.length - 1;
            return (
              <li key={step.number} className={cls.step}>
                <div className={`${cls.rail} ${col}`} aria-hidden="true">
                  <span className={cls.number}>{step.number}</span>
                  {index < steps.length - 1 && (
                    <span className={cls.line}>
                      <Image src="/homepage/process-line.svg" alt="" width={244} height={2} />
                    </span>
                  )}
                </div>
                {/* Column dividers on every step but the last (≥ 1024px). */}
                <div className={`${cls.body} ${col} ${isLast ? "" : cls.bodyDivider}`}>
                  <span className={cls.icon}>
                    <Image src={STEP_ICONS[step.icon]} alt="" width={30} height={30} />
                  </span>
                  <div className={cls.text}>
                    <h3 className={cls.title3}>
                      <Image
                        src={STEP_ICONS_MOBILE[step.icon]}
                        alt=""
                        width={16}
                        height={16}
                        className="flex-none md:hidden"
                      />
                      <span>
                        <span className="sr-only">Step {step.number}: </span>
                        {step.title}
                      </span>
                    </h3>
                    <p className={cls.description}>{step.description}</p>
                  </div>
                </div>
                {/* Outer strip corners round off the shared white panel (≥ 1024px). */}
                <div
                  className={[
                    cls.outcome,
                    col,
                    isLast ? "lg:rounded-br-[12px]" : cls.outcomeDivider,
                    isFirst ? "lg:rounded-bl-[12px]" : "",
                  ].join(" ")}
                >
                  <p className={cls.outcomeLabel}>{step.outcomeLabel}</p>
                  <p className={cls.outcomeText}>{step.outcome}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
