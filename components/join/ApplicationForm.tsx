"use client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  FileText,
  Hammer,
  Languages,
  MapPin,
  Paperclip,
  Phone,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { submitJoinApplication } from "@/app/actions/joinApplication";
import { JOIN_PAGE } from "@/data/joinPage";
import {
  HONEYPOT_FIELD,
  INITIAL_JOIN_STATE,
  JOIN_DOC_ACCEPT,
  JOIN_LANGUAGES,
  JOIN_OTHER,
  WHY_HIRE_MAX_LETTERS,
  countLetters,
  limitLetters,
  readJoinValues,
  validateJoinDocuments,
  type JoinErrorField,
  type JoinField,
  type JoinFormState,
  type JoinFormValues,
} from "@/utils/joinForm";
import { THANK_YOU_PATH, saveThankYouNote } from "@/lib/thankYou";

/** Where a sent application goes (app/thank-you). */
const THANK_YOU = THANK_YOU_PATH;

type FormCopy = (typeof JOIN_PAGE)["form"];

interface ApplicationFormProps {
  copy: FormCopy;
}

// Figma "Application form" — desktop 312:105 (white card, 32px padding, name
// and phone side by side, district beside the language chips), mobile 313:262
// (every field stacked). Choices are radio/checkbox inputs styled as chips;
// a chosen chip turns peach with an orange ring and a check badge.
const cls = {
  card: [
    "flex min-w-0 flex-col gap-[20px] rounded-[20px] border border-sand bg-white px-[16px] py-[20px]",
    "shadow-[0_12px_30px_0_rgba(99,36,0,0.08)]",
    "md:gap-[19px] md:rounded-[24px] md:px-[26px] md:py-[24px] md:shadow-[0_16px_40px_0_rgba(99,36,0,0.08)] lg:flex-1",
  ].join(" "),
  head: "flex flex-col gap-[4px] leading-[normal] md:flex-row md:items-baseline md:justify-between md:gap-[12px]",
  title: "m-0 hidden text-[22px] font-bold text-ink md:block",
  required: "m-0 text-[12.5px] text-slate md:text-[13px]",
  // Gaps leave room for a one-line error under a field (cls.error).
  row: "flex flex-col gap-[20px] md:flex-row md:gap-[12px]",
  // relative: errors float just below the field (cls.error) instead of adding a line.
  field: "relative flex min-w-0 flex-col gap-[6px] md:flex-1",
  group: "relative m-0 flex min-w-0 flex-col gap-[6px] border-0 p-0 [&[aria-invalid=true]_label]:border-error",
  label: "flex gap-[3px] text-[13.5px] leading-[normal] font-semibold text-ink md:text-[14px]",
  star: "text-[#e81d25]",
  inputWrap: [
    "flex items-center gap-[8px] rounded-[12px] border border-sand bg-input-bg px-[14px]",
    "focus-within:border-orange focus-within:[box-shadow:0_0_0_3px_rgba(242,105,33,0.18)]",
    "has-[[aria-invalid=true]]:border-error has-[[aria-invalid=true]]:bg-[#fff7f9]",
  ].join(" "),
  input: [
    "h-[44px] min-w-0 flex-1 border-0 bg-transparent p-0 text-[16px] text-ink md:text-[15px] outline-none",
    "placeholder:text-[rgba(90,107,128,0.8)]",
  ].join(" "),
  chips: "flex flex-wrap gap-[8px]",
  chip: [
    "relative flex cursor-pointer items-center gap-[5px] rounded-full border border-sand bg-white py-[8px] pr-[12px] pl-[11px]",
    "text-[13.5px] leading-[normal] font-semibold whitespace-nowrap text-ink select-none",
    "transition-colors duration-160 hover:border-orange/50",
    // Chosen: peach fill, 1.5px orange ring (inset shadow keeps the size steady).
    "has-[:checked]:border-orange has-[:checked]:bg-peach-100 has-[:checked]:shadow-[inset_0_0_0_0.5px_var(--color-orange)]",
    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange",
  ].join(" "),
  chipCheck: "hidden size-[16px] flex-none items-center justify-center rounded-full bg-orange peer-checked:flex",
  // Floats in the gap under its field (parent is relative), so a message never
  // pushes the form taller. One line, cut with "…" if it is too long.
  error: [
    "pointer-events-none absolute top-full right-0 left-0 m-0 mt-[1px] truncate",
    "text-[11.5px] leading-[13px] font-medium text-error",
  ].join(" "),
  select: "cursor-pointer appearance-none",
  menu: [
    "absolute top-[calc(100%+6px)] right-0 left-0 z-30 m-0 max-h-[288px] list-none overflow-y-auto rounded-[14px] border border-sand bg-white p-[6px]",
    "shadow-[0_16px_40px_0_rgba(99,36,0,0.14)] outline-none",
  ].join(" "),
  option: "flex cursor-pointer items-center gap-[10px] rounded-[10px] px-[12px] py-[9px] text-[14.5px] leading-[20px] select-none",
  textarea: [
    "min-h-[64px] w-full resize-y border-0 bg-transparent px-0 py-[10px] text-[16px] leading-[22px] text-ink outline-none md:text-[15px]",
    "placeholder:text-[rgba(90,107,128,0.8)]",
  ].join(" "),
  hint: "m-0 text-[12.5px] leading-[normal] text-slate md:text-[13px]",
  upload: [
    "inline-flex h-[36px] flex-none cursor-pointer items-center gap-[7px] rounded-full border border-sand bg-white px-[14px]",
    "text-[13.5px] leading-[normal] font-semibold whitespace-nowrap text-ink transition-colors duration-160 hover:border-orange",
    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange",
    "has-[[aria-invalid=true]]:border-error",
  ].join(" "),
  fileRow: "flex max-w-full items-center gap-[6px] rounded-full border border-sand bg-input-bg py-[3px] pr-[3px] pl-[10px] text-[12.5px] text-ink",
  fileRemove: [
    "flex size-[22px] flex-none cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-slate",
    "hover:bg-peach-100 hover:text-orange focus-visible:outline-2 focus-visible:outline-orange",
  ].join(" "),
  submit: [
    "btn-primary w-full gap-[10px] px-[20px] text-[16px] font-bold [--btn-h:50px]",
    "md:px-[24px] md:[--btn-h:52px]",
  ].join(" "),
  note: "m-0 flex items-center justify-center gap-[6px] text-center text-[13px] leading-[normal] font-medium text-brown md:gap-[8px] md:text-[14px]",
  banner: "m-0 rounded-[12px] px-[14px] py-[12px] text-[14px] leading-[20px] font-medium",
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
  onChange,
}: {
  type: "radio" | "checkbox";
  name: JoinField;
  value: string;
  label: string;
  defaultChecked: boolean;
  required?: boolean;
  lang?: string;
  onChange?: (checked: boolean) => void;
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
        {...(onChange ? { onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked) } : {})}
      />
      <span className={cls.chipCheck} aria-hidden="true">
        <Check size={10} strokeWidth={3} className="text-white" aria-hidden="true" />
      </span>
      {label}
    </label>
  );
}

