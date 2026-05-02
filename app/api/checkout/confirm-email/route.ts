import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPlanById } from "@/config/commercial-catalog";
import { getOrCreateAuthUserByEmail } from "@/lib/auth-user";
import { checkoutAttributionFromPayload } from "@/lib/checkout-attribution";
import {
  buildNewCheckoutSessionPayload,
  checkoutSessionRef,
  isPaidBillingUser,
  newCheckoutSessionId,
  newPurchaseEventId,
} from "@/lib/checkout-session";
import { ensureUserDocForCheckout } from "@/lib/checkout-user";
import { getAdminDb } from "@/lib/firebase-admin";
import type { LeadAttributionInput } from "@/lib/lead-attribution.types";
import {
  buildCheckoutEmailIpRateLimitKey,
  buildCheckoutEmailRateLimitKey,
  checkRateLimit,
} from "@/lib/request-rate-limit";
import { getStripe } from "@/lib/stripe-server";
import { isPlaceholderStripePriceId } from "@/lib/stripe-placeholders";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW_IP = 20;
const MAX_PER_WINDOW_EMAIL_IP = 5;

const bodySchema = z.object({
  email: z.string().email().max(320),
  planId: z.string().min(1).max(128),
  source: z.string().max(64).optional(),
  locale: z.string().max(16).optional(),
  attribution: z
    .object({
      firstTouch: z.record(z.string(), z.unknown()).nullable().optional(),
      lastTouch: z.record(z.string(), z.unknown()).nullable().optional(),
    })
    .passthrough()
    .optional(),
  funnelSessionId: z.string().max(128).optional(),
  posthogDistinctId: z.string().max(256).optional(),
  posthogSessionId: z.string().max(256).optional(),
  metaFbp: z.string().max(256).optional(),
  metaFbc: z.string().max(256).optional(),
  entryUrl: z.string().max(4096).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;

    const ipLimited = await checkRateLimit(
      buildCheckoutEmailIpRateLimitKey(ip),
      MAX_PER_WINDOW_IP,
      WINDOW_MS,
    );
    if (!ipLimited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(ipLimited.retryAfterMs / 1000)) },
        },
      );
    }

    const emailLimited = await checkRateLimit(
      buildCheckoutEmailRateLimitKey(ip, parsed.data.email),
      MAX_PER_WINDOW_EMAIL_IP,
      WINDOW_MS,
    );
    if (!emailLimited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(emailLimited.retryAfterMs / 1000)) },
        },
      );
    }

    const plan = getPlanById(parsed.data.planId);
    if (!plan) {
      return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
    }

    const stripePriceId = plan.metadata?.stripe_price_id;
    const email = parsed.data.email.trim();
    const locale = parsed.data.locale?.trim() || "en";

    const uid = await getOrCreateAuthUserByEmail(email);
    const userSnap = await getAdminDb().doc(`users/${uid}`).get();
    const existedBefore = userSnap.exists;
    if (isPaidBillingUser(userSnap.data())) {
      return NextResponse.json({
        checkoutSessionId: null,
        resolution: "existing_paid_user" as const,
        nextStep: "show_already_subscribed" as const,
      });
    }

    await ensureUserDocForCheckout({ uid, email, locale });

    const stripe = getStripe();
    let customerId: string | null = userSnap.data()?.billingCustomerId ?? null;
    const placeholder = isPlaceholderStripePriceId(
      typeof stripePriceId === "string" ? stripePriceId : "",
    );

    if (!placeholder && stripe) {
      const escaped = email.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
      const search = await stripe.customers.search({
        query: `email:'${escaped}'`,
        limit: 1,
      });
      if (search.data.length > 0) {
        customerId = search.data[0]!.id;
      } else {
        const c = await stripe.customers.create({
          email,
          metadata: { uid },
        });
        customerId = c.id;
      }
      await getAdminDb()
        .doc(`users/${uid}`)
        .set(
          { billingCustomerId: customerId, updatedAt: FieldValue.serverTimestamp() },
          { merge: true },
        );
    }

    const attributionSnapshot = checkoutAttributionFromPayload({
      attribution: parsed.data.attribution as LeadAttributionInput | undefined,
      funnelSessionId: parsed.data.funnelSessionId,
      posthogDistinctId: parsed.data.posthogDistinctId,
      posthogSessionId: parsed.data.posthogSessionId,
      metaFbp: parsed.data.metaFbp,
      metaFbc: parsed.data.metaFbc,
      entryUrl: parsed.data.entryUrl,
      ip,
    });

    const checkoutSessionId = newCheckoutSessionId();
    const purchaseEventId = newPurchaseEventId(checkoutSessionId);
    const payload = buildNewCheckoutSessionPayload({
      id: checkoutSessionId,
      email,
      planId: plan.id,
      locale,
      uid,
      attributionSnapshot,
      funnelSessionId: parsed.data.funnelSessionId ?? null,
      purchaseEventId,
    });

    if (customerId) {
      payload.externalCustomerId = customerId;
    }

    await checkoutSessionRef(checkoutSessionId).set(payload);

    const resolution = existedBefore
      ? ("existing_free_user" as const)
      : ("new_email" as const);

    return NextResponse.json({
      checkoutSessionId,
      resolution,
      nextStep: "proceed_to_payment" as const,
    });
  } catch (e) {
    console.error("[checkout/confirm-email]", e);
    return NextResponse.json(
      { error: "Unable to start checkout. Try again later." },
      { status: 500 },
    );
  }
}
