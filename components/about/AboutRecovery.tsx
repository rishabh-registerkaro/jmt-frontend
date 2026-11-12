import { ArrowRight } from "lucide-react";
import type { AboutRecoveryContent } from "@/types/about";
import { ABOUT_INNER, AboutSectionHeader } from "./shared";

// Figma "When something goes wrong" — desktop 292:154 (four step cards with
// arrows between, then three facts in a ruled row), mobile 297:98 (a numbered
// timeline: badge + rail on the left, white card on the right; facts as rows).
const cls = {
  inner: `${ABOUT_INNER} flex flex-col gap-[18px] py-[56px] md:gap-[32px] md:py-[100px] lg:gap-[48px]`,
  steps: "m-0 flex list-none flex-col p-0 lg:grid lg:grid-cols-4 lg:gap-[20px]",
  step: "flex gap-[14px] pb-[10px] last:pb-0 lg:pb-0",
  rail: "flex flex-none flex-col items-center self-stretch lg:hidden",
  line: "w-[2px] flex-1 bg-orange/35",
  badge: "flex flex-none items-center justify-center rounded-full text-white leading-[normal] font-bold",
  card: [
    "flex min-w-0 flex-1 flex-col gap-[4px] rounded-[14px] border border-sand bg-white px-[16px] py-[14px]",
    "md:px-[20px] md:py-[18px]",
    "lg:min-h-[183px] lg:gap-[12px] lg:rounded-[18px] lg:p-[24px] lg:shadow-[0_14px_36px_0_rgba(99,36,0,0.07)]",
  ].join(" "),
  cardTop: "hidden items-center justify-between lg:flex",
  title: "m-0 text-[15.5px] leading-[normal] font-bold text-ink md:text-[17px] lg:text-[18px]",
  text: "m-0 text-[13.5px] leading-[20px] text-slate md:text-[14.5px] md:leading-[22px]",
  facts: "m-0 flex list-none flex-col p-0 leading-[normal] lg:flex-row lg:border-t lg:border-brown/15",
  fact: [
    "flex items-center gap-[12px] border-t border-brown/12 py-[12px]",
    "lg:flex-1 lg:flex-col lg:items-start lg:gap-[4px] lg:border-t-0 lg:pt-[24px] lg:pb-0",
  ].join(" "),
  factValue: "m-0 w-[130px] flex-none text-[20px] font-bold text-orange md:w-[180px] md:text-[24px] lg:w-auto lg:text-[28px] lg:tracking-[-0.28px]",
  factLabel: "m-0 min-w-0 flex-1 text-[13.5px] text-slate md:text-[14.5px]",
};

export default function AboutRecovery({ content }: { content: AboutRecoveryContent }) {
  const last = content.steps.length - 1;
  return (
    <section id="when-something-goes-wrong" className="bg-peach-100" aria-labelledby="about-recovery-title">
      <div className={cls.inner}>
        <AboutSectionHeader id="about-recovery-title" copy={content.copy} />

        <ol className={cls.steps} data-reveal-stagger>
          {content.steps.map((step, index) => {
            const num = String(index + 1).padStart(2, "0");
            const tone = index === last ? "bg-brown" : "bg-orange";
            return (
              <li key={step.title} className={cls.step} style={{ "--i": index } as React.CSSProperties}>
                <div className={cls.rail} aria-hidden="true">
                  <span className={`${cls.badge} ${tone} size-[36px] text-[12px]`}>{num}</span>
                  {index !== last && <span className={cls.line} />}
                </div>
                <div className={cls.card}>
                  <div className={cls.cardTop} aria-hidden="true">
                    <span className={`${cls.badge} ${tone} size-[40px] text-[13px]`}>{num}</span>
                    {index !== last && <ArrowRight aria-hidden="true" size={18} className="flex-none text-peach-200" />}
                  </div>
                  <h3 className={cls.title}>{step.title}</h3>
                  <p className={cls.text}>{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <ul className={cls.facts} data-reveal-stagger>
          {content.facts.map((fact, index) => (
            <li key={fact.value} className={cls.fact} style={{ "--i": index } as React.CSSProperties}>
              <p className={cls.factValue}>{fact.value}</p>
              <p className={cls.factLabel}>{fact.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
