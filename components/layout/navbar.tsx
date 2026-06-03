"use client";

import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NavAuth } from "./nav-auth";

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isQuizRoute = pathname === "/quiz";
  const isMarketingHome = pathname === "/";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-md",
        isMarketingHome
          ? "border-[#dce8e5] bg-[#eef7f4]/90 text-[#172120]"
          : "border-border bg-background/80",
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <nav
          className="flex min-w-0 items-center gap-2 md:gap-6"
          aria-label="Primary"
        >
          {siteConfig.nav.map((item) => {
            const isCta = item.variant === "cta";
            if (isQuizRoute) return null;
            if (isCta) {
              return (
                <Button
                  key={item.href}
                  asChild
                  size="sm"
                  className={cn(
                    "shrink-0 rounded-full px-3 sm:px-4",
                    isMarketingHome && "bg-[#172120] text-white hover:bg-[#263533]",
                  )}
                >
                  <Link href={item.href}>{t(item.labelKey)}</Link>
                </Button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hidden rounded-md px-2 py-1.5 text-sm transition-colors md:inline-flex",
                  isMarketingHome
                    ? "text-[#60706d] hover:text-[#172120]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
          {isQuizRoute ? (
            <span className="text-xs font-medium text-muted-foreground">60-sec quiz</span>
          ) : (
            <NavAuth isMarketingHome={isMarketingHome} />
          )}
        </nav>
      </div>
    </header>
  );
}
