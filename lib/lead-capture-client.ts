"use client";

import { buildLeadCapturePayload } from "@/lib/analytics";
import type { LeadSource } from "@/lib/lead-types";

export async function submitLeadCapture(input: {
  email: string;
  source: LeadSource;
  locale?: string;
  entryUrl?: string;
  turnstileToken?: string;
  firebaseIdToken?: string;
  quiz?: Record<string, unknown> | null;
}): Promise<{ ok: boolean; leadId?: string; error?: string }> {
  const body = buildLeadCapturePayload({
    email: input.email,
    source: input.source,
    locale: input.locale,
    entryUrl: input.entryUrl,
    turnstileToken: input.turnstileToken,
    quiz: input.quiz,
  });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (input.firebaseIdToken) {
    headers.Authorization = `Bearer ${input.firebaseIdToken}`;
  }
  const res = await fetch("/api/lead/capture", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    leadId?: string;
    error?: string;
  };
  if (!res.ok) {
    return { ok: false, error: json.error ?? `HTTP ${res.status}` };
  }
  return { ok: true, leadId: json.leadId };
}

/** Best-effort: used from auth magic-link flow (never blocks sign-in). */
export function recordLeadFromAuth(
  email: string,
  source: "login" | "signup",
  locale?: string,
  turnstileToken?: string,
): void {
  void submitLeadCapture({ email, source, locale, turnstileToken }).then((r) => {
    if (!r.ok) {
      console.warn("[lead-capture]", r.error);
    }
  });
}
