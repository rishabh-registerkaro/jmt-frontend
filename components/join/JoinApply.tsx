import { ArrowRight, Clock, MessageCircle, Phone } from "lucide-react";
import { Eyebrow } from "@/components/service/SectionHeader";
import { JOIN_PAGE } from "@/data/joinPage";
import type { ContactInfo } from "@/types/homepage";
import ApplicationForm from "./ApplicationForm";

interface JoinApplyProps {
  id: string;
  content: (typeof JOIN_PAGE)["apply"];
  form: (typeof JOIN_PAGE)["form"];
  contact: ContactInfo;
  opensWhatsApp: string;
}

// Figma "5 · Apply form" — desktop 312:69 (440px panel: heading, Call and
// WhatsApp cards, hours, "no joining fee" strip; the form card on the right),
// mobile 313:257 (heading, the form, then Call / WhatsApp buttons and one line
// with the hours). The phone number and hours come from the admin.
const cls = {
  section: "scroll-mt-[68px] bg-peach-100 lg:scroll-mt-[80px]",
  inner: "site-container flex flex-col gap-[16px] py-[48px] max-md:px-[20px] md:gap-[28px] md:py-[72px] lg:flex-row lg:items-start lg:gap-[32px] lg:py-[96px]",
  panel: "flex flex-col items-start gap-[16px] md:gap-[22px] lg:w-[440px] lg:flex-none lg:max-xl:w-[360px]",
  title: [
    "m-0 font-bold text-heading text-[32px] leading-[36px] tracking-[-0.48px]",
    "md:text-[40px] md:leading-[46px] lg:text-[48px] lg:leading-[52px] lg:tracking-[-0.96px]",
  ].join(" "),
  intro: "m-0 hidden text-[17px] leading-[27px] text-slate lg:block lg:max-w-[420px]",
  card: [
    "group hidden w-full items-center gap-[14px] rounded-[16px] bg-white px-[18px] py-[16px] text-inherit no-underline lg:flex",
    "shadow-[0_16px_40px_0_rgba(99,36,0,0.08)] transition-transform duration-240 ease-site hover:-translate-y-[2px] focus-ring",
  ].join(" "),
  cardBadge: "flex size-[48px] flex-none items-center justify-center rounded-[14px] bg-orange",
  cardLabel: "text-[11px] font-bold tracking-[1.1px] text-slate",
  cardArrow: "flex size-[36px] flex-none items-center justify-center rounded-full bg-peach-100",
  hours: "m-0 hidden items-center gap-[8px] text-[14.5px] leading-[normal] font-semibold text-brown lg:flex",
  noFee: "hidden w-full items-center gap-[12px] rounded-[14px] bg-brown px-[16px] py-[14px] lg:flex",
  // Phones and tablets, under the form.
  talk: "flex gap-[10px] lg:hidden",
  talkBtn: [
    "flex min-w-0 flex-1 items-center justify-center gap-[8px] rounded-[14px] bg-white p-[14px]",
    "text-[14.5px] leading-[normal] font-bold text-ink no-underline focus-ring",
  ].join(" "),
  talkBadge: "flex size-[30px] flex-none items-center justify-center rounded-full bg-orange",
  talkNote: "m-0 text-[13.5px] leading-[21px] text-slate lg:hidden",
};

export default function JoinApply({ id, content, form, contact, opensWhatsApp }: JoinApplyProps) {
  const callHref = contact.phoneHref ?? `#${id}`;
  const whatsappHref = contact.whatsappHref ?? `#${id}`;
  const whatsappExternal = whatsappHref.startsWith("http");
  const external = whatsappExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <section id={id} className={cls.section} aria-labelledby={`${id}-title`}>
      <div className={cls.inner}>
        <div className={cls.panel}>
          <div className="flex flex-col gap-[16px] md:gap-[22px]" data-reveal="clip">
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 id={`${id}-title`} className={cls.title}>
              {content.heading.lead} <span className="text-orange">{content.heading.accent}</span>
            </h2>
          </div>
          <p className={cls.intro}>{content.intro}</p>

          <a href={callHref} className={cls.card}>
            <span className={cls.cardBadge} aria-hidden="true">
              <Phone size={22} className="text-white" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-[2px] leading-[normal]">
              <span className={cls.cardLabel}>{content.callLabel}</span>
              <span className="text-[18px] font-bold whitespace-nowrap text-orange">{contact.phoneDisplay}</span>
            </span>
            <span className={cls.cardArrow} aria-hidden="true">
              <ArrowRight size={16} className="text-brown" aria-hidden="true" />
            </span>
          </a>
          <a href={whatsappHref} className={cls.card} {...external}>
            <span className={cls.cardBadge} aria-hidden="true">
              <MessageCircle size={22} className="text-white" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-[2px] leading-[normal]">
              <span className={cls.cardLabel}>{content.whatsappLabel}</span>
              <span className="text-[18px] font-bold text-ink">{content.whatsappText}</span>
            </span>
            <span className={cls.cardArrow} aria-hidden="true">
              <ArrowRight size={16} className="text-brown" aria-hidden="true" />
            </span>
            {whatsappExternal && <span className="sr-only"> {opensWhatsApp}</span>}
          </a>
          <p className={cls.hours}>
            <Clock size={16} className="flex-none text-brown" aria-hidden="true" />
            {contact.hours}
          </p>
          <p className={`m-0 ${cls.noFee}`}>
            <span
              className="flex size-[36px] flex-none items-center justify-center rounded-full bg-orange text-[13px] leading-[normal] font-bold text-white"
              aria-hidden="true"
            >
              ₹0
            </span>
            <span className="text-[14px] leading-[normal] font-semibold text-white">{content.noFee}</span>
          </p>
        </div>

        <ApplicationForm copy={form} whatsappHref={whatsappHref} opensWhatsApp={opensWhatsApp} />

        <div className={cls.talk}>
          <a href={callHref} className={cls.talkBtn}>
            <span className={cls.talkBadge} aria-hidden="true">
              <Phone size={15} className="text-white" aria-hidden="true" />
            </span>
            {content.callButton}
          </a>
          <a href={whatsappHref} className={cls.talkBtn} {...external}>
            <span className={cls.talkBadge} aria-hidden="true">
              <MessageCircle size={15} className="text-white" aria-hidden="true" />
            </span>
            {content.whatsappButton}
            {whatsappExternal && <span className="sr-only"> {opensWhatsApp}</span>}
          </a>
        </div>
        <p className={cls.talkNote}>
          {content.talkNote} {contact.hours}.
        </p>
      </div>
    </section>
  );
}
