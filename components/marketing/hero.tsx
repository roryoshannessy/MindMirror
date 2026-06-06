import { getTranslations } from "next-intl/server";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="relative overflow-hidden border-b border-[#dce8e5] bg-[#eef7f4] px-4 text-[#172120] sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#ffffff_0%,#f6fbfa_38%,#dcefeb_100%)]" aria-hidden />
      <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-[#b9ddd4]/35 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center py-10 text-center sm:py-14 lg:py-16">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#d6e6e1] bg-white/75 px-4 py-2 text-sm font-medium text-[#365c56] shadow-sm backdrop-blur">
          <Sparkles className="size-4" aria-hidden />
          AI journal that reflects back
        </p>

        <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.04] tracking-tight text-[#101918] sm:text-6xl lg:text-7xl">
          {t("headline")}
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-[#5d706c] sm:text-xl">
          {t("subheadline")}
        </p>

        <div className="mt-7 flex w-full max-w-xl flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="min-h-12 w-full rounded-full bg-[#172120] px-6 text-white shadow-[0_14px_34px_rgb(23_33_32/0.22)] hover:bg-[#263533] sm:w-auto"
          >
            <a href="#product-workflow">
              {t("cta_primary")}
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-h-12 w-full rounded-full border-[#d5e4df] bg-white/78 px-6 text-[#172120] hover:bg-white sm:w-auto"
          >
            <Link href="/quiz">{t("cta_secondary")}</Link>
          </Button>
        </div>

        <p className="mt-4 max-w-md text-sm leading-6 text-[#74827f]">{t("social_proof")}</p>
      </div>
    </section>
  );
}
