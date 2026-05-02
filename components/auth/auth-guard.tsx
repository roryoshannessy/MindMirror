"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { hasActiveBillingAccess } from "@/lib/billing-access";
import { sanitizeReturnTo } from "@/lib/safe-return-to";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Routes that require an active subscription. Account and billing management
 * routes stay outside this list (FOUNDATION §9.5).
 */
export const PAID_ONLY_PATH_PREFIXES: string[] = [];

function isPaidOnlyPath(pathname: string): boolean {
  return PAID_ONLY_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

type Props = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const claims = useAuthStore((s) => s.claims);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      const raw = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
      const returnTo = sanitizeReturnTo(raw);
      router.replace(
        `/auth/login?returnTo=${encodeURIComponent(returnTo)}`,
      );
      return;
    }
    if (isPaidOnlyPath(pathname) && !hasActiveBillingAccess(claims)) {
      router.replace("/pricing?reason=paywall");
    }
  }, [claims, isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isPaidOnlyPath(pathname) && !hasActiveBillingAccess(claims)) {
    return null;
  }

  return <>{children}</>;
}
