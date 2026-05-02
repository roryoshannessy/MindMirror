import { brand } from "@/config/brand";

export const ANALYTICS_CONSENT_STORAGE_KEY = `${brand.STORAGE_PREFIX}_analytics_consent_v1`;
export const ANALYTICS_CONSENT_EVENT = "mm-analytics-consent";

const STORAGE_KEY = ANALYTICS_CONSENT_STORAGE_KEY;

export type AnalyticsConsentValue = "granted" | "denied";

/** Third-party analytics (PostHog, Meta Pixel) allowed — not first-party attribution localStorage. */
export function getAnalyticsConsent(): AnalyticsConsentValue | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "granted" || v === "denied") return v;
  return null;
}

export function setAnalyticsConsent(value: AnalyticsConsentValue): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
}

export function analyticsConsentRequired(): boolean {
  return process.env.NEXT_PUBLIC_ANALYTICS_REQUIRES_CONSENT === "1";
}

/** PostHog + Meta may run (subject to DISABLED). */
export function isAnalyticsVendorAllowed(): boolean {
  if (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "1") return false;
  if (!analyticsConsentRequired()) return true;
  return getAnalyticsConsent() === "granted";
}

/** Email / user-id style traits to PostHog + Meta advanced matching. Default on unless explicitly "0". */
export function isAnalyticsPiiToVendorsAllowed(): boolean {
  return process.env.NEXT_PUBLIC_ANALYTICS_SEND_PII !== "0";
}
