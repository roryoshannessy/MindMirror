import {
  FieldValue,
  Timestamp,
  type DocumentData,
  type Firestore,
} from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendPurchase, type CapiUserData } from "@/lib/meta-capi";
import type { PurchaseAttributionSnapshot } from "@/lib/purchase-attribution";

export const CAPI_PURCHASES_PENDING_COLLECTION = "capi_purchases_pending";
export const CAPI_PURCHASES_PROCESSED_COLLECTION = "capi_purchases_processed";

const MAX_CAPI_ATTEMPTS = 5;
const PROCESSING_LOCK_MS = 2 * 60 * 1000;

export type QueueCapiPurchaseInput = {
  invoiceId: string;
  subscriptionId: string | null;
  uid: string | null;
  amountPaidCents: number;
  currencyCode: string;
  contentName: string;
  attributionSnapshot: PurchaseAttributionSnapshot;
  purchaseEventId: string;
  stripeEventId: string;
  eventTime: number;
  eventSourceUrl: string;
  userData: CapiUserData;
  customData: {
    value: number;
    currency: string;
    contentName?: string | null;
  };
  isTestUser: boolean;
};

export type ProcessCapiPurchaseResult =
  | { status: "sent"; invoiceId: string }
  | { status: "queued"; invoiceId: string; reason: "not_configured" }
  | { status: "skipped"; invoiceId: string; reason: "not_found" | "locked" | "not_due" | "test_user" }
  | { status: "failed"; invoiceId: string; error: string; retryable: boolean };

export function capiTestEventCode(): string | null {
  return process.env.META_CAPI_TEST_EVENT_CODE?.trim() || null;
}

export function capiSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
}

export function isMetaCapiConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() &&
      process.env.META_CAPI_ACCESS_TOKEN?.trim(),
  );
}

function pendingRef(db: Firestore, invoiceId: string) {
  return db.doc(`${CAPI_PURCHASES_PENDING_COLLECTION}/${invoiceId}`);
}

function processedRef(db: Firestore, invoiceId: string) {
  return db.doc(`${CAPI_PURCHASES_PROCESSED_COLLECTION}/${invoiceId}`);
}

function backoffMs(attempt: number): number {
  return Math.min(60 * 60 * 1000, 5 * 60 * 1000 * 2 ** Math.max(0, attempt - 1));
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function timestampMillis(value: unknown): number | null {
  if (value instanceof Timestamp) return value.toMillis();
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof value.toMillis === "function"
  ) {
    return value.toMillis();
  }
  return null;
}

