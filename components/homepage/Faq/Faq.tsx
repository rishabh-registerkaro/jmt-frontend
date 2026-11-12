import { MessageCircle, Phone } from "lucide-react";
import type { ChromeLabels, ContactInfo, FaqCopy, FaqGroup, FounderContent } from "@/types/homepage";
import FaqTabs from "./FaqTabs";
import { JOIN_CREW_ANCHOR } from "./anchors";
import { UI_TEXT as t } from "@/lib/uiText";

interface FaqProps {
  groups: FaqGroup[];
  copy: FaqCopy;
  founder: FounderContent;
  contact: ContactInfo;
  labels: ChromeLabels;
}

const cls = {
  // Mobile (<768, Figma "Homepage — Mobile 390"): one 18px-gap column; both
  // columns dissolve (display: contents) so the owner card can move last.
  inner: [
    "site-container section-pad",
    "flex flex-col gap-[18px] md:grid md:grid-cols-1 md:gap-[48px]",
    "lg:grid-cols-2 lg:items-start lg:gap-[72px]",
  ].join(" "),
  eyebrow:
    "m-0 flex items-center gap-[10px] text-[11.5px] leading-[16px] font-semibold tracking-[1.38px] text-slate uppercase md:hidden",
  eyebrowRule: "h-[2px] w-[20px] flex-none bg-[#a9822a]",
  title: [
    "m-0 text-heading font-bold",
    "text-[30px] leading-[34px] tracking-[-0.45px]",
    "md:text-[clamp(32px,26.3661971831px+1.5023474178vw,48px)] md:leading-[1.05] md:tracking-[-1px]",
  ].join(" "),
  owner: [
    "flex flex-col gap-[14px] p-[20px] max-md:order-last md:mt-[32px] md:gap-[18px] md:p-[29px]",
    "rounded-[16px] border border-sand bg-white shadow-[0_12px_30px_rgba(8,26,48,0.08)]",
    "md:rounded-[20px] md:border-card-line md:shadow-none md:[filter:drop-shadow(0_24px_24px_rgba(19,53,90,0.15))]",
  ].join(" "),
  avatar: [
    "relative flex size-[44px] flex-none items-center justify-center",
    "rounded-[50px] bg-navy text-white text-[15px] leading-[20px] font-bold",
    "md:size-[60px] md:text-gold md:text-[22px] md:leading-[1.05] md:tracking-[-0.4px]",
  ].join(" "),
  ownerTitle: [
    "m-0 text-ink font-bold text-[20px] leading-[27px]",
    "md:text-navy md:text-[clamp(20px,18.5915492958px+0.3755868545vw,24px)] md:leading-[1.05] md:tracking-[-0.5px]",
  ].join(" "),
  // Mobile: two equal 49px pills (Figma "Buttons").
  call: [
    "btn-primary [--btn-h:50px] flex-[1_1_140px] text-[15px] leading-[24px]",
    "max-md:flex-1 max-md:gap-2 max-md:px-5 max-md:text-[15.5px] max-md:leading-[21px] max-md:[--btn-h:49px]",
  ].join(" "),
  whatsapp: [
    "btn-outline [--btn-h:50px] flex-[1_1_140px] gap-[12px] text-[15px] leading-[24px]",
    "max-md:flex-1 max-md:gap-2 max-md:border-[1.2px] max-md:px-5 max-md:text-[15.5px] max-md:leading-[21px] max-md:[--btn-h:49px]",
  ].join(" "),
  moreLink: [
    "font-semibold text-ink underline [text-underline-position:from-font] md:border-b md:border-gold md:pb-px md:text-navy md:no-underline",
    "focus-ring hover:text-brown",
  ].join(" "),
};

export default function Faq({ groups, copy, founder, contact, labels }: FaqProps) {
  const whatsappHref = contact.whatsappHref ?? "#contact";
  const whatsappIsExternal = whatsappHref.startsWith("http");

  return (
    <section id="faq" className="bg-white" aria-labelledby="faq-title">
      {/* "Join our crew" links land here; FaqTabs then opens the workers tab. */}
      <span id={JOIN_CREW_ANCHOR} aria-hidden="true" />
      <div className={cls.inner}>
        {/* ── Left column ── */}
        <div className="flex flex-col max-md:contents lg:pt-[18px]" data-reveal="left">
          <p className={cls.eyebrow}>
            <span className={cls.eyebrowRule} aria-hidden="true" />
            {t.faq.eyebrow}
          </p>
          <h2 id="faq-title" className={cls.title}>
            {copy.title}
          </h2>
          {copy.intro && <p className="body-lg max-w-[374px] md:mt-[18px]">{copy.intro}</p>}

          <aside className={cls.owner} aria-labelledby="owner-title">
            <div className="flex items-center gap-[14px]">
              <span className={cls.avatar} aria-hidden="true">
                {founder.initials}
                <span className="absolute top-[46px] left-[46px] hidden size-[13px] rounded-[50px] bg-online md:block" />
              </span>
              <div className="flex min-w-0 flex-col gap-[2px]">
                <p className="m-0 text-[15px] leading-[20px] font-semibold text-ink md:text-[16px] md:leading-[25.6px] md:text-navy">
                  {founder.name}
                </p>
                <p className="m-0 text-[13px] leading-[18px] text-slate md:text-[14px] md:leading-[22.4px]">
                  {copy.ownerRole}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-[14px] md:gap-[6px] md:border-t md:border-card-line-soft md:pt-[17px]">
              <h3 id="owner-title" className={cls.ownerTitle}>
                {copy.ownerTitle}
              </h3>
              {copy.ownerText && (
                <p className="m-0 text-[14px] leading-[22px] text-slate md:text-[15px] md:leading-[24px]">{copy.ownerText}</p>
              )}
            </div>

            <div className="flex gap-[10px] md:flex-wrap">
              <a href={contact.phoneHref ?? "#contact"} className={cls.call}>
                <Phone size={18} strokeWidth={1.75} className="text-white" aria-hidden="true" />
                {labels.callButton}
              </a>
              <a
                href={whatsappHref}
                className={cls.whatsapp}
                {...(whatsappIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <MessageCircle size={18} className="text-brown md:[stroke-width:1.75]" aria-hidden="true" />
                {labels.whatsappButton}
                {whatsappIsExternal && <span className="sr-only"> {t.opensWhatsApp}</span>}
              </a>
            </div>
          </aside>
        </div>

        {/* ── Right column: tabs + accordion ── */}
        <div
          className="flex min-w-0 flex-col gap-[24px] max-md:contents"
          data-reveal
          style={{ "--rd": "150ms" } as React.CSSProperties}
        >
          <FaqTabs groups={groups} />
          {(copy.moreText || copy.moreLink.label) && (
            <p className="m-0 text-[14px] leading-[19px] text-slate md:pl-[4px] md:text-[15px] md:leading-[24px]">
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
