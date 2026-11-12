import { Eyebrow } from "@/components/service/SectionHeader";
import { AccentText, Responsive, reveal } from "@/components/about/shared";
import type { JoinSectionCopy } from "@/data/joinPage";

// Shared pieces of the Join our crew page (Figma 311:2 desktop / 313:2 mobile).
// Phones follow the 390 frame; md+ takes the desktop type sizes and lg (1024)
// the desktop row layouts.

/** Section heading: 30/34 on phones, 44/50 on desktop. */
export const JOIN_H2 = [
  "m-0 font-bold text-heading text-[30px] leading-[34px] tracking-[-0.45px]",
  "md:text-[38px] md:leading-[44px] md:tracking-[-0.76px] lg:text-[44px] lg:leading-[50px] lg:tracking-[-0.88px]",
].join(" ");

/** Inner wrapper: 20px gutters on phones, 80px at 1440; 48 / 96px block padding. */
export const JOIN_INNER = "site-container max-md:px-[20px] py-[48px] md:py-[72px] lg:py-[96px]";

/**
 * Figma "Header": eyebrow + heading (760px) left, slate aside (420px)
 * bottom-aligned right. Phones: eyebrow, heading and intro stacked 16px apart.
 */
export function JoinSectionHeader({ id, copy }: { id: string; copy: JoinSectionCopy }) {
  // introShort: empty/absent = same as `intro`, null = not shown on phones.
  const mobileIntro = copy.introShort === null ? null : copy.introShort || copy.intro;
  return (
    <div className="flex flex-col gap-[16px] lg:flex-row lg:items-end lg:justify-between lg:gap-[40px]">
      <div className="flex min-w-0 flex-col gap-[16px] md:gap-[12px] lg:max-w-[760px] lg:flex-1" data-reveal="clip">
        <Eyebrow>{copy.eyebrow}</Eyebrow>
        <h2 id={id} className={JOIN_H2}>
          <AccentText heading={copy.heading} />
        </h2>
      </div>
      {copy.intro && (
        <p
          className={[
            "m-0 text-[15px] leading-[24px] text-slate md:text-[16.5px] md:leading-[26px] lg:w-[420px] lg:flex-none",
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