const LANGUAGE_TAGS: Record<string, string> = { Bengali: "bn", Hindi: "hi", English: "en" };

type Describe = (field: JoinErrorField) => { "aria-invalid"?: true; "aria-describedby"?: string };

interface FieldProps {
  copy: FormCopy;
  values: JoinFormValues;
  errors: Partial<Record<JoinErrorField, string>>;
  describe: Describe;
}

/** A one-line text input in the form's input frame. */
function TextInput({
  id,
  name,
  icon: Icon,
  placeholder,
  defaultValue,
  maxLength,
  describe,
  ...rest
}: {
  id: string;
  name: JoinField;
  icon: typeof User;
  placeholder: string;
  defaultValue: string;
  maxLength: number;
  describe: Describe;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cls.inputWrap}>
      <Icon size={17} className="flex-none text-slate" aria-hidden="true" />
      <input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        defaultValue={defaultValue}
        maxLength={maxLength}
        className={cls.input}
        {...rest}
        {...describe(name)}
      />
    </div>
  );
}

/**
 * A dropdown styled like the rest of the form (the browser's own <select>
 * list can't be styled). ARIA select-only combobox: a button opens a listbox;
 * arrows / Home / End move, Enter or Space picks, Escape or Tab closes, and a
 * letter jumps to the next choice starting with it. The value is sent in a
 * hidden input, so the form posts exactly what the old <select> did.
 */
