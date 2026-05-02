import { getTranslations } from "next-intl/server";
import { brand } from "@/config/brand";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{brand.NAME}</p>
            <p className="mt-2 text-sm text-muted-foreground">{brand.TAGLINE}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Product
            </p>
            <ul className="mt-3 space-y-2">
              {siteConfig.footer.product.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Legal & support
            </p>
            <ul className="mt-3 space-y-2">
              {siteConfig.footer.legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
              {siteConfig.footer.support.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t(item.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {brand.LEGAL_ENTITY}
        </p>
      </div>
    </footer>
  );
}
