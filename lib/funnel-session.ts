import { brand } from "@/config/brand";

const TTL_MS = 24 * 60 * 60 * 1000;
const KEY = `${brand.STORAGE_PREFIX}_funnel_session`;

type FunnelSession = { id: string; createdAt: number };

export function getOrCreateFunnelSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FunnelSession;
      if (
        typeof parsed.id === "string" &&
        typeof parsed.createdAt === "number" &&
        Date.now() - parsed.createdAt < TTL_MS
      ) {
        return parsed.id;
      }
    }
  } catch {
    /* fresh session */
  }
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  const next: FunnelSession = { id, createdAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(next));
  return id;
}
