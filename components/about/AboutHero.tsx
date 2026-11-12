import Image from "next/image";
import type { AboutHeroContent, AboutServiceIcon } from "@/types/about";
import { BTN_OUTLINE, BTN_PRIMARY, DualIcon, Pill, Responsive } from "./shared";

interface AboutHeroProps {
  content: AboutHeroContent;
  /** "Meet the founder" target (the team section on this page). */
  founderHref: string;
  /** "Our services" target (the homepage services section). */
  servicesHref: string;
}

const SERVICE_ICONS: Record<AboutServiceIcon, { sm: readonly [string, number]; lg: readonly [string, number] }> = {
  users: { sm: ["/about/m/users-16.svg", 16], lg: ["/about/icon-users-19.svg", 19] },
  shield: { sm: ["/homepage/m/step-shield.svg", 16], lg: ["/about/icon-shield-19.svg", 19] },
  hat: { sm: ["/about/m/hat-16.svg", 16], lg: ["/about/icon-hat-19.svg", 19] },
  factory: { sm: ["/about/m/factory-16.svg", 16], lg: ["/about/icon-factory-19.svg", 19] },
};

// Figma "Hero" — desktop 289:50 (1440×1029), mobile 296:44 (390×1100).
// Centered intro over a white → peach → white wash, then the orange mission
// card: mission copy + "What we do today" list side by side from xl, stacked
// below (as in the mobile frame).
const cls = {
  hero: [
    "bg-[linear-gradient(180deg,#fff_0%,#fef1e7_50%,#fff_100%)]",
    "md:bg-[linear-gradient(180deg,#fff_0%,#fef1e7_55%,#fff_100%)]",
  ].join(" "),
  inner: "site-container flex flex-col items-center gap-[22px] pt-[36px] pb-[40px] max-md:px-[20px] md:pt-[72px] md:pb-[64px] lg:gap-[40px]",
  intro: "flex w-full flex-col items-center gap-[22px]",
  title: [
    "m-0 max-w-[350px] text-center font-bold text-heading",
    "text-[38px] leading-[43px] tracking-[-0.57px]",
    "md:max-w-[900px] md:text-[52px] md:leading-[58px] md:tracking-[-1.04px] lg:text-[64px] lg:leading-[70px] lg:tracking-[-1.28px]",
  ].join(" "),
  subtitle: "m-0 max-w-[350px] text-center text-[15.5px] leading-[25px] text-slate md:max-w-[720px] md:text-[18px] md:leading-[29px]",
  ctas: "flex w-full flex-col gap-[10px] md:w-auto md:flex-row md:gap-[12px]",

  card: [
    "relative isolate flex w-full flex-col gap-[18px] overflow-hidden rounded-[24px] px-[20px] pt-[28px] pb-[20px]",
    "bg-[linear-gradient(121.69deg,#f7931e_0%,#f26921_32.143%,#642301_71.429%)]",
    "md:rounded-[28px] md:p-[40px] md:shadow-[0_24px_60px_0_rgba(99,36,0,0.18)]",
    "xl:flex-row xl:items-center xl:gap-[40px] xl:py-[48px] xl:pr-[48px] xl:pl-[56px]",
    "xl:bg-[linear-gradient(140.32deg,#f7931e_0%,#f26921_34.615%,#642301_76.923%)]",
  ].join(" "),
  mandalaSm: "pointer-events-none absolute top-[-60px] left-[120px] z-0 max-w-none mix-blend-plus-lighter xl:hidden",
  mandalaLg: "pointer-events-none absolute top-[120px] left-[-120px] z-0 hidden max-w-none mix-blend-plus-lighter xl:block",
  mission: "relative flex flex-col items-start gap-[18px] xl:w-[520px] xl:flex-none xl:gap-[20px]",
  missionTitle: [
    "m-0 font-bold text-white text-[30px] leading-[34px] tracking-[-0.45px]",
    "md:text-[38px] md:leading-[44px] md:tracking-[-0.76px] xl:max-w-[500px] xl:text-[44px] xl:leading-[50px] xl:tracking-[-0.88px]",
  ].join(" "),
  missionText: "m-0 text-[14.5px] leading-[23px] text-white/90 md:text-[17px] md:leading-[28px] xl:max-w-[480px]",
  dots: "hidden gap-[6px] xl:flex",

  list: "relative flex w-full min-w-0 flex-col rounded-[18px] bg-white px-[16px] pt-[18px] pb-[6px] md:rounded-[20px] md:px-[24px] md:pt-[24px] md:pb-[12px] xl:flex-1",
  head: "flex items-center justify-between gap-[12px] pb-[10px] md:pb-[12px]",
  headTitle: "m-0 text-[16px] leading-[normal] font-bold text-ink md:text-[18px]",
  headBadge: "rounded-full bg-orange px-[8px] py-[3px] text-[11px] leading-[normal] font-bold whitespace-nowrap text-white md:px-[10px] md:py-[4px] md:text-[12px]",
  row: "flex items-center gap-[12px] border-t border-sand py-[12px] md:gap-[14px] md:py-[14px]",
  badge: "flex size-[34px] flex-none items-center justify-center rounded-[10px] md:size-[40px] md:rounded-[12px]",
  rowText: "flex min-w-0 flex-1 flex-col gap-[2px]",
  rowTitle: "m-0 text-[14px] leading-[normal] font-semibold text-ink md:text-[15.5px]",
  rowDesc: "m-0 hidden text-[13.5px] leading-[19px] text-slate md:block",
  status: "flex-none rounded-full px-[8px] py-[3px] text-[10.5px] leading-[normal] font-bold whitespace-nowrap md:px-[10px] md:py-[4px] md:text-[11.5px]",
};

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export default function AboutHero({ content, founderHref, servicesHref }: AboutHeroProps) {
  const { mission } = content;
  return (
    <section id="top" className={cls.hero} aria-labelledby="about-title">
      <div className={cls.inner}>
        <div className={cls.intro}>
          <div className="reveal" style={delay(150)}>
            <Pill tone="white">
              <Responsive copy={content.pill} />
            </Pill>
          </div>
          <h1 id="about-title" className={`${cls.title} reveal-clip`}>
            {content.heading.lead} <span className="text-orange">{content.heading.accent}</span>
            {content.heading.tail}
          </h1>
          <p className={`${cls.subtitle} reveal`} style={delay(420)}>
            {content.subtitle}
          </p>
          <div className={`${cls.ctas} reveal`} style={delay(520)}>
            <a href={founderHref} className={BTN_PRIMARY}>
              {content.primaryCta}
              <DualIcon sm={["/about/m/arrow-white-17.svg", 17]} lg={["/service/icon-arrow-white.svg", 18]} />
            </a>
            <a href={servicesHref} className={BTN_OUTLINE}>
              {content.secondaryCta}
            </a>
          </div>
        </div>

        <div className={`${cls.card} reveal`} style={delay(640)}>
          <Image src="/about/m/mission-mandala.svg" alt="" width={383.348} height={375.018} className={cls.mandalaSm} aria-hidden="true" />
          <Image src="/about/mandala-card.svg" alt="" width={547.64} height={535.74} className={cls.mandalaLg} aria-hidden="true" />

          <div className={cls.mission}>
            <Pill tone="glass">{mission.pill}</Pill>
            <h2 className={cls.missionTitle}>{mission.title}</h2>
            <p className={cls.missionText}>
              <Responsive copy={mission.text} />
            </p>
            <div className={cls.dots} aria-hidden="true">
              <span className="h-[8px] w-[24px] rounded-[4px] bg-white" />
              <span className="size-[8px] rounded-[4px] bg-white/40" />
              <span className="size-[8px] rounded-[4px] bg-white/40" />
            </div>
          </div>

          <div className={cls.list}>
            <div className={cls.head}>
              <h3 className={cls.headTitle}>{mission.servicesTitle}</h3>
              <span className={cls.headBadge}>
                <Responsive copy={mission.liveBadge} />
              </span>
            </div>
            <ul className="m-0 list-none p-0">
              {mission.services.map((service) => (
                <li key={service.title} className={cls.row}>
                  <span
                    className={`${cls.badge} ${service.live ? "bg-orange/12" : "bg-input-bg"}`}
                    aria-hidden="true"
                  >
                    <DualIcon sm={SERVICE_ICONS[service.icon].sm} lg={SERVICE_ICONS[service.icon].lg} />
                  </span>
                  <span className={cls.rowText}>
                    <span className={cls.rowTitle}>{service.title}</span>
                    <span className={cls.rowDesc}>{service.text}</span>
                  </span>
                  <span className={`${cls.status} ${service.live ? "bg-peach-100 text-orange" : "bg-input-bg text-slate"}`}>
                    {service.live ? mission.liveLabel : mission.soonLabel}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
