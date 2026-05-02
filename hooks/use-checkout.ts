"use client";

export type ConfirmEmailResult = {
  checkoutSessionId: string | null;
  resolution: string;
  nextStep: string;
};

export async function postCheckoutConfirmEmail(
  body: Record<string, unknown>,
): Promise<ConfirmEmailResult> {
  const res = await fetch("/api/checkout/confirm-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as ConfirmEmailResult & { error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? `Request failed (${res.status})`);
  }
  return json;
}

export async function postCheckoutSession(checkoutSessionId: string): Promise<{ url: string }> {
  const res = await fetch("/api/checkout/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ checkoutSessionId }),
  });
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? `Request failed (${res.status})`);
  }
  if (!json.url) {
    throw new Error("Missing redirect URL");
  }
  return { url: json.url };
}

export async function getCheckoutResume(session: string, token?: string): Promise<{
  status: string;
  planId?: string;
  purchaseEventId?: string;
}> {
  const params = new URLSearchParams({ session });
  if (token) params.append("token", token);
  const res = await fetch(`/api/checkout/resume?${params.toString()}`);
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(typeof json.error === "string" ? json.error : `Request failed (${res.status})`);
  }
  return json as never;
}

export async function postCheckoutClaimSend(checkoutSessionId: string, resumeToken?: string): Promise<void> {
  const res = await fetch("/api/checkout/claim/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ checkoutSessionId, resumeToken }),
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) {
    throw new Error(json.error ?? `Request failed (${res.status})`);
  }
}
