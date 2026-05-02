import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { decodeMagicLinkState } from "@/lib/magic-link-state.server";
import { checkoutSessionRef } from "@/lib/checkout-session";
import { getAdminAuth } from "@/lib/firebase-admin";
import { deriveIsTestUserFromRequest } from "@/lib/is-test-user";
import { mergeUserProfileFromHydration } from "@/lib/user-hydration";

export const runtime = "nodejs";

const bodySchema = z.object({
  magicLinkState: z.string().max(16384).optional(),
  locale: z.string().max(16).optional(),
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    if (!token) {
      return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
    }

    const decoded = await getAdminAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const email = decoded.email ?? null;
    const displayName = decoded.name ?? null;

    const rawBody = await req.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const magicLinkState = parsed.data.magicLinkState
      ? decodeMagicLinkState(parsed.data.magicLinkState)
      : null;

    const locale = magicLinkState?.locale ?? parsed.data.locale ?? "en";

    const host =
      req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? null;
    const isTestUser = deriveIsTestUserFromRequest(host);

    await mergeUserProfileFromHydration({
      uid,
      email,
      displayName,
      locale,
      isTestUser,
      magicLinkState,
    });

    const chkId = magicLinkState?.checkoutSessionId;
    if (chkId) {
      const cref = checkoutSessionRef(chkId);
      const cs = await cref.get();
      if (cs.exists && cs.data()?.uid === uid) {
        await cref.update({
          "claim.status": "claimed",
          "claim.claimedAt": FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[hydrate-profile]", e);
    return NextResponse.json(
      { error: "Profile sync failed" },
      { status: 500 },
    );
  }
}
