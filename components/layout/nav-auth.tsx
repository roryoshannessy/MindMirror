"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NavAuth() {
  const t = useTranslations("nav");
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div
        className="hidden h-8 w-14 shrink-0 animate-pulse rounded-md bg-muted md:block"
        aria-hidden
      />
    );
  }

  if (isAuthenticated) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hidden text-muted-foreground hover:text-foreground md:inline-flex"
        onClick={() => void signOut()}
      >
        {t("sign_out")}
      </Button>
    );
  }

  return (
    <Link
      href="/auth/login"
      className={cn(
        "hidden rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex",
      )}
    >
      {t("sign_in")}
    </Link>
  );
}
