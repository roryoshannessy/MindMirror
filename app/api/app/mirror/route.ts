import { FieldValue, Timestamp, type DocumentData } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  generateMindMirror,
  generateMindMirrorFollowUp,
  type MindMirrorFollowUp,
  type MindMirrorInsight,
} from "@/lib/ai/mindmirror";
import { analyzeReflection, type ReflectionAnalysis } from "@/lib/app-patterns";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import {
  buildJournalEntriesRateLimitKey,
  checkRateLimit,
} from "@/lib/request-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const privateJsonHeaders = {
  "Cache-Control": "no-store, private",
  Pragma: "no-cache",
  Vary: "Authorization",
};

const mirrorSchema = z.object({
  entryId: z.string().trim().min(1).max(160).regex(/^[A-Za-z0-9_-]+$/),
  regenerate: z.boolean().optional().default(false),
});

const followUpSchema = z.object({
  entryId: z.string().trim().min(1).max(160).regex(/^[A-Za-z0-9_-]+$/),
  questionIndex: z.number().int().min(0).max(4),
  answer: z.string().trim().min(10).max(2500),
});

const WRITE_WINDOW_MS = 10 * 60 * 1000;
const MAX_WRITES_PER_WINDOW = 24;
const GENERATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_GENERATIONS_PER_DAY = 30;
const ENTRY_REGEN_COOLDOWN_MS = 10 * 60 * 1000;
const MAX_FOLLOW_UPS_PER_ENTRY = 6;

function bearerToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  return token || null;
}

function clientIp(req: Request): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

async function uidFromRequest(req: Request): Promise<string | null> {
  const token = bearerToken(req);
  if (!token) return null;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

async function enforceMirrorRateLimit(req: Request, uid: string) {
  const limited = await checkRateLimit(
    buildJournalEntriesRateLimitKey(clientIp(req), uid, "write"),
    MAX_WRITES_PER_WINDOW,
    WRITE_WINDOW_MS,
  );
  if (limited.ok) return null;
  return NextResponse.json(
    { error: "Too many mirror reads. Try again in a little while." },
    {
      status: 429,
      headers: {
        ...privateJsonHeaders,
        "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)),
      },
    },
  );
}

async function enforceGenerationQuota(uid: string) {
  const limited = await checkRateLimit(
    `mirror-generate:${uid}`,
    MAX_GENERATIONS_PER_DAY,
    GENERATE_WINDOW_MS,
  );
  if (limited.ok) return null;
  return NextResponse.json(
    { error: "Daily mirror limit reached. Try again tomorrow." },
    {
      status: 429,
      headers: {
        ...privateJsonHeaders,
        "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)),
      },
    },
  );
}

function isoFromFirestore(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString();
  }
  return new Date().toISOString();
}

function entryDataToContext(data: DocumentData) {
  const text = String(data.text ?? "");
  return {
    analysis: (data.analysis as ReflectionAnalysis | undefined) ?? analyzeReflection(text),
    text,
  };
}

function mapFollowUps(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const followUp = item as {
      answer?: unknown;
      createdAt?: unknown;
      question?: unknown;
      response?: unknown;
    };
    return {
      answer: String(followUp.answer ?? ""),
      createdAt: isoFromFirestore(followUp.createdAt),
      question: String(followUp.question ?? ""),
      response: followUp.response as MindMirrorFollowUp,
    };
  });
}

function msSinceFirestore(value: unknown): number | null {
  if (!value) return null;
  const iso = isoFromFirestore(value);
  const time = Date.parse(iso);
  if (Number.isNaN(time)) return null;
  return Date.now() - time;
}

