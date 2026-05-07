import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { brand } from "@/config/brand";
import type { CommercialAttributionContext } from "@/lib/attribution-server";
import {
  checkoutSessionRef,
  hashResumeToken,
  isCheckoutSessionId,
} from "@/lib/checkout-session";
import { sendTransactionalEmail } from "@/lib/email-sender";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { encodeMagicLinkState } from "@/lib/magic-link-state.server";
import { getSiteUrl } from "@/lib/site-url";

export const runtime = "nodejs";

const bodySchema = z.object({
  checkoutSessionId: z.string().refine(isCheckoutSessionId, "Invalid checkout session"),
  resumeToken: z.string().optional(),
});

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
    const resumeToken = parsed.data.resumeToken;
    const ref = checkoutSessionRef(id);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const data = snap.data()!;
    const sessionUid = data.uid as string | null;

    // Verify authorization: either valid resume token OR authenticated user matching uid
    let authorized = false;

    // Method 1: Resume token verification (for users completing checkout)
    if (resumeToken) {
      const tokenHash = hashResumeToken(resumeToken);
      const storedHash = data.resumeTokenHash as string | undefined;
      if (tokenHash === storedHash) {
        authorized = true;
      }
    }

    // Method 2: Authenticated Firebase user matching the session UID
    if (!authorized && sessionUid) {
      try {
        // Check for Firebase ID token in Authorization header
        const authHeader = req.headers.get("authorization");
        if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.slice(7);
          const decodedToken = await getAdminAuth().verifyIdToken(token);
          if (decodedToken.uid === sessionUid) {
            authorized = true;
          }
        }
      } catch (e) {
        // Token verification failed, continue to check other methods
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: "Unauthorized. Valid resume token or authenticated user required." },
        { status: 401 },
      );
    }

    // Verify checkout is completed and entitlement is granted before sending claim email
    const status = data.status as string | undefined;
    const entitlement = data.entitlement as { status?: string } | undefined;
    if (status !== "completed" || entitlement?.status !== "granted") {
      return NextResponse.json(
        { error: "Checkout not yet completed or entitlement not granted" },
        { status: 400 },
      );
    }

    const claim = data.claim as { status?: string } | undefined;
    if (claim?.status !== "pending") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const email = data.email as string;
    const locale = typeof data.locale === "string" ? data.locale : "en";
    const attr = data.attributionSnapshot as CommercialAttributionContext;
    const m = attr.matching;
    const siteUrl = getSiteUrl();
    const returnPath =
      locale && locale !== "en" ? `/${locale}/account/welcome` : "/account/welcome";

    const state = encodeMagicLinkState({
      returnTo: returnPath,
      checkoutSessionId: id,
      funnelSessionId: (data.funnelSessionId as string | null) ?? undefined,
      posthogDistinctId: m?.posthogDistinctId ?? undefined,
      posthogSessionId: m?.posthogSessionId ?? undefined,
      metaFbp: m?.metaFbp ?? undefined,
      metaFbc: m?.metaFbc ?? undefined,
      source: "checkout",
      locale,
    });

    const callbackUrl = `${siteUrl}/auth/callback?returnTo=${encodeURIComponent(returnPath)}&state=${encodeURIComponent(state)}`;

    const link = await getAdminAuth().generateSignInWithEmailLink(email, {
      url: callbackUrl,
      handleCodeInApp: true,
    });

    const subject = `Access your ${brand.NAME} account`;

    await sendTransactionalEmail({
      to: email,
      subject,
      text: `${subject}\n\nOpen this link to sign in:\n${link}\n`,
      html: `<p>${escapeHtml(subject)}</p><p><a href="${escapeHtml(link)}">Continue to ${escapeHtml(brand.NAME)}</a></p>`,
    });

    await ref.update({
      "claim.status": "email_sent",
      "claim.emailSentAt": FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[checkout/claim/send]", e);
    return NextResponse.json(
      { error: "Unable to send claim email." },
      { status: 500 },
    );
  }
}
