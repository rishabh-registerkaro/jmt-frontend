import Image from "next/image";
import type { AboutPromisesContent } from "@/types/about";
import { ABOUT_INNER, DualIcon, Pill, Responsive, reveal } from "./shared";

// Figma "Promises band" — desktop 292:107 (copy left, 2×2 promise tiles right,
// mandala top right), mobile 297:55 (copy, tiles, then the assurance chips;
// no mandala). Below lg the text column "dissolves" (display: contents) so the
// chips can move under the tiles.
const cls = {
  band: [
    "relative isolate overflow-hidden",
    "bg-[linear-gradient(122deg,#f7931e_0%,#f26921_32.143%,#642301_71.429%)]",
    "lg:bg-[linear-gradient(141.67deg,#f7931e_0%,#f26921_34.615%,#642301_76.923%)]",
  ].join(" "),
  mandala: "pointer-events-none absolute top-[-80px] left-[62.5%] z-0 hidden max-w-none mix-blend-plus-lighter lg:block",
  inner: `${ABOUT_INNER} relative flex flex-col items-start gap-[18px] py-[48px] md:py-[72px] lg:flex-row lg:items-center lg:gap-[56px] lg:py-[80px]`,
  text: "contents lg:flex lg:w-[520px] lg:flex-none lg:flex-col lg:items-start lg:gap-[18px] lg:max-xl:w-[420px]",
  title: [
    "m-0 font-bold text-white text-[30px] leading-[34px] tracking-[-0.45px]",
    "md:text-[38px] md:leading-[44px] lg:max-w-[500px] lg:text-[44px] lg:leading-[50px] lg:tracking-[-0.88px]",
  ].join(" "),
  copy: "m-0 text-[15px] leading-[24px] text-white/90 md:text-[17px] md:leading-[28px] lg:max-w-[480px]",
  chips: "m-0 flex w-full list-none flex-wrap gap-[8px] p-0 max-lg:order-last lg:max-w-[500px]",
  chip: "flex items-center gap-[6px] rounded-full bg-white py-[7px] pr-[11px] pl-[9px] md:py-[8px] md:pr-[12px] md:pl-[10px]",
  chipBadge: "flex size-[16px] items-center justify-center rounded-full bg-orange md:size-[18px]",
  chipText: "text-[12px] leading-[normal] font-semibold whitespace-nowrap text-brown md:text-[13px]",
  tiles: "m-0 grid w-full list-none grid-cols-2 gap-[10px] p-0 md:gap-[16px] lg:flex-1",
  tile: "flex min-w-0 flex-col gap-[4px] rounded-[16px] border border-white/25 bg-white/12 p-[16px] leading-[normal] md:gap-[6px] md:rounded-[18px] md:p-[24px]",
  value: "flex items-baseline gap-[6px] md:gap-[8px]",
  num: "text-[36px] font-bold tracking-[-0.54px] text-white md:text-[52px] md:tracking-[-1.04px]",
  unit: "text-[14px] font-semibold text-peach-200 md:text-[18px]",
  label: "m-0 text-[13px] font-medium text-white/90 md:text-[15px]",
};

export default function AboutPromises({ content }: { content: AboutPromisesContent }) {
  return (
    <section id="promises" className={cls.band} aria-labelledby="about-promises-title">
      <Image src="/about/promises-mandala.svg" alt="" width={547.64} height={535.74} className={cls.mandala} aria-hidden="true" />
      <div className={cls.inner}>
        <div className={cls.text}>
          <div data-reveal>
            <Pill tone="glass">{content.pill}</Pill>
          </div>
          <h2 id="about-promises-title" className={cls.title} data-reveal="clip" style={reveal(80)}>
            {content.title}
          </h2>
          <p className={cls.copy} data-reveal style={reveal(160)}>
            <Responsive copy={content.text} />
          </p>
          <ul className={cls.chips} data-reveal-stagger>
            {content.assurances.map((item, index) => (
              <li key={item} className={cls.chip} style={{ "--i": index } as React.CSSProperties}>
                <span className={cls.chipBadge} aria-hidden="true">
                  <DualIcon sm={["/about/m/check-white-9.svg", 9]} lg={["/about/icon-check-white-10.svg", 10]} />
                </span>
                <span className={cls.chipText}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <ul className={cls.tiles} data-reveal-stagger>
          {content.promises.map((promise, index) => (
            <li key={promise.value + promise.unit} className={cls.tile} style={{ "--i": index } as React.CSSProperties}>
              <p className={`m-0 ${cls.value}`}>
                <span className={cls.num}>{promise.value}</span>
                <span className={cls.unit}>{promise.unit}</span>
              </p>
              <p className={cls.label}>
                <Responsive copy={promise.label} />
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
