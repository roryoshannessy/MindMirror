#!/usr/bin/env node
/**
 * Pulls Stripe products (metadata.foundation === "true") and active prices into
 * generated/stripe-product-data.json. Requires STRIPE_SECRET_KEY (test or live).
 *
 * In Stripe Dashboard: set Product metadata `foundation` = `true`, set each
 * Price `lookup_key`, and Price metadata `internal_id` (catalog plan id, e.g. starter-monthly-USD).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Match Next.js: optional .env, then .env.local overrides (not already set by the shell).
dotenv.config({ path: join(root, ".env") });
dotenv.config({ path: join(root, ".env.local"), override: true });

function envSecret(value) {
  if (value == null) return "";
  let s = String(value).trim();
  if (
    s.length >= 2 &&
    ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'")))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

const key = envSecret(process.env.STRIPE_SECRET_KEY);
if (!key) {
  console.error("sync-stripe: STRIPE_SECRET_KEY is not set.");
  process.exit(1);
}

const stripe = new Stripe(key);

const productsOut = [];
let startingAfter;

for (;;) {
  const list = await stripe.products.list({
    active: true,
    limit: 100,
    ...(startingAfter ? { starting_after: startingAfter } : {}),
  });

  for (const product of list.data) {
    if (product.metadata?.foundation !== "true") continue;

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
      limit: 100,
    });

    const priceData = prices.data.map((pr) => ({
      id: pr.id,
      lookup_key: pr.lookup_key,
      currency: pr.currency,
      unit_amount: pr.unit_amount,
      type: pr.type,
      recurring: pr.recurring
        ? {
            interval: pr.recurring.interval,
            interval_count: pr.recurring.interval_count,
            trial_period_days: pr.recurring.trial_period_days ?? null,
          }
        : null,
      metadata: pr.metadata ? { ...pr.metadata } : {},
    }));

    productsOut.push({
      id: product.id,
      name: product.name,
      description: product.description,
      metadata: product.metadata ? { ...product.metadata } : {},
      prices: priceData,
    });
  }

  if (!list.has_more) break;
  startingAfter = list.data[list.data.length - 1]?.id;
  if (!startingAfter) break;
}

productsOut.sort((a, b) => a.name.localeCompare(b.name));

const out = {
  syncedAt: new Date().toISOString(),
  foundationVersion: 1,
  products: productsOut,
};

const dir = join(root, "generated");
mkdirSync(dir, { recursive: true });
const dest = join(dir, "stripe-product-data.json");
writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`, "utf8");

console.log(
  `sync-stripe: wrote ${productsOut.length} foundation product(s) → ${dest.replace(root + "/", "")}`,
);
