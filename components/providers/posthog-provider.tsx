"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnalyticsConsentBanner } from "@/components/consent/analytics-consent-banner";
import { onAnalyticsRouteChange } from "@/lib/analytics";
import {
  getAnalyticsVendorAllowedSnapshot,
  subscribeAnalyticsVendorAllowed,
} from "@/lib/analytics-consent-subscribe";
import { initPostHog } from "@/lib/posthog";

type Props = { children: React.ReactNode };

export function PostHogProvider({ children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  const vendorAllowed = useSyncExternalStore(
    subscribeAnalyticsVendorAllowed,
    getAnalyticsVendorAllowedSnapshot,
    () => false,
  );

  useEffect(() => {
    if (!vendorAllowed || process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "1") return;
    initPostHog();
  }, [vendorAllowed]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ANALYTICS_DISABLED === "1") return;
    if (!vendorAllowed) return;
    onAnalyticsRouteChange(pathname, searchKey);
  }, [pathname, searchKey, vendorAllowed]);

  return (
    <>
      {children}
      <AnalyticsConsentBanner />
    </>
  );
}
