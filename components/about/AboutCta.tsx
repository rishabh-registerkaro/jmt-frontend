import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { AboutCtaContent } from "@/types/about";
import { ABOUT_INNER } from "./shared";

interface AboutCtaProps {
  content: AboutCtaContent;
  /** "Request workers" target (the homepage contact form). */
  requestHref: string;
  /** "Join our crew" target (the openings section on this page). */
  joinHref: string;
}

// Figma "CTA" — desktop 295:135 (copy left, buttons right, mandala on the
// right), mobile 297:251 (stacked, full-width buttons, no mandala).
const cls = {
  inner: `${ABOUT_INNER} pb-[56px] md:pb-[100px]`,
  card: [
    "relative isolate flex flex-col items-start gap-[14px] overflow-hidden rounded-[24px] px-[22px] pt-[32px] pb-[24px]",
    "bg-[linear-gradient(138.8deg,#f7931e_0%,#f26921_32.143%,#642301_71.429%)]",
    "md:gap-[24px] md:rounded-[28px] md:p-[48px]",
    "xl:flex-row xl:items-center xl:justify-between xl:p-[56px]",
    "xl:bg-[linear-gradient(157.21deg,#f7931e_0%,#f26921_34.615%,#642301_76.923%)]",
  ].join(" "),
  mandala: "pointer-events-none absolute top-[-160px] left-[64.06%] z-0 hidden max-w-none mix-blend-plus-lighter xl:block",
  text: "relative flex flex-col gap-[14px] md:gap-[12px]",
  title: "m-0 max-w-[620px] text-[28px] leading-[32px] font-bold tracking-[-0.42px] text-white md:text-[40px] md:leading-[46px] md:tracking-[-0.8px]",
  copy: "m-0 max-w-[560px] text-[14.5px] leading-[22px] text-white/90 md:text-[17px] md:leading-[normal]",
  buttons: "relative flex w-full flex-col gap-[14px] md:w-auto md:flex-row md:gap-[12px] xl:flex-none",
  primary: [
    "btn-base gap-[8px] bg-white px-[20px] text-[15.5px] text-brown [--btn-h:49.2px] [--focus-color:#fff]",
    "hover:bg-peach-100 md:px-[24px] md:text-[16px] md:[--btn-h:52px]",
  ].join(" "),
  secondary: [
    "btn-base border-[1.2px] border-solid border-white bg-transparent px-[20px] text-[15.5px] text-white [--btn-h:51.4px] [--focus-color:#fff]",
    "hover:bg-white/10 md:px-[24px] md:text-[16px] md:[--btn-h:54.4px]",
  ].join(" "),
};

export default function AboutCta({ content, requestHref, joinHref }: AboutCtaProps) {
  return (
    <section className="bg-white" aria-labelledby="about-cta-title">
      <div className={cls.inner}>
        <div className={cls.card} data-reveal="zoom">
          <Image src="/about/mandala-card.svg" alt="" width={547.64} height={535.74} className={cls.mandala} aria-hidden="true" />
          <div className={cls.text}>
            <h2 id="about-cta-title" className={cls.title}>
              {content.title}
            </h2>
            <p className={cls.copy}>{content.text}</p>
          </div>
          <div className={cls.buttons}>
            <a href={requestHref} className={cls.primary}>
              {content.primaryCta}
              <ArrowRight aria-hidden="true" className="size-[17px] flex-none text-brown md:size-[18px]" />
            </a>
            <a href={joinHref} className={cls.secondary}>
              {content.secondaryCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
