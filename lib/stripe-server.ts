import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

/** Returns null when `STRIPE_SECRET_KEY` is unset (placeholder checkout still works). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}
