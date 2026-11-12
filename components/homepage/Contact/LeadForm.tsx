"use client";

import Image from "next/image";
import { useActionState, useEffect, useId, useRef, useState, type RefObject } from "react";
import { submitLead } from "@/app/actions/leads";
import {
  HONEYPOT_FIELD,
  INITIAL_LEAD_STATE,
  LOCALE_FIELD,
  MAX_HEADCOUNT,
  readLeadValues,
  validateLead,
} from "@/utils/leadForm";
import type { LeadField, LeadFormCopy, LeadFormState } from "@/types/homepage";
import { useLanguage } from "@/components/i18n/LanguageProvider";

const cls = {
  // Mobile (<768, Figma "Homepage — Mobile 390"): 45px rounded-rect fields, sand border.
  input: [
    "h-[45px] w-full px-[14px] rounded-[10px] border bg-input-bg md:h-[50px] md:px-[19px] md:rounded-full",
    "placeholder:text-slate/80",
    // 16px on phones stops iOS Safari from zooming the page when a field is focused.
    "font-site text-[16px] xs:text-[15px] text-ink",
    // iOS renders empty/filled date inputs centred and collapsed; keep them like the other pills.
    "[&[type=date]]:appearance-none [&[type=date]]:text-left [&::-webkit-date-and-time-value]:text-left",
    // Phones: the leading calendar icon replaces the native one; the invisible
    // native picker button covers the whole field so any tap opens it.
    "max-md:[&[type=date]]:relative max-md:[&::-webkit-calendar-picker-indicator]:absolute max-md:[&::-webkit-calendar-picker-indicator]:inset-0",
    "max-md:[&::-webkit-calendar-picker-indicator]:h-full max-md:[&::-webkit-calendar-picker-indicator]:w-full max-md:[&::-webkit-calendar-picker-indicator]:opacity-0",
    "transition-[border-color,background-color,box-shadow] duration-160 ease-[ease]",
    "hover:border-pill-line focus:bg-white focus:outline-none",
    // Number spinners add clutter to a pill input.
    "[&[type=number]]:[appearance:textfield]",
    "[&[type=number]::-webkit-inner-spin-button]:m-0 [&[type=number]::-webkit-inner-spin-button]:appearance-none",
    "[&[type=number]::-webkit-outer-spin-button]:m-0 [&[type=number]::-webkit-outer-spin-button]:appearance-none",
  ].join(" "),
  inputValid: "border-sand md:border-input-line focus:border-orange focus:[box-shadow:0_0_0_3px_rgba(242,105,33,0.18)]",
  inputInvalid:
    "border-error bg-[#fff7f7] focus:border-error focus:[box-shadow:0_0_0_3px_rgba(198,40,40,0.15)]",
  // Room on the right for the ✓ / ! badge (not on date inputs: the picker icon lives there).
  inputBadge: "pr-[44px]",
  badge:
    "pointer-events-none absolute top-1/2 right-[16px] flex size-[20px] -translate-y-1/2 items-center justify-center rounded-full text-white",
  // Fixed one-line slot under every field from md up: messages appear without
  // moving anything. Phones collapse the empty slot to keep the design's spacing.
  error:
    "m-0 flex h-[18px] min-w-0 items-center gap-[5px] pl-[14px] text-[12.5px] leading-[18px] text-error max-md:empty:hidden",
  // Leading 16px icon inside phone / location / date fields (phones only).
  fieldIcon: "pointer-events-none absolute top-1/2 left-[14px] z-1 size-4 -translate-y-1/2 md:hidden",
  inputWithIcon: "max-md:pl-[38px]",
  status:
    "absolute top-full right-0 left-0 m-0 mt-[8px] truncate text-center text-[13px] leading-[18px] text-error empty:hidden focus:outline-none",
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
  /** Phones: shares a row with the other half field (headcount + start date). */
  half?: boolean;
  /** Phones: leading icon inside the field. */
  icon?: string;
}

