import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { getAdminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const ref = getAdminDb().doc("_dev/m2_admin_smoke");
    await ref.set(
      {
        at: new Date().toISOString(),
        product: brand.NAME,
      },
      { merge: true },
    );
    const snap = await ref.get();
    return NextResponse.json({ ok: true, path: ref.path, data: snap.data() });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
