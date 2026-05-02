import type { DocumentData } from "firebase-admin/firestore";
import type { AttributionTouch } from "@/lib/lead-attribution.types";
import { getAdminDb } from "@/lib/firebase-admin";
import { normalizeEmail } from "@/lib/normalize-email";

export type CommercialAcquisition = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  adset: string | null;
  placement: string | null;
  fbclid: string | null;
  gclid: string | null;
  msclkid: string | null;
  landingPage: string | null;
  referrer: string | null;
};

export type CommercialMatching = {
  metaFbp: string | null;
  metaFbc: string | null;
  ip: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  userAgent: string | null;
  posthogDistinctId: string | null;
  posthogSessionId: string | null;
  funnelSessionId: string | null;
};

export type CommercialAttributionContext = {
  acquisition: CommercialAcquisition;
  matching: CommercialMatching;
};

const ACQ_KEYS: (keyof CommercialAcquisition)[] = [
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmTerm",
  "utmContent",
  "adset",
  "placement",
  "fbclid",
  "gclid",
  "msclkid",
  "landingPage",
  "referrer",
];

const MATCH_KEYS: (keyof CommercialMatching)[] = [
  "metaFbp",
  "metaFbc",
  "ip",
  "country",
  "region",
  "city",
  "userAgent",
  "posthogDistinctId",
  "posthogSessionId",
  "funnelSessionId",
];

export function emptyAcquisition(): CommercialAcquisition {
  return {
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmTerm: null,
    utmContent: null,
    adset: null,
    placement: null,
    fbclid: null,
    gclid: null,
    msclkid: null,
    landingPage: null,
    referrer: null,
  };
}

export function emptyMatching(): CommercialMatching {
  return {
    metaFbp: null,
    metaFbc: null,
    ip: null,
    country: null,
    region: null,
    city: null,
    userAgent: null,
    posthogDistinctId: null,
    posthogSessionId: null,
    funnelSessionId: null,
  };
}

function touchToAcquisition(t: AttributionTouch): CommercialAcquisition {
  return {
    utmSource: t.utmSource,
    utmMedium: t.utmMedium,
    utmCampaign: t.utmCampaign,
    utmTerm: t.utmTerm,
    utmContent: t.utmContent,
    adset: null,
    placement: null,
    fbclid: t.fbclid,
    gclid: t.gclid,
    msclkid: t.msclkid,
    landingPage: t.landingPage,
    referrer: t.referrer,
  };
}

function acquisitionFromLeadDoc(data: DocumentData): CommercialAcquisition {
  const attr = data.attribution as { firstTouch?: AttributionTouch; lastTouch?: AttributionTouch } | null;
  const first = attr?.firstTouch;
  if (first) return touchToAcquisition(first);
  return emptyAcquisition();
}

function acquisitionFromUserDoc(data: DocumentData): CommercialAcquisition {
  return {
    utmSource: strOrNull(data.attributionSource),
    utmMedium: strOrNull(data.attributionMedium),
    utmCampaign: strOrNull(data.attributionCampaign),
    utmTerm: strOrNull(data.attributionTerm),
    utmContent: strOrNull(data.attributionContent),
    adset: strOrNull(data.attributionAdset),
    placement: strOrNull(data.attributionPlacement),
    fbclid: strOrNull(data.attributionFbclid),
    gclid: strOrNull(data.attributionGclid),
    msclkid: strOrNull(data.attributionMsclkid),
    landingPage: strOrNull(data.attributionLandingPage),
    referrer: strOrNull(data.attributionReferrer),
  };
}

function acquisitionFromCheckoutDoc(data: DocumentData): CommercialAcquisition {
  const snap = data.attributionSnapshot as CommercialAttributionContext | undefined;
  return snap?.acquisition ? { ...snap.acquisition } : emptyAcquisition();
}

