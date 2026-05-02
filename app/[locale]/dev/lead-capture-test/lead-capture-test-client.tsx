"use client";

import { useRef, useState } from "react";
import { brand } from "@/config/brand";
import { submitLeadCapture } from "@/lib/lead-capture-client";
import {
  CloudflareTurnstile,
  type CloudflareTurnstileHandle,
} from "@/components/turnstile/cloudflare-turnstile";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

export function LeadCaptureTestClient() {
  const [email, setEmail] = useState("");
  const [source, setSource] = useState<"signup" | "login" | "quiz" | "checkout">(
    "signup",
  );
  const [log, setLog] = useState<string>("");
  const turnstileRef = useRef<CloudflareTurnstileHandle>(null);

  const run = async () => {
    setLog("Submitting…");
    let turnstileToken: string | undefined;
    if (turnstileSiteKey) {
      turnstileToken = turnstileRef.current?.getToken();
      if (!turnstileToken) {
        setLog("Complete the Turnstile widget first (required when TURNSTILE_SECRET_KEY is set in production).");
        return;
      }
    }
    const r = await submitLeadCapture({ email, source, turnstileToken });
    setLog(
      r.ok
        ? `ok${r.leadId ? ` leadId=${r.leadId}` : ""}\nOpen Firestore → leads/${email.trim().toLowerCase()} and PostHog.`
        : `error: ${r.error}`,
    );
    turnstileRef.current?.reset();
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-lg border border-border bg-card p-6 text-card-foreground">
      <h1 className="text-lg font-semibold">{brand.NAME} · M4 lead capture (dev)</h1>
      <p className="text-sm text-muted-foreground">
        Visit a URL with{" "}
        <code className="rounded bg-muted px-1 text-xs">?utm_source=meta</code> first, then submit.
        Check <code className="text-xs">localStorage {brand.STORAGE_PREFIX}_attribution</code> and
        the <code className="text-xs">leads</code> collection. Not linked from public navigation.
      </p>
      <label className="block text-sm font-medium" htmlFor="m4-email">
        Email
      </label>
      <input
        id="m4-email"
        type="email"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <label className="block text-sm font-medium" htmlFor="m4-source">
        Source
      </label>
      <select
        id="m4-source"
        className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
        value={source}
        onChange={(e) =>
          setSource(e.target.value as "signup" | "login" | "quiz" | "checkout")
        }
      >
        <option value="signup">signup</option>
        <option value="login">login</option>
        <option value="quiz">quiz</option>
        <option value="checkout">checkout</option>
      </select>
      {turnstileSiteKey ? <CloudflareTurnstile ref={turnstileRef} /> : null}
      <button
        type="button"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        onClick={() => void run()}
      >
        POST /api/lead/capture
      </button>
      <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs text-muted-foreground">
        {log || "—"}
      </pre>
    </div>
  );
}
