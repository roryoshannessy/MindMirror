/**
 * Lead docs mix server-trustable fields with browser-supplied matching hints.
 * Downstream (Stripe, CAPI) must treat `attribution` / ids as hints, not ground truth.
 */
export const CLIENT_SIGNALS_PROVENANCE = "browser_unverified" as const;
