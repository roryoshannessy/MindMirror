import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPlanById } from "@/config/commercial-catalog";
import {
  checkoutSessionRef,
  hashResumeToken,
  newResumeToken,
} from "@/lib/checkout-session";
import { getSiteUrl } from "@/lib/site-url";
import { createSubscriptionHostedCheckoutSession } from "@/lib/stripe-hosted-checkout";
import { isPlaceholderStripePriceId } from "@/lib/stripe-placeholders";
import { getStripe } from "@/lib/stripe-server";
import {
  userBillingPatchPlaceholder,
} from "@/lib/stripe-billing-projection";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

const bodySchema = z.object({
  checkoutSessionId: z.string().min(4).max(128),
  couponCode: z.string().max(64).optional(),
});

function localePathPrefix(locale: string): string {
  return locale && locale !== "en" ? `/${locale}` : "";
}

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

    const id = parsed.data.checkoutSessionId;
    const ref = checkoutSessionRef(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Checkout session not found" }, { status: 404 });
    }

    const data = snap.data()!;
    if (data.status !== "email_confirmed") {
      return NextResponse.json(
        { error: "Checkout session is not ready for payment" },
        { status: 400 },
      );
    }

    const plan = getPlanById(data.planId as string);
    if (!plan) {
      return NextResponse.json({ error: "Plan missing from catalog" }, { status: 400 });
    }

    const uid = data.uid as string | null;
    if (!uid) {
      return NextResponse.json({ error: "Checkout session missing user" }, { status: 400 });
    }

    const priceId = plan.metadata?.stripe_price_id;
    if (typeof priceId !== "string" || !priceId) {
      return NextResponse.json({ error: "Plan has no Stripe price" }, { status: 400 });
    }

    const resumeToken = newResumeToken();
    const resumeHash = hashResumeToken(resumeToken);
    const site = getSiteUrl();
    const loc = typeof data.locale === "string" ? data.locale : "en";
    const prefix = localePathPrefix(loc);
    const successUrl = `${site}${prefix}/checkout/return?session=${encodeURIComponent(id)}&token=${encodeURIComponent(resumeToken)}`;
    const cancelUrl = `${site}${prefix}/checkout/recover?token=${encodeURIComponent(resumeToken)}`;

    const metaBase = {
      checkoutSessionId: id,
      uid,
      planId: plan.id,
      funnelSessionId: (data.funnelSessionId as string | null) ?? "",
    };

    const placeholder = isPlaceholderStripePriceId(priceId);

    if (placeholder) {
      // Placeholder checkout only allowed in development with explicit flag
      const isProd = process.env.NODE_ENV === "production";
      const allowPlaceholder = process.env.ALLOW_PLACEHOLDER_CHECKOUT === "1";

      if (isProd) {
        console.error(
          `[checkout/session] Placeholder Stripe price ID attempted in production: ${priceId}. ` +
          `Run 'npm run stripe:sync' to sync real Stripe products.`
        );
        return NextResponse.json(
          {
            error: "Checkout is not configured for production. Please contact support.",
            details: "Placeholder Stripe prices are not allowed in production.",
          },
          { status: 503 },
        );
      }

      if (!allowPlaceholder) {
        return NextResponse.json(
          {
            error: "Placeholder checkout is disabled. Set ALLOW_PLACEHOLDER_CHECKOUT=1 to enable.",
            details: "For production, run 'npm run stripe:sync' to sync real Stripe products.",
          },
          { status: 503 },
        );
      }

      // Development mode with explicit placeholder flag — proceed with fake checkout
      const fakeCs = `cs_placeholder_${id.replace(/^chk_/, "").slice(0, 24)}`;
      const fakeSub = `sub_placeholder_${id.replace(/^chk_/, "").slice(0, 24)}`;
      await ref.update({
        resumeTokenHash: resumeHash,
        status: "completed",
        externalCheckoutSessionId: fakeCs,
        externalSubscriptionId: fakeSub,
        externalInvoiceId: null,
        entitlement: { status: "granted", grantedAt: FieldValue.serverTimestamp() },
        claim: { status: "pending" as const },
        updatedAt: FieldValue.serverTimestamp(),
      });

      await getAdminDb()
        .doc(`users/${uid}`)
        .set(
          userBillingPatchPlaceholder({
            planId: plan.id,
            subscriptionId: fakeSub,
            customerId: (data.externalCustomerId as string | null) ?? null,
          }),
          { merge: true },
        );

      console.warn(
        `[checkout/session] Placeholder checkout completed for uid=${uid} (development mode only)`
      );
      return NextResponse.json({ url: successUrl });
    }

    const customerId = data.externalCustomerId as string | null;
    if (!customerId) {
      return NextResponse.json(
        { error: "Missing Stripe customer; re-run email step." },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured (STRIPE_SECRET_KEY)." },
        { status: 503 },
      );
    }

    const { url, sessionId } = await createSubscriptionHostedCheckoutSession({
      customerId,
      stripePriceId: priceId,
      trialDays: plan.trialDays,
      successUrl,
      cancelUrl,
      subscriptionMetadata: metaBase,
      checkoutSessionMetadata: metaBase,
    });

    await ref.update({
      resumeTokenHash: resumeHash,
      status: "provider_handoff",
      externalCheckoutSessionId: sessionId,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ url });
  } catch (e) {
    console.error("[checkout/session]", e);
    return NextResponse.json(
      { error: "Unable to start payment session." },
      { status: 500 },
    );
  }
}
