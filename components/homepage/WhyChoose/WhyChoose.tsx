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
                  <h3 className={cls.reason__title}>{reason.title}</h3>
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
  why__inner: "site-container section-pad flex flex-col gap-8 lg:gap-6",
  why__header: "split-header [--aside-w:460px]",
  why__title: "heading-xl flex-1",
  why__accent: "accent-underline",
  why__copy: "body-lg lg:pt-3 lg:pr-[26px]",
  why__body: "grid grid-cols-1 gap-10 lg:min-h-[492.9px] lg:grid-cols-2 lg:gap-[72px]",

  // ── Reasons list ──
  reasons: "flex flex-col border-t border-sand",
  reason: [
    "grid flex-1 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-3 border-b border-sand py-7",
    "[grid-template-areas:'number_text'_'number_tag']",
    "md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-x-8 md:pt-9 md:pb-[37px]",
    "md:[grid-template-areas:'number_text_tag']",
  ].join(" "),
  reason__number: [
    "[grid-area:number] self-start md:self-center",
    "text-[clamp(36px,30.4366197183px+1.4835680751vw,51.8px)] leading-[1.0501930502] font-bold tracking-[-1px] text-brown tabular-nums",
  ].join(" "),
  reason__text: "flex flex-col gap-2 [grid-area:text]",
  reason__title: "m-0 text-[clamp(19px,17.9436619718px+0.2816901408vw,22px)] leading-[1.3] font-semibold tracking-normal text-ink",
  reason__description: "body-lg",
  reason__tag: [
    "inline-flex h-[39.2px] items-center justify-self-start rounded-full bg-orange-tint px-[17px] [grid-area:tag]",
    "eyebrow whitespace-nowrap text-brown",
  ].join(" "),

  // ── Image ──
  why__figure: "relative m-0 min-h-[320px] overflow-hidden rounded-[12px] bg-sand md:min-h-[440px]",
  why__badge: [
    "absolute right-4 bottom-4 z-1 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5",
    "[filter:drop-shadow(0_8px_12px_rgba(8,27,48,0.4))] eyebrow text-navy",
  ].join(" "),
  why__badgeDot: "size-1.5 flex-none rounded-[50px] bg-gold",
};
