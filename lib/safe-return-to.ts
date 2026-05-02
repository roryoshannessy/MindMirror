/**
 * Same-origin return paths only. Blocks credential leaks, protocol tricks,
 * and paths outside an explicit allowlist (open-redirect hardening).
 */

import { routing } from "@/i18n/routing";

const ALLOWED_PREFIXES = [
  "/pricing",
  "/quiz",
  "/checkout",
  "/account",
  "/legal",
  "/dev",
  "/auth",
] as const;

function pathnameWithoutLocale(pathname: string): string {
  for (const loc of routing.locales) {
    if (pathname === `/${loc}`) return "/";
    if (pathname.startsWith(`/${loc}/`)) {
      return pathname.slice(`/${loc}`.length);
    }
  }
  return pathname;
}

export function sanitizeReturnTo(raw: string | null | undefined): string {
  if (raw == null || raw === "") return "/";

  const trimmed = raw.trim();
  try {
    const u = /^https?:\/\//i.test(trimmed)
      ? new URL(trimmed)
      : new URL(trimmed, "http://localhost:3000");

    if (u.username || u.password) return "/";
    if (u.protocol !== "http:" && u.protocol !== "https:") return "/";

    const path = `${u.pathname}${u.search}${u.hash}`;
    if (!path.startsWith("/") || path.startsWith("//")) return "/";

    const pathOnly = u.pathname;
    const policyPath = pathnameWithoutLocale(pathOnly);
    if (policyPath === "/" || policyPath === "") return path;

    const ok = ALLOWED_PREFIXES.some(
      (p) => policyPath === p || policyPath.startsWith(`${p}/`),
    );
    return ok ? path : "/";
  } catch {
    return "/";
  }
}
