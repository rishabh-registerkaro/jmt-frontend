import Image from "next/image";
import Photo from "@/components/common/Photo";
import type { AboutPerson, AboutTeamContent } from "@/types/about";
import { ABOUT_INNER, AboutSectionHeader, DualIcon, Responsive, reveal } from "./shared";

interface AboutTeamProps {
  id: string;
  content: AboutTeamContent;
  /** "Join our crew" target (the openings section on this page). */
  joinHref: string;
}

// Figma "Run by people who work the sites" — desktop 292:2, mobile 296:233.
// Desktop (lg+): founder, supervisors, crews and the orange join card in one
// 420px row (the Figma row is 1304px — 24px wider than the 1280 column — so
// the columns keep its 410 : 300 : 300 : 222 proportions and fit the column),
// then the founder's quote as a peach strip.
// Below lg: founder full width, the two team cards side by side, a compact
// join banner and the quote as a card (the mobile frame).
const cls = {
  inner: `${ABOUT_INNER} flex flex-col gap-[18px] pt-[24px] pb-[56px] md:gap-[32px] md:py-[100px] lg:gap-[48px]`,
  people: [
    "m-0 grid list-none grid-cols-2 gap-[12px] p-0 md:gap-[20px]",
    "lg:grid-cols-[410fr_300fr_300fr_222fr] lg:gap-[24px]",
  ].join(" "),
  person: "relative isolate overflow-hidden rounded-[18px] bg-navy-card md:rounded-[20px]",
  founder: "col-span-2 h-[380px] md:h-[460px] lg:col-span-1 lg:h-[420px]",
  member: "h-[240px] md:h-[340px] lg:h-[420px]",
  shade: [
    "pointer-events-none absolute inset-0",
    "bg-[linear-gradient(180deg,rgba(8,27,48,0)_40%,rgba(8,27,48,0.88)_100%)]",
    "md:bg-[linear-gradient(180deg,rgba(8,27,48,0)_45%,rgba(8,27,48,0.88)_100%)]",
  ].join(" "),
  caption: "absolute inset-x-0 bottom-0 flex flex-col items-start gap-[3px] px-[16px] pb-[16px] md:gap-[4px] md:px-[22px] md:pb-[22px]",
  tag: "rounded-full bg-orange px-[9px] py-[3px] text-[11px] leading-[normal] font-bold text-white md:px-[10px] md:py-[4px] md:text-[11.5px]",
  nameLg: "m-0 text-[20px] leading-[normal] font-bold text-white",
  nameSm: "m-0 text-[16px] leading-[normal] font-bold text-white md:text-[20px]",
  role: "m-0 text-[12.5px] leading-[17px] text-white/85 md:text-[14px] md:leading-[normal]",

  // Desktop join card (lg+).
  joinCard: [
    "hidden h-[420px] flex-col justify-between overflow-hidden rounded-[20px] px-[24px] py-[28px] lg:flex",
    "bg-[linear-gradient(103.22deg,#f7931e_0%,#f26921_34.615%,#642301_76.923%)]",
  ].join(" "),
  joinBadge: "flex size-[44px] items-center justify-center rounded-[12px] bg-white/18",
  joinTitle: "m-0 text-[22px] leading-[28px] font-bold text-white",
  joinText: "m-0 text-[14px] leading-[21px] text-white/90",
  joinBtn: [
    "inline-flex items-center gap-[6px] self-start rounded-[43px] bg-white px-[16px] py-[11px]",
    "text-[14px] leading-[normal] font-semibold text-brown no-underline",
    "transition-colors duration-160 hover:bg-peach-100 focus-ring [--focus-color:#fff]",
  ].join(" "),
  // Below lg: one-line banner with a round arrow.
  joinBanner: [
    "flex items-center gap-[12px] rounded-[18px] p-[18px] text-white no-underline lg:hidden md:p-[24px]",
    "bg-[linear-gradient(167.28deg,#f7931e_0%,#f26921_32.143%,#642301_71.429%)]",
    "focus-ring",
  ].join(" "),
  joinBannerArrow: "flex size-[40px] flex-none items-center justify-center rounded-full bg-white",

  quote: [
    "m-0 flex flex-col items-start gap-[10px] rounded-[18px] bg-peach-100 p-[20px]",
    "md:p-[28px] lg:flex-row lg:items-center lg:gap-[20px] lg:rounded-[20px] lg:px-[28px] lg:py-[24px]",
  ].join(" "),
  quoteText: "m-0 text-[15px] leading-[24px] font-medium text-brown md:text-[18px] md:leading-[28px] lg:flex-1",
};

