"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CommercialCatalog, Plan } from "@/config/commercial-catalog";
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

export function PricingPlans({ catalog }: { catalog: CommercialCatalog }) {
  const t = useTranslations("pricing");

  if (catalog.plans.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">{t("empty_state")}</p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {catalog.plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const t = useTranslations("pricing");
  const priceLabel = formatPrice(plan.amountCents, plan.currency);
  const billingNote =
    plan.intervalCount === 1
      ? t(`billing_period.single.${plan.intervalUnit}`)
      : t("billing_period.multi", {
          count: plan.intervalCount,
          unit: t(`billing_period.unit.${plan.intervalUnit}`),
        });

  const href = `/checkout/email?planId=${encodeURIComponent(plan.id)}&session=pricing`;

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
          {plan.intervalUnit === "year" && plan.intervalCount === 1 ? (
            <span className="block text-xs text-primary font-medium">
              {t("annual_monthly_equiv")} · {t("annual_savings")}
            </span>
          ) : null}
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
