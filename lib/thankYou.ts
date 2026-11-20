// The thank-you page each form leads to (app/thank-you), and the small
// note a form leaves for it.
//
// The note holds only what the page shows back to the visitor: first name,
// crew size, place, start and a few tags (roles, service or trade). Phone and
// email are never stored. It lives in sessionStorage, so it stays in this tab
// only and is gone when the tab closes. Without it the page shows its
// generic version.

export const THANK_YOU_FORMS = ["request", "enquiry", "application"] as const;
export type ThankYouForm = (typeof THANK_YOU_FORMS)[number];

export const isThankYouForm = (value: string): value is ThankYouForm =>
  (THANK_YOU_FORMS as readonly string[]).includes(value);

/** One URL for every form; the note below says which form was sent. */
export const THANK_YOU_PATH = "/thank-you";

export interface ThankYouNote {
  form: ThankYouForm;
  firstName: string;
  crew: string;
  location: string;
  start: string;
  tags: string[];
}

const KEY = "jmt-thank-you";
const clip = (value: string, max = 80) => value.replace(/\s+/g, " ").trim().slice(0, max);

/** Called by a form right after it was sent. Never throws (private mode, storage off). */
export function saveThankYouNote(note: { form: ThankYouForm; name: string; crew?: string; location?: string; start?: string; tags?: string[] }) {
  const value: ThankYouNote = {
    form: note.form,
    firstName: clip(note.name.trim().split(/\s+/)[0] ?? "", 40),
    crew: clip(note.crew ?? "", 6),
    location: clip(note.location ?? ""),
    start: clip(note.start ?? "", 40),
    tags: (note.tags ?? []).map((tag) => clip(tag)).filter(Boolean).slice(0, 8),
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // The page falls back to its generic version.
  }
}

/** The saved note as stored (a string), or null. Safe to call on the server. */
export function readThankYouNoteRaw(): string | null {
  try {
    return typeof sessionStorage === "undefined" ? null : sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Which form the saved note is for; "request" when there is none. */
export function thankYouNoteForm(raw: string | null): ThankYouForm {
  try {
    const form = raw ? (JSON.parse(raw) as Partial<ThankYouNote>).form : undefined;
    return typeof form === "string" && isThankYouForm(form) ? form : "request";
  } catch {
    return "request";
  }
}

/** The note for `form`, or null (other form, nothing saved, unreadable). */
export function parseThankYouNote(raw: string | null, form: ThankYouForm): ThankYouNote | null {
  if (!raw) return null;
  try {
    const note = JSON.parse(raw) as Partial<ThankYouNote>;
    if (note.form !== form) return null;
    const text = (value: unknown) => (typeof value === "string" ? value : "");
    return {
      form,
      firstName: text(note.firstName),
      crew: text(note.crew),
      location: text(note.location),
      start: text(note.start),
      tags: Array.isArray(note.tags) ? note.tags.filter((tag): tag is string => typeof tag === "string") : [],
    };
  } catch {
    return null;
  }
}
