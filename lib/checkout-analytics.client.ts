"use client";

import { ensureMetaPixelReady, trackPixelPurchase } from "@/lib/meta-pixel";
import { getPostHog, initPostHog } from "@/lib/posthog";

export function capturePurchaseCompleted(props: {
  planId: string;
  purchaseEventId: string;
  valueCents: number;
  currency: string;
}): void {
  // Use the stable purchaseEventId generated server-side at payment time
  // This matches the event_id sent by CAPI batcher for Meta deduplication
  const eventId = props.purchaseEventId;

  initPostHog();
  try {
    getPostHog().capture("purchase_completed", {
      plan_id: props.planId,
      purchase_event_id: props.purchaseEventId,
      value: props.valueCents / 100,
      currency: props.currency,
    });
  } catch {
    /* optional */
  }

  void ensureMetaPixelReady().then(() => {
    trackPixelPurchase({
      value: props.valueCents / 100,
      currency: props.currency,
      contentName: props.planId,
      eventId,
    });
  });
}
