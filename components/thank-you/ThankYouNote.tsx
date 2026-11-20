"use client";

import { CalendarDays, Check, MapPin, Users, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import type { ThankYouPageContent } from "@/data/thankYouPage";
import { parseThankYouNote, readThankYouNoteRaw, type ThankYouForm } from "@/lib/thankYou";
import { readableDate } from "@/lib/whatsapp";

// The parts of the thank-you page that show what the visitor just sent
// (lib/thankYou.ts). After a form the page is reached by client navigation,
// so the note is there on the first render. On a reload or a direct visit
// the server renders the generic version and the name fills in after load.

// Written once before navigating here, so there is nothing to listen to.
const subscribe = () => () => {};

function useNote(form: ThankYouForm) {
  const raw = useSyncExternalStore(subscribe, readThankYouNoteRaw, () => null);
  return useMemo(() => parseThankYouNote(raw, form), [raw, form]);
}

/** "Thank you, Rahul." + the orange line. Takes focus so screen readers start here. */
export function ThankYouTitle({
  form,
  id,
  className,
  greeting,
  accent,
}: {
  form: ThankYouForm;
  id: string;
  className: string;
  greeting: string;
  accent: string;
}) {
  const note = useNote(form);
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <h1 ref={ref} id={id} tabIndex={-1} className={`${className} focus:outline-none`}>
      {greeting}
      {note?.firstName ? `, ${note.firstName}.` : "."}
      <span className="block text-orange">{accent}</span>
    </h1>
  );
}

/** Chips with what was sent: crew size, place, start, roles / service / trade. */
export function ThankYouSummary({ form, copy }: { form: ThankYouForm; copy: ThankYouPageContent["summary"] }) {
  const note = useNote(form);
  if (!note) return null;

  const worker = form === "application";
  const chips: { key: string; icon: LucideIcon; text: string }[] = [];
  if (note.crew) chips.push({ key: "crew", icon: Users, text: `${note.crew} ${copy.workers}` });
  if (note.location) chips.push({ key: "location", icon: MapPin, text: note.location });
  if (note.start) {
    chips.push({
      key: "start",
      icon: CalendarDays,
      text: worker ? `${copy.canStart} ${note.start}` : `${copy.from} ${readableDate(note.start)}`,
    });
  }
  note.tags.forEach((tag, i) => chips.push({ key: `tag-${i}`, icon: Check, text: tag }));
  if (chips.length === 0) return null;

  return (
    <div
      className={[
        "lead-success-pop mt-[8px] flex w-full max-w-[640px] flex-col items-center gap-[12px] rounded-[18px] border border-peach-line bg-white/80",
        "px-[16px] py-[16px] shadow-[0_12px_30px_rgba(99,36,0,0.08)] backdrop-blur-sm md:rounded-[20px] md:px-[24px] md:py-[20px]",
      ].join(" ")}
      style={{ animationDelay: "240ms" }}
    >
      <p className="m-0 text-[11.5px] leading-[normal] font-bold tracking-[1.2px] text-slate uppercase md:text-[12px]">
        {worker ? copy.applicationTitle : copy.requestTitle}
      </p>
      <ul className="m-0 flex list-none flex-wrap justify-center gap-[8px] p-0">
        {chips.map(({ key, icon: Icon, text }) => (
          <li
            key={key}
            className="flex max-w-full items-center gap-[6px] rounded-full bg-peach-100 py-[6px] pr-[12px] pl-[10px] text-[13.5px] leading-[normal] font-semibold text-ink md:text-[14px]"
          >
            <Icon className="size-[15px] flex-none text-orange" aria-hidden="true" />
            <span className="truncate">{text}</span>
          </li>
        ))}
      </ul>
      <p className="m-0 text-[12.5px] leading-[18px] text-slate md:text-[13px]">{copy.note}</p>
    </div>
  );
}
