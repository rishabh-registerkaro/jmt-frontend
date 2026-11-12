"use client";

import { ArrowRight, Calendar, Check, Clock, MapPin, MessageCircle, Phone, User, Users, type LucideIcon } from "lucide-react";
import { useActionState, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { submitContactLead } from "@/app/actions/contactLead";
import type { ContactPageContent } from "@/data/contactPage";
import {
  CONTACT_FIELDS,
  CONTACT_SERVICES,
  HONEYPOT_FIELD,
  INITIAL_CONTACT_STATE,
  MAX_HEADCOUNT,
  readContactValues,
  validateContact,
  type ContactField,
  type ContactFormState,
} from "@/utils/contactForm";
import { Responsive } from "./Responsive";

// Figma "Enquiry form" — desktop 302:158 (two fields per row), phones 304:55
// (one per row, crew size + start date side by side).
const cls = {
  card: [
    "flex flex-col gap-[16px] rounded-[20px] border border-sand bg-white px-[18px] py-[22px] shadow-[0_12px_30px_rgba(99,36,0,0.08)]",
    "md:gap-[20px] md:rounded-[24px] md:p-[32px] md:shadow-[0_16px_40px_rgba(99,36,0,0.08)]",
  ].join(" "),
  title: "m-0 text-[21px] leading-[normal] font-bold text-ink md:text-[24px]",
  note: "m-0 text-[12.5px] leading-[normal] text-slate md:text-[13.5px]",
  label: "flex gap-[3px] text-[13.5px] leading-[normal] font-semibold text-ink md:text-[14px]",
  star: "text-[#e81d25]",
  option: [
    "relative flex cursor-pointer items-center gap-[7px] rounded-[12px] border border-sand bg-white py-[9px] pr-[12px] pl-[10px]",
    "text-[12.5px] leading-[normal] font-semibold text-ink md:gap-[8px] md:px-[12px] md:py-[11px] md:text-[13px]",
    "transition-[border-color,background-color] duration-160 hover:border-sand-line",
    "has-checked:border-[1.5px] has-checked:border-orange has-checked:bg-peach-100",
    "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-orange",
  ].join(" "),
  optionDot: [
    "flex size-[16px] flex-none items-center justify-center rounded-full border-[1.5px] border-sand bg-white md:size-[18px]",
    "group-has-checked/opt:border-0 group-has-checked/opt:bg-orange",
  ].join(" "),
  input: [
    "w-full rounded-[10px] border bg-input-bg px-[14px] py-[12px] md:rounded-[12px] md:py-[13px]",
    "font-site text-[16px] leading-[20px] text-ink xs:text-[14px] md:text-[14.5px] placeholder:text-slate/80",
    "transition-[border-color,background-color,box-shadow] duration-160 ease-[ease]",
    "hover:border-sand-line focus:bg-white focus:outline-none",
    "[&[type=number]]:[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
    // Date: the leading calendar icon replaces the native one; the invisible
    // native picker button covers the field so any tap opens the picker.
    "[&[type=date]]:relative [&[type=date]]:min-h-[46px] [&[type=date]]:appearance-none [&[type=date]]:text-left md:[&[type=date]]:min-h-[48px]",
    "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full",
    "[&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
  ].join(" "),
  inputOk: "border-sand focus:border-orange focus:[box-shadow:0_0_0_3px_rgba(242,105,33,0.18)]",
  inputBad: "border-error bg-[#fff7f9] focus:border-error focus:[box-shadow:0_0_0_3px_rgba(198,40,40,0.15)]",
  fieldIcon: "pointer-events-none absolute top-1/2 left-[14px] z-1 size-[16px] -translate-y-1/2 text-slate",
  error: "m-0 text-[12.5px] leading-[18px] text-error",
  submit:
    "btn-primary w-full gap-[8px] [--btn-h:49px] px-[20px] text-[15.5px] leading-[normal] md:w-auto md:[--btn-h:51px] md:px-[28px] md:text-[16px]",
  whatsapp:
    "flex items-center justify-center gap-[8px] rounded-[6px] text-[13.5px] leading-[normal] font-semibold text-brown no-underline focus-ring hover:underline md:text-[14px]",
  reassure:
    "flex items-center gap-[8px] rounded-[10px] bg-peach-100 px-[12px] py-[10px] text-[12.5px] leading-[normal] font-medium text-brown md:rounded-[12px] md:px-[14px] md:py-[12px] md:text-[13.5px]",
};

type InputField = Exclude<ContactField, "service" | "note">;

interface FieldConfig {
  name: InputField;
  type: "text" | "tel" | "number" | "date";
  autoComplete: string;
  inputMode?: "text" | "tel" | "numeric";
  icon?: LucideIcon;
  /** Phones: shares a row (crew size + start date). */
  half?: boolean;
}

const FIELDS: FieldConfig[] = [
  { name: "name", type: "text", autoComplete: "name", icon: User },
  { name: "companyName", type: "text", autoComplete: "organization" },
  { name: "phone", type: "tel", autoComplete: "tel", inputMode: "tel", icon: Phone },
  { name: "siteLocation", type: "text", autoComplete: "address-level2", icon: MapPin },
  { name: "headcount", type: "number", autoComplete: "off", inputMode: "numeric", icon: Users, half: true },
  { name: "startDate", type: "date", autoComplete: "off", icon: Calendar, half: true },
];

// Phones (<768px) get the design's shorter crew-size placeholder.
const PHONE_QUERY = "(max-width: 767.98px)";
function useIsPhone(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(PHONE_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(PHONE_QUERY).matches,
    // Server/first render: the short text, which fits both layouts.
    () => true,
  );
}

export default function EnquiryForm({
  copy,
  whatsappHref,
}: {
  copy: ContactPageContent["form"];
  whatsappHref: string | null;
}) {
  const [state, formAction, isPending] = useActionState(submitContactLead, INITIAL_CONTACT_STATE);
  const [dismissed, setDismissed] = useState<ContactFormState | null>(null);
  const [checked, setChecked] = useState<Partial<Record<ContactField, string | null>>>({});
  const idPrefix = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const isPhone = useIsPhone();

  const showSuccess = state.status === "success" && dismissed !== state;

  // A field is checked when the visitor leaves it, then re-checked on every
  // change so its message clears as soon as it's fixed.
  const checkFields = (fields: readonly ContactField[]) => {
    if (!formRef.current) return {};
    const errors = validateContact(readContactValues(new FormData(formRef.current)));
    setChecked((prev) => {
      const next = { ...prev };
      for (const field of fields) next[field] = errors[field] ?? null;
      return next;
    });
    return errors;
  };

  const errorFor = (field: ContactField) => (field in checked ? checked[field] ?? undefined : state.fieldErrors[field]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const errors = checkFields(CONTACT_FIELDS);
    const first = CONTACT_FIELDS.find((f) => errors[f]);
    if (first) {
      event.preventDefault();
      formRef.current?.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
    }
  };

  useEffect(() => {
    if (state.status === "success") {
      const panel = successRef.current;
      panel?.focus({ preventScroll: true });
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      panel?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    } else if (state.status === "error") {
      const invalid = formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]');
      (invalid ?? statusRef.current)?.focus();
    }
  }, [state]);

  const statusMessage = state.status === "error" && Object.keys(state.fieldErrors).length === 0 ? state.message : "";
  const serviceError = errorFor("service");
  const values = state.status === "success" ? INITIAL_CONTACT_STATE.values : state.values;

  return (
    <div id="enquiry" className={`${cls.card} scroll-mt-[84px]`}>
      <div className="flex flex-col gap-[3px] md:gap-[4px]">
        <h2 className={cls.title}>{copy.title}</h2>
        <p className={cls.note}>{copy.requiredNote}</p>
      </div>

      {showSuccess ? (
        <div
          ref={successRef}
          role="status"
          tabIndex={-1}
          className="flex flex-col items-center gap-[12px] rounded-[16px] border border-peach-line bg-[linear-gradient(160deg,var(--color-peach-50),var(--color-peach-100))] px-[20px] py-[40px] text-center focus:outline-none"
        >
          <span
            aria-hidden="true"
            className="lead-success-pop flex size-[56px] items-center justify-center rounded-full bg-success text-white shadow-[0_0_0_8px_rgba(46,125,79,0.12)]"
          >
            <Check aria-hidden="true" className="size-[26px]" strokeWidth={2.6} />
          </span>
          <p className="m-0 mt-[6px] text-[20px] leading-[1.25] font-bold text-ink md:text-[22px]">{copy.successTitle}</p>
          <p className="m-0 max-w-[380px] text-[14.5px] leading-[22px] text-slate-strong">{state.message}</p>
          <button
            type="button"
            className="btn-outline mt-[6px] [--btn-h:46px] text-[15px]"
            onClick={() => {
              setChecked({});
              setDismissed(state);
            }}
          >
            {copy.sendAnother}
          </button>
        </div>
      ) : (
        <form
          ref={formRef}
          action={formAction}
          noValidate
          onSubmit={onSubmit}
          aria-describedby={`${idPrefix}-status`}
          className="flex flex-col gap-[16px] md:gap-[20px]"
        >
          <fieldset className="m-0 flex flex-col gap-[8px] border-0 p-0" aria-describedby={serviceError ? `${idPrefix}-service-error` : undefined}>
            <legend className={`${cls.label} mb-[8px] p-0`}>
              {copy.serviceLabel}
              <span className={cls.star} aria-hidden="true">*</span>
            </legend>
            <div className="flex flex-wrap gap-[8px]">
              {CONTACT_SERVICES.map((service) => (
                <label key={service} className={`group/opt ${cls.option}`}>
                  <input
                    type="radio"
                    name="service"
                    value={service}
                    defaultChecked={values.service === service}
                    required
                    className="sr-only"
                    onChange={() => checkFields(["service"])}
                  />
                  <span className={cls.optionDot} aria-hidden="true">
                    <Check
                      aria-hidden="true"
                      strokeWidth={3}
                      className="hidden size-[9px] text-white group-has-checked/opt:block md:size-[10px]"
                    />
                  </span>
                  {copy.services[service]}
                </label>
              ))}
            </div>
            {serviceError && (
              <p id={`${idPrefix}-service-error`} className={cls.error}>
                {serviceError}
              </p>
            )}
          </fieldset>

          <div className="grid grid-cols-2 gap-x-[10px] gap-y-[16px] md:gap-x-[14px] md:gap-y-[20px]">
            {FIELDS.map((field) => {
              const inputId = `${idPrefix}-${field.name}`;
              const errorId = `${inputId}-error`;
              const error = errorFor(field.name);
              const placeholder =
                field.name === "headcount"
                  ? isPhone
                    ? copy.placeholders.headcount.mobile
                    : copy.placeholders.headcount.desktop
                  : field.name === "startDate"
                    ? undefined
                    : copy.placeholders[field.name];
              return (
                <div
                  key={field.name}
                  className={`flex min-w-0 flex-col gap-[6px] md:col-span-1 md:gap-[7px] ${field.half ? "col-span-2 min-[420px]:col-span-1" : "col-span-2"}`}
                >
                  <label htmlFor={inputId} className={cls.label}>
                    {copy.labels[field.name]}
                    <span className={cls.star} aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    {field.icon && <field.icon aria-hidden="true" className={cls.fieldIcon} />}
                    <input
                      id={inputId}
                      name={field.name}
                      type={field.type}
                      inputMode={field.inputMode}
                      autoComplete={field.autoComplete}
                      required
                      defaultValue={values[field.name]}
                      placeholder={placeholder}
                      min={field.type === "number" ? 1 : undefined}
                      max={field.type === "number" ? MAX_HEADCOUNT : undefined}
                      maxLength={field.type === "tel" ? 20 : undefined}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? errorId : undefined}
                      onBlur={() => checkFields([field.name])}
                      onChange={() => {
                        if (field.name in checked) checkFields([field.name]);
                      }}
                      className={[cls.input, error ? cls.inputBad : cls.inputOk, field.icon ? "pl-[38px]" : ""].join(" ")}
                    />
                  </div>
                  {/* Always rendered so the live region exists before the message arrives. */}
                  <p id={errorId} className={error ? cls.error : "sr-only"} aria-live="polite">
                    {error}
                  </p>
                </div>
              );
            })}

            <div className="col-span-2 flex flex-col gap-[6px] md:gap-[7px]">
              <label htmlFor={`${idPrefix}-note`} className={cls.label}>
                {copy.labels.note}
              </label>
              <textarea
                id={`${idPrefix}-note`}
                name="note"
                maxLength={1000}
                defaultValue={values.note}
                placeholder={copy.placeholders.note}
                className={`${cls.input} ${cls.inputOk} h-[76px] resize-y md:h-[84px]`}
              />
            </div>
          </div>

          {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor={`${idPrefix}-${HONEYPOT_FIELD}`}>{copy.honeypot}</label>
            <input id={`${idPrefix}-${HONEYPOT_FIELD}`} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="flex flex-col gap-[16px] md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-[12px]">
            <button type="submit" className={cls.submit} disabled={isPending} aria-busy={isPending}>
              {isPending && (
                <span aria-hidden="true" className="size-[16px] animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isPending ? copy.submitting : copy.submit}
              {!isPending && (
                <ArrowRight aria-hidden="true" className="size-[17px] flex-none text-white md:size-[18px]" />
              )}
            </button>
            {whatsappHref && (
              <a
                href={whatsappHref}
                className={cls.whatsapp}
                {...(whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                <MessageCircle aria-hidden="true" className="size-[16px] flex-none text-brown md:size-[17px]" />
                <Responsive desktop={copy.whatsapp.desktop} mobile={copy.whatsapp.mobile} />
              </a>
            )}
          </div>

          <p
            id={`${idPrefix}-status`}
            ref={statusRef}
            tabIndex={-1}
            role={statusMessage ? "alert" : undefined}
            className="m-0 text-center text-[13px] leading-[18px] text-error empty:hidden focus:outline-none"
          >
            {statusMessage}
          </p>
        </form>
      )}

      <p className={`m-0 ${cls.reassure}`}>
        <Clock aria-hidden="true" className="size-[15px] flex-none text-orange md:size-[16px]" />
        <Responsive desktop={copy.reassurance.desktop} mobile={copy.reassurance.mobile} />
      </p>
    </div>
  );
}
