import { Eyebrow } from "@/components/service/SectionHeader";
import type { ContactPageContent } from "@/data/contactPage";

// Figma "What happens next" — desktop 303:95: one peach band (24px radius,
// 32/28 padding) with the label column (260) and three ruled steps; 80px below.
// Phones 304:292: gold-rule eyebrow + 24px heading, then three peach step
// cards without the description (shown again from md).
const cls = {
  inner: "site-container pt-[40px] pb-[32px] max-md:px-[20px] md:pb-[72px] lg:pt-0 lg:pb-[80px]",
  band: "flex flex-col gap-[12px] lg:flex-row lg:items-center lg:gap-0 lg:rounded-[24px] lg:bg-peach-100 lg:px-[32px] lg:py-[28px]",
  label: "flex flex-col gap-[12px] lg:w-[260px] lg:flex-none lg:gap-[4px]",
  eyebrowLg: "m-0 hidden text-[12px] leading-[normal] font-bold tracking-[1.2px] text-orange uppercase lg:block",
  title: "m-0 text-[24px] leading-[27px] font-bold tracking-[-0.36px] text-heading lg:leading-[normal] lg:tracking-[-0.24px] lg:text-ink",
  steps: "m-0 flex list-none flex-col gap-[10px] p-0 md:grid md:grid-cols-3 lg:flex lg:flex-[1_1_0] lg:flex-row lg:gap-0",
  step: [
    "flex items-center gap-[12px] rounded-[14px] bg-peach-100 py-[12px] pr-[14px] pl-[12px]",
    "md:items-start md:p-[16px]",
    "lg:flex-[1_1_0] lg:gap-[14px] lg:rounded-none lg:border-l lg:border-[rgba(100,35,1,0.15)] lg:bg-transparent lg:py-0 lg:pr-[16px] lg:pl-[24px]",
  ].join(" "),
  badge:
    "flex size-[34px] flex-none items-center justify-center rounded-full text-[12px] leading-[normal] font-bold text-white lg:size-[40px] lg:text-[13px]",
  when: "text-[10.5px] leading-[normal] font-bold tracking-[0.84px] text-orange uppercase lg:text-[11px] lg:tracking-[0.88px]",
  stepTitle: "m-0 text-[15px] leading-[normal] font-bold text-ink lg:text-[16px]",
  text: "m-0 hidden text-[13.5px] leading-[20px] text-slate md:block lg:max-w-[240px]",
};

export default function NextSteps({ copy }: { copy: ContactPageContent["steps"] }) {
  return (
    <section className="bg-white" aria-labelledby="next-steps-title">
      <div className={cls.inner}>
        <div className={cls.band} data-reveal>
          <div className={cls.label}>
            <div className="lg:hidden">
              <Eyebrow>{copy.eyebrow}</Eyebrow>
            </div>
            <p className={cls.eyebrowLg}>{copy.eyebrow}</p>
            <h2 id="next-steps-title" className={cls.title}>
              {copy.title}
            </h2>
          </div>
          <ol className={cls.steps}>
            {copy.items.map((step, i) => (
              <li key={step.title} className={cls.step}>
                {/* The last step (crew on site) is brown in the design. */}
                <span className={`${cls.badge} ${i === copy.items.length - 1 ? "bg-brown" : "bg-orange"}`} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex min-w-0 flex-col gap-px lg:gap-[3px]">
                  <span className={cls.when}>{step.when}</span>
                  <h3 className={cls.stepTitle}>{step.title}</h3>
                  <p className={cls.text}>{step.text}</p>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
