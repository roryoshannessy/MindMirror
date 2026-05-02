import { FieldValue } from "firebase-admin/firestore";
import { normalizeEmail } from "@/lib/normalize-email";
import type { MagicLinkState } from "@/lib/magic-link-state.types";
import { getAdminDb } from "@/lib/firebase-admin";

export async function mergeUserProfileFromHydration(args: {
  uid: string;
  email: string | null;
  displayName: string | null;
  locale: string;
  isTestUser: boolean;
  magicLinkState: MagicLinkState | null;
}): Promise<void> {
  const ref = getAdminDb().doc(`users/${args.uid}`);
  const snap = await ref.get();
  const now = FieldValue.serverTimestamp();

  const existingTest = snap.data()?.isTestUser === true;
  const isTestUser = existingTest || args.isTestUser;

  const patch: Record<string, unknown> = {
    uid: args.uid,
    email: args.email,
    emailNormalized: args.email ? normalizeEmail(args.email) : null,
    displayName: args.displayName,
    locale: args.locale,
    updatedAt: now,
    lastActiveAt: now,
    isTestUser,
  };

  if (!snap.exists) {
    patch.createdAt = now;
    patch.billingPlan = "free";
    patch.billingStatus = null;
    patch.billingCustomerId = null;
    patch.billingSubscriptionId = null;
    patch.billingCurrentTermEnd = null;
    patch.billingScheduledCancellation = false;
    patch.billingPaymentFailed = false;
    patch.firstPaidAt = null;
    patch.attributionSource = null;
    patch.attributionMedium = null;
    patch.attributionCampaign = null;
    patch.attributionAdset = null;
    patch.attributionTerm = null;
    patch.attributionContent = null;
    patch.attributionPlacement = null;
    patch.attributionFbclid = null;
    patch.attributionLandingPage = null;
    patch.attributionReferrer = null;
    patch.metaFbp = null;
    patch.metaFbc = null;
    patch.posthogDistinctId = null;
    patch.posthogSessionId = null;
    patch.funnelSessionId = null;
    patch.lastKnownIp = null;
    patch.lastKnownCountry = null;
    patch.lastKnownRegion = null;
    patch.lastKnownCity = null;
    patch.lastKnownUserAgent = null;
    patch.lastPurchaseAttribution = null;
  }

  const s = args.magicLinkState;
  if (s?.posthogDistinctId) patch.posthogDistinctId = s.posthogDistinctId;
  if (s?.posthogSessionId) patch.posthogSessionId = s.posthogSessionId;
  if (s?.funnelSessionId) patch.funnelSessionId = s.funnelSessionId;
  if (s?.metaFbp) patch.metaFbp = s.metaFbp;
  if (s?.metaFbc) patch.metaFbc = s.metaFbc;
  if (s?.locale) patch.locale = s.locale.slice(0, 16);

  await ref.set(patch, { merge: true });
}
