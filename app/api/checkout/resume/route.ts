import type { DocumentData } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { checkoutSessionRef, hashResumeToken } from "@/lib/checkout-session";
export const runtime = "nodejs";

export type CheckoutResumeStatus =
  | "payment_pending"
  | "payment_settled_claim_pending"
  | "claim_email_sent"
  | "already_claimed";

function normalizeResumeStatus(d: DocumentData): CheckoutResumeStatus {
  const st = d.status as string;
  const claim = d.claim as { status?: string } | undefined;
  const ent = d.entitlement as { status?: string } | undefined;

  if (st === "completed" && ent?.status === "granted") {
    if (claim?.status === "pending") return "payment_settled_claim_pending";
    if (claim?.status === "email_sent") return "claim_email_sent";
    if (claim?.status === "claimed") return "already_claimed";
  }
  return "payment_pending";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session");
    const resumeToken = url.searchParams.get("token");

    if (!sessionId?.startsWith("chk_")) {
      return NextResponse.json({ error: "Invalid session" }, { status: 400 });
    }

    const snap = await checkoutSessionRef(sessionId).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const d = snap.data()!;

    // Optional: Verify resume token if provided (validates caller has the return link)
    if (resumeToken) {
      const tokenHash = hashResumeToken(resumeToken);
      const storedHash = d.resumeTokenHash as string | undefined;
      if (tokenHash !== storedHash) {
        return NextResponse.json({ error: "Invalid resume token" }, { status: 401 });
      }
    }

    const status = normalizeResumeStatus(d);

    // Return only non-sensitive fields. PII (email, uid, subscription ID) is not returned
    // to unauthenticated clients. Authenticated users access this info via account endpoints.
    const response: {
      status: CheckoutResumeStatus;
      checkoutSessionId: string;
      planId: string;
      purchaseEventId?: string;
    } = {
      status,
      checkoutSessionId: sessionId,
      planId: d.planId as string,
    };

    // Include purchaseEventId for all settled statuses where payment succeeded
    // (this is the event_id that will be sent to Meta Pixel and CAPI for deduplication)
    // It's safe to return because it's a non-PII stable identifier (purchase_chk_xxx)
    if (
      (status === "payment_settled_claim_pending" ||
        status === "claim_email_sent" ||
        status === "already_claimed") &&
      d.purchaseEventId
    ) {
      response.purchaseEventId = d.purchaseEventId as string;
    }

    return NextResponse.json(response);
  } catch (e) {
    console.error("[checkout/resume]", e);
    return NextResponse.json({ error: "Resume failed" }, { status: 500 });
  }
}
