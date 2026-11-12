"use client";

import { ArrowRight, Check, Clock, MapPin, Phone, User } from "lucide-react";
import Image from "next/image";
import { useActionState, useEffect, useRef } from "react";
import { submitJoinApplication } from "@/app/actions/joinApplication";
import { JOIN_PAGE } from "@/data/joinPage";
import { HONEYPOT_FIELD, INITIAL_JOIN_STATE, type JoinField, type JoinFormValues } from "@/utils/joinForm";

type FormCopy = (typeof JOIN_PAGE)["form"];

interface ApplicationFormProps {
  copy: FormCopy;
  /** WhatsApp link from the admin's contact details (falls back to the section anchor). */
  whatsappHref: string;
  /** Screen-reader note for links that open WhatsApp in a new tab. */
  opensWhatsApp: string;
}

// Figma "Application form" — desktop 312:105 (white card, 32px padding, name
// and phone side by side, district beside the language chips), mobile 313:262
// (every field stacked). Choices are radio/checkbox inputs styled as chips;
// a chosen chip turns peach with an orange ring and a check badge.
const cls = {
  card: [
    "flex min-w-0 flex-col gap-[18px] rounded-[20px] border border-sand bg-white px-[18px] py-[22px]",
    "shadow-[0_12px_30px_0_rgba(99,36,0,0.08)]",
    "md:gap-[22px] md:rounded-[24px] md:p-[32px] md:shadow-[0_16px_40px_0_rgba(99,36,0,0.08)] lg:flex-1",
  ].join(" "),
  head: "flex flex-col gap-[4px] leading-[normal]",
  title: "m-0 hidden text-[24px] font-bold text-ink md:block",
  required: "m-0 text-[12.5px] text-slate md:text-[13.5px]",
  row: "flex flex-col gap-[18px] md:flex-row md:gap-[14px]",
  field: "flex min-w-0 flex-col gap-[7px] md:flex-1 md:gap-[8px]",
  group: "m-0 flex min-w-0 flex-col gap-[9px] border-0 p-0 md:gap-[10px]",
  label: "flex gap-[3px] text-[14px] leading-[normal] font-semibold text-ink md:text-[14.5px]",
  star: "text-[#e81d25]",
  inputWrap: [
    "flex items-center gap-[8px] rounded-[12px] border border-sand bg-input-bg px-[14px]",
    "focus-within:border-orange focus-within:[box-shadow:0_0_0_3px_rgba(242,105,33,0.18)]",
  ].join(" "),
  input: [
    "h-[48.5px] min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] text-ink md:text-[15px] outline-none",
    "placeholder:text-[rgba(90,107,128,0.8)]",
  ].join(" "),
  chips: "flex flex-wrap gap-[8px]",
  chip: [
    "relative flex cursor-pointer items-center gap-[6px] rounded-full border border-sand bg-white py-[11px] pr-[14px] pl-[12px]",
    "text-[14px] leading-[normal] font-semibold whitespace-nowrap text-ink select-none",
    "md:py-[10px] md:pr-[16px] md:pl-[14px] md:text-[14.5px]",
    "transition-colors duration-160 hover:border-orange/50",
    // Chosen: peach fill, 1.5px orange ring (inset shadow keeps the size steady).
    "has-[:checked]:border-orange has-[:checked]:bg-peach-100 has-[:checked]:shadow-[inset_0_0_0_0.5px_var(--color-orange)]",
    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange",
  ].join(" "),
  chipCheck: "hidden size-[18px] flex-none items-center justify-center rounded-full bg-orange peer-checked:flex",
  error: "m-0 text-[12.5px] leading-[normal] font-medium text-error",
  consent: "flex cursor-pointer items-start gap-[10px] md:items-center",
  box: [
    "flex size-[22px] flex-none items-center justify-center rounded-[6px] border-[1.5px] border-sand bg-white",
    "peer-checked:border-orange peer-checked:bg-orange",
    "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-orange",
  ].join(" "),
  submit: [
    "btn-primary w-full gap-[10px] px-[20px] text-[16.5px] font-bold [--btn-h:56.5px]",
    "md:px-[24px] md:text-[17px] md:[--btn-h:59.2px]",
  ].join(" "),
  note: "m-0 flex items-center justify-center gap-[6px] text-center text-[13px] leading-[normal] font-medium text-brown md:gap-[8px] md:text-[14px]",
  banner: "m-0 rounded-[12px] px-[14px] py-[12px] text-[14px] leading-[20px] font-medium",
  // Figma "State — Application sent" 312:293: the card keeps its frame, the
  // form is replaced by a centred check badge, heading, note and WhatsApp link.
  sent: [
    "flex min-w-0 flex-col items-center gap-[14px] rounded-[20px] border border-sand bg-white px-[20px] py-[32px] text-center outline-none",
    "shadow-[0_12px_30px_0_rgba(99,36,0,0.08)]",
    "md:gap-[16px] md:rounded-[24px] md:p-[40px] md:shadow-[0_16px_40px_0_rgba(99,36,0,0.08)] lg:flex-1",
  ].join(" "),
  sentBadge: "lead-success-pop flex size-[60px] flex-none items-center justify-center rounded-full bg-orange md:size-[72px]",
  sentTitle: "m-0 text-[26px] leading-[normal] font-bold text-ink md:text-[30px]",
  sentText: "m-0 max-w-[480px] text-[15.5px] leading-[24px] text-slate md:text-[16.5px] md:leading-[26px]",
  sentWhatsApp: "btn-outline gap-[8px] border-[1.2px] pr-[20px] pl-[18px] text-[14.5px] font-semibold [--btn-h:46px] md:text-[15px]",
};

