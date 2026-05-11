import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NavAuth } from "./nav-auth";

export async function Navbar() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Logo />
        <nav
          className="flex min-w-0 items-center gap-2 md:gap-6"
          aria-label="Primary"
        >
          {siteConfig.nav.map((item) => {
            const isCta = item.variant === "cta";
            if (isCta) {
              return (
                <Button key={item.href} asChild size="sm" className="shrink-0 rounded-lg px-3 sm:px-4">
                  <Link href={item.href}>{t(item.labelKey)}</Link>
                </Button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hidden rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex",
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
          <NavAuth />
        </nav>
      </div>
    </header>
  );
}
