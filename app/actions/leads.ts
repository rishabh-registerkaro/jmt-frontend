"use server";

import { headers } from "next/headers";
import { ADMIN_TIMEOUT_MS, adminUrl, sharedSecret } from "@/lib/adminApi";
import {
  EMPTY_LEAD_VALUES,
  HONEYPOT_FIELD,
  readLeadValues,
  validateLead,
} from "@/utils/leadForm";
import type { LeadFormState } from "@/types/homepage";

/**
 * Homepage "Request workers" form → jmt-admin's POST /api/lead/homepage,
 * which saves it to the `leads` table, emails the admin and rate-limits per
 * visitor IP. That route returns a ready-to-render LeadFormState.
 *
 * The obvious checks run here first, so a mistyped field gets its message
 * without a round trip; jmt-admin re-validates everything anyway.
 */
export async function submitLead(
  _previous: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  // Bots fill every field; pretend success so they don't retry.
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return successState();
  }

  const values = readLeadValues(formData);
  const fieldErrors = validateLead(values);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
      values,
    };
  }

  // jmt-admin rate-limits per visitor, so pass on the visitor's IP (it only
  // trusts this header together with the shared secret).
  const h = await headers();
  const visitorIp = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";

  try {
    const res = await fetch(adminUrl("/api/lead/homepage"), {
      method: "POST",
      headers: {
        "x-revalidate-secret": sharedSecret(),
        "x-jmt-client-ip": visitorIp,
      },
      body: formData,
      cache: "no-store",
      // Covers the admin's own 8 s cap on the notification email.
      signal: AbortSignal.timeout(ADMIN_TIMEOUT_MS + 5_000),
    });
    const state: unknown = await res.json();
    if (isLeadFormState(state)) return state;
    throw new Error(`unexpected response (HTTP ${res.status})`);
  } catch (error) {
    console.error("[homepage] Failed to send lead to jmt-admin:", error);
    return {
      status: "error",
      message:
        "We couldn't send your request just now. Please try again, or call or WhatsApp us directly.",
      fieldErrors: {},
      values,
    };
  }
}

function isLeadFormState(value: unknown): value is LeadFormState {
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

function successState(): LeadFormState {
  return {
    status: "success",
    message: "Thanks — your requirement is in. The owner will call you back within 24 hours.",
    fieldErrors: {},
    values: EMPTY_LEAD_VALUES,
  };
}
