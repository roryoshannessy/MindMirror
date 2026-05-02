import productData from "@/generated/stripe-product-data.json";

export interface Plan {
  id: string;
  name: string;
  stripeRecurringLookupKey: string;
  stripeIntroLookupKey?: string;
  trialDays?: number;
  intervalUnit: "day" | "week" | "month" | "year";
  intervalCount: number;
  amountCents: number;
  currency: string;
  features: string[];
  highlighted?: boolean;
  metadata?: Record<string, string>;
}

export interface Addon {
  id: string;
  name: string;
  stripeLookupKey: string;
  amountCents: number;
  currency: string;
  metadata?: Record<string, string>;
}

export interface CommercialCatalog {
  plans: Plan[];
  addons: Addon[];
  defaultPlanId: string;
}

export type StripeProductDataFile = {
  syncedAt: string;
  foundationVersion: number;
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    metadata: Record<string, string>;
    prices: Array<{
      id: string;
      lookup_key: string | null;
      currency: string;
      unit_amount: number | null;
      type: "one_time" | "recurring";
      recurring: {
        interval: string;
        interval_count: number;
        trial_period_days: number | null;
      } | null;
      metadata: Record<string, string>;
    }>;
  }>;
};

function slugFromLookupKey(lookupKey: string): string {
  return lookupKey
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseFeatureKeys(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isIntervalUnit(x: string): x is Plan["intervalUnit"] {
  return x === "day" || x === "week" || x === "month" || x === "year";
}

export function mapStripeDataToCatalog(data: StripeProductDataFile): CommercialCatalog {
  const plans: Plan[] = [];
  const addons: Addon[] = [];
  const usedPlanIds = new Set<string>();

  for (const product of data.products) {
    for (const price of product.prices) {
      if (!price.lookup_key) continue;

      if (price.type === "recurring" && price.recurring) {
        const interval = price.recurring.interval;
        if (!isIntervalUnit(interval)) continue;

        let id =
          price.metadata.internal_id?.trim() || slugFromLookupKey(price.lookup_key);
        if (usedPlanIds.has(id)) {
          id = `${id}-${price.id.slice(-8)}`;
        }
        usedPlanIds.add(id);

        const trialFromRecurring = price.recurring.trial_period_days;
        const trialMetaParsed = product.metadata.trial_days
          ? Number.parseInt(product.metadata.trial_days, 10)
          : NaN;
        const trialDays =
          typeof trialFromRecurring === "number" && trialFromRecurring > 0
            ? trialFromRecurring
            : Number.isFinite(trialMetaParsed) && trialMetaParsed > 0
              ? trialMetaParsed
              : undefined;

        plans.push({
          id,
          name: product.name,
          stripeRecurringLookupKey: price.lookup_key,
          stripeIntroLookupKey: price.metadata.intro_lookup_key?.trim() || undefined,
          trialDays,
          intervalUnit: interval,
          intervalCount: price.recurring.interval_count,
          amountCents: price.unit_amount ?? 0,
          currency: price.currency.toUpperCase(),
          features: parseFeatureKeys(price.metadata.features ?? product.metadata.features),
          highlighted:
            price.metadata.highlighted === "true" || product.metadata.highlighted === "true",
          metadata: {
            ...price.metadata,
            stripe_price_id: price.id,
            stripe_product_id: product.id,
          },
        });
      } else if (price.type === "one_time" && price.metadata.kind === "addon") {
        const id =
          price.metadata.internal_id?.trim() || slugFromLookupKey(price.lookup_key);
        addons.push({
          id,
          name: price.metadata.display_name?.trim() || product.name,
          stripeLookupKey: price.lookup_key,
          amountCents: price.unit_amount ?? 0,
          currency: price.currency.toUpperCase(),
          metadata: {
            ...price.metadata,
            stripe_price_id: price.id,
            stripe_product_id: product.id,
          },
        });
      }
    }
  }

  plans.sort((a, b) => a.amountCents - b.amountCents || a.id.localeCompare(b.id));

  const catalogDefault = data.products.find((p) => p.metadata.catalog_default_plan_id?.trim())
    ?.metadata.catalog_default_plan_id;
  const defaultPlanId =
    (catalogDefault && plans.some((p) => p.id === catalogDefault)
      ? catalogDefault
      : undefined) ??
    plans.find((p) => p.highlighted)?.id ??
    plans[0]?.id ??
    "free";

  return { plans, addons, defaultPlanId };
}

const catalogCache = mapStripeDataToCatalog(productData as unknown as StripeProductDataFile);

export function getCatalog(): CommercialCatalog {
  return catalogCache;
}

export function getPlanById(id: string): Plan | undefined {
  return catalogCache.plans.find((p) => p.id === id);
}
