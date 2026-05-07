import { getStripe } from "@/lib/stripe-server";

export async function createSubscriptionHostedCheckoutSession(input: {
  customerId: string;
  stripePriceId: string;
  trialDays?: number;
  successUrl: string;
  cancelUrl: string;
  subscriptionMetadata: Record<string, string>;
  checkoutSessionMetadata: Record<string, string>;
}): Promise<{ url: string; sessionId: string }> {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured (missing STRIPE_SECRET_KEY).");
  }

  const trial =
    input.trialDays != null && input.trialDays > 0 ? input.trialDays : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: input.customerId,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    allow_promotion_codes: true,
    payment_method_types: ["card"],
    line_items: [{ price: input.stripePriceId, quantity: 1 }],
    subscription_data: {
      ...(trial ? { trial_period_days: trial } : {}),
      metadata: input.subscriptionMetadata,
    },
    metadata: input.checkoutSessionMetadata,
  });

  const url = session.url;
  if (!url) {
    throw new Error("Stripe Checkout session missing redirect URL.");
  }
  if (!session.id?.startsWith("cs_")) {
    throw new Error("Stripe Checkout session missing session ID.");
  }
  return { url, sessionId: session.id };
}
