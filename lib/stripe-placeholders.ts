/** IDs in `generated/stripe-product-data.json` until real Stripe prices exist. */
export function isPlaceholderStripePriceId(priceId: string | undefined | null): boolean {
  if (!priceId) return true;
  return (
    priceId.startsWith("price_placeholder_") ||
    priceId.includes("_placeholder_")
  );
}
