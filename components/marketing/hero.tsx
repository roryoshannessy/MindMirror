import { getTranslations } from "next-intl/server";
import {
  Activity,
  ArrowRight,
  AudioLines,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  LockKeyhole,
  Mic2,
  ShieldCheck,
  Sparkles,
  Target,
  Waypoints,
} from "lucide-react";
import { brand } from "@/config/brand";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function Hero() {
  const t = await getTranslations("hero");

  const proofPoints = [
    ["One thought", "first mirror"],
    ["3 reflections", "early signals"],
    ["10 reflections", "pattern map"],
  ] as const;

  const timelineRows = [
    ["Decision loop", "11 signals", "w-[82%]", "text-zinc-100"],
    ["Energy crash", "7 signals", "w-[58%]", "text-zinc-300"],
    ["Morning focus", "5 signals", "w-[44%]", "text-zinc-400"],
  ] as const;

  const insightRows = [
    ["Pattern", "Clarity seeking"],
    ["Cost", "Planning replaces action"],
    ["Next", "Pick one decision"],
  ] as const;

  return (
    <section className="relative overflow-hidden border-b border-border bg-background px-4 py-8 sm:px-6 sm:py-16 lg:py-18">
      <div className="mm-hero-grid absolute inset-0 opacity-60" aria-hidden />
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:gap-10">
        <div className="mm-fade-up relative z-10 text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" aria-hidden />
            Voice-first thought mirror
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-semibold leading-tight text-foreground sm:text-6xl lg:mx-0">
            {t("headline")}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 lg:mx-0">
            {t("subheadline")}
          </p>

          <div className="mx-auto mt-7 hidden max-w-xl grid-cols-3 gap-2 text-left text-xs text-muted-foreground sm:grid sm:gap-3 sm:text-sm lg:mx-0">
            {proofPoints.map(([top, bottom]) => (
              <div
                key={top}
                className="rounded-lg border border-border bg-card/60 p-3 shadow-[0_14px_40px_rgb(0_0_0/0.22)]"
              >
                <Check className="mb-2 size-3.5 text-primary sm:size-4" aria-hidden />
                <span>
                  <span className="block font-medium text-foreground">{top}</span>
                  <span className="block">{bottom}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row lg:mx-0">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/signup?returnTo=%2Faccount">
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
              <Link href="/quiz">{t("cta_secondary")}</Link>
            </Button>
          </div>

          <p className="mx-auto mt-5 max-w-sm text-sm text-muted-foreground sm:mt-7 lg:mx-0">
            {t("social_proof")}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          <div className="mm-float relative rounded-[1.4rem] border border-white/10 bg-[#111114] p-1.5 shadow-[0_28px_80px_rgb(0_0_0/0.5)] sm:rounded-[1.75rem] sm:p-2">
            <div className="overflow-hidden rounded-[1.05rem] border border-border bg-background sm:rounded-[1.35rem]">
              <div className="flex items-center justify-between border-b border-border bg-card/45 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-primary" aria-hidden />
                  <span className="text-xs font-medium text-foreground">{brand.NAME}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mic2 className="size-3.5 text-primary" aria-hidden />
                  <span>first mirror preview</span>
                </div>
              </div>

              <div className="relative grid gap-3 p-3 sm:grid-cols-[1.1fr_0.9fr] sm:p-5">
                <div className="mm-scan pointer-events-none absolute left-5 right-5 top-24 h-px bg-primary/70" />

                <div className="rounded-lg border border-border bg-card/70 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Today’s reflection</p>
                      <p className="mt-2 text-lg font-semibold leading-snug text-foreground">
                        “I keep waiting until I feel certain before I choose.”
                      </p>
                    </div>
                    <AudioLines className="mt-1 size-5 text-primary" aria-hidden />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-md border border-border bg-background p-2">
                      <span className="block text-muted-foreground">Emotion</span>
                      <span className="mt-1 block font-medium text-foreground">Pressure</span>
                    </div>
                    <div className="rounded-md border border-border bg-background p-2">
                      <span className="block text-muted-foreground">Topic</span>
                      <span className="mt-1 block font-medium text-foreground">Work</span>
                    </div>
                    <div className="rounded-md border border-border bg-background p-2">
                      <span className="block text-muted-foreground">Goal</span>
                      <span className="mt-1 block font-medium text-foreground">Decide</span>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-lg border border-border bg-card/70 p-4">
                  <div className="mm-mira-bot absolute -right-2 -top-3" aria-hidden>
                    <span />
                    <span />
                  </div>
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="size-4 text-primary" aria-hidden />
                    <p className="text-xs font-medium text-foreground">Mira noticed</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    This is the third time this pattern appeared around decisions.
                  </p>
                  <div className="mt-4 rounded-md border border-primary/30 bg-primary/10 p-3">
                    <p className="text-sm font-medium leading-5 text-foreground">
                      Clarity seeking loop
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card/70 p-4 sm:col-span-2">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Pattern dashboard</p>
                      <h2 className="mt-1 text-xl font-semibold text-foreground">
                        What keeps coming back
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                      <CalendarDays className="size-3" aria-hidden />
                      30 days
                    </span>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-3">
                      {timelineRows.map(([label, count, width, color]) => (
                        <div key={label}>
                          <div className="mb-1.5 flex justify-between text-xs">
                            <span className={color}>{label}</span>
                            <span className="text-muted-foreground">{count}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div className={`h-full rounded-full bg-primary ${width}`} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-2">
                      {insightRows.map(([label, value]) => (
                        <div
                          key={label}
                          className="flex items-center justify-between gap-4 rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                          <span className="text-muted-foreground">{label}</span>
                          <span className="text-right font-medium text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-border bg-card/60 p-4">
                    <Activity className="size-4 text-emerald-300" aria-hidden />
                    <p className="mt-3 text-xs text-muted-foreground">Habit link</p>
                    <p className="mt-1 text-sm font-medium text-foreground">Sleep affects focus</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card/60 p-4">
                    <Waypoints className="size-4 text-sky-300" aria-hidden />
                    <p className="mt-3 text-xs text-muted-foreground">Life area</p>
                    <p className="mt-1 text-sm font-medium text-foreground">Work decisions</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card/60 p-4">
                    <LockKeyhole className="size-4 text-amber-200" aria-hidden />
                    <p className="mt-3 text-xs text-muted-foreground">Data control</p>
                    <p className="mt-1 text-sm font-medium text-foreground">Export anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 left-4 right-4 hidden rounded-lg border border-border bg-background/95 p-3 shadow-xl backdrop-blur sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-400/10">
                <ShieldCheck className="size-4 text-emerald-200" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Early product access</p>
                <p className="text-xs text-muted-foreground">Start with one thought. Add more to sharpen the map.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="size-3.5 text-primary" aria-hidden />
              <span>landing to first mirror</span>
              <ChevronRight className="size-3.5" aria-hidden />
              <CircleDot className="size-3.5 text-primary" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
