import { captureAttribution } from "@/lib/attribution";

/**
 * First-party attribution only (localStorage). PostHog + Meta bootstrap from
 * `PostHogProvider` after optional consent (`NEXT_PUBLIC_ANALYTICS_REQUIRES_CONSENT`).
 */
if (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED !== "1") {
  captureAttribution();
}
