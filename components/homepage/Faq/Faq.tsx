import Image from "next/image";
import type { ChromeLabels, ContactInfo, FaqCopy, FaqGroup, FounderContent } from "@/types/homepage";
import FaqTabs from "./FaqTabs";
import { JOIN_CREW_ANCHOR } from "./anchors";
import type { Dictionary } from "@/lib/i18n";

interface FaqProps {
  groups: FaqGroup[];
  copy: FaqCopy;
  founder: FounderContent;
  contact: ContactInfo;
  labels: ChromeLabels;
  t: Dictionary;
}

const cls = {
  inner: [
    "site-container section-pad",
    "grid grid-cols-1 gap-[48px]",
    "lg:grid-cols-2 lg:items-start lg:gap-[72px]",
  ].join(" "),
  title: [
    "m-0 text-heading font-bold",
    "text-[clamp(32px,26.3661971831px+1.5023474178vw,48px)] leading-[1.05] tracking-[-1px]",
  ].join(" "),
  owner: [
    "mt-[32px] flex flex-col gap-[18px] p-[24px] md:p-[29px]",
    "rounded-[20px] border border-card-line bg-white",
    "[filter:drop-shadow(0_24px_24px_rgba(19,53,90,0.15))]", // drop-shadow($shadow-card)
  ].join(" "),
  avatar: [
    "relative flex size-[60px] flex-none items-center justify-center",
    "rounded-[50px] bg-navy text-gold",
    "text-[22px] leading-[1.05] font-bold tracking-[-0.4px]",
  ].join(" "),
  ownerTitle: [
    "m-0 text-navy font-bold",
    "text-[clamp(20px,18.5915492958px+0.3755868545vw,24px)] leading-[1.05] tracking-[-0.5px]",
  ].join(" "),
  call: "btn-primary [--btn-h:50px] flex-[1_1_140px] text-[15px] leading-[24px]",
  whatsapp: "btn-outline [--btn-h:50px] flex-[1_1_140px] gap-[12px] text-[15px] leading-[24px]",
  moreLink: [
    "border-b border-gold pb-px font-semibold text-navy no-underline",
    "focus-ring hover:text-brown",
  ].join(" "),
};

export default function Faq({ groups, copy, founder, contact, labels, t }: FaqProps) {
  const whatsappHref = contact.whatsappHref ?? "#contact";
  const whatsappIsExternal = whatsappHref.startsWith("http");

  return (
    <section id="faq" className="bg-white" aria-labelledby="faq-title">
      {/* "Join our crew" links land here; FaqTabs then opens the workers tab. */}
      <span id={JOIN_CREW_ANCHOR} aria-hidden="true" />
      <div className={cls.inner}>
        {/* ── Left column ── */}
        <div className="flex flex-col lg:pt-[18px]" data-reveal="left">
          <h2 id="faq-title" className={cls.title}>
            {copy.title}
          </h2>
          {copy.intro && <p className="body-lg mt-[18px] max-w-[374px]">{copy.intro}</p>}

          <aside className={cls.owner} aria-labelledby="owner-title">
            <div className="flex items-center gap-[14px]">
              <span className={cls.avatar} aria-hidden="true">
                {founder.initials}
                <span className="absolute top-[46px] left-[46px] size-[13px] rounded-[50px] bg-online" />
              </span>
              <div className="flex min-w-0 flex-col gap-[2px]">
                <p className="m-0 text-[16px] leading-[25.6px] font-semibold text-navy">{founder.name}</p>
                <p className="m-0 text-[14px] leading-[22.4px] text-slate">{copy.ownerRole}</p>
              </div>
            </div>

            <div className="flex flex-col gap-[6px] border-t border-card-line-soft pt-[17px]">
              <h3 id="owner-title" className={cls.ownerTitle}>
                {copy.ownerTitle}
              </h3>
              {copy.ownerText && <p className="m-0 text-[15px] leading-[24px] text-slate">{copy.ownerText}</p>}
            </div>

            <div className="flex flex-wrap gap-[10px]">
              <a href={contact.phoneHref ?? "#contact"} className={cls.call}>
                <Image src="/homepage/icon-phone-white-18.svg" alt="" width={18} height={18} />
                {labels.callButton}
              </a>
              <a
                href={whatsappHref}
                className={cls.whatsapp}
                {...(whatsappIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <Image src="/homepage/icon-whatsapp-outline.svg" alt="" width={18} height={18} />
                {labels.whatsappButton}
                {whatsappIsExternal && <span className="sr-only"> {t.opensWhatsApp}</span>}
              </a>
            </div>
          </aside>
        </div>

        {/* ── Right column: tabs + accordion ── */}
        <div className="flex min-w-0 flex-col gap-[24px]" data-reveal style={{ "--rd": "150ms" } as React.CSSProperties}>
          <FaqTabs groups={groups} />
          {(copy.moreText || copy.moreLink.label) && (
            <p className="m-0 pl-[4px] text-[15px] leading-[24px] text-slate">
              {copy.moreText}{" "}
              {copy.moreLink.label && (
                <a href={copy.moreLink.href} className={cls.moreLink}>
                  {copy.moreLink.label}
                </a>
              )}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
