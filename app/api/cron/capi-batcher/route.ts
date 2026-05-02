import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendPurchase, type CapiUserData } from "@/lib/meta-capi";
import type { PurchaseAttributionSnapshot } from "@/lib/purchase-attribution";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Allow up to 60 s — batcher may fan out to several CAPI calls.
export const maxDuration = 60;

const PENDING_DELAY_MS = 20 * 60 * 1000;
const MAX_BATCH = 50;

function cronSecret(): string | null {
  return process.env.CRON_SECRET?.trim() || null;
}

function testEventCode(): string | null {
  return process.env.META_CAPI_TEST_EVENT_CODE?.trim() || null;
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

/**
 * Canonical event_id that matches the browser Pixel format in
 * lib/checkout-analytics.client.ts so Meta can deduplicate the two events.
 * Format: purchase_{uid}_{subscriptionId}
 * Fallback (no subscriptionId): purchase_{invoiceId} — won't deduplicate but stays unique.
 */
function buildEventId(uid: string, subscriptionId: string | null, invoiceId: string): string {
  if (uid && subscriptionId) {
    return `purchase_${uid}_${subscriptionId}`;
  }
  return `purchase_${invoiceId}`;
}

export async function GET(req: Request) {
  const secret = cronSecret();
  if (!secret) {
    // Fail closed in production — never allow unauthenticated access to an endpoint
    // that triggers external API calls and deletes Firestore documents.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Service not configured" }, { status: 503 });
    }
    // In development, allow without a secret so local testing works without env setup.
  } else {
    // Vercel sets Authorization: Bearer <CRON_SECRET> automatically on scheduled runs.
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const db = getAdminDb();
  const cutoff = new Date(Date.now() - PENDING_DELAY_MS);

  const snap = await db
    .collection("capi_purchases_pending")
    .where("queuedAt", "<", cutoff)
    .limit(MAX_BATCH)
    .get();

  if (snap.empty) {
    return NextResponse.json({ processed: 0 });
  }

  const results: Array<{ invoiceId: string; status: string; error?: string }> = [];

  for (const doc of snap.docs) {
    const data = doc.data();
    const invoiceId = doc.id;
    const uid: string = data.uid ?? "";

    // Skip test users.
    const isTestUser = data.isTestUser === true;
    if (!isTestUser && uid) {
      const userSnap = await db.doc(`users/${uid}`).get();
      const userProfile = userSnap.data();
      if (userProfile?.isTestUser === true) {
        await db.doc(`capi_purchases_processed/${invoiceId}`).set({
          invoiceId,
          uid,
          status: "skipped_test_user",
          processedAt: FieldValue.serverTimestamp(),
        });
        await doc.ref.delete();
        results.push({ invoiceId, status: "skipped_test_user" });
        continue;
      }
    }

    const snap_attr: PurchaseAttributionSnapshot | undefined =
      data.attributionSnapshot ?? undefined;

    // Fallback to users/{uid}.lastPurchaseAttribution if snapshot missing.
    let attribution = snap_attr;
    if (!attribution && uid) {
      const userSnap = await db.doc(`users/${uid}`).get();
      attribution = userSnap.data()?.lastPurchaseAttribution ?? undefined;
    }

    const valueCents: number = attribution?.valueCents ?? data.amountPaidCents ?? 0;
    const currency: string = attribution?.currency ?? data.currencyCode ?? "USD";
    const contentName: string = attribution?.contentName ?? data.contentName ?? "subscription";

    // Pull lead for user data enrichment.
    let leadData: Record<string, unknown> = {};
    if (uid) {
      const userSnap = await db.doc(`users/${uid}`).get();
      const userProfile = userSnap.data();
      const email: string | undefined = userProfile?.email;
      if (email) {
        const leadSnap = await db.doc(`leads/${email.toLowerCase().trim()}`).get();
        leadData = leadSnap.data() ?? {};
      }
    }

    // Prefer checkout-time attribution (most recent); fallback to lead-time.
    // This ensures we send the fbp/fbc that was active at payment time.
    const checkoutAttribution = attribution?.attributionContext?.matching;
    const userData: CapiUserData = {
      email: (leadData.email as string | undefined) ?? null,
      fbp:
        (checkoutAttribution?.metaFbp as string | undefined) ??
        (leadData.metaFbp as string | undefined) ??
        null,
      fbc:
        (checkoutAttribution?.metaFbc as string | undefined) ??
        (leadData.metaFbc as string | undefined) ??
        null,
      externalId: uid || null,
    };

    const subscriptionId: string | null = data.subscriptionId ?? null;
    // Use stable purchaseEventId from webhook (generated at payment time)
    // Fallback to buildEventId for backward compatibility with old records
    const eventId = data.purchaseEventId ?? buildEventId(uid || invoiceId, subscriptionId, invoiceId);
    const eventTime = Math.floor(
      (data.queuedAt?.toDate?.()?.getTime?.() ?? Date.now()) / 1000,
    );

    const capiResult = await sendPurchase({
      eventId,
      eventTime,
      eventSourceUrl: siteUrl(),
      userData,
      customData: {
        value: valueCents / 100,
        currency,
        contentName,
      },
      testEventCode: testEventCode(),
    });

    if (capiResult.ok) {
      await db.doc(`capi_purchases_processed/${invoiceId}`).set({
        invoiceId,
        uid,
        status: "sent",
        eventId,
        processedAt: FieldValue.serverTimestamp(),
      });
      await doc.ref.delete();
      results.push({ invoiceId, status: "sent" });
    } else {
      console.error("[capi-batcher] send failed", invoiceId, capiResult.error);
      results.push({ invoiceId, status: "failed", error: capiResult.error });
      // Leave pending — will retry on next cron tick.
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
