import { NextResponse } from "next/server";
import { z } from "zod";
import { brand } from "@/config/brand";
import { sendTransactionalEmail } from "@/lib/email-sender";
import { getAdminAuth } from "@/lib/firebase-admin";
import { encodeMagicLinkState } from "@/lib/magic-link-state.server";
import {
  buildMagicLinkRateLimitKey,
  checkRateLimit,
} from "@/lib/request-rate-limit";
import { sanitizeReturnTo } from "@/lib/safe-return-to";

export const runtime = "nodejs";

const bodySchema = z.object({
  email: z.string().email().max(320),
  returnTo: z.string().max(2048).default("/"),
  source: z.enum(["login", "signup"]).default("login"),
});

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;

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

    const { email, returnTo, source } = parsed.data;
    const returnPath = sanitizeReturnTo(returnTo);

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      null;
    const ua = req.headers.get("user-agent");
    const rlKey = buildMagicLinkRateLimitKey(ip, email, ua);
    const limited = await checkRateLimit(rlKey, MAX_PER_WINDOW, WINDOW_MS);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)),
          },
        },
      );
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ).replace(/\/$/, "");

    const state = encodeMagicLinkState({
      returnTo: returnPath,
      source,
    });

    const callbackUrl = `${siteUrl}/auth/callback?returnTo=${encodeURIComponent(returnPath)}&state=${encodeURIComponent(state)}`;

    const link = await getAdminAuth().generateSignInWithEmailLink(email, {
      url: callbackUrl,
      handleCodeInApp: true,
    });

    const subject =
      source === "signup"
        ? `Finish creating your ${brand.NAME} account`
        : `Sign in to ${brand.NAME}`;

    await sendTransactionalEmail({
      to: email,
      subject,
      text: `${subject}\n\nOpen this link to continue:\n${link}\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>${subject}</p><p><a href="${escapeHtml(link)}">Continue to ${escapeHtml(brand.NAME)}</a></p><p>If you did not request this, you can ignore this email.</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[magic-link]", e);
    return NextResponse.json(
      { error: "Unable to send sign-in email. Try again later." },
      { status: 500 },
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
