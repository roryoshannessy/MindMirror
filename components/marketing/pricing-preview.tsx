import { ArrowRight, CheckCircle2, LockKeyhole, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCatalog, type Plan } from "@/config/commercial-catalog";
import { formatPrice } from "@/lib/format-price";

const previewFeatures = [
  "60-second self-awareness quiz",
  "Sample recurring-thought result",
  "Clear status before checkout",
] as const;

const trustCards = [
  {
    icon: ShieldCheck,
    title: "Responsible promise",
    body: "Built for reflection and self-awareness. Not therapy, diagnosis, or crisis support.",
  },
  {
    icon: LockKeyhole,
    title: "Secure checkout",
    body: "Payment intent is handled through Stripe. MindMirror does not store card details.",
  },
  {
    icon: RotateCcw,
    title: "Beta clarity",
    body: "The current reflection loop is available in beta while the full paid product is still being shaped.",
  },
] as const;

function planFeatures(plan: Plan) {
  if (plan.intervalUnit === "year") {
    return [
      "7-day Stripe trial before billing",
      "Best-value early beta access",
      "Current mirror + future pattern map",
    ];
  }

  return [
    "Flexible monthly early beta access",
    "Current mirror + future pattern map",
    "Stripe-managed billing and receipts",
  ];
}

function PaidPlanCard({ plan }: { plan: Plan }) {
  const price = formatPrice(plan.amountCents, plan.currency);
  const cadence = plan.intervalUnit === "year" ? "per year" : "per month";
  const href = `/checkout/email?planId=${encodeURIComponent(plan.id)}&session=home-pricing`;

  return (
    <article
      className={`relative flex min-h-[28rem] flex-col rounded-[1.7rem] border p-5 shadow-sm ${
        plan.highlighted
          ? "border-[#9fbbb5] bg-[#eef7f4] text-[#172120] shadow-[0_28px_80px_rgb(51_84_79/0.18)]"
          : "border-[#dfe9e7] bg-white text-[#172120]"
      }`}
    >
      {plan.highlighted ? (
        <span className="absolute right-5 top-5 rounded-full bg-[#172120] px-3 py-1 text-xs font-semibold text-white">
          Best value
        </span>
      ) : null}
      <p className="text-sm font-semibold text-[#60706d]">
        {plan.intervalUnit === "year" ? "Annual" : "Monthly"}
      </p>
      <h3 className="mt-3 text-2xl font-semibold">{plan.name.replace("MindMirror ", "")}</h3>
      <p className="mt-5 flex items-end gap-2">
        <span className="text-4xl font-semibold">{price}</span>
        <span className="pb-1 text-sm text-[#60706d]">{cadence}</span>
      </p>
      {plan.trialDays ? (
        <p className="mt-3 rounded-full border border-[#d8e7e3] bg-white px-3 py-1.5 text-xs font-medium text-[#42615d]">
          {plan.trialDays}-day trial before billing
        </p>
      ) : null}

      <ul className="mt-7 grid gap-3 text-sm">
        {planFeatures(plan).map((feature) => (
          <li key={feature} className="flex gap-3">
            <CheckCircle2
              className="mt-0.5 size-4 shrink-0 text-[#42615d]"
              aria-hidden
            />
            <span className="text-[#60706d]">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        size="lg"
        variant="outline"
        className={`mt-auto rounded-full ${
          plan.highlighted
            ? "border-[#172120] bg-[#172120] text-white hover:bg-[#263533]"
            : "border-[#d8e7e3] bg-[#f7fbfa] text-[#172120] hover:bg-white"
        }`}
      >
        <Link href={href}>
          Start early beta
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </Button>
    </article>
  );
}

export function PricingPreview() {
  const catalog = getCatalog();
  const paidPlans = catalog.plans.slice().sort((a, b) => {
    if (a.highlighted && !b.highlighted) return 1;
    if (!a.highlighted && b.highlighted) return -1;
    return a.amountCents - b.amountCents;
  });

  return (
    <section
      id="pricing"
      className="border-t border-[#dce8e5] bg-white px-4 py-16 text-[#172120] sm:px-6 lg:py-20"
      aria-label="Pricing"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#60706d]">
              Pricing
            </p>
            <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Preview the pattern before you decide.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-[#60706d] lg:justify-self-end">
            This is still an early-access purchase-intent test. The page should make the promise
            clear, then let people decide whether they would pay for the full product.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          <article className="flex min-h-[28rem] flex-col rounded-[1.7rem] border border-[#dfe9e7] bg-[#f7fbfa] p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#60706d]">Free Preview</p>
            <h3 className="mt-3 text-2xl font-semibold">Quiz + sample mirror</h3>
            <p className="mt-5 flex items-end gap-2">
              <span className="text-4xl font-semibold">$0</span>
              <span className="pb-1 text-sm text-[#60706d]">before checkout</span>
            </p>
            <ul className="mt-7 grid gap-3 text-sm text-[#60706d]">
              {previewFeatures.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#42615d]" aria-hidden />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              className="mt-auto rounded-full bg-[#172120] text-white hover:bg-[#263533]"
            >
              <Link href="/quiz">
                Start the quiz
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </article>

          {paidPlans.map((plan) => (
            <PaidPlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {trustCards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-[#dfe9e7] bg-[#f8fbfa] p-5">
                <Icon className="size-5 text-[#42615d]" aria-hidden />
                <p className="mt-3 text-sm font-semibold">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#60706d]">{item.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
