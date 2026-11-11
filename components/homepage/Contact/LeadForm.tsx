"use client";

import Image from "next/image";
import { useActionState, useEffect, useId, useRef, useState, type RefObject } from "react";
import { submitLead } from "@/app/actions/leads";
import { HONEYPOT_FIELD, INITIAL_LEAD_STATE, LOCALE_FIELD, MAX_HEADCOUNT } from "@/utils/leadForm";
import type { LeadField, LeadFormCopy, LeadFormState } from "@/types/homepage";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const cls = {
  input: [
    "h-[50px] w-full px-[19px] rounded-full border bg-input-bg",
    // 16px on phones stops iOS Safari from zooming the page when a field is focused.
    "font-site text-[16px] xs:text-[15px] text-ink",
    // iOS renders empty/filled date inputs centred and collapsed; keep them like the other pills.
    "[&[type=date]]:appearance-none [&[type=date]]:text-left [&::-webkit-date-and-time-value]:text-left",
    "transition-[border-color,background-color,box-shadow] duration-160 ease-[ease]",
    "hover:border-pill-line focus:bg-white focus:outline-none",
    // Number spinners add clutter to a pill input.
    "[&[type=number]]:[appearance:textfield]",
    "[&[type=number]::-webkit-inner-spin-button]:m-0 [&[type=number]::-webkit-inner-spin-button]:appearance-none",
    "[&[type=number]::-webkit-outer-spin-button]:m-0 [&[type=number]::-webkit-outer-spin-button]:appearance-none",
  ].join(" "),
  inputValid: "border-input-line focus:border-orange focus:[box-shadow:0_0_0_3px_rgba(242,105,33,0.18)]",
  inputInvalid: "border-error focus:border-error focus:[box-shadow:0_0_0_3px_rgba(198,40,40,0.15)]",
  status: "m-0 text-[14px] leading-[20px] empty:hidden focus:outline-none",
  success: [
    "relative flex flex-[1_1_auto] flex-col items-center justify-center gap-[10px] xs:gap-[12px] overflow-hidden",
    "min-h-[340px] px-[18px] py-[32px] xs:px-[24px] xs:py-[40px] rounded-[16px] text-center",
    "bg-[linear-gradient(160deg,var(--color-peach-50)_0%,var(--color-peach-100)_100%)]",
    "border border-peach-line focus:outline-none",
  ].join(" "),
};

/** Seconds the thank-you panel stays up before the empty form comes back. */
const RESET_AFTER_S = 30;

function SuccessPanel({
  panelRef,
  title,
  message,
  resetLabel,
  resetInText,
  onReset,
}: {
  panelRef: RefObject<HTMLDivElement | null>;
  title: string;
  message: string;
  resetLabel: string;
  resetInText: string;
  onReset: () => void;
}) {
  const [left, setLeft] = useState(RESET_AFTER_S);
  const onResetRef = useRef(onReset);
  useEffect(() => {
    onResetRef.current = onReset;
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft((s) => Math.max(0, s - 1));
    }, 1000);
    const done = window.setTimeout(() => onResetRef.current(), RESET_AFTER_S * 1000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(done);
    };
  }, []);

  const progress = left / RESET_AFTER_S;

  return (
    <div ref={panelRef} className={cls.success} role="status" tabIndex={-1}>
      <span
        aria-hidden="true"
        className="lead-success-pop flex size-[56px] xs:size-[64px] items-center justify-center rounded-full bg-success text-white shadow-[0_0_0_7px_rgba(46,125,79,0.12)] xs:shadow-[0_0_0_8px_rgba(46,125,79,0.12)]"
      >
        <svg className="size-[26px] xs:size-[30px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <p className="m-0 mt-[8px] text-[20px] xs:text-[24px] leading-[1.25] font-bold tracking-[-0.3px] text-ink text-balance">
        {title}
      </p>
      <p className="m-0 max-w-[380px] text-[14.5px] leading-[22px] xs:text-[15px] xs:leading-[24px] text-slate-strong text-pretty">
        {message}
      </p>
      <button
        type="button"
        className="btn-outline [--btn-h:48px] mt-[8px] w-full max-w-[300px] text-[15px] xs:w-auto"
        onClick={onReset}
      >
        {resetLabel}
      </button>
      <div className="mt-[4px] flex w-full max-w-[220px] flex-col items-center gap-[6px]" aria-hidden="true">
        <div className="h-[4px] w-full overflow-hidden rounded-full bg-peach-200/60">
          <div
            className="h-full rounded-full bg-orange transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="m-0 text-[12px] leading-[16px] text-slate">{resetInText.replace("{s}", String(left))}</p>
      </div>
    </div>
  );
}

