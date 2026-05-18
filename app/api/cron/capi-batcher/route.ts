import { NextResponse } from "next/server";
import { processCapiPurchases } from "@/lib/capi-purchases";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.NODE_ENV !== "production";

  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : null;
  const headerSecret = req.headers.get("x-cron-secret")?.trim() ?? null;
  return bearer === secret || headerSecret === secret;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? "25");
  const results = await processCapiPurchases({
    limit: Number.isFinite(limit) ? limit : 25,
  });

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
  });
}
