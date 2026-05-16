import {
  emptyAcquisition,
  emptyMatching,
  type CommercialAcquisition,
  type CommercialAttributionContext,
} from "@/lib/attribution-server";
import type { LeadAttributionInput } from "@/lib/lead-attribution.types";

function acquisitionFromLeadInput(
  attr: LeadAttributionInput | null | undefined,
): CommercialAcquisition {
  const t = attr?.lastTouch ?? attr?.firstTouch;
  if (!t) return emptyAcquisition();
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

export function checkoutAttributionFromPayload(input: {
  attribution?: LeadAttributionInput | null;
  funnelSessionId?: string | null;
  posthogDistinctId?: string | null;
  posthogSessionId?: string | null;
  metaFbp?: string | null;
  metaFbc?: string | null;
  entryUrl?: string | null;
  ip?: string | null;
}): CommercialAttributionContext {
  const acq = acquisitionFromLeadInput(input.attribution ?? null);
  if (input.entryUrl && !acq.landingPage) {
    acq.landingPage = input.entryUrl.slice(0, 4096);
  }
  return {
    acquisition: acq,
    matching: {
      ...emptyMatching(),
      metaFbp: input.metaFbp ?? null,
      metaFbc: input.metaFbc ?? null,
      ip: input.ip ?? null,
      posthogDistinctId: input.posthogDistinctId ?? null,
      posthogSessionId: input.posthogSessionId ?? null,
      funnelSessionId: input.funnelSessionId ?? null,
    },
  };
}
