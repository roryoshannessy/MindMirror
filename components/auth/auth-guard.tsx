"use client";

import { useEffect, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
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
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (isPaidOnlyPath(pathname) && !hasActiveBillingAccess(claims)) {
      router.replace("/pricing?reason=paywall");
    }
  }, [claims, isAuthenticated, isLoading, pathname, router]);

  useEffect(() => {
    if (!isLoading) return;
    const timeout = window.setTimeout(() => setLoadingTimedOut(true), 2500);
    return () => window.clearTimeout(timeout);
  }, [isLoading]);

  if (isLoading && !loadingTimedOut) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnTo = sanitizeReturnTo(
      `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`,
    );
    const href = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
    return (
      <div className="mx-auto flex min-h-[55vh] w-full max-w-lg items-center justify-center px-4 py-12">
        <div className="w-full rounded-lg border border-border bg-card/80 p-5 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            MindMirror
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Sign in to open your mirror.
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your reflections are saved to your private account.
          </p>
          <Link
            href={href}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-5 text-sm font-medium text-background transition hover:bg-foreground/90"
          >
            Continue
          </Link>
        </div>
      </div>
    );
  }

  if (isPaidOnlyPath(pathname) && !hasActiveBillingAccess(claims)) {
    return null;
  }

  return <>{children}</>;
}