// Two per row, in the design's order. Labels come from the admin (copy.labels).
const FIELDS: FieldConfig[] = [
  { name: "companyName", type: "text", autoComplete: "organization", required: false },
  { name: "name", type: "text", autoComplete: "name", required: true },
  { name: "phone", type: "tel", autoComplete: "tel", required: true, inputMode: "tel", maxLength: 20, icon: "/homepage/m/field-phone.svg" },
  { name: "email", type: "email", autoComplete: "email", required: true, inputMode: "email", maxLength: 254 },
  { name: "siteLocation", type: "text", autoComplete: "address-level2", required: true, icon: "/homepage/m/field-pin.svg" },
  { name: "headcount", type: "number", autoComplete: "off", required: true, inputMode: "numeric", half: true },
  { name: "startDate", type: "date", autoComplete: "off", required: false, wide: true, half: true, icon: "/homepage/m/field-cal.svg" },
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

  // Live validation: a field is checked when the visitor leaves it, then
  // re-checked on every keystroke so the message clears as soon as it's fixed.
  // `checked[field]` = the current message, or null when valid. Fields not
  // checked yet fall back to the server's verdict from the last submit.
  const [checked, setChecked] = useState<Partial<Record<LeadField, string | null>>>({});
  const [filled, setFilled] = useState<Partial<Record<LeadField, boolean>>>({});

  const checkFields = (fields: readonly LeadField[]) => {
    if (!formRef.current) return {};
    const values = readLeadValues(new FormData(formRef.current));
    const errors = validateLead(values);
    setChecked((prev) => {
      const next = { ...prev };
      for (const field of fields) next[field] = errors[field] ?? null;
      return next;
    });
    setFilled((prev) => {
      const next = { ...prev };
      for (const field of fields) next[field] = values[field] !== "";
      return next;
    });
    return errors;
  };

  const errorFor = (field: LeadField) =>
    field in checked ? checked[field] ?? undefined : state.fieldErrors[field];

  // Submitting runs every check first; invalid → stay here and focus the first problem.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const errors = checkFields(FIELDS.map((f) => f.name));
    const first = FIELDS.find((f) => errors[f.name]);
    if (first) {
      event.preventDefault();
      formRef.current?.querySelector<HTMLInputElement>(`[name="${first.name}"]`)?.focus();
    }
  };

  const statusMessage =
    state.status === "error" && Object.keys(state.fieldErrors).length === 0 ? state.message : "";

  const resetForm = () => {
    setChecked({});
    setFilled({});
    setDismissed(state);
  };

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
        onReset={resetForm}
      />
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-[1_1_auto] flex-col justify-between gap-[16px] md:gap-[14px]"
      noValidate
      onSubmit={onSubmit}
      aria-describedby={`${idPrefix}-status`}
    >
      <input type="hidden" name={LOCALE_FIELD} value={locale} />
      <div className="grid grid-cols-2 gap-x-[10px] gap-y-[16px] md:gap-x-[16px] md:gap-y-[4px]">
        {FIELDS.map((field) => {
          const inputId = `${idPrefix}-${field.name}`;
          const errorId = `${inputId}-error`;
          const error = errorFor(field.name);
          const valid = checked[field.name] === null && filled[field.name];
          const hasBadge = field.type !== "date";
          return (
            <div
              key={field.name}
              className={[
                "flex min-w-0 flex-col gap-[6px]",
                field.half ? "col-span-1" : "col-span-2",
                field.wide ? "md:col-span-2" : "md:col-span-1",
              ].join(" ")}
            >
              <label
                htmlFor={inputId}
                className="text-[13px] leading-[18px] font-semibold text-ink md:text-[14px] md:leading-[22.4px]"
              >
                {copy.labels[field.name]}
                {!field.required && copy.optionalHint && (
                  <span className="font-normal text-slate"> {copy.optionalHint}</span>
                )}
              </label>
              <div className="relative">
                {field.icon && <Image src={field.icon} alt="" width={16} height={16} className={cls.fieldIcon} />}
                <input
                  id={inputId}
                  name={field.name}
                  type={field.type}
                  inputMode={field.inputMode}
                  autoComplete={field.autoComplete}
                  maxLength={field.maxLength}
                  required={field.required}
                  defaultValue={state.values[field.name]}
                  placeholder={(t.form.placeholders as Partial<Record<LeadField, string>>)[field.name]}
                  min={field.type === "number" ? 1 : undefined}
                  max={field.type === "number" ? MAX_HEADCOUNT : undefined}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  onBlur={() => checkFields([field.name])}
                  onChange={() => {
                    if (field.name in checked) checkFields([field.name]);
                  }}
                  className={[
                    cls.input,
                    error ? cls.inputInvalid : cls.inputValid,
                    hasBadge ? cls.inputBadge : "",
                    field.icon ? cls.inputWithIcon : "",
                  ].join(" ")}
                />
                {hasBadge && (error || valid) && (
                  <span aria-hidden="true" className={`${cls.badge} ${error ? "bg-error" : "bg-success"}`}>
                    {error ? (
                      <svg viewBox="0 0 20 20" className="size-[12px]" fill="currentColor">
                        <rect x="9" y="4" width="2.4" height="8" rx="1.2" />
                        <circle cx="10.2" cy="15.2" r="1.4" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="size-[12px]" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    )}
                  </span>
                )}
              </div>
              {/* Always rendered, fixed height: an error never pushes the layout. */}
              <p id={errorId} className={cls.error} aria-live="polite">
                {error && (
                  <span className="truncate" title={error}>
                    {error}
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={`${idPrefix}-${HONEYPOT_FIELD}`}>{t.form.honeypot}</label>
        <input id={`${idPrefix}-${HONEYPOT_FIELD}`} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* The status line floats under the button (in the card's bottom padding),
          so a send failure doesn't change the form's height either. Field
          problems are already shown on the fields, so only other errors appear. */}
      <div className="relative">
        <button
          type="submit"
          className="btn-primary w-full max-md:py-[14px] max-md:text-[15.5px] max-md:leading-[21px] max-md:[--btn-h:49px]"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending && (
            <span
              aria-hidden="true"
              className="size-[16px] animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}
          {isPending ? copy.submitting : copy.submit}
          {!isPending && <Image src="/homepage/icon-arrow-right-white-form.svg" alt="" width={18} height={18} />}
        </button>
        <p
          id={`${idPrefix}-status`}
          ref={statusRef}
          tabIndex={-1}
          className={cls.status}
          role={statusMessage ? "alert" : undefined}
          title={statusMessage || undefined}
        >
          {statusMessage}
        </p>
      </div>
    </form>
  );
}
