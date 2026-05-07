import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendPurchase, type CapiUserData } from "@/lib/meta-capi";
import type { PurchaseAttributionSnapshot } from "@/lib/purchase-attribution";
import { userBillingPatchFromSubscription } from "@/lib/stripe-billing-projection";
import { getStripe } from "@/lib/stripe-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAlreadyExists(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const o = err as { code?: number; message?: string };
  return o.code === 6 || Boolean(o.message?.includes("ALREADY_EXISTS"));
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const sub = invoice.parent?.subscription_details?.subscription;
  if (typeof sub === "string") return sub;
  if (sub && typeof sub === "object" && "id" in sub) return sub.id;
  return null;
}

function testEventCode(): string | null {
  return process.env.META_CAPI_TEST_EVENT_CODE?.trim() || null;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

function isMetaCapiConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() &&
      process.env.META_CAPI_ACCESS_TOKEN?.trim(),
  );
}

async function dispatchStripeEvent(event: Stripe.Event, stripe: Stripe, db: Firestore): Promise<void> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "subscription") return;

    const checkoutSessionId = session.metadata?.checkoutSessionId;
    const uid = session.metadata?.uid;
    const planId = session.metadata?.planId;
    if (!checkoutSessionId || !uid || !planId) return;

    const subId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    if (!subId) return;

    const sub = await stripe.subscriptions.retrieve(subId);
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;

    await db.doc(`checkout_sessions/${checkoutSessionId}`).set(
      {
        status: "completed",
        externalCheckoutSessionId: session.id,
        externalSubscriptionId: sub.id,
        externalCustomerId: customerId,
        entitlement: { status: "granted", grantedAt: FieldValue.serverTimestamp() },
        claim: { status: "pending" },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    await db
      .doc(`users/${uid}`)
      .set(userBillingPatchFromSubscription({ planId, subscription: sub }), { merge: true });
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice;
    if (invoice.billing_reason !== "subscription_create") return;

    const invoiceId = invoice.id;
    if (!invoiceId) return;

    const snapMeta = invoice.parent?.subscription_details?.metadata;
    let uid: string | null =
      typeof invoice.metadata?.uid === "string"
        ? invoice.metadata.uid
        : typeof snapMeta?.uid === "string"
          ? snapMeta.uid
          : null;
    let planId: string | null =
      typeof invoice.metadata?.planId === "string"
        ? invoice.metadata.planId
        : typeof snapMeta?.planId === "string"
          ? snapMeta.planId
          : null;
    let checkoutSessionId: string | null =
      typeof invoice.metadata?.checkoutSessionId === "string"
        ? invoice.metadata.checkoutSessionId
        : typeof snapMeta?.checkoutSessionId === "string"
          ? snapMeta.checkoutSessionId
          : null;

    const subRef = subscriptionIdFromInvoice(invoice);
    if (subRef) {
      const sub = await stripe.subscriptions.retrieve(subRef);
      uid = uid ?? (typeof sub.metadata?.uid === "string" ? sub.metadata.uid : null);
      planId =
        planId ?? (typeof sub.metadata?.planId === "string" ? sub.metadata.planId : null);
      checkoutSessionId =
        checkoutSessionId ??
        (typeof sub.metadata?.checkoutSessionId === "string"
          ? sub.metadata.checkoutSessionId
          : null);
    }

    const userRef = uid ? db.doc(`users/${uid}`) : null;
    const profile = userRef ? (await userRef.get()).data() : undefined;

    // Read checkout session to get full attribution context and purchaseEventId
    let checkoutAttribution = null;
    let purchaseEventId: string | null = null;

    if (checkoutSessionId) {
      // If checkoutSessionId exists, we MUST have purchaseEventId from checkout_sessions
      // Do not fall back to invoiceId — this would break Pixel/CAPI deduplication
      try {
        const checkoutSnap = await db.doc(`checkout_sessions/${checkoutSessionId}`).get();
        if (!checkoutSnap.exists) {
          // Document should exist; if not, this is a fatal error that requires retry
          throw new Error(
            `Checkout session not found for invoice ${invoiceId}: ${checkoutSessionId}`,
          );
        }
        const checkoutData = checkoutSnap.data();
        checkoutAttribution = checkoutData?.attributionSnapshot ?? null;
        // purchaseEventId was generated upfront when checkout_sessions was created
        purchaseEventId = (checkoutData?.purchaseEventId as string | undefined) ?? null;
        if (!purchaseEventId) {
          // purchaseEventId should always exist if checkoutSessionId exists
          throw new Error(
            `Purchase event ID missing from checkout session for invoice ${invoiceId}: ${checkoutSessionId}`,
          );
        }
      } catch (e) {
        // Transient or fatal failure reading checkout session — Stripe will retry
        console.error(`[stripe webhook] failed to read/process checkout session`, e);
        throw e;
      }
    } else {
      // Legacy: no checkoutSessionId in metadata (old checkout flow or manual payment)
      // Fall back to invoiceId only for backwards compatibility
      purchaseEventId = `purchase_${invoiceId}`;
      console.warn(
        `[stripe webhook] using invoiceId fallback for event ${event.id} (no checkoutSessionId)`,
      );
    }

    const paid = invoice.amount_paid ?? 0;
    const currency = (invoice.currency ?? "usd").toUpperCase();

    const customerId =
      typeof invoice.customer === "string"
        ? invoice.customer
        : invoice.customer?.id ?? null;

    if (checkoutSessionId) {
      await db.doc(`checkout_sessions/${checkoutSessionId}`).set(
        {
          externalInvoiceId: invoiceId,
          ...(subRef ? { externalSubscriptionId: subRef } : {}),
          ...(customerId ? { externalCustomerId: customerId } : {}),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    const snap: PurchaseAttributionSnapshot = {
      planId,
      subscriptionId: subRef,
      customerId,
      invoiceId,
      valueCents: paid,
      currency,
      contentName: planId ?? "subscription",
      uid,
      attributionContext: checkoutAttribution,
    };

    if (userRef) {
      await userRef.set(
        {
          lastPurchaseAttribution: snap,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }

    let leadData: Record<string, unknown> = {};
    const email =
      typeof profile?.email === "string" ? profile.email.toLowerCase().trim() : null;
    if (email) {
      const leadSnap = await db.doc(`leads/${email}`).get();
      leadData = leadSnap.data() ?? {};
    }

    const checkoutMatching = snap.attributionContext?.matching;
    const userData: CapiUserData = {
      email: (leadData.email as string | undefined) ?? email,
      fbp:
        (checkoutMatching?.metaFbp as string | undefined) ??
        (leadData.metaFbp as string | undefined) ??
        null,
      fbc:
        (checkoutMatching?.metaFbc as string | undefined) ??
        (leadData.metaFbc as string | undefined) ??
        null,
      externalId: uid || null,
    };

    const capiLogRef = db.doc(`capi_purchase_events/${invoiceId}`);
    const baseCapiLog = {
      invoiceId,
      subscriptionId: subRef ?? null,
      uid: uid ?? "",
      amountPaidCents: paid,
      currencyCode: currency,
      contentName: snap.contentName,
      attributionSnapshot: snap,
      purchaseEventId,
      stripeEventId: event.id,
      eventSourceUrl: siteUrl(),
      attemptedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    try {
      if (profile?.isTestUser === true) {
        await capiLogRef.set({
          ...baseCapiLog,
          status: "skipped_test_user",
        });
        return;
      }

      if (!isMetaCapiConfigured()) {
        await capiLogRef.set({
          ...baseCapiLog,
          status: "skipped_not_configured",
        });
        return;
      }

      const capiResult = await sendPurchase({
        eventId: purchaseEventId,
        eventTime: event.created,
        eventSourceUrl: siteUrl(),
        userData,
        customData: {
          value: paid / 100,
          currency,
          contentName: snap.contentName,
        },
        testEventCode: testEventCode(),
      });

      await capiLogRef.set({
        ...baseCapiLog,
        status: capiResult.ok ? "sent" : "failed",
        sentAt: capiResult.ok ? FieldValue.serverTimestamp() : null,
        error: capiResult.ok ? null : capiResult.error,
      });
    } catch (e) {
      console.error("[stripe webhook] CAPI send/log failed", e);
      try {
        await capiLogRef.set(
          {
            ...baseCapiLog,
            status: "failed",
            error: String(e),
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      } catch (logError) {
        console.error("[stripe webhook] CAPI failure log failed", logError);
      }
    }
  }
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 501 });
  }

  const body = await req.text();
  const hdrs = await headers();
  const sig = hdrs.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    console.error("[stripe webhook] verify", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = getAdminDb();
  const stateRef = db.doc(`stripe_webhook_state/${event.id}`);
  const PROCESSING_TIMEOUT_MS = 60_000; // 60 seconds
  const MAX_ATTEMPTS = 5;

  // Idempotency: Track webhook state to prevent duplicate processing
  let shouldRetryDispatch = false;
  try {
    await stateRef.create({
      status: "received",
      type: event.type,
      attempts: 0,
      receivedAt: FieldValue.serverTimestamp(),
    });
  } catch (e: unknown) {
    if (isAlreadyExists(e)) {
      // Webhook already received, check its state
      const existingState = await stateRef.get();
      if (existingState.exists) {
        const state = existingState.data();
        if (state?.status === "processed") {
          // Already processed successfully, return 200 to prevent Stripe retries
          return NextResponse.json({ received: true });
        }
        // If processing, check if it's stale (timeout exceeded)
        if (state?.status === "processing") {
          const processingStartedAt = state.processingStartedAt?.toMillis?.() ?? 0;
          const elapsedMs = Date.now() - processingStartedAt;
          if (elapsedMs > PROCESSING_TIMEOUT_MS) {
            // Processing timed out, allow retry
            shouldRetryDispatch = true;
          } else {
            // Still processing within timeout, ask Stripe to retry later
            return NextResponse.json(
              { error: "Webhook still processing" },
              { status: 503 }
            );
          }
        }
        // If failed, check attempt count and allow retry if under limit
        if (state?.status === "failed") {
          const attempts = state.attempts ?? 0;
          if (attempts < MAX_ATTEMPTS) {
            shouldRetryDispatch = true;
          } else {
            // Max attempts exceeded, return 200 to stop Stripe retries
            console.error(
              `[stripe webhook] event ${event.id} exceeded max attempts (${MAX_ATTEMPTS}), giving up`
            );
            return NextResponse.json({ received: true });
          }
        }
      }
      // If shouldRetryDispatch is true, fall through to dispatch logic
      if (!shouldRetryDispatch) {
        // State existed but wasn't in a retryable condition
        console.error("[stripe webhook] unable to determine retry state", e);
        return NextResponse.json(
          { error: "Unable to track webhook state" },
          { status: 503 }
        );
      }
    } else {
      // Not an ALREADY_EXISTS error, genuine state tracking failure
      console.error("[stripe webhook] state creation failed", e);
      return NextResponse.json(
        { error: "Unable to track webhook state" },
        { status: 503 }
      );
    }
  }

  // Mark as processing (only if first time or retrying from failed)
  if (!shouldRetryDispatch) {
    try {
      await stateRef.update({
        status: "processing",
        processingStartedAt: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.error("[stripe webhook] mark processing", e);
      return NextResponse.json(
        { error: "Unable to update webhook state" },
        { status: 503 }
      );
    }
  } else {
    // Update as processing retry
    try {
      await stateRef.update({
        status: "processing",
        processingStartedAt: FieldValue.serverTimestamp(),
        attempts: FieldValue.increment(1),
      });
    } catch (e) {
      console.error("[stripe webhook] mark processing (retry)", e);
      return NextResponse.json(
        { error: "Unable to update webhook state" },
        { status: 503 }
      );
    }
  }

  // Attempt dispatch
  let dispatchSucceeded = false;
  let dispatchError: unknown;
  try {
    await dispatchStripeEvent(event, stripe, db);
    dispatchSucceeded = true;
  } catch (e) {
    dispatchError = e;
    console.error("[stripe webhook] dispatch", e);
  }

  // Only mark as processed if dispatch succeeded
  if (dispatchSucceeded) {
    try {
      await stateRef.update({
        status: "processed",
        processedAt: FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.error("[stripe webhook] mark processed", e);
      // Even if state update fails, dispatch succeeded, so return 200
      return NextResponse.json({ received: true });
    }
    return NextResponse.json({ received: true });
  }

  // Dispatch failed, update state to "failed" and return 503 so Stripe retries
  try {
    await stateRef.update({
      status: "failed",
      lastError: String(dispatchError),
      lastErrorAt: FieldValue.serverTimestamp(),
    });
  } catch (e) {
    console.error("[stripe webhook] mark failed", e);
  }
  console.error("[stripe webhook] dispatch failed, returning 503 for retry");
  return NextResponse.json(
    { error: "Webhook dispatch failed" },
    { status: 503 }
  );
}
