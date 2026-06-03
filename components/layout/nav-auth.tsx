"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavAuthProps = {
  isMarketingHome?: boolean;
};

export function NavAuth({ isMarketingHome = false }: NavAuthProps) {
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
        className={cn(
          "hidden md:inline-flex",
          isMarketingHome
            ? "text-[#60706d] hover:text-[#172120]"
            : "text-muted-foreground hover:text-foreground",
        )}
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
        "hidden rounded-md px-2 py-1.5 text-sm transition-colors md:inline-flex",
        isMarketingHome
          ? "text-[#60706d] hover:text-[#172120]"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {t("sign_in")}
    </Link>
  );
}
