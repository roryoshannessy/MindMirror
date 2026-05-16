"use client";

import { captureAttribution, readLeadAttributionInput } from "@/lib/attribution";
import {
  isAnalyticsPiiToVendorsAllowed,
  isAnalyticsVendorAllowed,
} from "@/lib/analytics-consent";
import { getOrCreateFunnelSessionId } from "@/lib/funnel-session";
import type { LeadSource } from "@/lib/lead-types";
import {
  ensureMetaPixelReady,
  getMetaCookies,
  identifyPixelUser,
  trackPixelPageView,
} from "@/lib/meta-pixel";
import { getPostHog, initPostHog } from "@/lib/posthog";

function currentUrlForAnalytics(pathname: string, searchKey: string): string {
  if (typeof window !== "undefined") {
    return window.location.href.split("#")[0].slice(0, 8192);
  }
  return searchKey ? `${pathname}?${searchKey}` : pathname;
}

export function onAnalyticsRouteChange(pathname: string, searchKey: string): void {
  if (!isAnalyticsVendorAllowed()) return;

  captureAttribution();
  void ensureMetaPixelReady()
    .then(() => trackPixelPageView())
    .catch(() => {
      /* Pixel optional */
    });

  initPostHog();
  const ph = getPostHog();
  const url = currentUrlForAnalytics(pathname, searchKey);
  try {
    ph.capture("$pageview", { $current_url: url });
  } catch {
    /* not loaded */
  }
}

export function buildLeadCapturePayload(input: {
  email: string;
  source: LeadSource;
  locale?: string;
  entryUrl?: string;
  turnstileToken?: string;
  quiz?: Record<string, unknown> | null;
}): Record<string, unknown> {
  const attribution = readLeadAttributionInput();
  const funnelSessionId = getOrCreateFunnelSessionId();
  let posthogDistinctId: string | undefined;
  let posthogSessionId: string | undefined;
  if (isAnalyticsVendorAllowed()) {
    try {
      initPostHog();
      const ph = getPostHog();
      posthogDistinctId = ph.get_distinct_id?.();
      posthogSessionId = (ph as { get_session_id?: () => string | undefined }).get_session_id?.();
    } catch {
      /* optional */
    }
  }
  const { fbp, fbc } = getMetaCookies();
  const out: Record<string, unknown> = {
    email: input.email.trim(),
    source: input.source,
    posthogDistinctId,
    posthogSessionId,
    metaFbp: fbp,
    metaFbc: fbc,
    attribution,
    funnelSessionId: funnelSessionId || undefined,
    entryUrl:
      input.entryUrl ??
      (typeof window !== "undefined" ? window.location.href.slice(0, 4096) : undefined),
    locale: input.locale,
    browserLanguage:
      typeof navigator !== "undefined" ? navigator.language?.slice(0, 64) : undefined,
    timezone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone?.slice(0, 128)
        : undefined,
  };
  if (input.turnstileToken) {
    out.turnstileToken = input.turnstileToken;
  }
  if (input.quiz != null) {
    out.quiz = input.quiz;
  }
  return out;
}

export function identifyAnalyticsUser(
  uid: string,
  traits?: { email?: string | null },
): void {
  if (!isAnalyticsVendorAllowed()) return;
  if (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "1") return;

  const sendPii = isAnalyticsPiiToVendorsAllowed();

  try {
    const ph = getPostHog();
    initPostHog();
    ph.identify(uid, sendPii && traits?.email ? { email: traits.email } : {});
  } catch {
    /* optional */
  }

  if (sendPii) {
    identifyPixelUser(uid);
  }
}
