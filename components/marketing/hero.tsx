import { getTranslations } from "next-intl/server";
import { ArrowRight, Check, Mic2, ShieldCheck, Sparkles } from "lucide-react";
import { brand } from "@/config/brand";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <section className="overflow-hidden border-b border-border bg-background px-4 py-10 sm:px-6 sm:py-14 xl:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="size-4" aria-hidden />
            {brand.NAME}
          </p>
          <h1 className="mt-5 max-w-3xl text-balance text-3xl font-semibold leading-tight text-foreground sm:text-5xl 2xl:text-6xl">
            {t("headline")}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8">
            {t("subheadline")}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2 text-xs text-muted-foreground sm:mt-8 sm:gap-3 sm:text-sm">
            {[
              ["7 questions", "No account first"],
              ["Pattern result", "Before checkout"],
              ["$0 today", "7-day trial"],
            ].map(([top, bottom]) => (
              <div key={top} className="flex items-start gap-1.5 sm:gap-2">
                <Check className="mt-0.5 size-3 shrink-0 text-primary sm:size-4" aria-hidden />
                <span>
                  <span className="block font-medium text-foreground">{top}</span>
                  <span className="block">{bottom}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/quiz">
                {t("cta_primary")}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full border-border bg-transparent sm:w-auto"
            >
              <Link href="/#how-it-works">{t("cta_secondary")}</Link>
            </Button>
          </div>

          <p className="mt-5 text-sm text-muted-foreground sm:mt-7">{t("social_proof")}</p>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Example pattern profile
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">Decision loop</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mic2 className="size-4 text-primary" aria-hidden />
                Voice-first
              </div>
            </div>

            <div className="grid gap-0 md:grid-cols-[1fr_0.82fr]">
              <div className="border-b border-border p-5 md:border-b-0 md:border-r">
                <p className="text-sm text-muted-foreground">Recurring thought</p>
                <p className="mt-3 text-2xl font-semibold leading-snug text-foreground">
                  “I need to understand it before I move.”
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    ["Shows up around", "career, money, relationships"],
                    ["Hidden cost", "planning replaces action"],
                    ["Likely pattern", "clarity seeking loop"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-4 border-t border-border pt-3 text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-right font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5">
                <div className="mb-5 flex items-center gap-2 text-sm font-medium text-foreground">
                  <ShieldCheck className="size-4 text-primary" aria-hidden />
                  Private by design
                </div>
                <div className="space-y-4">
                  {[
                    ["You said this", "11 times"],
                    ["Open loop", "3 weeks"],
                    ["Next useful move", "one decision"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: value === "one decision" ? "46%" : value === "3 weeks" ? "64%" : "82%" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 border-t border-border pt-4 text-sm leading-6 text-muted-foreground">
                  MindMirror turns repeated thoughts into a pattern you can name, track, and finally challenge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
