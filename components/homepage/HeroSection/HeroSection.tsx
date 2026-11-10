import Image from "next/image";
import type { ContactInfo, HeroContent, HeroTrustIcon } from "@/types/homepage";
import Photo from "@/components/common/Photo";

interface HeroSectionProps {
  content: HeroContent;
  contact: ContactInfo;
}

const TRUST_ICONS: Record<HeroTrustIcon, { src: string; size: number }> = {
  verified: { src: "/homepage/icon-verified-user.svg", size: 24 },
  fast: { src: "/homepage/icon-lightning-fast.svg", size: 24 },
  support: { src: "/homepage/icon-person-support.svg", size: 28 },
};

// Desktop: photo fills the section, two blurred peach washes fade it out
// behind the copy (Figma rects 9 & 10). Below 1280px the photo moves under
// the copy as its own block so text never sits on a busy image. (The wash only
// clears the 659px copy column from ~1280px; at 1024 the copy ran onto the photo.)
const cls = {
  hero: "relative isolate flex flex-col overflow-hidden bg-hero-wash-2 xl:min-h-[643px] xl:justify-center xl:bg-navy",
  inner: "site-container relative z-2 pt-[40px] pb-[32px] xl:py-[60px]",
  content:
    "flex max-w-[659px] flex-col gap-[28px] xl:min-h-[523px] xl:justify-between xl:gap-[40px]",
  intro: "flex flex-col gap-[18px]",
  eyebrow:
    "m-0 flex items-center gap-[10px] text-[13px] leading-[20.8px] font-semibold tracking-[2.1px] text-brown uppercase",
  dot: "size-[7px] flex-none rounded-[50px] bg-brown",
  title:
    "m-0 text-[clamp(40px,28.7323943662px+3.0046948357vw,72px)] leading-[1.05] font-semibold tracking-[-1.4px] text-brown",
  accent: "font-extrabold text-orange",
  subtitle:
    "m-0 max-w-[629px] text-[clamp(16px,14.9436619718px+0.2816901408vw,19px)] leading-[1.6] font-normal tracking-[0] text-brown-soft",
  ctas: "flex flex-wrap items-center gap-x-[20px] gap-y-[12px]",
  whatsapp: [
    "inline-flex min-h-[44px] items-center gap-[8px] rounded-[6px]",
    "text-[15px] leading-[24px] font-medium text-brown no-underline",
    "focus-ring hover:underline hover:underline-offset-[3px]",
  ].join(" "),
  trust: "flex flex-wrap items-center gap-x-[24px] gap-y-[4px] md:max-w-[557px] md:justify-between",
  trustItem: "flex min-h-[44px] items-center gap-[8px] text-[15px] leading-[24px] font-medium text-brown",

  // ── Background layers ──
  media: "relative z-0 h-[280px] overflow-hidden md:h-[380px] xl:absolute xl:inset-0 xl:h-auto",
  // Figma builds this fade from two blurred, rotated rectangles (Rectangles 9
  // and 10). Their CSS export doesn't render like Figma does, so this single
  // gradient is fitted to the rendered frame instead: solid peach to x≈650px,
  // fading out by x≈830px, with the edge leaning right toward the bottom.
  wash: [
    "pointer-events-none absolute inset-0 z-1 hidden xl:block",
    "bg-[linear-gradient(85deg,#f7dcc5_0%,#f7dcc5_44%,rgba(247,220,197,0.92)_48%,rgba(247,220,197,0.55)_53%,rgba(247,220,197,0.18)_57%,rgba(247,220,197,0)_61%)]",
  ].join(" "),
  mandala: [
    "pointer-events-none absolute top-[12px] left-[-40px] z-1 h-auto w-[300px] mix-blend-plus-lighter",
    "xl:top-[8.34%] xl:left-[0.97%] xl:h-[83.32%] xl:w-[38.03%]",
  ].join(" "),
};

export default function HeroSection({ content, contact }: HeroSectionProps) {
  const whatsappHref = contact.whatsappHref ?? "#contact";
  const whatsappIsExternal = whatsappHref.startsWith("http");

  return (
    <section className={cls.hero} aria-labelledby="hero-title">
      <div className={cls.inner}>
        <div className={cls.content}>
          <div className={cls.intro}>
            <p className={cls.eyebrow}>
              <span className={cls.dot} aria-hidden="true" />
              {content.eyebrow}
            </p>
            <h1 id="hero-title" className={cls.title}>
              {content.titleLead}{" "}
              <span className={cls.accent}>{content.titleAccent}</span>{" "}
              {content.titleTail}
            </h1>
            <p className={cls.subtitle}>{content.subtitle}</p>
          </div>

          <div className={cls.ctas}>
            <a href={content.primaryHref} className="btn-primary">
              {content.primaryCta}
              <Image src="/homepage/icon-arrow-right-white.svg" alt="" width={18} height={18} />
            </a>
            <a href={content.secondaryHref} className="btn-outline">
              {content.secondaryCta}
            </a>
            <a
              href={whatsappHref}
              className={cls.whatsapp}
              {...(whatsappIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <Image src="/homepage/icon-whatsapp-fill.svg" alt="" width={24} height={24} />
              {content.whatsappCta}
              {whatsappIsExternal && <span className="sr-only"> (opens WhatsApp)</span>}
            </a>
          </div>

          <ul className={cls.trust}>
            {content.trustPoints.map((point) => {
              const icon = TRUST_ICONS[point.icon];
              return (
                <li key={point.label} className={cls.trustItem}>
                  <Image src={icon.src} alt="" width={icon.size} height={icon.size} />
                  {point.label}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className={cls.media}>
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
