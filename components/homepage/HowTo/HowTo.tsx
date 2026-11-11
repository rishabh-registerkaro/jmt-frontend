import Image from "next/image";
import type { ProcessCopy, ProcessIcon, ProcessStep } from "@/types/homepage";

interface HowToProps {
  steps: ProcessStep[];
  copy: ProcessCopy;
}

const STEP_ICONS: Record<ProcessIcon, string> = {
  requirement: "/homepage/icon-step-requirement.svg",
  "site-visit": "/homepage/icon-step-site-visit.svg",
  crew: "/homepage/icon-step-crew.svg",
  records: "/homepage/icon-step-records.svg",
};

// ≥ 1024px each step's rail/body/outcome is pinned to the step's column of the
// shared grid (max 4 steps). Literal strings so Tailwind generates them.
const STEP_COL = ["lg:col-1", "lg:col-2", "lg:col-3", "lg:col-4"];

const cls = {
  process: "bg-peach-100",
  inner: "site-container section-pad flex flex-col gap-[32px] lg:gap-[44px]",
  header: "split-header [--aside-w:460px]",
  title: "heading-xl flex-[1_1_0]",
  accent: "accent-underline",
  copy: "body-lg lg:pr-[12px]",

  // ── Steps ──
  // < 1024px: each step is its own card (1 col → 2 cols at tablet).
  // ≥ 1024px: steps dissolve (display: contents) into one 4×3 grid so the rail,
  // white panel and brown outcome strip line up across columns like the design.
  steps: [
    "grid grid-cols-1 gap-[16px] md:grid-cols-2",
    "lg:grid-cols-4 lg:grid-rows-[44px_1fr_auto] lg:gap-0",
    // The white panel behind rows 2–3, with the design's soft shadow.
    "lg:before:col-[1/-1] lg:before:row-[2/4] lg:before:mt-[20px] lg:before:rounded-[12px] lg:before:bg-white lg:before:shadow-panel lg:before:content-['']",
  ].join(" "),
  step: "flex flex-col overflow-hidden rounded-[12px] bg-white shadow-panel lg:contents",
  rail: "flex items-center px-[24px] pt-[24px] pb-0 lg:row-1 lg:h-[44px] lg:overflow-hidden lg:p-0 lg:pl-[32px]",
  number:
    "flex size-[44px] flex-none items-center justify-center rounded-[22px] bg-orange text-[14px] font-bold text-white",
  line: "hidden lg:flex lg:min-w-0 lg:flex-[1_1_0] lg:overflow-hidden lg:[&_img]:flex-none",
  body: [
    "flex flex-auto flex-col gap-[24px] px-[24px] pt-[20px] pb-[28px]",
    "lg:relative lg:row-2 lg:mt-[20px] lg:px-[32px] lg:pt-[32px] lg:pb-[36px]",
  ].join(" "),
  bodyDivider: "lg:border-r lg:border-peach-line",
  icon: "flex size-[56px] items-center justify-center rounded-[12px] bg-peach-100",
  text: "flex flex-col gap-[10px]",
  title3: "m-0 text-[20px] leading-[28px] font-semibold text-ink",
  description: "m-0 text-[15px] leading-[24px] text-slate",
  outcome: [
    "flex flex-col gap-[8px] bg-brown px-[24px] pt-[20px] pb-[24px]",
    "lg:relative lg:row-3 lg:min-h-[124px] lg:px-[32px] lg:pt-[24px] lg:pb-[28px]",
  ].join(" "),
  outcomeDivider: "lg:border-r lg:border-[rgba(255,255,255,0.16)]",
  outcomeLabel: "m-0 text-[12px] font-bold tracking-[0.96px] text-peach-200 uppercase",
  outcomeText: "m-0 text-[16px] leading-[24px] font-semibold text-white",
};

export default function HowTo({ steps, copy }: HowToProps) {
  return (
    <section id="how-we-work" className={cls.process} aria-labelledby="process-title">
      <div className={cls.inner}>
        <div className={cls.header}>
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
                      <span className="sr-only">Step {step.number}: </span>
                      {step.title}
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