function Label({ htmlFor, children, required = true }: { htmlFor?: string; children: React.ReactNode; required?: boolean }) {
  const Tag = htmlFor ? "label" : "span";
  return (
    <Tag {...(htmlFor ? { htmlFor } : {})} className={cls.label}>
      {children}
      {required && (
        <span className={cls.star} aria-hidden="true">
          *
        </span>
      )}
    </Tag>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className={cls.error} role="alert">
      {message}
    </p>
  );
}

function Chip({
  type,
  name,
  value,
  label,
  defaultChecked,
  required,
  lang,
}: {
  type: "radio" | "checkbox";
  name: JoinField;
  value: string;
  label: string;
  defaultChecked: boolean;
  required?: boolean;
  lang?: string;
}) {
  return (
    <label className={cls.chip} lang={lang}>
      <input
        type={type}
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        required={required}
        className="peer sr-only"
      />
      <span className={cls.chipCheck} aria-hidden="true">
        <Check size={10} strokeWidth={3} className="text-white" aria-hidden="true" />
      </span>
      {label}
    </label>
  );
}

const LANGUAGE_TAGS: Record<string, string> = { Bengali: "bn", Hindi: "hi", English: "en" };

export default function ApplicationForm({ copy, whatsappHref, opensWhatsApp }: ApplicationFormProps) {
  const [state, formAction, pending] = useActionState(submitJoinApplication, INITIAL_JOIN_STATE);
  const showSuccess = state.status === "success";
  const errors = state.fieldErrors;
  // After an error the form remounts (key) with what the visitor sent.
  const values: JoinFormValues =
    state.status === "error" ? state.values : INITIAL_JOIN_STATE.values;
  const chosenLanguages = new Set(values.languages.split(", ").filter(Boolean));
  const describe = (field: JoinField) => (errors[field] ? { "aria-invalid": true, "aria-describedby": `join-${field}-error` } : {});

  // After a reply, move focus where keyboard and screen-reader users need it:
  // the first invalid field (or the first input of an invalid group), or the
  // success message.
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "success") {
      successRef.current?.focus();
      return;
    }
    if (state.status !== "error") return;
    const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    const target = invalid?.matches("input, select, textarea")
      ? invalid
      : invalid?.querySelector<HTMLElement>("input, select, textarea");
    (target ?? formRef.current?.querySelector<HTMLElement>("#join-form-status"))?.focus();
  }, [state]);

  if (showSuccess) {
    const external = whatsappHref.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};
    return (
      <div ref={successRef} className={cls.sent} role="status" tabIndex={-1}>
        <span className={cls.sentBadge} aria-hidden="true">
          <Image src="/join/icon-check.svg" alt="" width={36} height={36} className="size-[30px] md:size-[36px]" />
        </span>
        <h3 className={cls.sentTitle}>{copy.messages.successTitle}</h3>
        <p className={cls.sentText}>{state.message}</p>
        <a href={whatsappHref} className={cls.sentWhatsApp} {...external}>
          <Image src="/join/icon-msg.svg" alt="" width={17} height={17} className="size-[17px] flex-none" aria-hidden="true" />
          {copy.messages.whatsapp}
          {"target" in external && <span className="sr-only"> {opensWhatsApp}</span>}
        </a>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      key={state.status === "error" ? JSON.stringify(state.values) : "fresh"}
      action={formAction}
      className={cls.card}
      noValidate
      aria-describedby={state.status === "error" ? "join-form-status" : undefined}
    >
      <div className={cls.head}>
        <h3 className={cls.title}>{copy.title}</h3>
        <p className={cls.required}>{copy.required}</p>
      </div>

      {state.status === "error" && state.message && (
        <p id="join-form-status" className={`${cls.banner} bg-[#fdecea] text-error`} role="alert">
          {state.message}
        </p>
      )}

      {/* Honeypot: hidden from people and assistive tech, filled only by bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor={`join-${HONEYPOT_FIELD}`}>Leave this field empty</label>
        <input id={`join-${HONEYPOT_FIELD}`} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={cls.row}>
        <div className={cls.field}>
          <Label htmlFor="join-name">{copy.labels.name}</Label>
          <div className={cls.inputWrap}>
            <User size={17} className="flex-none text-slate" aria-hidden="true" />
            <input
              id="join-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder={copy.placeholders.name}
              defaultValue={values.name}
              required
              maxLength={100}
              className={cls.input}
              {...describe("name")}
            />
          </div>
          <FieldError id="join-name-error" message={errors.name} />
        </div>
        <div className={cls.field}>
          <Label htmlFor="join-phone">{copy.labels.phone}</Label>
          <div className={cls.inputWrap}>
            <Phone size={17} className="flex-none text-slate" aria-hidden="true" />
            <input
              id="join-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={copy.placeholders.phone}
              defaultValue={values.phone}
              required
              maxLength={20}
              className={cls.input}
              {...describe("phone")}
            />
          </div>
          <FieldError id="join-phone-error" message={errors.phone} />
        </div>
      </div>

      <fieldset className={cls.group} {...describe("trade")}>
        <legend className="contents">
          <Label>{copy.labels.trade}</Label>
        </legend>
        <div className={cls.chips}>
          {copy.trades.map((trade) => (
            <Chip key={trade} type="radio" name="trade" value={trade} label={trade} defaultChecked={values.trade === trade} required />
          ))}
        </div>
        <FieldError id="join-trade-error" message={errors.trade} />
      </fieldset>

      <fieldset className={cls.group} {...describe("experience")}>
        <legend className="contents">
          <Label>{copy.labels.experience}</Label>
        </legend>
        <div className={cls.chips}>
          {copy.experience.map((item) => (
            <Chip key={item} type="radio" name="experience" value={item} label={item} defaultChecked={values.experience === item} required />
          ))}
        </div>
        <FieldError id="join-experience-error" message={errors.experience} />
      </fieldset>

      <div className={`${cls.row} md:items-start`}>
        <div className={cls.field}>
          <Label htmlFor="join-location">{copy.labels.location}</Label>
          <div className={cls.inputWrap}>
            <MapPin size={17} className="flex-none text-slate" aria-hidden="true" />
            <input
              id="join-location"
              name="location"
              type="text"
              autoComplete="address-level2"
              placeholder={copy.placeholders.location}
              defaultValue={values.location}
              required
              maxLength={120}
              className={cls.input}
              {...describe("location")}
            />
          </div>
          <FieldError id="join-location-error" message={errors.location} />
        </div>
        <fieldset className={`${cls.group} md:flex-none`} {...describe("languages")}>
          <legend className="contents">
            <Label>{copy.labels.languages}</Label>
          </legend>
          <div className={cls.chips}>
            {copy.languages.map((language) => (
              <Chip
                key={language.value}
                type="checkbox"
                name="languages"
                value={language.value}
                label={language.label}
                lang={LANGUAGE_TAGS[language.value]}
                defaultChecked={chosenLanguages.has(language.value)}
              />
            ))}
          </div>
          <FieldError id="join-languages-error" message={errors.languages} />
        </fieldset>
      </div>

      <fieldset className={cls.group} {...describe("start")}>
        <legend className="contents">
          <Label required={false}>{copy.labels.start}</Label>
        </legend>
        <div className={cls.chips}>
          {copy.start.map((item) => (
            <Chip key={item} type="radio" name="start" value={item} label={item} defaultChecked={values.start === item} />
          ))}
        </div>
        <FieldError id="join-start-error" message={errors.start} />
      </fieldset>

      <div className="flex flex-col gap-[7px]">
        <label className={cls.consent}>
          <input
            type="checkbox"
            name="consent"
            value="yes"
            defaultChecked={values.consent === "yes"}
            required
            className="peer sr-only"
            {...describe("consent")}
          />
          <span className={cls.box} aria-hidden="true">
            <Check size={13} strokeWidth={3} className="text-white" aria-hidden="true" />
          </span>
          <span className="text-[14px] leading-[normal] font-medium text-ink md:text-[14.5px]">
            {copy.labels.consent}{" "}
            <span className="font-semibold text-[#e81d25]" aria-hidden="true">
              *
            </span>
          </span>
        </label>
        <FieldError id="join-consent-error" message={errors.consent} />
      </div>

      <button type="submit" className={cls.submit} disabled={pending} aria-disabled={pending}>
        {pending ? copy.sending : copy.submit}
        <ArrowRight className="size-[18px] flex-none text-white md:size-[19px]" aria-hidden="true" />
      </button>

      <p className={cls.note}>
        <Clock className="size-[14px] flex-none text-orange md:size-[15px]" aria-hidden="true" />
        {copy.note}
      </p>
    </form>
  );
}
