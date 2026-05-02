import { createHash, randomBytes } from "node:crypto";
import { FieldValue, Timestamp, type DocumentData } from "firebase-admin/firestore";
import type { CommercialAttributionContext } from "@/lib/attribution-server";
import { getAdminDb } from "@/lib/firebase-admin";
import { normalizeEmail } from "@/lib/normalize-email";

export const CHECKOUT_SESSIONS_COLLECTION = "checkout_sessions";

export type CheckoutSessionStatus =
  | "created"
  | "email_confirmed"
  | "provider_handoff"
  | "completed"
  | "failed"
  | "expired"
  | "abandoned";

export type CheckoutClaimStatus = "pending" | "email_sent" | "claimed" | "not_needed";

export type CheckoutEntitlementStatus =
  | "pending"
  | "granted"
  | "not_granted"
  | "not_needed";

export type CheckoutSessionDoc = {
  id: string;
  email: string;
  emailNormalized: string;
  uid: string | null;
  status: CheckoutSessionStatus;
  planId: string;
  locale: string;
  externalCheckoutSessionId: string | null;
  externalSubscriptionId: string | null;
  externalInvoiceId: string | null;
  externalCustomerId: string | null;
  resumeTokenHash: string;
  /** Stable purchase event ID for Pixel/CAPI deduplication. Generated upfront, reused by all webhooks. */
  purchaseEventId: string;
  claim: {
    status: CheckoutClaimStatus;
    emailSentAt?: Timestamp;
    claimedAt?: Timestamp;
  };
  entitlement: {
    status: CheckoutEntitlementStatus;
    grantedAt?: Timestamp;
  };
  attributionSnapshot: CommercialAttributionContext;
  funnelSessionId: string | null;
  createdAt: FieldValue | Timestamp;
  updatedAt: FieldValue | Timestamp;
  expiresAt: Timestamp;
};

export function newCheckoutSessionId(): string {
  return `chk_${randomBytes(16).toString("hex")}`;
}

export function newResumeToken(): string {
  return randomBytes(24).toString("base64url");
}

/**
 * Generate stable purchase event ID upfront using checkoutSessionId.
 * Used by both browser Pixel and CAPI for deduplication.
 * Format: purchase_{checkoutSessionId}
 */
export function newPurchaseEventId(checkoutSessionId: string): string {
  return `purchase_${checkoutSessionId}`;
}

export function hashResumeToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function checkoutSessionRef(id: string) {
  return getAdminDb().doc(`${CHECKOUT_SESSIONS_COLLECTION}/${id}`);
}

export function isPaidBillingUser(data: DocumentData | undefined): boolean {
  if (!data) return false;
  const plan = data.billingPlan;
  if (typeof plan === "string" && plan !== "" && plan !== "free") return true;
  const s = data.billingStatus;
  return s === "active" || s === "trialing";
}

export function defaultExpiresAt(): Timestamp {
  return Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000);
}

export function buildNewCheckoutSessionPayload(input: {
  id: string;
  email: string;
  planId: string;
  locale: string;
  uid: string | null;
  attributionSnapshot: CommercialAttributionContext;
  funnelSessionId: string | null;
  purchaseEventId: string;
}): Record<string, unknown> {
  const emailNorm = normalizeEmail(input.email);
  const now = FieldValue.serverTimestamp();
  return {
    id: input.id,
    email: input.email.trim(),
    emailNormalized: emailNorm,
    uid: input.uid,
    status: "email_confirmed" as const,
    planId: input.planId,
    locale: input.locale,
    externalCheckoutSessionId: null,
    externalSubscriptionId: null,
    externalInvoiceId: null,
    externalCustomerId: null,
    /** Replaced with a real hash in POST /api/checkout/session before Stripe (or placeholder) handoff. */
    resumeTokenHash: "pending",
    purchaseEventId: input.purchaseEventId,
    claim: { status: "pending" as const },
    entitlement: { status: "pending" as const },
    attributionSnapshot: input.attributionSnapshot,
    funnelSessionId: input.funnelSessionId,
    createdAt: now,
    updatedAt: now,
    expiresAt: defaultExpiresAt(),
  };
}
