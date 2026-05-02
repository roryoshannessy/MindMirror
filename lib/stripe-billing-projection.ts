import { FieldValue, Timestamp } from "firebase-admin/firestore";
import type Stripe from "stripe";

export function subscriptionStatusToBillingStatus(
  status: Stripe.Subscription.Status,
): string {
  return status;
}

/** Dev / placeholder catalog prices (no Stripe subscription object). */
export function userBillingPatchPlaceholder(args: {
  planId: string;
  subscriptionId: string;
  customerId: string | null;
}): Record<string, unknown> {
  return {
    billingPlan: args.planId,
    billingStatus: "active",
    billingSubscriptionId: args.subscriptionId,
    billingCustomerId: args.customerId,
    billingPaymentFailed: false,
    firstPaidAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

export function userBillingPatchFromSubscription(args: {
  planId: string;
  subscription: Stripe.Subscription;
}): Record<string, unknown> {
  const customerId =
    typeof args.subscription.customer === "string"
      ? args.subscription.customer
      : args.subscription.customer?.id ?? null;

  const periodEnd = (
    args.subscription as Stripe.Subscription & { current_period_end?: number }
  ).current_period_end;

  return {
    billingPlan: args.planId,
    billingStatus: subscriptionStatusToBillingStatus(args.subscription.status),
    billingSubscriptionId: args.subscription.id,
    billingCustomerId: customerId,
    billingCurrentTermEnd:
      periodEnd != null ? Timestamp.fromMillis(periodEnd * 1000) : null,
    billingScheduledCancellation: args.subscription.cancel_at_period_end === true,
    billingPaymentFailed: false,
    firstPaidAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}
