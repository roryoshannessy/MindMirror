"use client";

import {
  ANALYTICS_CONSENT_EVENT,
  ANALYTICS_CONSENT_STORAGE_KEY,
  analyticsConsentRequired,
} from "@/lib/analytics-consent";

/** For `useSyncExternalStore` — third-party scripts (PostHog, Meta). */
export function subscribeAnalyticsVendorAllowed(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(ANALYTICS_CONSENT_EVENT, callback);
  return () => window.removeEventListener(ANALYTICS_CONSENT_EVENT, callback);
}

export function getAnalyticsVendorAllowedSnapshot(): boolean {
  if (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "1") return false;
  if (typeof window === "undefined") return false;
  if (!analyticsConsentRequired()) return true;
  return window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY) === "granted";
}
