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
              <Image src="/homepage/icon-phone-white-20.svg" alt="" width={20} height={20} className="max-md:hidden" />
              {founder.ctaLabel || labels.callButton}
              <Image src="/homepage/icon-arrow-right-white.svg" alt="" width={18} height={18} className="md:hidden" />
            </a>
          </div>

          <ul className={cls.founder__assurances} aria-label={t.founder.assurances} data-reveal-stagger>
            {founder.assurances.map((item) => (
              <li key={item} className={cls.founder__assurance}>
                <Image src="/homepage/icon-check.svg" alt="" width={16} height={16} className="size-[13px] md:size-4" />
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
  // Mobile (<768, Figma "Homepage — Mobile 390"): 24px rhythm, chip-style assurances.
  founder__inner: "site-container section-pad grid grid-cols-1 items-center gap-6 md:gap-8 lg:grid-cols-2 lg:gap-6",
  founder__media:
    "relative h-[360px] overflow-hidden rounded-[18px] bg-sand md:h-[520px] md:rounded-[12px] lg:h-[575px]",
  founder__content: "flex min-w-0 flex-col gap-6 md:gap-[22px] lg:pl-0",
  founder__title: "heading-xl",
  founder__story: [
    "m-0 max-w-[560px] text-[15px] leading-[25px] font-normal tracking-normal text-slate",
    "md:text-[clamp(16px,15.4718309859px+0.1408450704vw,17.5px)] md:leading-[1.7028571429] md:text-ink",
  ].join(" "),
  founder__signoff: [
    "flex max-w-[612px] items-center justify-between gap-x-4 md:flex-wrap md:gap-x-8 md:gap-y-4",
    "md:border-t md:border-sand-rule md:pt-[23px]",
  ].join(" "),
  founder__person: "flex flex-col gap-0.5",
  founder__name: [
    "m-0 text-[17px] leading-[23px] font-bold text-brown",
    "md:mb-0.5 md:text-[clamp(22px,20.5915492958px+0.3755868545vw,26px)] md:leading-[1.05] md:tracking-[-0.5px] md:text-navy",
  ].join(" "),
  founder__role: "m-0 text-[13.5px] leading-[18px] text-slate md:text-[14px] md:leading-[22.4px]",
  founder__cta: [
    "btn-primary [--btn-h:52px] text-[15.5px] leading-[24.8px]",
    "max-md:gap-2 max-md:px-5 max-md:py-[11px] max-md:leading-[21px] max-md:[--btn-h:43px]",
  ].join(" "),
  founder__assurances: "flex max-w-[612px] flex-wrap gap-2 md:gap-x-5 md:gap-y-2 md:pt-1.5",
  founder__assurance: [
    "flex items-center gap-[6px] rounded-full bg-peach-100 py-[6px] pr-[10px] pl-2 text-[13px] leading-[18px] font-medium text-ink",
    "md:gap-2 md:rounded-none md:bg-transparent md:p-0 md:text-[14.5px] md:leading-[23.2px] md:font-normal",
  ].join(" "),
};
