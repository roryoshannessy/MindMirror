"use client";

import { useEffect, useState } from "react";
import {
  analyticsConsentRequired,
  getAnalyticsConsent,
  setAnalyticsConsent,
} from "@/lib/analytics-consent";
import { Button } from "@/components/ui/button";

export function AnalyticsConsentBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!analyticsConsentRequired()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShow(getAnalyticsConsent() === null);
  }, []);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Analytics consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-4 py-3 text-card-foreground shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/80 sm:px-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use PostHog and Meta Pixel for product analytics and attribution. You can accept
          third-party analytics or continue with essential functionality only (first-party
          attribution may still use local storage).
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-border"
            onClick={() => {
              setAnalyticsConsent("denied");
              setShow(false);
            }}
          >
            Essential only
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setAnalyticsConsent("granted");
              setShow(false);
            }}
          >
            Accept analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
