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
      html: magicLinkHtml({ link, subject }),
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

function magicLinkHtml({ link, subject }: { link: string; subject: string }): string {
  const safeBrand = escapeHtml(brand.NAME);
  const safeSubject = escapeHtml(subject);
  const safeLink = escapeHtml(link);
  return `<!doctype html>
<html>
  <body style="margin:0;background:#0a0a0a;font-family:Inter,Arial,sans-serif;color:#fafafa;">
    <div style="padding:32px 16px;">
      <div style="margin:0 auto;max-width:520px;border:1px solid #27272a;border-radius:18px;background:#111113;padding:28px;">
        <div style="font-size:20px;font-weight:700;letter-spacing:-0.02em;">${safeBrand}</div>
        <p style="margin:28px 0 0;color:#a1a1aa;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">Secure sign-in link</p>
        <h1 style="margin:10px 0 0;font-size:28px;line-height:1.15;letter-spacing:-0.04em;">${safeSubject}</h1>
        <p style="margin:16px 0 0;color:#d4d4d8;font-size:16px;line-height:1.6;">Open your private mirror and continue from the thought you started with.</p>
        <a href="${safeLink}" style="display:inline-block;margin-top:28px;border-radius:999px;background:#fafafa;color:#0a0a0a;padding:14px 22px;font-size:15px;font-weight:700;text-decoration:none;">Continue to ${safeBrand}</a>
        <p style="margin:28px 0 0;color:#71717a;font-size:13px;line-height:1.6;">This link is private to you. If you did not request it, you can ignore this email.</p>
      </div>
    </div>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
