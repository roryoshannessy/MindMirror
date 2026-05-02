/**
 * Test / non-production users — skip CAPI etc. (FOUNDATION §20).
 * Sticky merge happens in `mergeUserProfileFromHydration` (once true, stays true).
 */
export function deriveIsTestUserFromRequest(host: string | null): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (process.env.VERCEL_ENV === "preview") return true;

  const h = (host ?? "").toLowerCase();
  return h.includes("localhost") || h.includes("127.0.0.1");
}
