import type { HomeImage, ReasonItem, WhyCopy } from "@/types/homepage";
import Photo from "@/components/common/Photo";

interface WhyChooseProps {
  reasons: ReasonItem[];
  image: HomeImage;
  copy: WhyCopy;
}

export default function WhyChoose({ reasons, image, copy }: WhyChooseProps) {
  return (
    <section id="why-us" className={cls.why} aria-labelledby="why-title">
      <div className={cls.why__inner}>
        <div className={cls.why__header}>
          <h2 id="why-title" className={cls.why__title} data-reveal="clip">
            {copy.heading.lead}{" "}
            {copy.heading.accent && <span className={cls.why__accent}>{copy.heading.accent}</span>}
          </h2>
          {copy.intro && <p className={cls.why__copy} data-reveal style={{ "--rd": "150ms" } as React.CSSProperties}>{copy.intro}</p>}
        </div>

        <div className={cls.why__body}>
          <ol className={cls.reasons} data-reveal-stagger>
            {reasons.map((reason) => (
              <li key={reason.number} className={cls.reason}>
                <span className={cls.reason__number} aria-hidden="true">
                  {reason.number}
                </span>
                <div className={cls.reason__text}>
                  {/* Mobile: the tag sits beside the title. */}
                  <div className={cls.reason__head}>
                    <h3 className={cls.reason__title}>{reason.title}</h3>
                    <span className={cls.reason__tagInline}>{reason.tag}</span>
                  </div>
                  <p className={cls.reason__description}>{reason.description}</p>
                </div>
                <span className={cls.reason__tag}>{reason.tag}</span>
              </li>
            ))}
          </ol>

          <figure className={cls.why__figure} data-reveal="img">
            <Photo image={image} sizes="(min-width: 1024px) 45vw, 100vw" />
            {copy.badge && (
              <figcaption className={cls.why__badge}>
                <span className={cls.why__badgeDot} aria-hidden="true" />
                {copy.badge}
              </figcaption>
            )}
          </figure>
        </div>
      </div>
    </section>
  );
}

const cls = {
  why: "bg-peach-wash",
  // Mobile (<768, Figma "Homepage — Mobile 390"): photo above the reasons, 24px rhythm.
  why__inner: "site-container section-pad flex flex-col gap-6 md:gap-8 lg:gap-6",
  why__header: "split-header [--aside-w:460px]",
  why__title: "heading-xl flex-1",
  why__accent: "accent-underline max-md:no-underline",
  why__copy: "body-lg lg:pt-3 lg:pr-[26px]",
  why__body: "grid grid-cols-1 gap-6 md:gap-10 lg:min-h-[492.9px] lg:grid-cols-2 lg:gap-[72px]",

  // ── Reasons list ──
  reasons: "flex flex-col border-t border-sand max-md:border-t-0",
  reason: [
    "grid flex-1 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-3 border-b border-sand py-7",
    "[grid-template-areas:'number_text'_'number_tag']",
    "max-md:items-start max-md:gap-x-[14px] max-md:gap-y-0 max-md:border-b-0 max-md:py-[18px]",
    "max-md:not-first:border-t max-md:not-first:border-[rgba(100,35,1,0.12)]",
    "md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-8 md:pt-9 md:pb-[37px]",
    "md:[grid-template-areas:'number_text_tag']",
  ].join(" "),
  reason__number: [
    "[grid-area:number] self-start md:self-center",
    "text-[28px] leading-[30px] font-bold text-brown tabular-nums",
    "md:text-[clamp(36px,30.4366197183px+1.4835680751vw,51.8px)] md:leading-[1.0501930502] md:tracking-[-1px]",
  ].join(" "),
  reason__text: "flex flex-col gap-[6px] [grid-area:text] md:gap-2",
  reason__head: "flex flex-wrap items-center gap-2",
  reason__title:
    "m-0 text-[16px] leading-[22px] font-semibold tracking-normal text-ink md:text-[clamp(19px,17.9436619718px+0.2816901408vw,22px)] md:leading-[1.3]",
  reason__tagInline:
    "inline-flex items-center rounded-full bg-orange-tint px-[9px] py-[3px] text-[10px] leading-[14px] font-bold tracking-[0.6px] whitespace-nowrap text-brown uppercase md:hidden",
  reason__description: "body-lg max-md:text-[14px] max-md:leading-[22px]",
  reason__tag: [
    "inline-flex h-[39.2px] items-center justify-self-start rounded-full bg-orange-tint px-[17px] [grid-area:tag]",
    "eyebrow whitespace-nowrap text-brown max-md:hidden",
  ].join(" "),

  // ── Image ──
  why__figure:
    "relative m-0 h-[220px] overflow-hidden rounded-[16px] bg-sand max-md:order-first md:h-auto md:min-h-[440px] md:rounded-[12px]",
  why__badge: [
    "absolute bottom-3 left-3 z-1 inline-flex items-center gap-[6px] rounded-full bg-white py-[6px] pr-3 pl-[10px]",
    "text-[11px] leading-[15px] font-bold tracking-[0.66px] text-brown uppercase",
    "md:right-4 md:bottom-4 md:left-auto md:gap-2 md:px-4 md:py-2.5 md:eyebrow md:text-navy",
    "md:[filter:drop-shadow(0_8px_12px_rgba(8,27,48,0.4))]",
  ].join(" "),
  why__badgeDot: "size-[7px] flex-none rounded-[50px] bg-orange md:size-1.5 md:bg-gold",
};
