import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Check,
  LockKeyhole,
  Mic2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { brand } from "@/config/brand";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function Hero() {
  const t = await getTranslations("hero");

  const proofPoints = [
    ["7 questions", "about 60 seconds"],
    ["Pattern reveal", "before checkout"],
    ["$0 today", "7-day trial"],
  ] as const;

  const patternRows = [
    ["Loop name", "Clarity seeking"],
    ["Hidden cost", "planning replaces action"],
    ["Next useful move", "pick one decision"],
  ] as const;

  return (
    <section className="overflow-hidden border-b border-border bg-background px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="mm-fade-up text-center lg:text-left">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="size-4" aria-hidden />
            60-second pattern quiz
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-semibold leading-tight text-foreground sm:text-6xl lg:mx-0">
            {t("headline")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8 lg:mx-0">
            {t("subheadline")}
          </p>

          <div className="mx-auto mt-7 grid max-w-xl grid-cols-3 gap-2 text-left text-xs text-muted-foreground sm:mt-9 sm:gap-3 sm:text-sm lg:mx-0">
            {proofPoints.map(([top, bottom]) => (
              <div
                key={top}
                className="rounded-lg border border-border bg-card/60 p-3"
              >
                <Check className="mb-2 size-3.5 text-primary sm:size-4" aria-hidden />
                <span>
                  <span className="block font-medium text-foreground">{top}</span>
                  <span className="block">{bottom}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:mt-9 sm:flex-row lg:mx-0">
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

        <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <div className="mm-float relative mx-auto max-w-sm rounded-[2rem] border border-border bg-[#111113] p-2 shadow-2xl lg:max-w-md">
            <div className="overflow-hidden rounded-[1.55rem] border border-border bg-background">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <span className="text-xs font-medium text-muted-foreground">{brand.NAME}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  <Mic2 className="size-3" aria-hidden />
                  voice-first
                </span>
              </div>

              <div className="relative p-5 sm:p-6">
                <div className="mm-scan pointer-events-none absolute left-6 right-6 top-24 h-px bg-primary/70" />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Example pattern profile
                </p>
                <h2 className="mt-3 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
                  Your mind keeps asking for certainty before action.
                </h2>

                <div className="mt-6 rounded-lg border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Recurring thought</p>
                  <p className="mt-2 text-xl font-semibold leading-snug text-foreground">
                    “I need to understand it before I move.”
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  {patternRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card/70 px-4 py-3 text-sm"
                    >
                      <span className="text-muted-foreground">{label}</span>
                      <span className="text-right font-medium text-foreground">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <TrendingUp className="size-4 text-primary" aria-hidden />
                    <p className="mt-3 text-xs text-muted-foreground">Pattern strength</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-4/5 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <LockKeyhole className="size-4 text-primary" aria-hidden />
                    <p className="mt-3 text-xs text-muted-foreground">Private by design</p>
                    <p className="mt-1 text-sm font-medium text-foreground">Export anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
