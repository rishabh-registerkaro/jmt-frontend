// Pre-typed WhatsApp messages. Every WhatsApp button links to the admin's
// number (chrome.contact.whatsappHref = https://wa.me/<digits>); these add a
// draft the visitor can edit before pressing Send, so the team can tell a
// contractor enquiry from a job applicant at a glance.

import { OTHER_SERVICE, type ContactFormValues } from "@/utils/contactForm";

export const WHATSAPP_DRAFTS = {
  /** Header, hero, mobile bar, footer, contact sections, FAQs. */
  general: "Hi JMT, I found you on your website. I need workers for my site. Can we talk?",
  service: (name: string) =>
    `Hi JMT, I'm interested in ${name}. Please share rates and availability for my site.`,
  /** Join our crew page (workers applying). */
  join: ["Hi JMT, I want to join your crew.", "Name:", "Trade:", "Experience:", "Location:"].join("\n"),
  /** After the join form is sent: the page asks applicants to send their ID. */
  joinSent: "Hi JMT, I just applied on your website. I'm sending my ID here.",
  /** Contact page "Visit" card (visits are booked over WhatsApp). */
  visit: "Hi JMT, I'd like to visit your office in Dum Dum. Which day and time suits you?",
} as const;

/** Adds `text` to a wa.me link; any other href (#contact, #apply…) is returned as is. */
export function withWhatsAppText(href: string, text: string): string;
export function withWhatsAppText(href: string | null, text: string): string | null;
export function withWhatsAppText(href: string | null, text: string): string | null {
  if (!href || !href.startsWith("https://wa.me/")) return href;
  return `${href.split("?")[0]}?text=${encodeURIComponent(text)}`;
}

/** "2026-12-01" → "1 Dec 2026"; anything else as typed. */
export function readableDate(value: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : null;
  if (!date || Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

/** Contact page form → WhatsApp: what the visitor typed, with blanks left to fill. */
export function enquiryDraft(values: ContactFormValues): string {
  const service = values.service === OTHER_SERVICE ? values.serviceOther || OTHER_SERVICE : values.service;
  const lines = [
    "Hi JMT, I'd like a crew for my site.",
    `Service: ${service}`,
    `Name: ${values.name}`,
    `Company: ${values.companyName}`,
    `Site location: ${values.siteLocation}`,
    `Crew size: ${values.headcount}`,
    `Start date: ${readableDate(values.startDate)}`,
  ];
  if (values.note) lines.push(`Notes: ${values.note}`);
  return lines.map((line) => line.trimEnd()).join("\n");
}

/** Blank enquiry template (the link before the visitor types anything). */
export const ENQUIRY_TEMPLATE = enquiryDraft({
  service: "",
  serviceOther: "",
  name: "",
  companyName: "",
  phone: "",
  siteLocation: "",
  headcount: "",
  startDate: "",
  note: "",
});
