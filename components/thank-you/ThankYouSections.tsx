import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, CircleCheck, Clock, ContactRound, MessageCircle, Phone } from "lucide-react";
import { Eyebrow } from "@/components/service/SectionHeader";
import { AccentHeading } from "@/components/contact/Responsive";
import { Pill, Responsive, reveal } from "@/components/about/shared";
import type { ThankYouPageContent } from "@/data/thankYouPage";
import type { ContactInfo } from "@/types/homepage";
import type { Copy } from "@/types/about";
import type { ThankYouForm } from "@/lib/thankYou";
import { ThankYouSummary, ThankYouTitle } from "./ThankYouNote";

// Thank-you page sections (app/thank-you/[form]). Same tokens as the rest of
// the site: peach hero wash like the Contact page, step track like "How
// hiring works", contact cards like the Join page's apply panel, and the
// About page's orange CTA card to close.

const INNER = "site-container max-md:px-[20px]";
const H2 = [
  "m-0 font-bold text-heading text-[28px] leading-[32px] tracking-[-0.42px]",
  "md:text-[36px] md:leading-[42px] md:tracking-[-0.72px] lg:text-[40px] lg:leading-[46px] lg:tracking-[-0.8px]",
].join(" ");

// ── Hero ─────────────────────────────────────────────────────────────────────

