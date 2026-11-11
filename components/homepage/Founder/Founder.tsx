import Image from "next/image";
import type { ChromeLabels, ContactInfo, FounderContent } from "@/types/homepage";
import Photo from "@/components/common/Photo";
import type { Dictionary } from "@/lib/i18n";

interface FounderProps {
  founder: FounderContent;
  contact: ContactInfo;
  labels: ChromeLabels;
  t: Dictionary;
}

export default function Founder({ founder, contact, labels, t }: FounderProps) {
  return (
    <section id="about" className={cls.founder} aria-labelledby="founder-title">
      <div className={cls.founder__inner}>
        <div className={cls.founder__media} data-reveal="img">
          <Photo image={founder.image} sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>

        <div className={cls.founder__content}>
          <h2 id="founder-title" className={cls.founder__title} data-reveal="clip">
            {founder.heading}
          </h2>
          <p className={cls.founder__story} data-reveal style={{ "--rd": "120ms" } as React.CSSProperties}>{founder.story}</p>

          <div className={cls.founder__signoff} data-reveal style={{ "--rd": "220ms" } as React.CSSProperties}>
            <div className={cls.founder__person}>
              <p className={cls.founder__name}>{founder.name}</p>
              <p className={cls.founder__role}>{founder.role}</p>
            </div>
            <a href={contact.phoneHref ?? "#contact"} className={cls.founder__cta}>
              <Image src="/homepage/icon-phone-white-20.svg" alt="" width={20} height={20} />
              {founder.ctaLabel || labels.callButton}
            </a>
          </div>

          <ul className={cls.founder__assurances} aria-label={t.founder.assurances} data-reveal-stagger>
            {founder.assurances.map((item) => (
              <li key={item} className={cls.founder__assurance}>
                <Image src="/homepage/icon-check.svg" alt="" width={16} height={16} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const cls = {
  founder: "bg-white",
  founder__inner: "site-container section-pad grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-6",
  founder__media: "relative h-[420px] overflow-hidden rounded-[12px] bg-sand md:h-[520px] lg:h-[575px]",
  founder__content: "flex min-w-0 flex-col gap-[22px] lg:pl-0",
  founder__title: "heading-xl",
  founder__story: [
    "m-0 max-w-[560px] text-ink",
    "text-[clamp(16px,15.4718309859px+0.1408450704vw,17.5px)] leading-[1.7028571429] font-normal tracking-normal",
  ].join(" "),
  founder__signoff: [
    "flex max-w-[612px] flex-wrap items-center justify-between gap-x-8 gap-y-4",
    "border-t border-sand-rule pt-[23px]",
  ].join(" "),
  founder__person: "flex flex-col gap-0.5",
  founder__name: [
    "m-0 mb-0.5 text-navy",
    "text-[clamp(22px,20.5915492958px+0.3755868545vw,26px)] leading-[1.05] font-bold tracking-[-0.5px]",
  ].join(" "),
  founder__role: "m-0 text-[14px] leading-[22.4px] text-slate",
  founder__cta: "btn-primary [--btn-h:52px] text-[15.5px] leading-[24.8px]",
  founder__assurances: "flex max-w-[612px] flex-wrap gap-x-5 gap-y-2 pt-1.5",
  founder__assurance: "flex items-center gap-2 text-[14.5px] leading-[23.2px] text-ink",
};
