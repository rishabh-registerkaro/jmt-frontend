import { ArrowRight, Check, MessageCircle } from "lucide-react";
import Link from "next/link";
import Photo from "@/components/common/Photo";
import { Pill, Responsive } from "@/components/about/shared";
import { JOIN_PAGE } from "@/data/joinPage";

type HeroContent = (typeof JOIN_PAGE)["hero"];

interface JoinHeroProps {
  content: HeroContent;
  homeHref: string;
  /** "Apply now" target: the form on this page. */
  applyHref: string;
  whatsappHref: string;
  opensWhatsApp: string;
}

// Figma "1 · Hero" — desktop 311:56 (copy left, 612×520 photo collage right
// with a floating "Every JMT worker gets" card), mobile 313:44 (stacked; one
// 350×260 photo with the card on its lower right, overlapping the bottom).
const cls = {
  hero: "bg-[linear-gradient(180deg,#fef1e7_0%,#fff_100%)] lg:bg-[linear-gradient(90deg,#fef1e7_0%,#fff_100%)]",
  inner: [
    "site-container flex flex-col gap-[16px] pt-[24px] pb-[32px] max-md:px-[20px]",
    "md:gap-[32px] md:pt-[40px] md:pb-[56px] lg:flex-row lg:items-center lg:gap-[48px] lg:pt-[56px] lg:pb-[72px]",
  ].join(" "),
  text: "flex min-w-0 flex-col items-start gap-[16px] md:gap-[22px] lg:w-[620px] lg:flex-none lg:max-xl:w-[480px]",
  crumbs: "m-0 flex list-none items-center gap-[8px] p-0 text-[13px] leading-[normal] font-medium text-slate md:gap-[10px] md:text-[14px]",
  crumbLink: "rounded-[4px] text-inherit no-underline focus-ring hover:text-brown hover:underline",
  title: [
    "m-0 font-bold text-heading text-[38px] leading-[42px] tracking-[-0.76px]",
    "md:text-[52px] md:leading-[58px] md:tracking-[-1.3px] xl:text-[60px] xl:leading-[64px] xl:tracking-[-1.5px]",
  ].join(" "),
  subtitle: "m-0 text-[15.5px] leading-[25px] text-slate md:max-w-[580px] md:text-[18px] md:leading-[29px]",
  ctas: "flex w-full flex-col gap-[10px] md:w-auto md:flex-row md:gap-[12px]",
  // Heights from the frames: 51.9 / 54.5 filled, +2.4px border outlined.
  primary: "btn-primary gap-[8px] px-[20px] text-[16px] [--btn-h:51.9px] max-md:w-full md:px-[28px] md:text-[16.5px] md:[--btn-h:54.5px]",
  whatsapp: [
    "btn-outline gap-[8px] border-[1.2px] px-[20px] text-[16px] [--btn-h:54.3px] max-md:w-full",
    "md:pr-[24px] md:pl-[22px] md:text-[16.5px] md:[--btn-h:56.9px]",
  ].join(" "),

  // Phones and tablets: one photo with the card overlapping its bottom.
  single: "relative mt-0 h-[260px] md:h-[420px] lg:hidden",
  singlePhoto: "relative h-full overflow-hidden rounded-[20px] bg-navy-card md:rounded-[24px]",
  // lg+: the collage.
  collage: "relative hidden h-[520px] min-w-0 flex-1 lg:grid lg:grid-cols-[400fr_200fr] lg:grid-rows-[250fr_258fr] lg:gap-[12px]",
  main: "relative row-span-2 overflow-hidden rounded-[24px] bg-navy-card",
  small: "relative overflow-hidden rounded-[20px] bg-navy-card",
  card: [
    "absolute flex flex-col items-start gap-[6px] rounded-[14px] bg-white px-[14px] py-[12px] shadow-[0_12px_30px_0_rgba(99,36,0,0.08)]",
    "lg:gap-[8px] lg:rounded-[16px] lg:px-[18px] lg:py-[16px] lg:shadow-[0_16px_36px_0_rgba(26,10,0,0.18)]",
  ].join(" "),
  cardTitle: "m-0 text-[10px] leading-[normal] font-bold tracking-[1px] whitespace-nowrap text-brown lg:text-[11px] lg:tracking-[1.1px]",
  cardItem: "flex items-center gap-[6px] text-[12.5px] leading-[normal] font-semibold whitespace-nowrap text-ink lg:gap-[8px] lg:text-[14px]",
  cardCheck: "flex size-[16px] flex-none items-center justify-center rounded-full bg-orange lg:size-[20px]",
};

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

