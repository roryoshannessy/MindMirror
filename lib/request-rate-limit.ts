import { createHash } from "node:crypto";

/**
 * Fixed-window rate limiter. Uses Upstash Redis when UPSTASH_REDIS_REST_URL +
 * UPSTASH_REDIS_REST_TOKEN are set (required in production). Falls back to an
 * in-process Map in development — that map resets on every cold start so it
 * provides no real protection on multi-instance serverless deploys.
 */

// ─── Redis backend ──────────────────────────────────────────────────────────

async function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  const { Redis } = await import("@upstash/redis");
  return new Redis({ url, token });
}

async function checkRateLimitRedis(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
  const redis = (await getRedisClient())!;
  const windowSeconds = Math.ceil(windowMs / 1000);
  // Bucket resets at fixed window boundary
  const bucket = Math.floor(Date.now() / windowMs);
  const redisKey = `rl:${key}:${bucket}`;

  const pipeline = redis.pipeline();
  pipeline.incr(redisKey);
  pipeline.expire(redisKey, windowSeconds * 2); // keep a little past window end
  const [count] = (await pipeline.exec()) as [number, number];

  if (count > limit) {
    const resetAt = (bucket + 1) * windowMs;
    return { ok: false, retryAfterMs: Math.max(0, resetAt - Date.now()) };
  }
  return { ok: true };
}

// ─── In-memory fallback (dev only) ─────────────────────────────────────────

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function checkRateLimitMemory(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (existing.count >= limit) {
    return { ok: false, retryAfterMs: Math.max(0, existing.resetAt - now) };
  }
  existing.count += 1;
  return { ok: true };
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (url && token) {
    return checkRateLimitRedis(key, limit, windowMs);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN must be set for production rate limiting.",
    );
  }
  return Promise.resolve(checkRateLimitMemory(key, limit, windowMs));
}

// ─── Key builders ────────────────────────────────────────────────────────────

export function buildMagicLinkRateLimitKey(
  ip: string | null,
  email: string,
  ua: string | null,
): string {
  const eh = createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
  return `ml:${ip ?? "unknown"}:${eh}:${(ua ?? "").slice(0, 120)}`;
}

export function buildLeadCaptureRateLimitKey(
  ip: string | null,
  email: string,
  ua: string | null,
): string {
  const eh = createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
  return `lead:${ip ?? "unknown"}:${eh}:${(ua ?? "").slice(0, 120)}`;
}

/** Per-IP bucket only — curbs email rotation abuse. */
export function buildLeadCaptureIpOnlyRateLimitKey(ip: string | null): string {
  return `lead-ip:${ip ?? "unknown"}`;
}

/** Per-IP bucket for checkout email confirmation. */
export function buildCheckoutEmailIpRateLimitKey(ip: string | null): string {
  return `chk-email-ip:${ip ?? "unknown"}`;
}

/** Per-email+IP bucket for checkout email confirmation. */
export function buildCheckoutEmailRateLimitKey(ip: string | null, email: string): string {
  const eh = createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
  return `chk-email:${ip ?? "unknown"}:${eh}`;
}
