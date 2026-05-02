import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { CLIENT_SIGNALS_PROVENANCE } from "@/lib/lead-provenance";
import { LEAD_SOURCES, buildLeadRecord } from "@/lib/lead-schema";
import { normalizeEmail } from "@/lib/normalize-email";
import {
  buildLeadCaptureIpOnlyRateLimitKey,
  buildLeadCaptureRateLimitKey,
  checkRateLimit,
} from "@/lib/request-rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile-verify";

export const runtime = "nodejs";

const QUIZ_JSON_MAX_BYTES = 24_000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW_EMAIL_IP = 8;
const MAX_PER_WINDOW_IP = 24;

const attributionTouchSchema = z.object({
  utmSource: z.string().max(512).nullable(),
  utmMedium: z.string().max(512).nullable(),
  utmCampaign: z.string().max(512).nullable(),
  utmTerm: z.string().max(512).nullable(),
  utmContent: z.string().max(512).nullable(),
  fbclid: z.string().max(512).nullable(),
  gclid: z.string().max(512).nullable(),
  msclkid: z.string().max(512).nullable(),
  landingPage: z.string().max(2048).nullable(),
  referrer: z.string().max(2048).nullable(),
  capturedAt: z.string().max(64),
});

const leadAttributionSchema = z.object({
  firstTouch: attributionTouchSchema.nullable(),
  lastTouch: attributionTouchSchema.nullable(),
});

const bodySchema = z.object({
  email: z.string().email().max(320),
  source: z.enum(LEAD_SOURCES),
  posthogDistinctId: z.string().max(256).optional(),
  posthogSessionId: z.string().max(256).optional(),
  metaFbp: z.string().max(512).optional(),
  metaFbc: z.string().max(512).optional(),
  attribution: leadAttributionSchema.optional(),
  funnelSessionId: z.string().max(128).optional(),
  entryUrl: z.string().max(4096).optional(),
  locale: z.string().max(32).optional(),
  browserLanguage: z.string().max(64).optional(),
  timezone: z.string().max(128).optional(),
  turnstileToken: z.string().max(4096).optional(),
  quiz: z
    .record(z.string(), z.unknown())
    .optional()
    .superRefine((val, ctx) => {
      if (val === undefined) return;
      try {
        const s = JSON.stringify(val);
        if (s.length > QUIZ_JSON_MAX_BYTES) {
          ctx.addIssue({
            code: "custom",
            message: `quiz JSON exceeds ${QUIZ_JSON_MAX_BYTES} bytes`,
          });
        }
      } catch {
        ctx.addIssue({ code: "custom", message: "quiz is not JSON-serializable" });
      }
    }),
});

function clientIp(req: Request): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

async function emailMatchesBearerToken(
  email: string,
  authHeader: string | null,
): Promise<boolean> {
  if (!authHeader?.startsWith("Bearer ")) return false;
  try {
    const decoded = await getAdminAuth().verifyIdToken(authHeader.slice(7));
    const em = decoded.email;
    if (!em) return false;
    return normalizeEmail(em) === normalizeEmail(email);
  } catch {
    return false;
  }
}

/**
 * When the client signals quiz completion (`quiz.completed === true`), stamp
 * `completedAt` server-side so the value is trustworthy.
 */
function finalizeQuizPayload(
  quiz: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!quiz) return undefined;
  if (quiz.completed === true && !quiz.completedAt) {
    return { ...quiz, completedAt: new Date().toISOString() };
  }
  return quiz;
}

export async function POST(req: Request) {
  const isProd = process.env.NODE_ENV === "production";
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        isProd ? { error: "Invalid request." } : { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const ip = clientIp(req);
    const ua = req.headers.get("user-agent");

    const trustedBrowser = await emailMatchesBearerToken(data.email, req.headers.get("authorization"));
    const turnstileRequired = Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
    const turnstileOk = !turnstileRequired || trustedBrowser || (await verifyTurnstileToken(data.turnstileToken));
    if (!turnstileOk) {
      return NextResponse.json(
        { error: isProd ? "Unable to process request." : "Verification failed." },
        { status: 403 },
      );
    }

    const ipKey = buildLeadCaptureIpOnlyRateLimitKey(ip);
    const ipLimited = await checkRateLimit(ipKey, MAX_PER_WINDOW_IP, WINDOW_MS);
    if (!ipLimited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(ipLimited.retryAfterMs / 1000)) },
        },
      );
    }

    const rlKey = buildLeadCaptureRateLimitKey(ip, data.email, ua);
    const limited = await checkRateLimit(rlKey, MAX_PER_WINDOW_EMAIL_IP, WINDOW_MS);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)) },
        },
      );
    }

    const country = req.headers.get("x-vercel-ip-country");
    const region = req.headers.get("x-vercel-ip-country-region");
    const city = req.headers.get("x-vercel-ip-city");

    const quiz = finalizeQuizPayload(data.quiz);

    const fields = buildLeadRecord({
      email: data.email,
      posthogDistinctId: data.posthogDistinctId ?? null,
      posthogSessionId: data.posthogSessionId ?? null,
      metaFbp: data.metaFbp ?? null,
      metaFbc: data.metaFbc ?? null,
      attribution: data.attribution ?? null,
      funnelSessionId: data.funnelSessionId ?? null,
      entryUrl: data.entryUrl ?? null,
      locale: data.locale ?? null,
      browserLanguage: data.browserLanguage ?? null,
      timezone: data.timezone ?? null,
      userAgent: ua?.slice(0, 512) ?? null,
      geoCountry: country,
      geoRegion: region,
      geoCity: city,
      ip,
      clientSignalsProvenance: CLIENT_SIGNALS_PROVENANCE,
      ...(quiz !== undefined ? { quiz } : {}),
    });

    const db = getAdminDb();
    const id = normalizeEmail(data.email);
    const ref = db.doc(`leads/${id}`);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({
        ...fields,
        source: data.source,
        lastCaptureSource: data.source,
        createdAt: FieldValue.serverTimestamp(),
        convertedToUser: false,
        uid: null,
      });
    } else {
      await ref.set(
        {
          ...fields,
          lastCaptureSource: data.source,
        },
        { merge: true },
      );
    }

    return NextResponse.json(isProd ? { ok: true } : { ok: true, leadId: id });
  } catch (e) {
    console.error("[lead/capture]", e);
    return NextResponse.json(
      { error: isProd ? "Unable to process request." : "Unable to save lead. Try again later." },
      { status: 500 },
    );
  }
}
