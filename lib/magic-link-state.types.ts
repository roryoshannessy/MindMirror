export type MagicLinkState = {
  returnTo?: string;
  posthogDistinctId?: string;
  posthogSessionId?: string;
  funnelSessionId?: string;
  metaFbp?: string;
  metaFbc?: string;
  source?: string;
  /** Post-checkout claim flow */
  checkoutSessionId?: string;
  locale?: string;
};