interface FieldConfig {
  name: LeadField;
  type: "text" | "tel" | "email" | "number" | "date";
  autoComplete: string;
  required: boolean;
  inputMode?: "text" | "tel" | "email" | "numeric";
  maxLength?: number;
  /** Spans both columns (keeps the grid even with an odd field count). */
  wide?: boolean;
}

// Two per row, in the design's order. Labels come from the admin (copy.labels).
const FIELDS: FieldConfig[] = [
  { name: "companyName", type: "text", autoComplete: "organization", required: false },
  { name: "name", type: "text", autoComplete: "name", required: true },
  { name: "phone", type: "tel", autoComplete: "tel", required: true, inputMode: "tel", maxLength: 20 },
  { name: "email", type: "email", autoComplete: "email", required: true, inputMode: "email", maxLength: 254 },
  { name: "siteLocation", type: "text", autoComplete: "address-level2", required: true },
  { name: "headcount", type: "number", autoComplete: "off", required: true, inputMode: "numeric" },
  { name: "startDate", type: "date", autoComplete: "off", required: false, wide: true },
];

export default function LeadForm({ copy }: { copy: LeadFormCopy }) {
  const { locale, t } = useLanguage();
  const [state, formAction, isPending] = useActionState(submitLead, INITIAL_LEAD_STATE);
  const [dismissed, setDismissed] = useState<LeadFormState | null>(null);
  const idPrefix = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const showSuccess = state.status === "success" && dismissed !== state;

  // Move focus to the outcome so keyboard and screen-reader users hear it:
  // the success panel, else the first invalid field, else the error message.
  useEffect(() => {
    if (state.status === "success") {
      // On phones the long form collapses into the shorter panel, which can leave it
      // above the viewport; bring it into view instead of letting focus jump.
      const panel = successRef.current;
      panel?.focus({ preventScroll: true });
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    } else if (state.status === "error") {
      const invalid = formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]');
      (invalid ?? statusRef.current)?.focus();
    }
  }, [state]);

  if (showSuccess) {
    return (
      <SuccessPanel
        panelRef={successRef}
        title={copy.successTitle}
        message={state.message}
        resetLabel={copy.resetLabel}
        resetInText={t.form.resetIn}
        onReset={() => setDismissed(state)}
      />
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-[1_1_auto] flex-col justify-between gap-[16px]"
      noValidate
      aria-describedby={`${idPrefix}-status`}
    >
      <input type="hidden" name={LOCALE_FIELD} value={locale} />
      <div className="grid grid-cols-1 gap-[16px] xs:grid-cols-2">
        {FIELDS.map((field) => {
          const inputId = `${idPrefix}-${field.name}`;
          const errorId = `${inputId}-error`;
          const error = state.fieldErrors[field.name];
          return (
            <div key={field.name} className={`flex flex-col gap-[6px]${field.wide ? " xs:col-span-2" : ""}`}>
              <label htmlFor={inputId} className="text-[14px] leading-[22.4px] font-semibold text-ink">
                {copy.labels[field.name]}
                {!field.required && copy.optionalHint && (
                  <span className="font-normal text-slate"> {copy.optionalHint}</span>
                )}
              </label>
              <input
                id={inputId}
                name={field.name}
                type={field.type}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete}
                maxLength={field.maxLength}
                required={field.required}
                defaultValue={state.values[field.name]}
                min={field.type === "number" ? 1 : undefined}
                max={field.type === "number" ? MAX_HEADCOUNT : undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={`${cls.input} ${error ? cls.inputInvalid : cls.inputValid}`}
              />
              {error && (
                <p id={errorId} className="m-0 pl-[12px] text-[13px] leading-[18px] text-error">
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`${idPrefix}-${HONEYPOT_FIELD}`}>{t.form.honeypot}</label>
        <input id={`${idPrefix}-${HONEYPOT_FIELD}`} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <p
        id={`${idPrefix}-status`}
        ref={statusRef}
        tabIndex={-1}
        className={state.status === "error" ? `${cls.status} text-error` : cls.status}
        role={state.status === "error" ? "alert" : undefined}
      >
        {state.status === "error" ? state.message : ""}
      </p>

      <button type="submit" className="btn-primary mt-[4px] w-full" disabled={isPending} aria-busy={isPending}>
        {isPending ? copy.submitting : copy.submit}
        {!isPending && <Image src="/homepage/icon-arrow-right-white-form.svg" alt="" width={18} height={18} />}
      </button>
    </form>
  );
}
