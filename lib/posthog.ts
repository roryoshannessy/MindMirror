"use client";

import posthog from "posthog-js";

let initialized = false;

export function initPostHog(): void {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "1") return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  const isDev = process.env.NODE_ENV === "development";
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  const apiHost = isDev ? host : "/t";

  if (initialized) return;
  initialized = true;

  posthog.init(key, {
    api_host: apiHost,
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: false,
    persistence: "localStorage+cookie",
  });
}

export function getPostHog() {
  return posthog;
}
