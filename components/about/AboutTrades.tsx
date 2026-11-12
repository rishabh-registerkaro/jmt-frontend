import { ArrowRight } from "lucide-react";
import type { AboutRole, AboutTradesContent } from "@/types/about";
import { ABOUT_H2, ABOUT_INNER, AccentText, BTN_OUTLINE, Responsive, reveal } from "./shared";

interface AboutTradesProps {
  content: AboutTradesContent;
  /** "See all roles" target (the homepage trades section). */
  rolesHref: string;
}

// Figma "Every trade your site needs" — desktop 289:153, mobile 296:133.
// Desktop: "Role marquee" — three rows of role pills (1307px window) drifting
// sideways, alternate rows in opposite directions; hover pauses a row. With
// reduced motion the rows sit still and centered, as drawn.
// Phones: the 14 roles as one centered, wrapped list.
const cls = {
  inner: `${ABOUT_INNER} flex flex-col items-center gap-[20px] py-[56px] md:gap-[36px] md:py-[100px] xl:px-[66.5px]`,
  title: `${ABOUT_H2} max-w-[350px] text-center md:max-w-[880px]`,
  intro: "m-0 max-w-[330px] text-center text-[15px] leading-[24px] text-slate md:max-w-[680px] md:text-[17px] md:leading-[27px]",
  list: "m-0 flex w-full list-none flex-wrap justify-center gap-[8px] p-0 md:sr-only",
  pill: [
    "flex flex-none items-center gap-[6px] rounded-full border border-sand bg-white py-[8px] pr-[12px] pl-[10px]",
    "text-[13px] leading-[normal] font-semibold whitespace-nowrap text-ink",
  ].join(" "),
  marquee: "hidden w-full max-w-[1307px] flex-col gap-[12px] md:flex",
  row: "flex w-full overflow-hidden motion-reduce:justify-center",
  // Animation: .about-marquee in styles/public.css (off for reduced motion).
  track: "about-marquee flex w-max flex-none",
  group: "flex flex-none gap-[12px] pr-[12px] motion-reduce:pr-0",
  pillLg: [
    "flex flex-none items-center gap-[8px] rounded-full border border-sand bg-white py-[11px] pr-[18px] pl-[14px]",
    "text-[14.5px] leading-[normal] font-semibold whitespace-nowrap text-ink",
  ].join(" "),
};

function Dot({ role, size }: { role: AboutRole; size: "sm" | "lg" }) {
  const tone = role.lead ? "bg-brown" : "bg-orange";
  const px = size === "sm" ? "size-[6px]" : "size-[7px]";
  return <span aria-hidden="true" className={`block flex-none rounded-full ${px} ${tone}`} />;
}

// Seconds for one loop of each row (rows differ in length, so the drift varies slightly).
const DURATIONS = ["58s", "64s", "60s"];

export default function AboutTrades({ content, rolesHref }: AboutTradesProps) {
  return (
    <section id="roles" className="bg-peach-100" aria-labelledby="about-trades-title">
      <div className={cls.inner}>
        <h2 id="about-trades-title" className={cls.title} data-reveal="clip">
          <AccentText heading={content.heading} />
        </h2>
        <p className={cls.intro} data-reveal style={reveal(120)}>
          <Responsive copy={content.intro} />
        </p>

        {/* Phones: the list itself. md+: kept for screen readers (sr-only) while the marquee shows. */}
        <ul className={cls.list} data-reveal-stagger>
          {content.roles.map((role, index) => (
            <li key={role.label} className={cls.pill} style={{ "--i": index } as React.CSSProperties}>
              <Dot role={role} size="sm" />
              {role.label}
            </li>
          ))}
        </ul>

        <div className={cls.marquee} aria-hidden="true" data-reveal style={reveal(160)}>
          {content.rows.map((row, rowIndex) => (
            <div key={rowIndex} className={cls.row}>
              <div
                className={cls.track}
                data-reverse={rowIndex % 2 === 1 ? "" : undefined}
                style={{ "--marquee-duration": DURATIONS[rowIndex % DURATIONS.length] } as React.CSSProperties}
              >
                {[0, 1].map((copy) => (
                  <div key={copy} className={`${cls.group} ${copy === 1 ? "motion-reduce:hidden" : ""}`}>
                    {row.map((role, index) => (
                      <span key={`${role.label}-${index}`} className={cls.pillLg}>
                        <Dot role={role} size="lg" />
                        {role.label}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <a href={rolesHref} className={BTN_OUTLINE} data-reveal style={reveal(220)}>
          {content.cta}
          <ArrowRight aria-hidden="true" className="size-[17px] flex-none text-brown md:size-[18px]" />
        </a>
      </div>
    </section>
  );
}
