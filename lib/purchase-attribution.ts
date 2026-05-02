import type { DocumentData } from "firebase-admin/firestore";
import type Stripe from "stripe";
import type { CommercialAttributionContext } from "@/lib/attribution-server";

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription;
  if (typeof sub === "string") return sub;
  if (sub && typeof sub === "object" && "id" in sub) return sub.id;
  return null;
}

/**
 * Snapshot stored on `capi_purchases_pending` and `users.lastPurchaseAttribution`.
 * Preserves full checkout-time attribution context for CAPI.
 */
export type PurchaseAttributionSnapshot = {
  planId: string | null;
  subscriptionId: string | null;
  customerId: string | null;
  invoiceId: string | null;
  valueCents: number;
  currency: string;
  contentName: string;
  uid: string | null;
  // Full checkout-time attribution context
  attributionContext: CommercialAttributionContext | null;
};

export function buildPurchaseAttributionSnapshotFromStripeEvent(
  event: Stripe.Event,
  profile: DocumentData | undefined,
): PurchaseAttributionSnapshot | null {
  if (event.type !== "invoice.paid") return null;
  const invoice = event.data.object as Stripe.Invoice;
  const uid =
    (invoice.metadata?.uid as string | undefined)?.trim() ||
    (typeof profile?.uid === "string" ? profile.uid : null);
  const planId =
    (invoice.metadata?.planId as string | undefined)?.trim() ||
    (typeof profile?.billingPlan === "string" ? profile.billingPlan : null);
  const subId = subscriptionIdFromInvoice(invoice);
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;

  const paid = invoice.amount_paid ?? 0;
  const currency = (invoice.currency ?? "usd").toUpperCase();

  return {
    planId,
    subscriptionId: subId,
    customerId,
    invoiceId: invoice.id ?? null,
    valueCents: paid,
    currency,
    contentName: typeof planId === "string" ? planId : "subscription",
    uid,
    attributionContext: null,
  };
}