function WorkerCard({ card, className }: { card: HeroContent["card"]; className: string }) {
  return (
    <div className={`${cls.card} ${className}`}>
      <p className={cls.cardTitle}>{card.title}</p>
      <ul className="m-0 flex list-none flex-col gap-[6px] p-0 lg:gap-[8px]">
        {card.items.map((item) => (
          <li key={item} className={cls.cardItem}>
            <span className={cls.cardCheck} aria-hidden="true">
              <Check strokeWidth={3} className="size-[9px] flex-none text-white lg:size-[11px]" aria-hidden="true" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function JoinHero({ content, homeHref, applyHref, whatsappHref, opensWhatsApp }: JoinHeroProps) {
  const external = whatsappHref.startsWith("http");
  return (
    <section id="top" className={cls.hero} aria-labelledby="join-title">
      <div className={cls.inner}>
        <div className={cls.text}>
          <nav aria-label="Breadcrumb" className="reveal" style={delay(120)}>
            <ol className={cls.crumbs}>
              <li>
                <Link href={homeHref} className={cls.crumbLink}>
                  {content.crumbHome}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-semibold text-brown" aria-current="page">
                {content.crumb}
              </li>
            </ol>
          </nav>
          <div className="reveal" style={delay(200)}>
            <Pill tone="white" className="max-md:text-[11px] max-md:tracking-[0.44px]">
              {content.pill}
            </Pill>
          </div>
          <h1 id="join-title" className={`${cls.title} reveal-clip`}>
            {content.heading.lead} <span className="text-orange">{content.heading.accent}</span>
            {content.heading.tail}
          </h1>
          <p className={`${cls.subtitle} reveal`} style={delay(440)}>
            <Responsive copy={content.subtitle} />
          </p>
          <div className={`${cls.ctas} reveal`} style={delay(540)}>
            <a href={applyHref} className={cls.primary}>
              {content.primaryCta}
              <ArrowRight className="size-[17px] flex-none text-white md:size-[18px]" aria-hidden="true" />
            </a>
            <a href={whatsappHref} className={cls.whatsapp} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              <MessageCircle className="size-[17px] flex-none text-brown md:size-[18px]" aria-hidden="true" />
              {content.whatsappCta}
              {external && <span className="sr-only"> {opensWhatsApp}</span>}
            </a>
          </div>
        </div>

        <div className={`${cls.single} reveal`} style={delay(660)}>
          <div className={cls.singlePhoto}>
            <Photo image={content.photos.main} sizes="(min-width: 768px) 100vw, calc(100vw - 40px)" priority />
          </div>
          <WorkerCard card={content.card} className="top-[178px] right-0 md:top-auto md:right-[24px] md:bottom-[24px]" />
        </div>

        <div className={`${cls.collage} reveal`} style={delay(200)}>
          <div className={cls.main}>
            <Photo image={content.photos.main} sizes="(min-width: 1280px) 400px, 30vw" priority />
          </div>
          <div className={cls.small}>
            <Photo image={content.photos.top} sizes="(min-width: 1280px) 200px, 15vw" />
          </div>
          <div className={cls.small}>
            <Photo image={content.photos.bottom} sizes="(min-width: 1280px) 200px, 15vw" />
          </div>
          <WorkerCard card={content.card} className="top-[393px] left-[-36px]" />
        </div>
      </div>
    </section>
  );
}
