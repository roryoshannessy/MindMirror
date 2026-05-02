"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Plan } from "@/config/commercial-catalog";
import { getCatalog } from "@/config/commercial-catalog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/lib/format-price";
import { cn } from "@/lib/utils";
import { useQuizStore } from "@/stores/quiz-store";

type Props = {
  className?: string;
  showHeading?: boolean;
};

function PlanCard({ plan, sessionId }: { plan: Plan; sessionId: string }) {
  const t = useTranslations("pricing");
  const priceLabel = formatPrice(plan.amountCents, plan.currency);
  const billingNote =
    plan.intervalCount === 1
      ? t(`billing_period.single.${plan.intervalUnit}`)
      : t("billing_period.multi", {
          count: plan.intervalCount,
          unit: t(`billing_period.unit.${plan.intervalUnit}`),
        });

  const href = `/checkout/email?planId=${encodeURIComponent(plan.id)}&session=quiz&qz=${encodeURIComponent(sessionId)}`;

  return (
    <Card
      className={cn(
        "relative border-border",
        plan.highlighted && "border-primary ring-2 ring-primary/40",
      )}
    >
      {plan.highlighted ? (
        <span className="absolute right-4 top-4 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
          {t("badge_popular")}
        </span>
      ) : null}
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription className="space-y-1">
          <span className="block text-2xl font-semibold text-foreground">{priceLabel}</span>
          <span className="text-xs text-muted-foreground">{billingNote}</span>
          {plan.trialDays ? (
            <span className="block text-xs text-muted-foreground">
              {t("trial_days", { days: plan.trialDays })}
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {plan.features.length > 0 ? (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {plan.features.map((key) => (
              <li key={key} className="flex gap-2">
                <span className="text-primary" aria-hidden>
                  ✓
                </span>
                <span>{t(`features.${key}`)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant={plan.highlighted ? "default" : "outline"}>
          <Link href={href}>{t("cta")}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PricingWall({ className, showHeading = true }: Props) {
  const sessionId = useQuizStore((s) => s.sessionId);
  const catalog = getCatalog();

  if (catalog.plans.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full", className)}>
      {showHeading ? (
        <h3 className="mb-4 text-center text-lg font-semibold">Choose your plan</h3>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2">
        {catalog.plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} sessionId={sessionId} />
        ))}
      </div>
    </div>
  );
}
