"use server";

import { headers } from "next/headers";
import { ADMIN_TIMEOUT_MS, adminUrl, sharedSecret } from "@/lib/adminApi";
import {
  EMPTY_CONTACT_VALUES,
  HONEYPOT_FIELD,
  readContactValues,
  validateContact,
  type ContactFormState,
} from "@/utils/contactForm";
import { getContactPage } from "@/server/sitePages";

/** Form messages, editable in jmt-admin (Dashboard → About Us / Contact / Join Our Crew). */
const formMessages = async () => (await getContactPage()).form.messages;

/**
 * Contact page "Send an enquiry" form → jmt-admin's POST /api/lead/contact,
 * which saves it to the `leads` table, emails the admin and rate-limits per
 * visitor IP. The obvious checks run here first, so a mistyped field gets its
 * message without a round trip; jmt-admin re-validates everything anyway.
 */
export async function submitContactLead(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const messages = await formMessages();
  // Bots fill every field; pretend success so they don't retry.
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") return successState(messages);

  const values = readContactValues(formData);
  const fieldErrors = validateContact(values);
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: messages.invalid, fieldErrors, values };
  }

  const h = await headers();
  const visitorIp = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";

  try {
    const res = await fetch(adminUrl("/api/lead/contact"), {
      method: "POST",
      headers: { "x-revalidate-secret": sharedSecret(), "x-jmt-client-ip": visitorIp },
      body: formData,
      cache: "no-store",
      signal: AbortSignal.timeout(ADMIN_TIMEOUT_MS + 5_000),
    });
    const state: unknown = await res.json();
    if (isContactFormState(state)) {
      if (state.status === "success") return successState(messages);
      if (Object.keys(state.fieldErrors).length > 0) return { ...state, message: messages.invalid };
      return state;
    }
    throw new Error(`unexpected response (HTTP ${res.status})`);
  } catch (error) {
    console.error("[contact] Failed to send enquiry to jmt-admin:", error);
    return { status: "error", message: messages.error, fieldErrors: {}, values };
  }
}

function isContactFormState(value: unknown): value is ContactFormState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (v.status === "success" || v.status === "error" || v.status === "idle") &&
    typeof v.message === "string" &&
    typeof v.fieldErrors === "object" &&
    v.fieldErrors !== null &&
    typeof v.values === "object" &&
    v.values !== null
  );
}

function successState(messages: { success: string }): ContactFormState {
  return { status: "success", message: messages.success, fieldErrors: {}, values: EMPTY_CONTACT_VALUES };
}
