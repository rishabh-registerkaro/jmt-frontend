import Image from "next/image";
import Link from "next/link";
import Photo from "@/components/common/Photo";
import type { ContactInfo } from "@/types/homepage";
import type { ServiceFactIcon, ServiceHeroContent } from "@/types/service";
import type { Dictionary } from "@/lib/i18n";

interface ServiceHeroProps {
  content: ServiceHeroContent;
  contact: ContactInfo;
  homeHref: string;
  t: Dictionary;
}

// 20px icons in 44px badges (md+), 16px in 34px badges on phones.
const FACT_ICONS: Record<ServiceFactIcon, { lg: string; sm: string }> = {
  users: { lg: "/service/icon-users.svg", sm: "/service/m/users-16.svg" },
  clock: { lg: "/service/icon-clock.svg", sm: "/service/m/clock-16.svg" },
  moon: { lg: "/service/icon-moon.svg", sm: "/service/m/moon-16.svg" },
  refresh: { lg: "/service/icon-refresh.svg", sm: "/service/m/refresh-16.svg" },
};

// Figma "Hero (full-bleed photo)" 237:60 — 1440×780.
// xl+: the photo fills the section; a peach wash fades it out behind the copy
// and a frosted fact bar sits along the bottom. Below xl the photo moves under
// the copy as its own block (as on the homepage hero) so the brown text never
// sits on a busy image, and the facts become a 2×2 grid.
// Phones (Figma 242:44): full-width stacked CTAs, a 210px rounded photo, and
// the facts as four small white cards.
const cls = {
  hero: "relative isolate flex flex-col overflow-hidden bg-[linear-gradient(180deg,#f4decd,#f7dcc5)] md:bg-none md:bg-hero-wash-1 xl:min-h-[780px]",
  inner: "site-container relative z-2 flex flex-col pt-[20px] pb-[32px] max-md:px-[20px] md:pt-[32px] xl:pt-[56px] xl:pb-[38px]",
  crumbs: "m-0 flex flex-wrap items-center gap-[8px] p-0 text-[13px] md:gap-[10px] md:text-[14px] leading-[normal] font-medium text-slate list-none",
  crumbLink: "rounded-[4px] text-inherit no-underline focus-ring hover:text-brown hover:underline",
  crumbCurrent: "font-semibold text-brown",
  copy: "mt-[18px] flex max-w-[660px] flex-col items-start gap-[18px] md:mt-[40px] md:gap-[24px] xl:mt-[72px]",
  tag: [
    "m-0 inline-flex items-center gap-[8px] rounded-full bg-[rgba(242,105,33,0.12)] py-[6px] pr-[12px] pl-[10px] md:py-[7px] md:pr-[14px]",
    "text-[11.5px] leading-[normal] font-semibold tracking-[1.15px] text-brown uppercase md:text-[12.5px] md:tracking-[1.25px]",
  ].join(" "),
  tagDot: "size-[7px] flex-none rounded-full bg-orange md:size-[8px]",
  title: [
    "m-0 max-w-[600px] font-bold text-brown",
    "text-[clamp(40px,31.549px+2.2535vw,64px)] leading-[1.1] tracking-[-0.8px] md:leading-[1.0625] md:tracking-[-1.92px]",
  ].join(" "),
  subtitle: "m-0 max-w-[560px] text-[15.5px] leading-[25px] text-[#5c280c] md:text-[clamp(16px,14.9436619718px+0.2816901408vw,19px)] md:leading-[1.58]",
  ctas: "flex w-full flex-col gap-[10px] md:w-auto md:flex-row md:flex-wrap md:items-center md:gap-[12px]",
  primary: "btn-primary max-md:[--btn-h:50px] max-md:text-[15.5px] px-[26px]",
  whatsapp: "btn-outline max-md:[--btn-h:50px] max-md:text-[15.5px] gap-[8px] border-[1.2px] pr-[24px] pl-[22px]",

  // Phones: four separate white cards in a 2×2 grid (Figma "Fact grid").
  // md–xl: one frosted bar, 2×2 on tablets, a single row on xl.
  facts: [
    "mt-[18px] grid grid-cols-2 gap-[10px] md:mt-[32px] md:gap-0 md:rounded-[20px] md:border md:border-sand md:bg-white/94 md:px-[8px] md:shadow-panel",
    "xl:mt-[54px] xl:grid-cols-4",
  ].join(" "),
  fact: [
    "flex min-w-0 items-center gap-[10px] rounded-[14px] bg-white p-[12px]",
    "md:gap-[14px] md:rounded-none md:bg-transparent md:px-[24px] md:py-[20px]",
    "border-sand md:max-xl:nth-[-n+2]:border-b md:max-xl:odd:border-r xl:not-last:border-r",
  ].join(" "),
  factBadge: "flex size-[34px] flex-none items-center justify-center rounded-full bg-orange md:size-[44px]",
  factLabel: "m-0 text-[10px] leading-[normal] font-bold tracking-[0.8px] text-brown uppercase md:text-[11.5px] md:tracking-[1.15px]",
  factValue: "m-0 max-w-[100px] text-[13.5px] leading-[normal] font-semibold text-ink md:max-w-none md:text-[17px]",

  // Below xl the photo sits inside the copy column, between the CTAs and the facts.
  inlineMedia: "relative mt-[18px] h-[210px] overflow-hidden rounded-[18px] bg-navy-card md:mt-[32px] md:h-[380px] md:rounded-[20px] xl:hidden",
  media: "absolute inset-0 z-0 hidden overflow-hidden xl:block",
  wash: [
    "pointer-events-none absolute inset-0 z-1 hidden xl:block",
    "bg-[linear-gradient(90deg,#f4decd_0%,rgba(247,220,197,0.95)_38%,rgba(247,220,197,0.35)_62%,rgba(247,220,197,0)_80%)]",
  ].join(" "),
  shade: [
    "pointer-events-none absolute inset-x-0 bottom-0 z-1 hidden h-[300px] xl:block",
    "bg-[linear-gradient(180deg,rgba(247,220,197,0)_0%,rgba(247,220,197,0.6)_100%)]",
  ].join(" "),
  mandala: [
    "pointer-events-none absolute top-[12px] left-[-60px] z-1 hidden h-auto w-[300px] mix-blend-plus-lighter md:block",
    "xl:top-[150px] xl:left-[-120px] xl:w-[548px]",
  ].join(" "),
};

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function ServiceHero({ content, contact, homeHref, t }: ServiceHeroProps) {
  const whatsappHref = contact.whatsappHref ?? "#contact";
  const whatsappIsExternal = whatsappHref.startsWith("http");

  return (
    <section id="top" className={cls.hero} aria-labelledby="service-hero-title">
      <div className={cls.inner}>
        <nav aria-label="Breadcrumb" className="reveal" style={delay(150)}>
          <ol className={cls.crumbs}>
            <li>
              <Link href={homeHref} className={cls.crumbLink}>
                {content.breadcrumb.home}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`${homeHref}#services`} className={cls.crumbLink}>
                {content.breadcrumb.services}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className={cls.crumbCurrent} aria-current="page">
              {content.breadcrumb.current}
            </li>
          </ol>
        </nav>

        <div className={cls.copy}>
          <p className={`${cls.tag} reveal`} style={delay(250)}>
            <span className={cls.tagDot} aria-hidden="true" />
            {content.tag}
          </p>
          <h1 id="service-hero-title" className={`${cls.title} reveal-clip`} style={delay(360)}>
            {content.title.lead} <span className="text-orange">{content.title.accent}</span> {content.title.tail}
          </h1>
          <p className={`${cls.subtitle} reveal`} style={delay(520)}>
            {content.subtitle}
          </p>
          <div className={`${cls.ctas} reveal`} style={delay(620)}>
            <a href="#contact" className={cls.primary}>
              {content.primaryCta}
              <Image src="/service/icon-arrow-white.svg" alt="" width={18} height={18} />
            </a>
            <a
              href={whatsappHref}
              className={cls.whatsapp}
              {...(whatsappIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <Image src="/service/icon-msg.svg" alt="" width={18} height={18} />
              {content.whatsappCta}
              {whatsappIsExternal && <span className="sr-only"> {t.opensWhatsApp}</span>}
            </a>
          </div>
        </div>

        <div className={`${cls.inlineMedia} reveal`} style={delay(700)}>
          <Photo image={content.image} sizes="(min-width: 768px) 100vw, calc(100vw - 40px)" priority />
        </div>

        <ul className={`${cls.facts} reveal`} style={delay(760)}>
          {content.facts.map((fact) => (
            <li key={fact.label} className={cls.fact}>
              <span className={cls.factBadge} aria-hidden="true">
                <Image src={FACT_ICONS[fact.icon].sm} alt="" width={16} height={16} className="md:hidden" />
                <Image src={FACT_ICONS[fact.icon].lg} alt="" width={20} height={20} className="hidden md:block" />
              </span>
              <span className="flex min-w-0 flex-col gap-[2px]">
                <span className={cls.factLabel}>{fact.label}</span>
                <span className={cls.factValue}>{fact.value}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${cls.media} reveal-zoom`} style={delay(100)}>
        <Photo image={content.image} sizes="100vw" />
      </div>
      <div className={cls.wash} aria-hidden="true" />
      <div className={cls.shade} aria-hidden="true" />
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
