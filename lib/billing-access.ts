import type { AuthClaims } from "@/stores/auth-store";

export function hasActiveBillingAccess(claims: AuthClaims | null): boolean {
  if (!claims) return false;
  const status = claims.billingStatus;
  return status === "active" || status === "trialing";
}
