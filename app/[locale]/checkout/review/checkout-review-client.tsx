"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Plan } from "@/config/commercial-catalog";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format-price";
import { postCheckoutSession } from "@/hooks/use-checkout";
import { cn } from "@/lib/utils";

export function CheckoutReviewClient({
  sessionId,
  plan,
  email,
}: {
  sessionId: string;
  plan: Plan;
  email: string;
}) {
  const t = useTranslations("checkout");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceLabel = formatPrice(plan.amountCents, plan.currency);
  const trial =
    plan.trialDays && plan.trialDays > 0
      ? t("trial_included", { days: plan.trialDays })
      : null;

  async function onPay() {
    setError(null);
    setLoading(true);
    try {
      const { url } = await postCheckoutSession(sessionId);
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : t("error_generic"));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("review_title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("review_signed_in_as", { email })}
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">{t("review_plan_label")}</p>
        <p className="text-lg font-semibold">{plan.name}</p>
        <p className="mt-1 text-2xl font-bold">{priceLabel}</p>
        <p className="text-sm text-muted-foreground">
          {t("review_billing_cadence", {
            count: plan.intervalCount,
            unit: plan.intervalUnit,
          })}
        </p>
        {trial ? <p className="mt-2 text-sm text-primary">{trial}</p> : null}
      </div>

      <label className="flex cursor-pointer items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 size-5 rounded border-input"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />
        <span>{t("terms_checkbox")}</span>
      </label>

      <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <div className="flex gap-3">
          <CreditCard className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p>{t("review_secure_checkout")}</p>
        </div>
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
          <p>
            {plan.trialDays && plan.trialDays > 0
              ? t("review_trial_cancel", { days: plan.trialDays })
              : t("review_cancel_anytime")}
          </p>
        </div>
        <p className="text-xs">
          {t("review_policy_prefix")}{" "}
          <Link href="/legal/terms" className="text-primary underline-offset-4 hover:underline">
            {t("terms_link")}
          </Link>{" "}
          {t("and")}{" "}
          <Link href="/legal/privacy" className="text-primary underline-offset-4 hover:underline">
            {t("privacy_link")}
          </Link>
          .
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="button"
        size="lg"
        className={cn("w-full")}
        disabled={!termsAccepted || loading}
        onClick={onPay}
      >
        {loading ? t("redirecting") : t("pay_with_card")}
      </Button>
    </div>
  );
}
