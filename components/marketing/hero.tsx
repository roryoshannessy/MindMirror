import { getTranslations } from "next-intl/server";
import { brand } from "@/config/brand";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="relative overflow-hidden border-b border-border px-4 py-20 sm:px-6 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, var(--primary) 0%, transparent 65%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium tracking-wide text-primary">
          {brand.NAME}
        </p>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-tight md:text-5xl">
          {t("headline")}
        </h1>
        <p className="mt-6 text-pretty text-base text-muted-foreground sm:text-lg">
          {t("subheadline")}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button asChild size="lg" className="w-full min-w-[14rem] sm:w-auto">
            <Link href="/quiz">{t("cta_primary")}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full min-w-[14rem] border-border bg-transparent sm:w-auto"
          >
            <Link href="/#features">{t("cta_secondary")}</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">{t("social_proof")}</p>
      </div>
    </section>
  );
}
