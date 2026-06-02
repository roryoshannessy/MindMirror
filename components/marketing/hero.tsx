import { getTranslations } from "next-intl/server";
import { ArrowRight, Check, Mic2, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function Hero() {
  const t = await getTranslations("hero");

  const proofPoints = ["60-second quiz", "Sample pattern result", "Checkout before app build"] as const;

  return (
    <section className="relative overflow-hidden border-b border-[#e6edf0] bg-[#f7fbfa] px-4 text-[#172120] sm:px-6">
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white to-transparent" aria-hidden />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center py-14 text-center sm:py-16 lg:py-20">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#d9e6e3] bg-white/80 px-4 py-2 text-sm font-medium text-[#42615d] shadow-sm">
          <Sparkles className="size-4" aria-hidden />
          AI journal for thought patterns
        </p>

        <h1 className="mt-6 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-[#101918] sm:text-6xl">
          {t("headline")}
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-[#60706d] sm:text-xl">
          {t("subheadline")}
        </p>

        <div className="mt-8 flex w-full max-w-lg flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="min-h-12 w-full rounded-full bg-[#172120] px-6 text-white hover:bg-[#263533] sm:w-auto"
          >
            <Link href="/quiz">
              {t("cta_primary")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-h-12 w-full rounded-full border-[#d9e6e3] bg-white/70 px-6 text-[#172120] hover:bg-white sm:w-auto"
          >
            <Link href="/auth/signup?returnTo=%2Faccount">{t("cta_secondary")}</Link>
          </Button>
        </div>

        <p className="mt-4 max-w-md text-sm leading-6 text-[#74827f]">{t("social_proof")}</p>

        <div className="relative mt-10 w-full max-w-3xl">
          <div className="absolute -inset-6 rounded-[2rem] bg-[#dcecea]/70 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-xl overflow-hidden rounded-[2rem] border border-[#d8e6e3] bg-white shadow-[0_28px_90px_rgb(51_84_79/0.18)]">
            <div className="flex items-center justify-between border-b border-[#edf3f2] px-5 py-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#172120]">
                <span className="size-2 rounded-full bg-[#406c64]" aria-hidden />
                MindMirror
              </div>
              <div className="flex items-center gap-2 text-xs text-[#74827f]">
                <Mic2 className="size-3.5" aria-hidden />
                sample result
              </div>
            </div>
            <div className="p-5 text-left sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#81908d]">
                Possible loop
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#172120]">
                Clarity seeking
              </h2>
              <p className="mt-3 text-base leading-7 text-[#60706d]">
                You may be waiting to feel certain before taking the next step.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["Cost", "Planning replaces action"],
                  ["Evidence", "decision, sure, waiting"],
                  ["Next", "Pick one visible step"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-[#edf3f2] bg-[#f8fbfa] p-4">
                    <p className="text-xs font-medium text-[#81908d]">{label}</p>
                    <p className="mt-2 text-sm font-medium leading-5 text-[#172120]">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-3">
          {proofPoints.map((point) => (
            <div
              key={point}
              className="flex items-center gap-3 rounded-full border border-[#dfe9e7] bg-white/80 px-4 py-3 text-sm text-[#52625f] shadow-sm"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e8f2ef] text-[#2f6058]">
                <Check className="size-3.5" aria-hidden />
              </span>
              {point}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