function SelectField({
  name,
  label,
  icon: Icon,
  placeholder,
  options,
  optionDetail,
  value,
  onChange,
  required = true,
  error,
  describe,
}: {
  name: JoinField;
  label: string;
  icon: typeof User;
  placeholder: string;
  options: readonly string[];
  /** Grey second line under an option (e.g. what a trade does). */
  optionDetail?: (item: string) => string | undefined;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  describe: Describe;
}) {
  const id = `join-${name}`;
  // Optional fields get a real "no answer" choice (the placeholder) at the top.
  const choices = required ? [...options] : ["", ...options];
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const openList = () => {
    setActive(Math.max(0, choices.indexOf(value)));
    setOpen(true);
  };
  const pick = (choice: string) => {
    onChange(choice);
    setOpen(false);
    buttonRef.current?.focus();
  };

  // Close on a click outside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the highlighted choice in view.
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = choices.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "ArrowDown") setActive((i) => Math.min(last, i + 1));
    else if (e.key === "ArrowUp") setActive((i) => Math.max(0, i - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "Enter" || e.key === " ") pick(choices[active]);
    else if (e.key === "Escape") setOpen(false);
    else if (e.key === "Tab") return setOpen(false);
    else if (e.key.length === 1) {
      const letter = e.key.toLowerCase();
      const order = [...choices.slice(active + 1), ...choices.slice(0, active + 1)];
      const next = order.find((c) => c.toLowerCase().startsWith(letter));
      if (next !== undefined) setActive(choices.indexOf(next));
      return;
    } else return;
    e.preventDefault();
  };

  const optionId = (i: number) => `${id}-option-${i}`;

  return (
    <div className={cls.field}>
      <span id={`${id}-label`}>
        <Label required={required}>{label}</Label>
      </span>
      <div ref={rootRef} className="relative">
        <input type="hidden" name={name} value={value} />
        <div className={`${cls.inputWrap} ${open ? "border-orange [box-shadow:0_0_0_3px_rgba(242,105,33,0.18)]" : ""}`}>
          <Icon size={17} className="flex-none text-slate" aria-hidden="true" />
          <button
            ref={buttonRef}
            id={id}
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-labelledby={`${id}-label ${id}`}
            aria-activedescendant={open ? optionId(active) : undefined}
            onClick={() => (open ? setOpen(false) : openList())}
            onKeyDown={onKeyDown}
            className={`${cls.input} ${cls.select} truncate text-left ${value ? "" : "text-[rgba(90,107,128,0.8)]"}`}
            {...describe(name)}
          >
            {value || placeholder}
          </button>
          <ChevronDown
            size={18}
            className={`pointer-events-none flex-none text-slate transition-transform duration-160 ${open ? "rotate-180 text-orange" : ""}`}
            aria-hidden="true"
          />
        </div>
        {open && (
          <ul ref={listRef} id={`${id}-list`} role="listbox" aria-labelledby={`${id}-label`} className={cls.menu}>
            {choices.map((choice, i) => {
              const selected = choice === value;
              const detail = choice ? optionDetail?.(choice) : undefined;
              return (
                <li
                  key={choice || "none"}
                  id={optionId(i)}
                  role="option"
                  aria-selected={selected}
                  onPointerMove={() => setActive(i)}
                  onClick={() => pick(choice)}
                  className={`${cls.option} ${i === active ? "bg-peach-100" : ""}`}
                >
                  <span className="flex min-w-0 flex-1 flex-col gap-[1px]">
                    <span className={`font-semibold ${selected ? "text-orange" : choice ? "text-ink" : "text-slate"}`}>
                      {choice || placeholder}
                    </span>
                    {detail && <span className="text-[12.5px] leading-[16px] text-slate">{detail}</span>}
                  </span>
                  {selected && <Check size={16} strokeWidth={2.6} className="flex-none text-orange" aria-hidden="true" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

/** Trade and experience dropdowns side by side; trade "Other" opens a box to type it. */
function TradeField({ copy, values, errors, describe }: FieldProps) {
  const [trade, setTrade] = useState(values.trade);
  const [experience, setExperience] = useState(values.experience);
  return (
    <>
      <div className={cls.row}>
        <SelectField
          name="trade"
          label={copy.labels.trade}
          icon={Hammer}
          placeholder={copy.placeholders.trade}
          options={copy.trades}
          optionDetail={(item) => (copy.tradeDetails as Record<string, string>)[item]}
          value={trade}
          onChange={setTrade}
          error={errors.trade}
          describe={describe}
        />
        <SelectField
          name="experience"
          label={copy.labels.experience}
          icon={Clock}
          placeholder={copy.placeholders.experience}
          options={copy.experience}
          value={experience}
          onChange={setExperience}
          error={errors.experience}
          describe={describe}
        />
      </div>
      {trade === JOIN_OTHER && (
        <div className={cls.field}>
          <label htmlFor="join-tradeOther" className="sr-only">
            {copy.labels.tradeOther}
          </label>
          <TextInput
            id="join-tradeOther"
            name="tradeOther"
            icon={Hammer}
            placeholder={copy.placeholders.tradeOther}
            defaultValue={values.tradeOther}
            maxLength={60}
            required
            describe={describe}
          />
          <FieldError id="join-tradeOther-error" message={errors.tradeOther} />
        </div>
      )}
    </>
  );
}

/** Optional start date as a dropdown ("Not sure yet" = no answer). */
function StartField({ copy, values, errors, describe }: FieldProps) {
  const [start, setStart] = useState(values.start);
  return (
    <SelectField
      name="start"
      label={copy.labels.start}
      icon={CalendarDays}
      placeholder={copy.placeholders.start}
      options={copy.start}
      value={start}
      onChange={setStart}
      required={false}
      error={errors.start}
      describe={describe}
    />
  );
}

/** Language chips on one line; ticking "Other" opens a small box beside them. */
function LanguagesField({ copy, values, errors, describe }: FieldProps) {
  const chosen = new Set(values.languages.split(", ").filter(Boolean));
  const [other, setOther] = useState(chosen.has(JOIN_OTHER));
  // Every choice is shown even if a saved copy of the page lists fewer; the
  // saved copy only changes how each one is written.
  const languages = JOIN_LANGUAGES.map(
    (value) => copy.languages.find((language) => language.value === value) ?? { value, label: value },
  );
  return (
    <fieldset className={cls.group} {...describe("languages")}>
      <legend className="sr-only">{copy.labels.languages}</legend>
      <div className="flex flex-col gap-[6px] md:flex-row md:flex-wrap md:items-center md:gap-x-[12px]">
        <span aria-hidden="true">
          <Label>{copy.labels.languages}</Label>
        </span>
        <div className={cls.chips}>
          {languages.map((language) => (
            <Chip
              key={language.value}
              type="checkbox"
              name="languages"
              value={language.value}
              label={language.label}
              lang={LANGUAGE_TAGS[language.value]}
              defaultChecked={chosen.has(language.value)}
              {...(language.value === JOIN_OTHER ? { onChange: setOther } : {})}
            />
          ))}
        </div>
        {other && (
          <div className="min-w-0 md:w-[170px]">
            <label htmlFor="join-languageOther" className="sr-only">
              {copy.labels.languageOther}
            </label>
            <TextInput
              id="join-languageOther"
              name="languageOther"
              icon={Languages}
              placeholder={copy.placeholders.languageOther}
              defaultValue={values.languageOther}
              maxLength={60}
              required
              describe={describe}
              className={`${cls.input} md:h-[36px]`}
            />
          </div>
        )}
      </div>
      <FieldError id="join-languages-error" message={errors.languages} />
      <FieldError id="join-languageOther-error" message={errors.languageOther} />
    </fieldset>
  );
}

/** Optional "Why should we hire you?" with a live letter count (spaces not counted) beside the label. */
function WhyHireField({ copy, values, errors, describe }: FieldProps) {
  const [letters, setLetters] = useState(countLetters(values.whyHire));
  const full = letters >= WHY_HIRE_MAX_LETTERS;
  return (
    <div className={cls.field}>
      <div className="flex items-baseline justify-between gap-[12px]">
        <Label htmlFor="join-whyHire" required={false}>
          {copy.labels.whyHire}
        </Label>
        <p className={`${cls.hint} flex-none tabular-nums ${full ? "font-semibold text-orange" : ""}`} aria-live="polite">
          {letters} / {WHY_HIRE_MAX_LETTERS} {copy.lettersLabel}
        </p>
      </div>
      <div className={`${cls.inputWrap} items-start`}>
        <textarea
          id="join-whyHire"
          name="whyHire"
          rows={2}
          placeholder={copy.placeholders.whyHire}
          defaultValue={values.whyHire}
          maxLength={600}
          onChange={(e) => {
            // Hard stop at the limit: typing or pasting past it keeps only the first 70 letters.
            if (countLetters(e.target.value) > WHY_HIRE_MAX_LETTERS) {
              e.target.value = limitLetters(e.target.value);
            }
            setLetters(countLetters(e.target.value));
          }}
          className={cls.textarea}
          {...describe("whyHire")}
        />
      </div>
      <FieldError id="join-whyHire-error" message={errors.whyHire} />
    </div>
  );
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/**
 * Optional CV / letters: a small "Attach" button with the hint beside it.
 * The chosen files live in the (hidden) file input, so they are sent with the
 * form; the chips let the visitor add more in several picks and remove one.
 */
function DocumentsField({ copy, errors, describe }: Omit<FieldProps, "values">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const error = validateJoinDocuments(files) ?? errors.documents;

  const update = (next: File[]) => {
    const transfer = new DataTransfer();
    next.forEach((file) => transfer.items.add(file));
    if (inputRef.current) inputRef.current.files = transfer.files;
    setFiles(next);
  };

  return (
    <div className="relative flex min-w-0 flex-col gap-[6px]">
      <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[6px]">
        <label className={cls.upload}>
          <Paperclip size={15} className="flex-none text-orange" aria-hidden="true" />
          {copy.placeholders.documents}
          <input
            ref={inputRef}
            id="join-documents"
            name="documents"
            type="file"
            multiple
            accept={JOIN_DOC_ACCEPT}
            className="sr-only"
            onChange={(e) => {
              const picked = Array.from(e.target.files ?? []);
              const isNew = (file: File) => !files.some((f) => f.name === file.name && f.size === file.size);
              update([...files, ...picked.filter(isNew)]);
            }}
            {...describe("documents")}
          />
        </label>
        {files.length === 0 && <p className={cls.hint}>{copy.documentsHint}</p>}
        {files.map((file, i) => (
          <span key={`${file.name}-${file.size}`} className={cls.fileRow}>
            <FileText size={13} className="flex-none text-orange" aria-hidden="true" />
            <span className="max-w-[140px] truncate">{file.name}</span>
            <span className="flex-none text-slate">{formatSize(file.size)}</span>
            <button
              type="button"
              className={cls.fileRemove}
              aria-label={`${copy.removeFile} ${file.name}`}
              onClick={() => update(files.filter((_, j) => j !== i))}
            >
              <X size={13} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>
      <FieldError id="join-documents-error" message={error} />
    </div>
  );
}

export default function ApplicationForm({ copy }: ApplicationFormProps) {
  const router = useRouter();
  // Sent: open the thank-you page. Pushed inside the action, so the button
  // keeps showing "Sending…" until the page is there.
  const [state, formAction, isPending] = useActionState(
    async (prev: JoinFormState, formData: FormData): Promise<JoinFormState> => {
      // A rejected action (offline, body too large, stale deploy) would otherwise throw to the error page.
      const next = await submitJoinApplication(prev, formData).catch(
        (): JoinFormState => ({
          status: "error",
          message: copy.messages.error,
          fieldErrors: {},
          values: readJoinValues(formData),
        }),
      );
      if (next.status === "success") {
        const values = readJoinValues(formData);
        saveThankYouNote({
          form: "application",
          name: values.name,
          location: values.location,
          start: values.start,
          tags: [values.trade === JOIN_OTHER ? values.tradeOther : values.trade, values.experience],
        });
        router.push(THANK_YOU);
      }
      return next;
    },
    INITIAL_JOIN_STATE,
  );
  // Until the thank-you page has loaded.
  const pending = isPending || state.status === "success";
  const errors = state.fieldErrors;
  // After an error the form remounts (key) with what the visitor sent.
  const values: JoinFormValues =
    state.status === "error" ? state.values : INITIAL_JOIN_STATE.values;
  const describe: Describe = (field) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": `join-${field}-error` } : {};
  const fieldProps = { copy, values, errors, describe };

  // Load the thank-you page ahead, so it opens at once.
  useEffect(() => {
    router.prefetch(THANK_YOU);
  }, [router]);

  // After an error, move focus where keyboard and screen-reader users need it:
  // the first invalid field (or the first input of an invalid group), or the
  // error message.
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status !== "error") return;
    const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    const target = invalid?.matches("input, select, textarea, button")
      ? invalid
      : invalid?.querySelector<HTMLElement>("input, select, textarea");
    (target ?? formRef.current?.querySelector<HTMLElement>("#join-form-status"))?.focus();
  }, [state]);

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
        // Field problems are shown on the fields themselves; then this summary is
        // for screen readers only, so the card doesn't grow. Other problems
        // (upload failed, server down…) still show as a visible banner.
        <p
          id="join-form-status"
          className={Object.keys(errors).length > 0 ? "sr-only" : `${cls.banner} bg-[#fdecea] text-error`}
          role="alert"
        >
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

      <TradeField {...fieldProps} />

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
        <StartField {...fieldProps} />
      </div>

      <LanguagesField {...fieldProps} />

      <WhyHireField {...fieldProps} />

      <DocumentsField copy={copy} errors={errors} describe={describe} />

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