export async function POST(req: Request) {
  const uid = await uidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateJsonHeaders });
  }

  const body = await req.json().catch(() => null);
  const parsed = mirrorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Choose a saved reflection first." },
      { status: 400, headers: privateJsonHeaders },
    );
  }

  const db = getAdminDb();
  const entryRef = db.collection(`users/${uid}/journal_entries`).doc(parsed.data.entryId);
  const entrySnap = await entryRef.get();
  if (!entrySnap.exists) {
    return NextResponse.json(
      { error: "Reflection not found." },
      { status: 404, headers: privateJsonHeaders },
    );
  }

  const entryData = entrySnap.data()!;
  const existingMirror = entryData.mindMirror as MindMirrorInsight | undefined;
  if (existingMirror && !parsed.data.regenerate) {
    return NextResponse.json(
      { cached: true, mirror: existingMirror },
      { headers: privateJsonHeaders },
    );
  }

  const rateLimited = await enforceMirrorRateLimit(req, uid);
  if (rateLimited) return rateLimited;

  const quotaLimited = await enforceGenerationQuota(uid);
  if (quotaLimited) return quotaLimited;

  const lastMirrorAge = msSinceFirestore(entryData.mindMirrorUpdatedAt);
  if (parsed.data.regenerate && lastMirrorAge !== null && lastMirrorAge < ENTRY_REGEN_COOLDOWN_MS) {
    return NextResponse.json(
      { error: "This mirror was refreshed recently. Try again in a few minutes." },
      {
        status: 429,
        headers: {
          ...privateJsonHeaders,
          "Retry-After": String(Math.ceil((ENTRY_REGEN_COOLDOWN_MS - lastMirrorAge) / 1000)),
        },
      },
    );
  }

  const currentText = String(entryData.text ?? "");
  const historicalSnap = await db
    .collection(`users/${uid}/journal_entries`)
    .orderBy("createdAt", "desc")
    .limit(12)
    .get();
  const historicalEntries = historicalSnap.docs
    .filter((doc) => doc.id !== entrySnap.id)
    .map((doc) => entryDataToContext(doc.data()));

  const mirror = await generateMindMirror({
    entryText: currentText,
    historicalEntries,
  });

  await entryRef.set(
    {
      mindMirror: mirror,
      mindMirrorUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json({ mirror }, { headers: privateJsonHeaders });
}

export async function PATCH(req: Request) {
  const uid = await uidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateJsonHeaders });
  }

  const body = await req.json().catch(() => null);
  const parsed = followUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Answer the follow-up question with at least one sentence." },
      { status: 400, headers: privateJsonHeaders },
    );
  }

  const entryRef = getAdminDb().collection(`users/${uid}/journal_entries`).doc(parsed.data.entryId);
  const entrySnap = await entryRef.get();
  if (!entrySnap.exists) {
    return NextResponse.json(
      { error: "Reflection not found." },
      { status: 404, headers: privateJsonHeaders },
    );
  }

  const entryData = entrySnap.data()!;
  const entryText = String(entryData.text ?? "");
  const existingMirror = entryData.mindMirror as MindMirrorInsight | undefined;
  const mirror =
    existingMirror ??
    (await generateMindMirror({
      entryText,
      historicalEntries: [],
    }));
  const followUps = mapFollowUps(entryData.followUps);
  if (followUps.length >= MAX_FOLLOW_UPS_PER_ENTRY) {
    return NextResponse.json(
      { error: "This reflection already has enough follow-up depth. Start a new entry." },
      { status: 400, headers: privateJsonHeaders },
    );
  }

  const question = mirror.followUpQuestions[parsed.data.questionIndex];
  if (!question) {
    return NextResponse.json(
      { error: "Choose one of the saved follow-up questions." },
      { status: 400, headers: privateJsonHeaders },
    );
  }

  const rateLimited = await enforceMirrorRateLimit(req, uid);
  if (rateLimited) return rateLimited;

  const quotaLimited = await enforceGenerationQuota(uid);
  if (quotaLimited) return quotaLimited;

  const response = await generateMindMirrorFollowUp({
    answer: parsed.data.answer,
    entryText,
    mirror,
    question,
  });
  const followUp = {
    answer: parsed.data.answer,
    createdAt: new Date().toISOString(),
    question,
    response,
  };

  await entryRef.set(
    {
      followUps: FieldValue.arrayUnion(followUp),
      mindMirror: mirror,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return NextResponse.json(
    {
      followUp,
      followUps: mapFollowUps([followUp]),
      mirror,
    },
    { headers: privateJsonHeaders },
  );
}
