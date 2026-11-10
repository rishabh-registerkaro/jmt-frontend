"use client";

import Image from "next/image";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitLead } from "@/app/actions/leads";
import { HONEYPOT_FIELD, INITIAL_LEAD_STATE, MAX_HEADCOUNT } from "@/utils/leadForm";
import type { LeadField, LeadFormState } from "@/types/homepage";

const cls = {
  input: [
    "h-[50px] w-full px-[19px] rounded-full border bg-input-bg",
    "font-site text-[15px] text-ink",
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
    "flex flex-[1_1_auto] flex-col items-start justify-center gap-[10px]",
    "p-[24px] rounded-[12px] bg-peach-100 focus:outline-none",
  ].join(" "),
};

interface FieldConfig {
  name: LeadField;
  label: string;
  type: "text" | "tel" | "number" | "date";
  autoComplete: string;
  required: boolean;
  inputMode?: "text" | "tel" | "numeric";
}

// Two per row, in the design's order.
const FIELDS: FieldConfig[] = [
  { name: "companyName", label: "Company name", type: "text", autoComplete: "organization", required: false },
  { name: "name", label: "Your name", type: "text", autoComplete: "name", required: true },
  { name: "phone", label: "Phone / WhatsApp", type: "tel", autoComplete: "tel", required: true, inputMode: "tel" },
  { name: "siteLocation", label: "Site location", type: "text", autoComplete: "address-level2", required: true },
  { name: "headcount", label: "Headcount", type: "number", autoComplete: "off", required: true, inputMode: "numeric" },
  { name: "startDate", label: "Start date", type: "date", autoComplete: "off", required: false },
];

export default function LeadForm() {
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
      successRef.current?.focus();
    } else if (state.status === "error") {
      const invalid = formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]');
      (invalid ?? statusRef.current)?.focus();
    }
  }, [state]);

  if (showSuccess) {
    return (
      <div ref={successRef} className={cls.success} role="status" tabIndex={-1}>
        <p className="m-0 text-[22px] leading-[1.25] font-bold tracking-[-0.2px] text-success">Request received</p>
        <p className="m-0 text-[15px] leading-[24px] text-ink">{state.message}</p>
        <button
          type="button"
          className="btn-outline [--btn-h:46px] mt-[8px] text-[15px]"
          onClick={() => setDismissed(state)}
        >
          Send another request
        </button>
      </div>
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
      <div className="grid grid-cols-1 gap-[16px] xs:grid-cols-2">
        {FIELDS.map((field) => {
          const inputId = `${idPrefix}-${field.name}`;
          const errorId = `${inputId}-error`;
          const error = state.fieldErrors[field.name];
          return (
            <div key={field.name} className="flex flex-col gap-[6px]">
              <label htmlFor={inputId} className="text-[14px] leading-[22.4px] font-semibold text-ink">
                {field.label}
                {!field.required && <span className="font-normal text-slate"> (optional)</span>}
              </label>
              <input
                id={inputId}
                name={field.name}
                type={field.type}
                inputMode={field.inputMode}
                autoComplete={field.autoComplete}
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
        <label htmlFor={`${idPrefix}-${HONEYPOT_FIELD}`}>Leave this field empty</label>
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
        {isPending ? "Sending…" : "Request workers"}
        {!isPending && <Image src="/homepage/icon-arrow-right-white-form.svg" alt="" width={18} height={18} />}
      </button>
    </form>
  );
}
