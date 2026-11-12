import Image from "next/image";
import Photo from "@/components/common/Photo";
import type { RelatedService, ServiceSectionCopy } from "@/types/service";
import SectionHeader from "./SectionHeader";

interface RelatedServicesProps {
  id: string;
  copy: ServiceSectionCopy;
  services: RelatedService[];
}

// Figma "Related services" 237:780 — two 628×280 cards, navy fade from the left.
const cls = {
  grid: "m-0 grid list-none grid-cols-1 gap-[20px] p-0 md:gap-[24px] lg:grid-cols-2",
  card: [
    "group/card relative isolate flex min-h-[220px] items-end overflow-hidden rounded-[16px] bg-navy-card md:min-h-[280px] md:items-center md:rounded-[20px]",
    "[&_img]:transition-transform [&_img]:duration-[600ms] [&_img]:ease-site hover:[&_img]:scale-[1.03] motion-reduce:[&_img]:transition-none",
  ].join(" "),
  shade: "absolute inset-0 bg-[linear-gradient(180deg,rgba(8,27,48,0.15)_15%,rgba(8,27,48,0.92)_100%)] md:bg-[linear-gradient(90deg,rgba(8,27,48,0.95)_0%,rgba(8,27,48,0.55)_60%,rgba(8,27,48,0.15)_100%)]",
  text: "relative z-1 flex max-w-[424px] flex-col items-start gap-[6px] px-[18px] pb-[18px] md:gap-[10px] md:px-[32px] md:py-[32px]",
  kicker: "m-0 text-[11px] leading-[normal] font-bold tracking-[1.32px] text-peach-200 uppercase md:text-[12px] md:tracking-[1.44px]",
  title: "m-0 text-[19px] leading-[normal] font-bold text-white md:text-[clamp(22px,20.5915492958px+0.3755868545vw,26px)] md:leading-[1.23]",
  copy: "m-0 max-w-[330px] text-[13.5px] leading-[20px] text-white/85 md:text-[15px] md:leading-[23px]",
  // Phones: plain white text link; md+: white pill.
  link: [
    "inline-flex items-center gap-[6px] rounded-full text-[13.5px] leading-[normal] font-semibold text-white no-underline",
    "focus-ring [--focus-color:#fff] max-md:hover:underline",
    "md:gap-[8px] md:bg-white md:px-[16px] md:py-[10px] md:text-[14.5px] md:text-brown",
    "md:transition-colors md:duration-160 md:hover:bg-peach-100",
  ].join(" "),
};

export default function RelatedServices({ id, copy, services }: RelatedServicesProps) {
  return (
    <section id={id} className="bg-white" aria-labelledby={`${id}-title`}>
      <div className="site-container section-pad flex flex-col gap-[20px] max-md:px-[20px] md:gap-[32px]">
        <SectionHeader id={`${id}-title`} copy={copy} />
        <ul className={cls.grid} data-reveal-stagger>
          {services.map((service, index) => (
            <li key={service.title} className={cls.card} style={{ "--i": index } as React.CSSProperties}>
              <Photo image={service.image} sizes="(min-width: 1024px) 50vw, 100vw" />
              <span className={cls.shade} aria-hidden="true" />
              <div className={cls.text}>
                <p className={cls.kicker}>{service.kicker}</p>
                <h3 className={cls.title}>{service.title}</h3>
                <p className={cls.copy}>{service.text}</p>
                <a href={service.href} className={cls.link}>
                  {service.cta}
                  <span className="sr-only">: {service.title}</span>
                  <Image src="/service/m/arrow-white-14.svg" alt="" width={14} height={14} className="md:hidden" />
                  <Image src="/service/icon-arrow-brown-16.svg" alt="" width={16} height={16} className="hidden md:block" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