export function ThankYouHero({
  form,
  copy,
  summary,
  sentTitle,
  message,
}: {
  form: ThankYouForm;
  copy: ThankYouPageContent["hero"];
  summary: ThankYouPageContent["summary"];
  /** The form's own success title from the admin ("Enquiry sent", …). */
  sentTitle: string;
  /** The form's own success message from the admin. */
  message: string;
}) {
  const worker = form === "application";
  return (
    <section
      className="relative overflow-hidden bg-[linear-gradient(180deg,var(--color-peach-100)_0%,#fff_100%)]"
      aria-labelledby="thanks-title"
    >
      {/* Soft glow behind the badge. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-[-120px] left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(242,105,33,0.16)_0%,rgba(242,105,33,0)_70%)] md:size-[620px]"
      />
      <div
        className={`${INNER} relative flex flex-col items-center gap-[16px] pt-[44px] pb-[48px] text-center md:gap-[18px] md:pt-[64px] md:pb-[72px] lg:pb-[80px]`}
      >
        <div className="relative mb-[10px] flex size-[76px] items-center justify-center md:size-[92px]" aria-hidden="true">
          <span className="thanks-ring absolute inset-0 rounded-full bg-success/25" />
          <span className="thanks-ring absolute inset-0 rounded-full bg-success/20 [--ring-d:700ms]" />
          <span className="lead-success-pop relative flex size-full items-center justify-center rounded-full bg-success text-white shadow-[0_0_0_8px_rgba(46,125,79,0.12),0_18px_40px_rgba(46,125,79,0.28)] md:shadow-[0_0_0_10px_rgba(46,125,79,0.12),0_18px_40px_rgba(46,125,79,0.28)]">
            <Check className="size-[38px] md:size-[46px]" strokeWidth={2.6} />
          </span>
        </div>

        <Pill tone="white" className="reveal">
          {sentTitle}
        </Pill>

        <ThankYouTitle
          form={form}
          id="thanks-title"
          greeting={copy.greeting}
          accent={worker ? copy.workerAccent : copy.contractorAccent}
          className={[
            "reveal-clip m-0 max-w-[880px] font-bold text-heading text-balance",
            "text-[36px] leading-[42px] tracking-[-0.72px] md:text-[52px] md:leading-[58px] md:tracking-[-1.3px]",
            "lg:text-[60px] lg:leading-[66px] lg:tracking-[-1.5px]",
          ].join(" ")}
        />

        <p
          className="reveal m-0 max-w-[620px] text-[16px] leading-[25px] text-slate-strong text-pretty md:text-[18px] md:leading-[29px]"
          style={{ "--d": "160ms" } as React.CSSProperties}
        >
          {message}
        </p>

        <ThankYouSummary form={form} copy={summary} />
      </div>
    </section>
  );
}

// ── What happens next ───────────────────────────────────────────────────────

export interface ThankYouStep {
  when: string;
  title: string;
  text: string;
}

/** The step that is already done (the form was sent), then what comes next. */
export function ThankYouSteps({
  copy,
  done,
  steps,
}: {
  copy: ThankYouPageContent["progress"];
  done: ThankYouStep;
  steps: ThankYouStep[];
}) {
  const all = [done, ...steps];
  const last = all.length - 1;
  const badge = (i: number) =>
    i === 0 ? "bg-success" : i === last ? "bg-brown" : "bg-orange";

  return (
    <section className="bg-white" aria-labelledby="thanks-steps-title">
      <div className={`${INNER} flex flex-col gap-[24px] py-[48px] md:gap-[32px] md:py-[72px] lg:gap-[40px] lg:py-[88px]`}>
        <div className="flex flex-col gap-[14px]" data-reveal="clip">
          <Eyebrow>{copy.eyebrow}</Eyebrow>
          <h2 id="thanks-steps-title" className={H2}>
            <AccentHeading heading={copy.title} />
          </h2>
        </div>

        {/* Phones and tablets: a vertical timeline. lg: one row with a rail. */}
        <ol
          className={[
            "relative m-0 grid list-none grid-cols-1 gap-[10px] p-0",
            all.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
            "lg:gap-[20px]",
          ].join(" ")}
          data-reveal-stagger
        >
          {all.map((step, i) => (
            <li
              key={`${i}-${step.title}`}
              className="relative flex gap-[14px] lg:flex-col lg:gap-0"
              style={{ "--i": i } as React.CSSProperties}
              aria-current={i === 0 ? "step" : undefined}
            >
              {/* Rail: down to the next badge on phones, across to it on lg. */}
              {i !== last && (
                <span
                  aria-hidden="true"
                  className={[
                    "absolute top-[44px] bottom-[-10px] left-[21px] w-[2px] lg:top-[27px] lg:right-[-20px] lg:bottom-auto lg:left-[80px] lg:h-[2px] lg:w-auto",
                    i === 0 ? "bg-success/40" : "bg-orange/30",
                  ].join(" ")}
                />
              )}
              <span
                aria-hidden="true"
                className={[
                  "relative z-1 flex size-[44px] flex-none items-center justify-center rounded-full border-white text-[13px] font-bold text-white",
                  "lg:ml-[24px] lg:size-[56px] lg:border-[6px] lg:text-[14px]",
                  badge(i),
                ].join(" ")}
              >
                {i === 0 ? <Check className="size-[20px] lg:size-[22px]" strokeWidth={3} /> : String(i).padStart(2, "0")}
              </span>
              <div
                className={[
                  "flex min-w-0 flex-1 flex-col gap-[4px] rounded-[14px] px-[16px] py-[14px] leading-[normal]",
                  "md:px-[20px] md:py-[18px] lg:mt-[18px] lg:min-h-[140px] lg:gap-[8px] lg:rounded-[18px] lg:px-[24px] lg:pt-[22px] lg:pb-[24px]",
                  i === 0 ? "border border-success/25 bg-[#eef7f1]" : "bg-peach-100",
                ].join(" ")}
              >
                <span
                  className={`text-[10.5px] font-bold tracking-[1.05px] uppercase md:text-[11.5px] ${i === 0 ? "text-success" : "text-orange"}`}
                >
                  {step.when}
                </span>
                <h3 className="m-0 text-[16px] font-bold text-ink md:text-[18px]">{step.title}</h3>
                {step.text && <p className="m-0 text-[13.5px] leading-[20px] text-slate md:text-[14.5px] md:leading-[22px]">{step.text}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ── Talk to us now + keep ready ─────────────────────────────────────────────

const card = [
  "group flex w-full items-center gap-[14px] rounded-[16px] bg-white px-[16px] py-[14px] text-inherit no-underline md:px-[18px] md:py-[16px]",
  "shadow-[0_16px_40px_0_rgba(99,36,0,0.08)] transition-transform duration-240 ease-site hover:-translate-y-[2px] focus-ring",
].join(" ");
const cardBadge = "flex size-[44px] flex-none items-center justify-center rounded-[14px] bg-orange md:size-[48px]";
const cardLabel = "text-[11px] font-bold tracking-[1.1px] text-slate";
const cardArrow =
  "flex size-[34px] flex-none items-center justify-center rounded-full bg-peach-100 transition-colors duration-160 group-hover:bg-orange group-hover:[&>svg]:text-white";

export function ThankYouActions({
  copy,
  contact,
  whatsappHref,
  whatsappText,
  opensWhatsApp,
  saveHref,
  ready,
  noFee,
}: {
  copy: ThankYouPageContent["actions"];
  contact: ContactInfo;
  whatsappHref: string | null;
  whatsappText: string;
  opensWhatsApp: string;
  /** vCard download; null hides the card (no phone number set). */
  saveHref: string | null;
  ready: { label: string; items: string[] };
  /** Workers only: the "no joining fee" warning. */
  noFee: { badge: string; title: string; text: Copy } | null;
}) {
  const external = whatsappHref?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : null;
  const arrow = (
    <span className={cardArrow} aria-hidden="true">
      <ArrowRight size={16} className="text-brown transition-colors duration-160" aria-hidden="true" />
    </span>
  );

  return (
    <section className="bg-peach-100" aria-labelledby="thanks-actions-title">
      <div
        className={`${INNER} grid grid-cols-1 gap-[28px] py-[48px] md:py-[72px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-[40px] lg:py-[88px]`}
      >
        <div className="flex flex-col gap-[14px] md:gap-[16px]">
          <div className="mb-[4px] flex flex-col gap-[14px]" data-reveal="clip">
            <Eyebrow>{copy.eyebrow}</Eyebrow>
            <h2 id="thanks-actions-title" className={H2}>
              <AccentHeading heading={copy.title} />
            </h2>
          </div>

          <div className="flex flex-col gap-[12px]" data-reveal-stagger>
            {contact.phoneHref && (
              <a href={contact.phoneHref} className={card} style={{ "--i": 0 } as React.CSSProperties}>
                <span className={cardBadge} aria-hidden="true">
                  <Phone size={21} className="text-white" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-[2px] leading-[normal]">
                  <span className={cardLabel}>{copy.callLabel}</span>
                  <span className="text-[17px] font-bold whitespace-nowrap text-orange md:text-[18px]">{contact.phoneDisplay}</span>
                  {contact.hours && (
                    <span className="flex items-center gap-[5px] text-[12.5px] font-medium text-slate">
                      <Clock size={13} className="flex-none" aria-hidden="true" />
                      {contact.hours}
                    </span>
                  )}
                </span>
                {arrow}
              </a>
            )}

            {whatsappHref && (
              <a href={whatsappHref} className={card} {...external} style={{ "--i": 1 } as React.CSSProperties}>
                <span className={`${cardBadge} bg-success`} aria-hidden="true">
                  <MessageCircle size={21} className="text-white" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-[2px] leading-[normal]">
                  <span className={cardLabel}>{copy.whatsappLabel}</span>
                  <span className="text-[16px] font-bold text-ink md:text-[17px]">{whatsappText}</span>
                </span>
                {arrow}
                {external && <span className="sr-only"> {opensWhatsApp}</span>}
              </a>
            )}

            {saveHref && (
              <a href={saveHref} download className={card} style={{ "--i": 2 } as React.CSSProperties}>
                <span className={`${cardBadge} bg-brown`} aria-hidden="true">
                  <ContactRound size={21} className="text-white" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-[2px] leading-[normal]">
                  <span className={cardLabel}>{copy.saveLabel}</span>
                  <span className="text-[16px] font-bold text-ink md:text-[17px]">{copy.saveText}</span>
                </span>
                {arrow}
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-[14px] lg:pt-[8px]">
          <div
            className="flex flex-col gap-[14px] rounded-[18px] border border-sand bg-white px-[18px] py-[20px] md:rounded-[22px] md:px-[26px] md:py-[26px]"
            data-reveal="right"
          >
            <p className="m-0 text-[12px] leading-[normal] font-bold tracking-[1.2px] text-orange uppercase">{ready.label}</p>
            <ul className="m-0 flex list-none flex-col gap-[12px] p-0">
              {ready.items.map((item) => (
                <li key={item} className="flex items-start gap-[10px] text-[14.5px] leading-[21px] font-semibold text-ink md:text-[15.5px] md:leading-[23px]">
                  <CircleCheck className="mt-[2px] size-[18px] flex-none text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {noFee && (
            <div className="flex items-center gap-[14px] rounded-[16px] bg-brown px-[16px] py-[16px] md:px-[20px]" data-reveal="right" style={reveal(120)}>
              <span
                aria-hidden="true"
                className="flex size-[44px] flex-none items-center justify-center rounded-full bg-orange text-[14px] leading-[normal] font-bold text-white"
              >
                {noFee.badge}
              </span>
              <span className="flex min-w-0 flex-col gap-[3px] leading-[normal]">
                <span className="text-[15.5px] font-bold text-white md:text-[16px]">{noFee.title}</span>
                <span className="text-[13.5px] leading-[20px] text-white/85 md:text-[14px]">
                  <Responsive copy={noFee.text} />
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── While you wait ──────────────────────────────────────────────────────────

export function ThankYouExplore({
  copy,
  links,
}: {
  copy: ThankYouPageContent["explore"];
  links: { label: string; href: string }[];
}) {
  return (
    <section className="bg-white" aria-labelledby="thanks-explore-title">
      <div className={`${INNER} py-[48px] md:py-[72px] lg:py-[88px]`}>
        <div
          className={[
            "relative isolate flex flex-col items-start gap-[18px] overflow-hidden rounded-[24px] px-[22px] pt-[30px] pb-[24px]",
            "bg-[linear-gradient(138.8deg,#f7931e_0%,#f26921_32.143%,#642301_71.429%)]",
            "md:gap-[24px] md:rounded-[28px] md:p-[48px] xl:flex-row xl:items-center xl:justify-between xl:p-[56px]",
            "xl:bg-[linear-gradient(157.21deg,#f7931e_0%,#f26921_34.615%,#642301_76.923%)]",
          ].join(" ")}
          data-reveal="zoom"
        >
          <Image
            src="/about/mandala-card.svg"
            alt=""
            width={547.64}
            height={535.74}
            className="pointer-events-none absolute top-[-160px] left-[64.06%] z-0 hidden max-w-none mix-blend-plus-lighter xl:block"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-[12px]">
            <h2
              id="thanks-explore-title"
              className="m-0 text-[28px] leading-[32px] font-bold tracking-[-0.42px] text-white md:text-[40px] md:leading-[46px] md:tracking-[-0.8px]"
            >
              {copy.title}
            </h2>
            <p className="m-0 max-w-[520px] text-[14.5px] leading-[22px] text-white/90 md:text-[17px] md:leading-[26px]">{copy.text}</p>
            {links.length > 0 && (
              <ul className="m-0 mt-[4px] flex list-none flex-wrap gap-[8px] p-0">
                {links.map((link) => (
                  <li key={`${link.label}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="focus-ring inline-flex items-center rounded-full border border-white/45 bg-white/12 px-[14px] py-[7px] text-[13.5px] leading-[normal] font-semibold text-white no-underline transition-colors duration-160 [--focus-color:#fff] hover:bg-white/22 md:text-[14px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link
            href="/"
            className="btn-base relative gap-[8px] bg-white px-[22px] text-[15.5px] text-brown [--btn-h:50px] [--focus-color:#fff] hover:bg-peach-100 max-md:w-full md:px-[26px] md:text-[16px] md:[--btn-h:54px] xl:flex-none"
          >
            {copy.home}
            <ArrowRight aria-hidden="true" className="size-[17px] flex-none text-brown md:size-[18px]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
