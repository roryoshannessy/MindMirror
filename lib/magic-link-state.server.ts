import type { MagicLinkState } from "@/lib/magic-link-state.types";

/** API routes only — uses Node `Buffer`. */
export function encodeMagicLinkState(state: MagicLinkState): string {
  return Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
}

export function decodeMagicLinkState(raw: string | null): MagicLinkState | null {
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as MagicLinkState;
  } catch {
    return null;
  }
}
