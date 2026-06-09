import { FieldValue, Timestamp, type DocumentData } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { MindMirrorFollowUp, MindMirrorInsight } from "@/lib/ai/mindmirror";
import { analyzeReflection } from "@/lib/app-patterns";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import {
  buildJournalEntriesRateLimitKey,
  checkRateLimit,
} from "@/lib/request-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const entrySchema = z.object({
  text: z.string().trim().min(10).max(5000),
  source: z.enum(["text", "voice"]).default("text"),
});

const deleteSchema = z.object({
  id: z.string().trim().min(1).max(160).regex(/^[A-Za-z0-9_-]+$/),
});

const WRITE_WINDOW_MS = 10 * 60 * 1000;
const MAX_WRITES_PER_WINDOW = 30;
const READ_WINDOW_MS = 60 * 1000;
const MAX_READS_PER_WINDOW = 60;

const privateJsonHeaders = {
  "Cache-Control": "no-store, private",
  Pragma: "no-cache",
  Vary: "Authorization",
};

type EntryResponse = {
  id: string;
  text: string;
  source: "text" | "voice";
  analysis: ReturnType<typeof analyzeReflection>;
  mindMirror?: MindMirrorInsight;
  followUps: Array<{
    answer: string;
    createdAt: string;
    question: string;
    response: MindMirrorFollowUp;
  }>;
  createdAt: string;
};

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

async function enforceWriteRateLimit(req: Request, uid: string) {
  const limited = await checkRateLimit(
    buildJournalEntriesRateLimitKey(clientIp(req), uid, "write"),
    MAX_WRITES_PER_WINDOW,
    WRITE_WINDOW_MS,
  );
  if (limited.ok) return null;
  return NextResponse.json(
    { error: "Too many journal updates. Try again in a little while." },
    {
      status: 429,
      headers: {
        ...privateJsonHeaders,
        "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)),
      },
    },
  );
}

async function enforceReadRateLimit(req: Request, uid: string) {
  const limited = await checkRateLimit(
    buildJournalEntriesRateLimitKey(clientIp(req), uid, "read"),
    MAX_READS_PER_WINDOW,
    READ_WINDOW_MS,
  );
  if (limited.ok) return null;
  return NextResponse.json(
    { error: "Too many journal reads. Try again in a little while." },
    {
      status: 429,
      headers: {
        ...privateJsonHeaders,
        "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)),
      },
    },
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

function mapEntry(id: string, data: DocumentData): EntryResponse {
  const followUps = Array.isArray(data.followUps)
    ? data.followUps.map((item: unknown) => {
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
      })
    : [];

  return {
    id,
    text: String(data.text ?? ""),
    source: data.source === "voice" ? "voice" : "text",
    analysis: data.analysis ?? analyzeReflection(String(data.text ?? "")),
    mindMirror: data.mindMirror as MindMirrorInsight | undefined,
    followUps,
    createdAt: isoFromFirestore(data.createdAt),
  };
}

export async function GET(req: Request) {
  const uid = await uidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateJsonHeaders });
  }

  const rateLimited = await enforceReadRateLimit(req, uid);
  if (rateLimited) return rateLimited;

  const snap = await getAdminDb()
    .collection(`users/${uid}/journal_entries`)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  return NextResponse.json(
    {
      entries: snap.docs.map((doc) => mapEntry(doc.id, doc.data())),
    },
    { headers: privateJsonHeaders },
  );
}

export async function POST(req: Request) {
  const uid = await uidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateJsonHeaders });
  }

  const rateLimited = await enforceWriteRateLimit(req, uid);
  if (rateLimited) return rateLimited;

  const body = await req.json().catch(() => null);
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Write at least a sentence first." },
      { status: 400, headers: privateJsonHeaders },
    );
  }

  const analysis = analyzeReflection(parsed.data.text);
  const ref = getAdminDb().collection(`users/${uid}/journal_entries`).doc();
  const createdAt = new Date();
  const payload = {
    text: parsed.data.text,
    source: parsed.data.source,
    analysis,
    createdAt: FieldValue.serverTimestamp(),
    createdAtClient: createdAt.toISOString(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await ref.set(payload);

  return NextResponse.json(
    {
      entry: {
        id: ref.id,
        text: parsed.data.text,
        source: parsed.data.source,
        analysis,
        followUps: [],
        createdAt: createdAt.toISOString(),
      } satisfies EntryResponse,
    },
    { headers: privateJsonHeaders },
  );
}

export async function DELETE(req: Request) {
  const uid = await uidFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: privateJsonHeaders });
  }

  const rateLimited = await enforceWriteRateLimit(req, uid);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const parsed = deleteSchema.safeParse({ id: searchParams.get("id") });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid entry id." },
      { status: 400, headers: privateJsonHeaders },
    );
  }

  await getAdminDb()
    .collection(`users/${uid}/journal_entries`)
    .doc(parsed.data.id)
    .delete();

  return NextResponse.json({ ok: true }, { headers: privateJsonHeaders });
}
