import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import type { ContactInfo } from "@/types/homepage";
import { UI_TEXT as t } from "@/lib/uiText";

interface MobileBarProps {
  contact: ContactInfo;
  /** Main CTA (same label and target as the hero's primary button). */
  ctaLabel: string;
  ctaHref: string;
}

// Figma "Homepage — Mobile 390" → "Sticky bottom bar (fixed)". Phones only;
// the footer reserves its height (Footer.tsx) so nothing ends up hidden behind it.
const cls = {
  bar: [
    "fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 md:hidden",
    "border-t border-sand bg-white px-3 pt-[7px] pb-[max(18px,env(safe-area-inset-bottom))]",
    "shadow-[0_-6px_20px_rgba(0,0,0,0.08)]",
  ].join(" "),
  action: [
    "flex flex-none flex-col items-center gap-[2px] rounded-[10px] px-[10px] py-[6px]",
    "text-[11.5px] leading-[16px] font-semibold whitespace-nowrap text-brown no-underline",
    "focus-ring [--focus-offset:0px]",
  ].join(" "),
  cta: "btn-primary min-w-0 flex-1 gap-2 px-5 py-[14px] text-[15.5px] leading-[21px] [--btn-h:49px]",
};

export default function MobileBar({ contact, ctaLabel, ctaHref }: MobileBarProps) {
  const whatsappHref = contact.whatsappHref ?? "#contact";
  const whatsappIsExternal = whatsappHref.startsWith("http");

  return (
    <nav className={cls.bar} aria-label={t.bar.label}>
      <a href={contact.phoneHref ?? "#contact"} className={cls.action}>
        <Phone size={19} className="text-brown" aria-hidden="true" />
        {t.bar.call}
      </a>
      <a
        href={whatsappHref}
        className={cls.action}
        {...(whatsappIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <MessageCircle size={19} className="text-brown" aria-hidden="true" />
        {t.bar.whatsapp}
        {whatsappIsExternal && <span className="sr-only"> {t.opensWhatsApp}</span>}
      </a>
      <a href={ctaHref} className={cls.cta}>
        <span className="truncate">{ctaLabel}</span>
        <ArrowRight size={18} className="text-white" aria-hidden="true" />
      </a>
    </nav>
  );
}