function strOrNull(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function matchingFromLeadDoc(data: DocumentData): CommercialMatching {
  return {
    metaFbp: strOrNull(data.metaFbp),
    metaFbc: strOrNull(data.metaFbc),
    ip: strOrNull(data.ip),
    country: strOrNull(data.geoCountry),
    region: strOrNull(data.geoRegion),
    city: strOrNull(data.geoCity),
    userAgent: strOrNull(data.userAgent),
    posthogDistinctId: strOrNull(data.posthogDistinctId),
    posthogSessionId: strOrNull(data.posthogSessionId),
    funnelSessionId: strOrNull(data.funnelSessionId),
  };
}

function matchingFromUserDoc(data: DocumentData): CommercialMatching {
  return {
    metaFbp: strOrNull(data.metaFbp),
    metaFbc: strOrNull(data.metaFbc),
    ip: strOrNull(data.lastKnownIp),
    country: strOrNull(data.lastKnownCountry),
    region: strOrNull(data.lastKnownRegion),
    city: strOrNull(data.lastKnownCity),
    userAgent: strOrNull(data.lastKnownUserAgent),
    posthogDistinctId: strOrNull(data.posthogDistinctId),
    posthogSessionId: strOrNull(data.posthogSessionId),
    funnelSessionId: strOrNull(data.funnelSessionId),
  };
}

function matchingFromCheckoutDoc(data: DocumentData): CommercialMatching {
  const snap = data.attributionSnapshot as CommercialAttributionContext | undefined;
  return snap?.matching ? { ...snap.matching } : emptyMatching();
}

/** First source wins per field (priority order left → right). */
export function mergeAcquisitionFirstWins(
  layers: CommercialAcquisition[],
): CommercialAcquisition {
  const out = emptyAcquisition();
  for (const layer of layers) {
    for (const k of ACQ_KEYS) {
      const v = layer[k];
      if (out[k] == null && v != null && v !== "") {
        out[k] = v;
      }
    }
  }
  return out;
}

/** Later layers overwrite earlier ones per field. */
export function mergeMatchingFreshWins(layers: CommercialMatching[]): CommercialMatching {
  const out = emptyMatching();
  for (const layer of layers) {
    for (const k of MATCH_KEYS) {
      const v = layer[k];
      if (v != null && v !== "") {
        out[k] = v;
      }
    }
  }
  return out;
}

export type ResolveCommercialAttributionInput = {
  uid?: string | null;
  email?: string | null;
  checkoutSessionId?: string | null;
  requestSignals?: {
    ip: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    userAgent: string | null;
  };
};

/**
 * Merges user doc, funnel-linked leads, direct lead, checkout session, then request signals.
 *
 * **Acquisition** uses `mergeAcquisitionFirstWins`: the first *layer* that supplies a non-null
 * value wins **per field** — not “whole first-touch blob wins.” If you need a single immutable
 * touch object, read `leads.*.attribution.firstTouch` or snapshot at checkout instead.
 *
 * **Matching** uses last-writer-wins per field across layers. Related leads sharing a
 * `funnelSessionId` exclude the direct lead doc id to avoid duplicate reads.
 */
export async function resolveCommercialAttribution(
  args: ResolveCommercialAttributionInput,
): Promise<CommercialAttributionContext> {
  const db = getAdminDb();
  const acquisitionLayers: CommercialAcquisition[] = [];
  const matchingLayers: CommercialMatching[] = [];

  let userData: DocumentData | null = null;
  if (args.uid) {
    const u = await db.doc(`users/${args.uid}`).get();
    if (u.exists) userData = u.data()!;
  }

  let leadData: DocumentData | null = null;
  let funnelSessionId: string | null = null;
  if (args.email) {
    const id = normalizeEmail(args.email);
    const l = await db.doc(`leads/${id}`).get();
    if (l.exists) {
      leadData = l.data()!;
      funnelSessionId = strOrNull(leadData.funnelSessionId);
    }
  }

  if (!funnelSessionId && userData) {
    funnelSessionId = strOrNull(userData.funnelSessionId);
  }

  const relatedLeadDocs: DocumentData[] = [];
  if (funnelSessionId) {
    const directLeadDocId = args.email ? normalizeEmail(args.email) : null;
    const q = await db
      .collection("leads")
      .where("funnelSessionId", "==", funnelSessionId)
      .limit(25)
      .get();
    for (const d of q.docs) {
      if (directLeadDocId && d.id === directLeadDocId) continue;
      relatedLeadDocs.push(d.data());
    }
  }

  let checkoutData: DocumentData | null = null;
  if (args.checkoutSessionId) {
    const c = await db.doc(`checkout_sessions/${args.checkoutSessionId}`).get();
    if (c.exists) checkoutData = c.data()!;
  }

  if (userData) {
    acquisitionLayers.push(acquisitionFromUserDoc(userData));
    matchingLayers.push(matchingFromUserDoc(userData));
  }

  for (const rel of relatedLeadDocs) {
    acquisitionLayers.push(acquisitionFromLeadDoc(rel));
    matchingLayers.push(matchingFromLeadDoc(rel));
  }

  if (leadData) {
    acquisitionLayers.push(acquisitionFromLeadDoc(leadData));
    matchingLayers.push(matchingFromLeadDoc(leadData));
  }

  if (checkoutData) {
    acquisitionLayers.push(acquisitionFromCheckoutDoc(checkoutData));
    matchingLayers.push(matchingFromCheckoutDoc(checkoutData));
  }

  if (args.requestSignals) {
    matchingLayers.push({
      metaFbp: null,
      metaFbc: null,
      ip: args.requestSignals.ip,
      country: args.requestSignals.country,
      region: args.requestSignals.region,
      city: args.requestSignals.city,
      userAgent: args.requestSignals.userAgent,
      posthogDistinctId: null,
      posthogSessionId: null,
      funnelSessionId: funnelSessionId,
    });
  }

  return {
    acquisition: mergeAcquisitionFirstWins(acquisitionLayers),
    matching: mergeMatchingFreshWins(matchingLayers),
  };
}
