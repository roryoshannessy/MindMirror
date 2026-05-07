"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildLeadCapturePayload } from "@/lib/analytics";
import { postCheckoutConfirmEmail } from "@/hooks/use-checkout";

export function CheckoutEmailClient({
  planId,
  sessionSource,
  quizSessionId,
}: {
  planId: string;
  sessionSource: string;
  quizSessionId: string | null;
}) {
  const t = useTranslations("checkout");
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const lead = buildLeadCapturePayload({
        email,
        source: "checkout",
        locale,
      });
      const funnelSessionId =
        sessionSource === "quiz" && quizSessionId ? quizSessionId : lead.funnelSessionId;
      const json = await postCheckoutConfirmEmail({
        email: lead.email,
        planId,
        source: sessionSource,
        locale: lead.locale,
        attribution: lead.attribution,
        funnelSessionId,
        posthogDistinctId: lead.posthogDistinctId,
        posthogSessionId: lead.posthogSessionId,
        metaFbp: lead.metaFbp,
        metaFbc: lead.metaFbc,
        entryUrl: lead.entryUrl,
      });

      if (json.nextStep === "show_already_subscribed") {
        router.push("/account/billing?reason=already_subscribed");
        return;
      }
      if (json.checkoutSessionId) {
        router.push(`/checkout/review?session=${encodeURIComponent(json.checkoutSessionId)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error_generic"));
    } finally {
      setLoading(false);
    }
  }

  if (!planId) {
    return (
      <p className="text-center text-sm text-muted-foreground">{t("missing_plan")}</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex max-w-md flex-col gap-4">
      <div>
        <label htmlFor="checkout-email" className="mb-1 block text-sm font-medium">
          {t("email_label")}
        </label>
        <Input
          id="checkout-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("email_placeholder")}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <p className="text-xs text-muted-foreground">{t("email_legal")}</p>
      <Button type="submit" disabled={loading}>
        {loading ? t("submitting") : t("continue")}
      </Button>
    </form>
  );
}