export async function queueCapiPurchase(
  input: QueueCapiPurchaseInput,
  db: Firestore = getAdminDb(),
): Promise<void> {
  const ref = pendingRef(db, input.invoiceId);
  const snap = await ref.get();
  const base = {
    invoiceId: input.invoiceId,
    subscriptionId: input.subscriptionId,
    uid: input.uid ?? "",
    amountPaidCents: input.amountPaidCents,
    currencyCode: input.currencyCode,
    contentName: input.contentName,
    attributionSnapshot: input.attributionSnapshot,
    purchaseEventId: input.purchaseEventId,
    stripeEventId: input.stripeEventId,
    eventTime: input.eventTime,
    eventSourceUrl: input.eventSourceUrl,
    userData: input.userData,
    customData: input.customData,
    testEventCode: capiTestEventCode(),
    isTestUser: input.isTestUser,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (!snap.exists) {
    await ref.set({
      ...base,
      status: "pending",
      attempts: 0,
      queuedAt: FieldValue.serverTimestamp(),
      nextAttemptAt: Timestamp.fromMillis(Date.now()),
    });
    return;
  }

  await ref.set(base, { merge: true });
}

export async function processQueuedCapiPurchase(
  invoiceId: string,
  db: Firestore = getAdminDb(),
): Promise<ProcessCapiPurchaseResult> {
  const ref = pendingRef(db, invoiceId);

  const initial = await ref.get();
  if (!initial.exists) {
    return { status: "skipped", invoiceId, reason: "not_found" };
  }

  if (!isMetaCapiConfigured()) {
    await ref.set(
      {
        status: "pending_configuration",
        lastSkippedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { status: "queued", invoiceId, reason: "not_configured" };
  }

  const now = Date.now();
  const locked = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;

    const data = snap.data() ?? {};
    const status = asString(data.status, "pending");
    const processingStartedAt = timestampMillis(data.processingStartedAt);
    if (
      status === "processing" &&
      processingStartedAt != null &&
      now - processingStartedAt < PROCESSING_LOCK_MS
    ) {
      return { state: "locked" as const };
    }

    const nextAttemptAt = timestampMillis(data.nextAttemptAt);
    if (
      (status === "failed_retryable" || status === "pending_configuration") &&
      nextAttemptAt != null &&
      nextAttemptAt > now
    ) {
      return { state: "not_due" as const };
    }

    const attempts = asNumber(data.attempts, 0);
    if (attempts >= MAX_CAPI_ATTEMPTS) {
      tx.set(
        ref,
        {
          status: "failed_max_attempts",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      return { state: "max_attempts" as const, data };
    }

    tx.set(
      ref,
      {
        status: "processing",
        attempts: FieldValue.increment(1),
        processingStartedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { state: "process" as const, data, attempt: attempts + 1 };
  });

  if (!locked) return { status: "skipped", invoiceId, reason: "not_found" };
  if (locked.state === "locked") return { status: "skipped", invoiceId, reason: "locked" };
  if (locked.state === "not_due") return { status: "skipped", invoiceId, reason: "not_due" };
  if (locked.state === "max_attempts") {
    return {
      status: "failed",
      invoiceId,
      error: "CAPI max attempts reached",
      retryable: false,
    };
  }

  const data = locked.data as DocumentData;
  const attempt = locked.attempt;

  if (data.isTestUser === true) {
    await processedRef(db, invoiceId).set(
      {
        ...data,
        status: "skipped_test_user",
        attempts: attempt,
        processedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    await ref.delete();
    return { status: "skipped", invoiceId, reason: "test_user" };
  }

  const userData = (data.userData ?? {}) as CapiUserData;
  const customData = data.customData as QueueCapiPurchaseInput["customData"] | undefined;

  try {
    const result = await sendPurchase({
      eventId: asString(data.purchaseEventId),
      eventTime: asNumber(data.eventTime, Math.floor(Date.now() / 1000)),
      eventSourceUrl: asString(data.eventSourceUrl, capiSiteUrl()),
      userData,
      customData: {
        value: asNumber(customData?.value, asNumber(data.amountPaidCents, 0) / 100),
        currency: asString(customData?.currency, asString(data.currencyCode, "USD")),
        contentName: customData?.contentName ?? asString(data.contentName, "subscription"),
      },
      testEventCode: capiTestEventCode(),
    });

    if (result.ok) {
      await processedRef(db, invoiceId).set(
        {
          ...data,
          status: "sent",
          attempts: attempt,
          sentAt: FieldValue.serverTimestamp(),
          processedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      await ref.delete();
      return { status: "sent", invoiceId };
    }

    const retryable = attempt < MAX_CAPI_ATTEMPTS;
    await ref.set(
      {
        status: retryable ? "failed_retryable" : "failed_max_attempts",
        attempts: attempt,
        error: result.error,
        lastAttemptAt: FieldValue.serverTimestamp(),
        nextAttemptAt: retryable ? Timestamp.fromMillis(Date.now() + backoffMs(attempt)) : null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { status: "failed", invoiceId, error: result.error, retryable };
  } catch (e) {
    const error = String(e);
    const retryable = attempt < MAX_CAPI_ATTEMPTS;
    await ref.set(
      {
        status: retryable ? "failed_retryable" : "failed_max_attempts",
        attempts: attempt,
        error,
        lastAttemptAt: FieldValue.serverTimestamp(),
        nextAttemptAt: retryable ? Timestamp.fromMillis(Date.now() + backoffMs(attempt)) : null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { status: "failed", invoiceId, error, retryable };
  }
}

export async function processCapiPurchases(
  opts: { limit?: number; db?: Firestore } = {},
): Promise<ProcessCapiPurchaseResult[]> {
  const db = opts.db ?? getAdminDb();
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 100);
  const snap = await db
    .collection(CAPI_PURCHASES_PENDING_COLLECTION)
    .orderBy("queuedAt", "asc")
    .limit(limit)
    .get();

  const results: ProcessCapiPurchaseResult[] = [];
  for (const doc of snap.docs) {
    results.push(await processQueuedCapiPurchase(doc.id, db));
  }
  return results;
}
