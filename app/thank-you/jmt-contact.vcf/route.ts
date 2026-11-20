import { SITE_URL } from "@/lib/site";
import { getSiteChrome } from "@/server/homepage";

// /thank-you/jmt-contact.vcf — "Save our number" on the thank-you page.
// A contact card (vCard 3.0) with the phone, WhatsApp and email from the
// admin's Contact details, so visitors recognise our call. Phones open it
// straight in the contacts app.

// Matches HOMEPAGE_REVALIDATE_SECONDS in server/homepage.ts (must be a literal here).
export const revalidate = 600;

/** vCard text value: backslash, comma, semicolon and newlines escaped. */
const esc = (value: string) => value.replace(/\\/g, "\\\\").replace(/[,;]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");

const afterScheme = (href: string | null, scheme: string) =>
  href && href.toLowerCase().startsWith(scheme) ? decodeURIComponent(href.slice(scheme.length).split("?")[0]) : null;

export async function GET() {
  const { brand, contact } = await getSiteChrome();
  const phone = afterScheme(contact.phoneHref, "tel:");
  const whatsapp = afterScheme(contact.whatsappHref, "https://wa.me/");
  const email = afterScheme(contact.emailHref, "mailto:");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${esc(brand.name)}`,
    `ORG:${esc(brand.name)}`,
    phone && `TEL;TYPE=WORK,VOICE:${esc(phone)}`,
    whatsapp && whatsapp.replace(/\D/g, "") !== phone?.replace(/\D/g, "") && `TEL;TYPE=CELL:+${whatsapp.replace(/\D/g, "")}`,
    email && `EMAIL;TYPE=WORK:${esc(email)}`,
    `URL:${SITE_URL}/`,
    "END:VCARD",
  ].filter(Boolean);

  return new Response(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="JMT.vcf"',
      "X-Robots-Tag": "noindex",
    },
  });
}
