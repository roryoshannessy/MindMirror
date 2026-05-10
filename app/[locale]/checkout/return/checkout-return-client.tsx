"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getPlanById } from "@/config/commercial-catalog";
import { capturePurchaseCompleted } from "@/lib/checkout-analytics.client";
import { getCheckoutResume, postCheckoutClaimSend } from "@/hooks/use-checkout";

const POLL_MS = 1500;
const MAX_MS = 30_000;

export function CheckoutReturnClient({ checkoutSessionId, resumeToken }: { checkoutSessionId: string; resumeToken?: string }) {
  const t = useTranslations("checkout");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const claimSent = useRef(false);
  const analyticsFired = useRef(false);
  const started = useRef<number | null>(null);

  useEffect(() => {
    started.current = Date.now();
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      if (cancelled) return;
      try {
        const r = await getCheckoutResume(checkoutSessionId, resumeToken);
        if (cancelled) return;
        setStatus(r.status);
        setPlanId(r.planId ?? null);

        if (r.status === "payment_settled_claim_pending") {
          if (!claimSent.current) {
            claimSent.current = true;
            void postCheckoutClaimSend(checkoutSessionId, resumeToken).catch(() => {
              /* claim can be retried from UI if needed */
            });
          }

          if (!analyticsFired.current && r.planId && r.purchaseEventId) {
            analyticsFired.current = true;
            const plan = getPlanById(r.planId);
            capturePurchaseCompleted({
              planId: r.planId,
              purchaseEventId: r.purchaseEventId,
              valueCents: plan?.amountCents ?? 0,
              currency: plan?.currency ?? "USD",
            });
          }
        }

        if (
          r.status === "payment_pending" &&
          started.current &&
          Date.now() - started.current < MAX_MS
        ) {
          timer = setTimeout(tick, POLL_MS);
        } else if (r.status === "payment_pending") {
          setError(t("return_timeout"));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : t("error_generic"));
        }
      }
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [checkoutSessionId, resumeToken, t]);

  if (error) {
    return <p className="text-center text-sm text-destructive">{error}</p>;
  }

  if (status === "payment_pending" || status === null) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-muted" />
        <p className="text-sm text-muted-foreground">{t("return_pending")}</p>
      </div>
    );
  }

  if (status === "payment_settled_claim_pending" || status === "claim_email_sent") {
    return (
      <div className="mx-auto max-w-md space-y-3 text-center">
        <h1 className="text-xl font-semibold">{t("return_success_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("return_success_body")}</p>
      </div>
    );
  }

  if (status === "already_claimed") {
    return (
      <div className="mx-auto max-w-md space-y-3 text-center">
        <h1 className="text-xl font-semibold">{t("return_claimed_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("return_claimed_body")}</p>
      </div>
    );
  }

  if (status === "payment_refunded") {
    return (
      <div className="mx-auto max-w-md space-y-3 text-center">
        <h1 className="text-xl font-semibold">{t("return_refunded_title")}</h1>
        <p className="text-sm text-muted-foreground">{t("return_refunded_body")}</p>
      </div>
    );
  }

  return (
    <p className="text-center text-sm text-muted-foreground">
      {t("return_unknown_status", { status: String(status) })}
    </p>
  );
}
