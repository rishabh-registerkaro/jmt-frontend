"use server";

import { headers } from "next/headers";
import { ADMIN_TIMEOUT_MS, adminUrl, sharedSecret } from "@/lib/adminApi";
import { EMPTY_LEAD_VALUES, HONEYPOT_FIELD, readLeadValues, validateLead } from "@/utils/leadForm";
import { getHomepageData } from "@/server/homepage";
import type { LeadFormCopy, LeadFormState } from "@/types/homepage";

/** The form's messages as set in the admin (cached). */
async function formCopy(): Promise<LeadFormCopy> {
  return (await getHomepageData()).contactCopy.form;
}

/**
 * Homepage "Request workers" form → jmt-admin's POST /api/lead/homepage,
 * which saves it to the `leads` table, emails the admin and rate-limits per
 * visitor IP. That route returns a ready-to-render LeadFormState.
 *
 * The obvious checks run here first, so a mistyped field gets its message
 * without a round trip; jmt-admin re-validates everything anyway.
 *
 * The success and error texts are the ones set in the admin (Contact →
 * Request form); only jmt-admin's specific refusals (e.g. rate limiting)
 * are passed through as-is.
 */
export async function submitLead(
  _previous: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  // Bots fill every field; pretend success so they don't retry.
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return successState(await formCopy());
  }

  const values = readLeadValues(formData);
  const fieldErrors = validateLead(values);
  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: (await formCopy()).invalidText,
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
    if (isLeadFormState(state)) {
      const copy = await formCopy();
      if (state.status === "success") return successState(copy);
      if (Object.keys(state.fieldErrors).length > 0) return { ...state, message: copy.invalidText };
      return state;
    }
    throw new Error(`unexpected response (HTTP ${res.status})`);
  } catch (error) {
    console.error("[homepage] Failed to send lead to jmt-admin:", error);
    return {
      status: "error",
      message: (await formCopy()).errorText,
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

function successState(copy: LeadFormCopy): LeadFormState {
  return {
    status: "success",
    message: copy.successText,
    fieldErrors: {},
    values: EMPTY_LEAD_VALUES,
  };
}
