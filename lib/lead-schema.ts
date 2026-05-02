import { FieldValue } from "firebase-admin/firestore";
import type { LeadAttributionInput } from "@/lib/lead-attribution.types";
import type { LeadSource } from "@/lib/lead-types";
import { normalizeEmail } from "@/lib/normalize-email";

export type { LeadSource } from "@/lib/lead-types";
export { LEAD_SOURCES } from "@/lib/lead-types";

export type BuildLeadRecordInput = {
  email: string;
  posthogDistinctId?: string | null;
  posthogSessionId?: string | null;
  metaFbp?: string | null;
  metaFbc?: string | null;
  attribution?: LeadAttributionInput | null;
  funnelSessionId?: string | null;
  entryUrl?: string | null;
  locale?: string | null;
  browserLanguage?: string | null;
  timezone?: string | null;
  userAgent?: string | null;
  geoCountry?: string | null;
  geoRegion?: string | null;
  geoCity?: string | null;
  ip?: string | null;
  quiz?: Record<string, unknown> | null;
  clientSignalsProvenance?: string;
};

/**
 * Firestore field payload (no immutable `source` — the route sets `source` / `lastCaptureSource`).
 * `posthogSessionId` is best-effort from posthog-js and may be null depending on SDK/version.
 */
export function buildLeadRecord(input: BuildLeadRecordInput): Record<string, unknown> {
  const emailNormalized = normalizeEmail(input.email);
  const out: Record<string, unknown> = {
    email: input.email.trim().slice(0, 320),
    emailNormalized,
    updatedAt: FieldValue.serverTimestamp(),
    posthogDistinctId: input.posthogDistinctId ?? null,
    posthogSessionId: input.posthogSessionId ?? null,
    metaFbp: input.metaFbp ?? null,
    metaFbc: input.metaFbc ?? null,
    attribution: input.attribution ?? null,
    funnelSessionId: input.funnelSessionId ?? null,
    entryUrl: input.entryUrl?.slice(0, 4096) ?? null,
    locale: input.locale?.slice(0, 32) ?? null,
    browserLanguage: input.browserLanguage?.slice(0, 64) ?? null,
    timezone: input.timezone?.slice(0, 128) ?? null,
    userAgent: input.userAgent?.slice(0, 512) ?? null,
    geoCountry: input.geoCountry?.slice(0, 8) ?? null,
    geoRegion: input.geoRegion?.slice(0, 64) ?? null,
    geoCity: input.geoCity?.slice(0, 128) ?? null,
    ip: input.ip?.slice(0, 64) ?? null,
    clientSignalsProvenance: input.clientSignalsProvenance ?? null,
  };
  if (input.quiz != null) {
    out.quiz = input.quiz;
  }
  return out;
}