function PersonCard({ person, className, nameClass, sizes }: { person: AboutPerson; className: string; nameClass: string; sizes: string }) {
  return (
    <li className={`${cls.person} ${className}`}>
      <Photo image={person.image} sizes={sizes} />
      <span className={cls.shade} aria-hidden="true" />
      <div className={cls.caption}>
        {person.tag && <span className={cls.tag}>{person.tag}</span>}
        <h3 className={nameClass}>{person.name}</h3>
        <p className={cls.role}>
          <Responsive copy={person.text} />
        </p>
      </div>
    </li>
  );
}

export default function AboutTeam({ id, content, joinHref }: AboutTeamProps) {
  const { founder, people, join, quote } = content;
  return (
    <section id={id} className="scroll-mt-[68px] bg-white lg:scroll-mt-[80px]" aria-labelledby={`${id}-title`}>
      <div className={cls.inner}>
        <AboutSectionHeader id={`${id}-title`} copy={content.copy} />

        <ul className={cls.people} data-reveal-stagger>
          <PersonCard
            person={founder}
            className={cls.founder}
            nameClass={cls.nameLg}
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) calc(100vw - 64px), calc(100vw - 40px)"
          />
          {people.map((person) => (
            <PersonCard
              key={person.name}
              person={person}
              className={cls.member}
              nameClass={cls.nameSm}
              sizes="(min-width: 1024px) 22vw, 50vw"
            />
          ))}
          <li className={cls.joinCard}>
            <div className="flex flex-col items-start gap-[10px]">
              <span className={cls.joinBadge} aria-hidden="true">
                <Image src="/about/icon-user-20.svg" alt="" width={20} height={20} />
              </span>
              <h3 className={cls.joinTitle}>{join.title}</h3>
              <p className={cls.joinText}>{join.text.text}</p>
            </div>
            <a href={joinHref} className={cls.joinBtn}>
              {join.cta}
              <Image src="/about/icon-arrow-brown-15.svg" alt="" width={15} height={15} />
            </a>
          </li>
        </ul>

        <a href={joinHref} className={cls.joinBanner} data-reveal>
          <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <span className="text-[16px] leading-[normal] font-bold md:text-[20px]">{join.title}</span>
            <span className="text-[13px] leading-[normal] text-white/90 md:text-[15px]">
              <Responsive copy={join.text} />
            </span>
          </span>
          <span className={cls.joinBannerArrow} aria-hidden="true">
            <Image src="/about/m/arrow-brown-17.svg" alt="" width={17} height={17} />
          </span>
          <span className="sr-only">{join.cta}</span>
        </a>

        <figure className={cls.quote} data-reveal style={reveal(80)}>
          <span aria-hidden="true" className="flex">
            <DualIcon sm={["/about/m/quote-24.svg", 24]} lg={["/about/icon-quote-30.svg", 30]} breakpoint="lg" />
          </span>
          <blockquote className="m-0 lg:flex-1">
            <p className={cls.quoteText}>{quote.text}</p>
          </blockquote>
          {/* Below lg one bold line ("Name, Role"); lg+ name over a slate role. */}
          <figcaption className="flex flex-none flex-wrap leading-[normal] lg:flex-col lg:gap-[2px] lg:whitespace-nowrap">
            <span className="text-[13px] font-bold text-ink lg:text-[15px]">
              {quote.name}
              <span className="lg:hidden">,&nbsp;</span>
            </span>
            <span className="text-[13px] font-bold text-ink lg:font-normal lg:text-slate">{quote.role}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
