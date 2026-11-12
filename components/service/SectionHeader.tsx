import type { ServiceSectionCopy } from "@/types/service";

interface SectionHeaderProps {
  id: string;
  copy: ServiceSectionCopy;
  /** Heading column width at lg (Figma: 780, or 720 on "Your crew"). */
  titleWidth?: string;
  /** Classes for the aside paragraph (size differs on "Your crew"). */
  introClassName?: string;
}

/**
 * Inner wrapper of every service-page section. Phones (Figma "Service page —
 * Mobile 390"): 20px gutters, 56px block padding, 20px between blocks.
 */
export const SECTION_INNER =
  "site-container section-pad max-md:px-[20px] flex flex-col gap-[20px] md:gap-[32px] lg:gap-[48px]";

// Figma "Header" frame shared by every service-page section: gold rule +
// uppercase eyebrow, 52px heading with an underlined orange accent, and a
// short slate aside aligned to the bottom on the right (440px).
// Phones: 11.5px eyebrow, 30/34 heading, 15/24 aside, all stacked 20px apart.
const cls = {
  header: "flex flex-col gap-[20px] md:gap-[16px] lg:flex-row lg:items-end lg:justify-between lg:gap-[40px]",
  eyebrow: [
    "m-0 flex items-center gap-[10px] text-[11.5px] leading-[normal] font-semibold tracking-[1.38px] text-slate uppercase",
    "md:gap-[12px] md:text-[12.5px] md:tracking-[1.5px]",
  ].join(" "),
  rule: "h-[2px] w-[20px] flex-none bg-[#a9822a] md:w-[24px]",
  title: "heading-xl max-md:text-[30px] max-md:leading-[34px] max-md:tracking-[-0.45px] md:tracking-[-1.04px] lg:leading-[56px]",
  accent: "accent-underline",
  intro: "m-0 text-[15px] leading-[24px] text-slate md:text-[17px] md:leading-[27px] lg:w-[440px] lg:flex-none",
};

export const SECTION_TITLE = cls.title;

export function AccentTitle({ heading }: { heading: ServiceSectionCopy["heading"] }) {
  return (
    <>
      {heading.lead} <span className={cls.accent}>{heading.accent}</span>
      {heading.tail ? ` ${heading.tail}` : null}
    </>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className={cls.eyebrow}>
      <span className={cls.rule} aria-hidden="true" />
      {children}
    </p>
  );
}

export default function SectionHeader({
  id,
  copy,
  titleWidth = "lg:max-w-[780px]",
  introClassName,
}: SectionHeaderProps) {
  return (
    <div className={cls.header}>
      <div className={`flex flex-col gap-[20px] md:gap-[14px] ${titleWidth}`} data-reveal="clip">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2 id={id} className={cls.title}>
          <AccentTitle heading={copy.heading} />
        </h2>
      </div>
      {copy.intro && (
        <p
          className={introClassName ?? cls.intro}
          data-reveal
          style={{ "--rd": "150ms" } as React.CSSProperties}
        >
          {copy.intro}
        </p>
      )}
    </div>
  );
}
