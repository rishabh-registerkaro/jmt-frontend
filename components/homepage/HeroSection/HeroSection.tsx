import Image from "next/image";
import { ArrowRight, Headphones, MessageCircle, ShieldCheck, Zap, type LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";
import { MdOutlineSupportAgent, MdOutlineVerifiedUser } from "react-icons/md";
import { SiWhatsapp } from "react-icons/si";
import { TbBolt } from "react-icons/tb";
import type { ContactInfo, HeroContent, HeroTrustIcon } from "@/types/homepage";
import Photo from "@/components/common/Photo";
import { UI_TEXT as t } from "@/lib/uiText";

interface HeroSectionProps {
  content: HeroContent;
  contact: ContactInfo;
}

// `mobile`: the 16px Lucide outline icons from Figma "Homepage — Mobile 390".
// `desktop`: Figma's desktop trust icons (Material verified-user and support-agent;
// Tabler bolt for the lightning icon).
const TRUST_ICONS: Record<HeroTrustIcon, { desktop: IconType; size: number; mobile: LucideIcon }> = {
  verified: { desktop: MdOutlineVerifiedUser, size: 24, mobile: ShieldCheck },
  fast: { desktop: TbBolt, size: 24, mobile: Zap },
  support: { desktop: MdOutlineSupportAgent, size: 26, mobile: Headphones },
};

// Desktop: photo fills the section, two blurred peach washes fade it out
// behind the copy (Figma rects 9 & 10). Below 1280px the photo moves under
// the copy as its own block so text never sits on a busy image. (The wash only
// clears the 659px copy column from ~1280px; at 1024 the copy ran onto the photo.)
const cls = {
  // Mobile (<768, Figma "Homepage — Mobile 390"): peach gradient, 32px block
  // padding, 20px rhythm, photo as a rounded card inside the gutters.
  hero: "relative isolate flex flex-col overflow-hidden bg-linear-to-b from-hero-wash-1 to-hero-wash-2 pb-8 md:bg-none md:bg-hero-wash-2 md:pb-0 xl:min-h-[643px] xl:justify-center xl:bg-navy",
  inner: "site-container relative z-2 pt-8 pb-5 md:pt-[40px] md:pb-[32px] xl:py-[60px]",
  content:
    "flex max-w-[659px] flex-col gap-5 md:gap-[28px] xl:min-h-[523px] xl:justify-between xl:gap-[40px]",
  intro: "flex flex-col gap-5 md:gap-[18px]",
  eyebrow:
    "m-0 flex items-center gap-2 text-[12px] leading-[16px] font-semibold tracking-[1.2px] text-brown uppercase md:gap-[10px] md:text-[13px] md:leading-[20.8px] md:tracking-[2.1px]",
  dot: "size-[6px] flex-none rounded-[50px] bg-brown md:size-[7px]",
  title:
    "m-0 text-[42px] leading-[46px] font-bold tracking-[-0.84px] text-brown md:text-[clamp(40px,28.7323943662px+3.0046948357vw,72px)] md:leading-[1.05] md:font-semibold md:tracking-[-1.4px]",
  accent: "font-bold text-orange md:font-extrabold",
  subtitle:
    "m-0 max-w-[629px] text-[16px] leading-[25px] font-normal tracking-[0] text-[#5c280c] md:text-[clamp(16px,14.9436619718px+0.2816901408vw,19px)] md:leading-[1.6] md:text-brown-soft",
  ctas: "flex flex-col items-stretch gap-[10px] md:flex-row md:flex-wrap md:items-center md:gap-x-[20px] md:gap-y-[12px]",
  // Mobile: full-width 49px buttons, 15.5px label, 1.2px outline.
  button:
    "max-md:w-full max-md:[--btn-h:49px] max-md:py-[14px] max-md:text-[15.5px] max-md:leading-[21px]",
  whatsapp: [
    "inline-flex min-h-[20px] items-center justify-center gap-[8px] rounded-[6px] md:min-h-[44px] md:justify-start",
    "text-[15px] leading-[20px] font-semibold text-brown no-underline md:leading-[24px] md:font-medium",
    "focus-ring hover:underline hover:underline-offset-[3px]",
  ].join(" "),
  trust: "flex flex-wrap items-center gap-x-[14px] gap-y-[10px] md:max-w-[557px] md:justify-between md:gap-x-[24px] md:gap-y-[4px]",
  trustItem:
    "flex min-h-[18px] items-center gap-[6px] text-[13.5px] leading-[18px] font-medium text-brown md:min-h-[44px] md:gap-[8px] md:text-[15px] md:leading-[24px]",

  // ── Background layers ──
  media: "relative z-0 mx-5 h-[240px] overflow-hidden rounded-[18px] md:mx-0 md:h-[380px] md:rounded-none xl:absolute xl:inset-0 xl:h-auto",
  // Figma builds this fade from two blurred, rotated rectangles (Rectangles 9
  // and 10). Their CSS export doesn't render like Figma does, so this single
  // gradient is fitted to the rendered frame instead: solid peach to x≈650px,
  // fading out by x≈830px, with the edge leaning right toward the bottom.
  wash: [
    "pointer-events-none absolute inset-0 z-1 hidden xl:block",
    "bg-[linear-gradient(85deg,#f7dcc5_0%,#f7dcc5_44%,rgba(247,220,197,0.92)_48%,rgba(247,220,197,0.55)_53%,rgba(247,220,197,0.18)_57%,rgba(247,220,197,0)_61%)]",
  ].join(" "),
  mandala: [
    "pointer-events-none absolute top-[12px] left-[-40px] z-1 hidden h-auto w-[300px] mix-blend-plus-lighter md:block",
    "xl:top-[8.34%] xl:left-[0.97%] xl:h-[83.32%] xl:w-[38.03%]",
  ].join(" "),
};

// Staggered entrance on page load (.reveal* in styles/public.css).
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function HeroSection({ content, contact }: HeroSectionProps) {
  const whatsappHref = contact.whatsappHref ?? "#contact";
  const whatsappIsExternal = whatsappHref.startsWith("http");

  return (
    <section className={cls.hero} aria-labelledby="hero-title">
      <div className={cls.inner}>
        <div className={cls.content}>
          <div className={cls.intro}>
            <p className={`${cls.eyebrow} reveal`} style={delay(250)}>
              <span className={cls.dot} aria-hidden="true" />
              {content.eyebrow}
            </p>
            <h1 id="hero-title" className={`${cls.title} reveal-clip`}>
              {content.titleLead}{" "}
              <span className={cls.accent}>{content.titleAccent}</span>{" "}
              {content.titleTail}
            </h1>
            <p className={`${cls.subtitle} reveal`} style={delay(520)}>{content.subtitle}</p>
          </div>

          <div className={`${cls.ctas} reveal`} style={delay(620)}>
            <a href={content.primaryHref} className={`btn-primary ${cls.button}`}>
              {content.primaryCta}
              <ArrowRight size={18} className="text-white" aria-hidden="true" />
            </a>
            <a href={content.secondaryHref} className={`btn-outline ${cls.button} max-md:border-[1.2px]`}>
              {content.secondaryCta}
            </a>
            <a
              href={whatsappHref}
              className={cls.whatsapp}
              {...(whatsappIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <MessageCircle size={18} className="text-brown md:hidden" aria-hidden="true" />
              <SiWhatsapp size={22} className="hidden flex-none text-brown md:block" aria-hidden="true" />
              {content.whatsappCta}
              {whatsappIsExternal && <span className="sr-only"> {t.opensWhatsApp}</span>}
            </a>
          </div>

          <ul className={cls.trust}>
            {content.trustPoints.map((point, i) => {
              const icon = TRUST_ICONS[point.icon];
              return (
                <li key={point.label} className={`${cls.trustItem} reveal`} style={delay(720 + i * 90)}>
                  <icon.mobile size={16} className="text-brown md:hidden" aria-hidden="true" />
                  <icon.desktop size={icon.size} className="hidden flex-none text-brown md:block" aria-hidden="true" />
                  {point.label}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className={`${cls.media} reveal-zoom`} style={delay(100)}>
        <Photo image={content.image} sizes="100vw" priority />
      </div>
      <div className={cls.wash} aria-hidden="true" />
      <Image
        src="/homepage/hero-mandala.svg"
        alt=""
        width={548}
        height={536}
        className={cls.mandala}
        aria-hidden="true"
      />
    </section>
  );
}
