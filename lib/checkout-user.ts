import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { normalizeEmail } from "@/lib/normalize-email";

export async function ensureUserDocForCheckout(args: {
  uid: string;
  email: string;
  locale: string;
}): Promise<void> {
  const ref = getAdminDb().doc(`users/${args.uid}`);
  const snap = await ref.get();
  const now = FieldValue.serverTimestamp();
  const loc = args.locale.slice(0, 16);
  const base: Record<string, unknown> = {
    uid: args.uid,
    email: args.email.trim(),
    emailNormalized: normalizeEmail(args.email),
    locale: loc,
    updatedAt: now,
    lastActiveAt: now,
  };

  if (!snap.exists) {
    await ref.set({
      ...base,
      createdAt: now,
      displayName: null,
      billingPlan: "free",
      billingStatus: null,
      billingCustomerId: null,
      billingSubscriptionId: null,
      billingCurrentTermEnd: null,
      billingScheduledCancellation: false,
      billingPaymentFailed: false,
      firstPaidAt: null,
      attributionSource: null,
      attributionMedium: null,
      attributionCampaign: null,
      attributionAdset: null,
      attributionTerm: null,
      attributionContent: null,
      attributionPlacement: null,
      attributionFbclid: null,
      attributionLandingPage: null,
      attributionReferrer: null,
      metaFbp: null,
      metaFbc: null,
      posthogDistinctId: null,
      posthogSessionId: null,
      funnelSessionId: null,
      lastKnownIp: null,
      lastKnownCountry: null,
      lastKnownRegion: null,
      lastKnownCity: null,
      lastKnownUserAgent: null,
      lastPurchaseAttribution: null,
      isTestUser: false,
    });
  } else {
    await ref.set(base, { merge: true });
  }
}
