"use client";

import { ArrowRight, Calendar, Check, MapPin, Phone, X, type LucideIcon } from "lucide-react";
import { FaExclamation } from "react-icons/fa6";
import { usePathname, useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitLead } from "@/app/actions/leads";
import {
  HONEYPOT_FIELD,
  INITIAL_LEAD_STATE,
  MAX_HEADCOUNT,
  PAGE_PATH_FIELD,
  PAGE_TITLE_FIELD,
  SERVICES_FIELD,
  readLeadServices,
  readLeadValues,
  validateLead,
} from "@/utils/leadForm";
import type { LeadField, LeadFormCopy, LeadFormState } from "@/types/homepage";
import { UI_TEXT as t } from "@/lib/uiText";
import { useRoleSelection } from "@/components/service/RoleSelection";
import { saveThankYouNote, thankYouPath } from "@/lib/thankYou";

/** Where a sent request goes (app/thank-you/[form]). */
const THANK_YOU = thankYouPath("request");

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
  fieldIcon: "pointer-events-none absolute top-1/2 left-[14px] z-1 size-4 -translate-y-1/2 text-slate md:hidden",
  inputWithIcon: "max-md:pl-[38px]",
  status:
    "absolute top-full right-0 left-0 m-0 mt-[8px] truncate text-center text-[13px] leading-[18px] text-error empty:hidden focus:outline-none",
};

/**
 * Service pages: the roles ticked in "Roles we supply", as removable chips,
 * with a link back up to the picker to add more. Sent as hidden fields
 * (one SERVICES_FIELD per role) and saved on the lead as "Services requested".
 */
