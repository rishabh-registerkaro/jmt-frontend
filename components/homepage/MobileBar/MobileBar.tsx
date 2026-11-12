import Image from "next/image";
import type { ContactInfo } from "@/types/homepage";
import type { Dictionary } from "@/lib/i18n";

interface MobileBarProps {
  contact: ContactInfo;
  /** Main CTA (same label and target as the hero's primary button). */
  ctaLabel: string;
  ctaHref: string;
  t: Dictionary;
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

export default function MobileBar({ contact, ctaLabel, ctaHref, t }: MobileBarProps) {
  const whatsappHref = contact.whatsappHref ?? "#contact";
  const whatsappIsExternal = whatsappHref.startsWith("http");

  return (
    <nav className={cls.bar} aria-label={t.bar.label}>
      <a href={contact.phoneHref ?? "#contact"} className={cls.action}>
        <Image src="/homepage/m/phone-brown.svg" alt="" width={19} height={19} />
        {t.bar.call}
      </a>
      <a
        href={whatsappHref}
        className={cls.action}
        {...(whatsappIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        <Image src="/homepage/m/msg-bar.svg" alt="" width={19} height={19} />
        {t.bar.whatsapp}
        {whatsappIsExternal && <span className="sr-only"> {t.opensWhatsApp}</span>}
      </a>
      <a href={ctaHref} className={cls.cta}>
        <span className="truncate">{ctaLabel}</span>
        <Image src="/homepage/icon-arrow-right-white.svg" alt="" width={18} height={18} />
      </a>
    </nav>
  );
}
