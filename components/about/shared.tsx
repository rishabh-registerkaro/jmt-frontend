import { Eyebrow } from "@/components/service/SectionHeader";
import type { AboutSectionCopy, AccentHeading, Copy } from "@/types/about";

// Shared pieces of the About page (Figma 289:2 desktop / 296:2 mobile).
// Phones follow the 390 frame; md+ (768) takes the desktop type sizes and
// lg/xl (1024/1280) the desktop row layouts.

export const reveal = (ms: number) => ({ "--rd": `${ms}ms` }) as React.CSSProperties;

/** The mobile frame's shorter line below md, the full line from md. */
export function Responsive({ copy }: { copy: Copy }) {
  if (!copy.short || copy.short === copy.text) return <>{copy.text}</>;
  return (
    <>
      <span className="md:hidden">{copy.short}</span>
      <span className="hidden md:inline">{copy.text}</span>
    </>
  );
}

/** "{lead} {accent}{tail}" with the accent in orange. */
export function AccentText({ heading }: { heading: AccentHeading }) {
  return (
    <>
      {heading.lead} <span className="text-orange">{heading.accent}</span>
      {heading.tail}
    </>
  );
}

type PillTone = "white" | "peach" | "glass";

const PILL_TONE: Record<PillTone, string> = {
  white: "border border-sand bg-white text-brown",
  peach: "bg-peach-100 text-brown",
  glass: "bg-white/18 text-white",
};

/** Rounded label with a dot (Figma "Pill / …"): 11.5px on phones, 13px from md. */
export function Pill({ tone, children, className = "" }: { tone: PillTone; children: React.ReactNode; className?: string }) {
  const dot = tone === "glass" ? "bg-white" : "bg-orange";
  return (
    <p
      className={[
        "m-0 inline-flex items-center gap-[7px] rounded-full py-[6px] pr-[12px] pl-[10px] md:gap-[8px] md:py-[7px] md:pr-[14px] md:pl-[12px]",
        "text-[11.5px] leading-[normal] font-semibold tracking-[0.46px] md:text-[13px] md:tracking-[0.52px]",
        PILL_TONE[tone],
        className,
      ].join(" ")}
    >
      <span aria-hidden="true" className={`block size-[6px] flex-none rounded-full md:size-[7px] ${dot}`} />
      {children}
    </p>
  );
}

/** Section heading: 30/34 on phones, 44/48 on desktop. */
export const ABOUT_H2 =
  "m-0 font-bold text-heading text-[30px] leading-[34px] tracking-[-0.45px] md:text-[38px] md:leading-[44px] md:tracking-[-0.76px] lg:text-[44px] lg:leading-[48px] lg:tracking-[-0.88px]";

/** Inner wrapper: 20px gutters on phones, 80px at 1440 (site-container). */
export const ABOUT_INNER = "site-container max-md:px-[20px]";

/**
 * Figma "Header" frame: eyebrow + heading (760px) on the left, slate aside
 * (440px) bottom-aligned on the right. Phones: eyebrow, heading and intro
 * stacked `gapClass` apart (the section's own rhythm).
 */
export function AboutSectionHeader({
  id,
  copy,
  gapClass = "gap-[18px]",
}: {
  id: string;
  copy: AboutSectionCopy;
  gapClass?: string;
}) {
  // introShort: empty/absent = same as `intro`, null = not shown on phones.
  const mobileIntro = copy.introShort === null ? null : copy.introShort || copy.intro;
  return (
    <div className={`flex flex-col ${gapClass} md:gap-[16px] lg:flex-row lg:items-end lg:justify-between lg:gap-[40px]`}>
      <div className={`flex min-w-0 flex-col ${gapClass} md:gap-[14px] lg:max-w-[760px] lg:flex-1`} data-reveal="clip">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2 id={id} className={ABOUT_H2}>
          <AccentText heading={copy.heading} />
        </h2>
      </div>
      {copy.intro && (
        <p
          className={[
            "m-0 text-[15px] leading-[24px] text-slate md:text-[17px] md:leading-[27px] lg:w-[440px] lg:flex-none",
            mobileIntro ? "" : "max-md:hidden",
          ].join(" ")}
          data-reveal
          style={reveal(150)}
        >
          {mobileIntro && mobileIntro !== copy.intro ? (
            <Responsive copy={{ text: copy.intro, short: mobileIntro }} />
          ) : (
            copy.intro
          )}
        </p>
      )}
    </div>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────────
// Heights from the Figma frames: filled 52 (desktop) / 49.2 (phones); outlined
// buttons add the 1.2px border: 54.4 / 51.4.

export const BTN_PRIMARY =
  "btn-primary gap-[8px] px-[20px] text-[15.5px] [--btn-h:49.2px] max-md:w-full md:px-[26px] md:text-[16px] md:[--btn-h:52px]";

export const BTN_OUTLINE =
  "btn-outline gap-[8px] border-[1.2px] px-[20px] text-[15.5px] [--btn-h:51.4px] max-md:w-full md:px-[26px] md:text-[16px] md:[--btn-h:54.4px]";
