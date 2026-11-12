import { Check, MessageCircle } from "lucide-react";
import type { AboutJoinContent } from "@/types/about";
import { ABOUT_INNER, AboutSectionHeader } from "./shared";

interface AboutJoinProps {
  id: string;
  content: AboutJoinContent;
  /** WhatsApp link from the site contact details (falls back to the contact form). */
  applyHref: string;
}

// Figma "Join our crew" — desktop 295:54 (one row per opening: text, perk
// chips, "Apply on WhatsApp"), mobile 297:179 (stacked cards, full-width button).
const cls = {
  inner: `${ABOUT_INNER} flex flex-col gap-[16px] pt-[16px] pb-[56px] md:gap-[32px] md:pb-[100px] lg:gap-[40px] lg:pt-[20px]`,
  list: "m-0 flex list-none flex-col gap-[16px] p-0 md:gap-[12px]",
  card: [
    "flex flex-col items-start gap-[10px] rounded-[16px] border border-sand bg-white p-[18px]",
    "shadow-[0_10px_26px_0_rgba(99,36,0,0.07)]",
    "md:p-[24px] lg:flex-row lg:items-center lg:gap-[24px] lg:rounded-[18px] lg:py-[22px] lg:pr-[24px] lg:pl-[28px] lg:shadow-[0_14px_36px_0_rgba(99,36,0,0.07)]",
  ].join(" "),
  text: "flex min-w-0 flex-col items-start gap-[10px] leading-[normal] lg:flex-1 lg:gap-[6px]",
  tag: "rounded-full bg-peach-100 px-[9px] py-[3px] text-[11px] font-bold text-orange md:px-[10px] md:text-[11.5px]",
  title: "m-0 text-[18px] font-bold text-ink md:text-[20px]",
  desc: "m-0 text-[14px] leading-[21px] text-slate md:text-[15px] lg:leading-[normal]",
  perks: "m-0 flex list-none flex-wrap gap-[6px] p-0 md:gap-[8px] lg:flex-none lg:flex-nowrap",
  perk: "flex items-center gap-[4px] rounded-full bg-input-bg py-[5px] pr-[9px] pl-[7px] md:gap-[5px] md:py-[6px] md:pr-[10px] md:pl-[8px]",
  perkText: "text-[12px] leading-[normal] font-semibold whitespace-nowrap text-ink md:text-[12.5px]",
  apply: [
    "btn-outline w-full gap-[8px] border-[1.2px] px-[16px] text-[14.5px] [--btn-h:46.2px]",
    "md:w-auto lg:flex-none lg:pr-[18px] lg:pl-[16px]",
  ].join(" "),
};

export default function AboutJoin({ id, content, applyHref }: AboutJoinProps) {
  const external = applyHref.startsWith("http");
  return (
    <section id={id} className="bg-white" aria-labelledby={`${id}-title`}>
      <div className={cls.inner}>
        <AboutSectionHeader id={`${id}-title`} copy={content.copy} gapClass="gap-[16px]" />

        <ul className={cls.list} data-reveal-stagger>
          {content.openings.map((opening, index) => (
            <li key={opening.title} className={cls.card} style={{ "--i": index } as React.CSSProperties}>
              <div className={cls.text}>
                <span className={cls.tag}>{opening.tag}</span>
                <h3 className={cls.title}>{opening.title}</h3>
                <p className={cls.desc}>{opening.text}</p>
              </div>
              <ul className={cls.perks}>
                {content.perks.map((perk) => (
                  <li key={perk} className={cls.perk}>
                    <Check aria-hidden="true" className="size-[11px] flex-none text-orange md:size-[12px]" />
                    <span className={cls.perkText}>{perk}</span>
                  </li>
                ))}
              </ul>
              <a
                href={applyHref}
                className={cls.apply}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <MessageCircle aria-hidden="true" size={16} className="flex-none text-brown" />
                {content.applyCta}
                <span className="sr-only"> — {opening.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
