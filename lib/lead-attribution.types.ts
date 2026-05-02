/** Serializable attribution touch (client → server, Firestore). */
export type AttributionTouch = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  fbclid: string | null;
  gclid: string | null;
  msclkid: string | null;
  landingPage: string | null;
  referrer: string | null;
  capturedAt: string;
};

export type LeadAttributionInput = {
  firstTouch: AttributionTouch | null;
  lastTouch: AttributionTouch | null;
};