function RequestedRoles({
  selection,
  copy,
}: {
  selection: NonNullable<ReturnType<typeof useRoleSelection>>;
  copy: { title: string; edit: string; add: string; empty: string; remove: string };
}) {
  const { selectedRoles, remove, rolesSectionId } = selection;
  // Nothing to pick from (roles section hidden) and nothing picked: no block.
  if (!rolesSectionId && selectedRoles.length === 0) return null;
  const none = selectedRoles.length === 0;

  return (
    <div className="flex flex-col gap-[8px]">
      {selectedRoles.map((role) => (
        <input key={role.id} type="hidden" name={SERVICES_FIELD} value={role.name} />
      ))}
      <div className="flex items-center justify-between gap-[12px]">
        <span className="text-[13px] leading-[18px] font-semibold text-ink md:text-[14px] md:leading-[22.4px]">
          {copy.title}
          {!none && <span className="font-normal text-slate"> ({selectedRoles.length})</span>}
        </span>
        {rolesSectionId && (
          <a
            href={`#${rolesSectionId}`}
            className="focus-ring rounded-[6px] text-[13px] leading-[18px] font-semibold text-orange underline-offset-[3px] hover:underline"
          >
            {none ? copy.add : copy.edit}
          </a>
        )}
      </div>
      {none ? (
        <p className="m-0 rounded-[12px] border border-dashed border-sand px-[14px] py-[10px] text-[13px] leading-[19px] text-slate">
          {copy.empty}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-[6px] p-0" aria-label={copy.title}>
          {selectedRoles.map((role) => (
            <li
              key={role.id}
              className="flex items-center gap-[4px] rounded-full border border-orange bg-peach-100 py-[4px] pr-[4px] pl-[12px] text-[13px] leading-[18px] font-semibold text-ink"
            >
              {role.name}
              <button
                type="button"
                onClick={() => remove(role.id)}
                aria-label={copy.remove.replace("{name}", role.name)}
                className="focus-ring flex size-[22px] cursor-pointer items-center justify-center rounded-full text-slate transition-colors hover:bg-white hover:text-ink"
              >
                <X className="size-[12px]" strokeWidth={3} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
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
  /** Phones ≥420px: shares a row with the other half field (headcount + start date); narrower phones stack them so the date isn't clipped. */
  half?: boolean;
  /** Phones: leading icon inside the field. */
  icon?: LucideIcon;
}

// Two per row, in the design's order. Labels come from the admin (copy.labels).
const FIELDS: FieldConfig[] = [
  { name: "companyName", type: "text", autoComplete: "organization", required: false },
  { name: "name", type: "text", autoComplete: "name", required: true },
  { name: "phone", type: "tel", autoComplete: "tel", required: true, inputMode: "tel", maxLength: 20, icon: Phone },
  { name: "email", type: "email", autoComplete: "email", required: true, inputMode: "email", maxLength: 254 },
  { name: "siteLocation", type: "text", autoComplete: "address-level2", required: true, icon: MapPin },
  { name: "headcount", type: "number", autoComplete: "off", required: true, inputMode: "numeric", half: true },
  { name: "startDate", type: "date", autoComplete: "off", required: false, wide: true, half: true, icon: Calendar },
];

export default function LeadForm({ copy }: { copy: LeadFormCopy }) {
  // Service pages only: the roles ticked in "Roles we supply" (null on the homepage).
  const selection = useRoleSelection();
  const router = useRouter();
  // Sent: open the thank-you page. Pushed inside the action, so the button
  // keeps showing "Sending…" until the page is there.
  const [state, formAction, isPending] = useActionState(
    async (prev: LeadFormState, formData: FormData): Promise<LeadFormState> => {
      // A rejected action (offline, body too large, stale deploy) would otherwise throw to the error page.
      const next = await submitLead(prev, formData).catch(
        (): LeadFormState => ({
          status: "error",
          message: copy.errorText,
          fieldErrors: {},
          values: readLeadValues(formData),
        }),
      );
      if (next.status === "success") {
        const values = readLeadValues(formData);
        saveThankYouNote({
          form: "request",
          name: values.name,
          crew: values.headcount,
          location: values.siteLocation,
          start: values.startDate,
          tags: readLeadServices(formData),
        });
        router.push(THANK_YOU);
      }
      return next;
    },
    INITIAL_LEAD_STATE,
  );
  // Until the thank-you page has loaded.
  const sending = isPending || state.status === "success";
  const idPrefix = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const pathname = usePathname();
  // document.title only exists in the browser; it is written into this hidden
  // field at submit time, so it always matches the page the form was sent from.
  const pageTitleRef = useRef<HTMLInputElement>(null);

  // Load the thank-you page ahead, so it opens at once.
  useEffect(() => {
    router.prefetch(THANK_YOU);
  }, [router]);

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
    if (pageTitleRef.current) pageTitleRef.current.value = document.title;
    const errors = checkFields(FIELDS.map((f) => f.name));
    const first = FIELDS.find((f) => errors[f.name]);
    if (first) {
      event.preventDefault();
      formRef.current?.querySelector<HTMLInputElement>(`[name="${first.name}"]`)?.focus();
    }
  };

  const statusMessage =
    state.status === "error" && Object.keys(state.fieldErrors).length === 0 ? state.message : "";

  // After an error, move focus to it so keyboard and screen-reader users hear
  // it: the first invalid field, else the error message.
  useEffect(() => {
    if (state.status === "error") {
      const invalid = formRef.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]');
      (invalid ?? statusRef.current)?.focus();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-[1_1_auto] flex-col justify-between gap-[16px] md:gap-[14px]"
      noValidate
      onSubmit={onSubmit}
      aria-describedby={`${idPrefix}-status`}
    >
      {/* Which page the form was sent from, shown as the lead's Source in the admin. */}
      <input type="hidden" name={PAGE_PATH_FIELD} value={pathname ?? ""} />
      <input ref={pageTitleRef} type="hidden" name={PAGE_TITLE_FIELD} defaultValue="" />
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
                field.half ? "col-span-2 min-[420px]:col-span-1" : "col-span-2",
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
                {field.icon && <field.icon className={cls.fieldIcon} aria-hidden="true" />}
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
                      <FaExclamation className="size-[12px]" />
                    ) : (
                      <Check className="size-[12px]" strokeWidth={3.2} />
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

      {selection && <RequestedRoles selection={selection} copy={t.form.roles} />}

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
          disabled={sending}
          aria-busy={sending}
        >
          {sending && (
            <span
              aria-hidden="true"
              className="size-[16px] animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}
          {sending ? copy.submitting : copy.submit}
          {!sending && <ArrowRight size={18} className="text-white" aria-hidden="true" />}
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
