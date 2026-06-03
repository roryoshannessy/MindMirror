import { getTranslations } from "next-intl/server";
import { ArrowRight, Check, Mic2, Sparkles, Waves } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

function BrainMirrorMascot() {
  return (
    <div className="mm-brain-mirror mm-landing-mascot is-active" aria-hidden>
      <svg viewBox="0 0 220 220" role="img">
        <path
          className="mm-brain-body"
          d="M78 62c8-24 40-27 55-9 24-10 52 7 50 35 17 8 24 29 10 45 8 27-18 49-43 38-14 21-49 18-57-6-27 3-45-24-35-47-19-16-13-48 20-56Z"
        />
        <path className="mm-brain-line" d="M88 82c13-16 35-11 40 7" />
        <path className="mm-brain-line" d="M74 116c19-11 39-6 51 11" />
        <path className="mm-brain-line" d="M133 91c-4 16 3 31 18 39" />
        <path className="mm-brain-line" d="M96 151c16 4 31-1 41-15" />
        <path className="mm-brain-arm" d="M68 145c-18 4-29 13-35 25" />
        <path className="mm-brain-arm right" d="M160 136c13 1 23 8 31 20" />
        <path className="mm-brain-leg" d="M88 171v27" />
        <path className="mm-brain-leg" d="M135 171v27" />
        <path className="mm-brain-foot" d="M76 199h24" />
        <path className="mm-brain-foot" d="M124 199h25" />
        <circle className="mm-mascot-mirror" cx="189" cy="164" r="24" />
        <path className="mm-mascot-shine" d="M180 159c5-7 13-9 20-5" />
        <path className="mm-mascot-handle" d="M204 180l14 14" />
      </svg>
    </div>
  );
}

export async function Hero() {
  const t = await getTranslations("hero");

  const proofPoints = ["Quiz first", "Sample result", "Checkout only after the promise lands"] as const;

  const signals = [
    ["Possible loop", "Clarity seeking"],
    ["Cost", "Planning replaces action"],
    ["Next", "Pick one visible step"],
  ] as const;

  return (
    <section className="relative overflow-hidden border-b border-[#dce8e5] bg-[#eef7f4] px-4 text-[#172120] sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#ffffff_0%,#f6fbfa_38%,#dcefeb_100%)]" aria-hidden />
      <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-[#b9ddd4]/35 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center py-12 text-center sm:py-16 lg:py-18">
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
            <Link href="/quiz">
              {t("cta_primary")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="min-h-12 w-full rounded-full border-[#d5e4df] bg-white/78 px-6 text-[#172120] hover:bg-white sm:w-auto"
          >
            <Link href="/auth/signup?returnTo=%2Faccount">{t("cta_secondary")}</Link>
          </Button>
        </div>

        <p className="mt-4 max-w-md text-sm leading-6 text-[#74827f]">{t("social_proof")}</p>

        <div className="relative mt-10 w-full max-w-5xl">
          <div className="absolute -inset-5 rounded-[2.4rem] bg-[#b8dad2]/40 blur-3xl" aria-hidden />
          <div className="relative overflow-hidden rounded-[2rem] border border-[#d6e6e1] bg-white/84 p-3 text-left shadow-[0_28px_90px_rgb(51_84_79/0.18)] backdrop-blur sm:p-4">
            <div className="grid gap-4 lg:grid-cols-[0.94fr_1.06fr]">
              <div className="relative min-h-[22rem] overflow-hidden rounded-[1.5rem] bg-[#101918] p-5 text-white sm:min-h-[24rem]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgb(255_255_255/0.1),transparent_42%)]" aria-hidden />
                <div className="relative flex items-center justify-between">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/72">
                    thought capture
                  </span>
                  <div className="mm-voice-bars text-white" aria-hidden>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>

                <div className="relative mx-auto mt-5 flex max-w-sm flex-col items-center">
                  <div className="relative h-56 w-full">
                    <div className="absolute left-3 top-10 space-y-2">
                      {["work", "waiting", "tired"].map((chip) => (
                        <span
                          key={chip}
                          className="mm-thought-chip block rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs text-white/68"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                    <div className="absolute left-1/2 top-2 -translate-x-1/2">
                      <BrainMirrorMascot />
                    </div>
                  </div>
                  <p className="mt-4 max-w-xs text-center text-sm leading-6 text-white/68">
                    Speak one messy thought. MindMirror turns it into something you can actually inspect.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[#edf3f2] bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between border-b border-[#edf3f2] pb-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#172120]">
                    <span className="size-2 rounded-full bg-[#406c64]" aria-hidden />
                    MindMirror result
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#74827f]">
                    <Mic2 className="size-3.5" aria-hidden />
                    sample
                  </div>
                </div>

                <div className="pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#81908d]">
                    Pattern preview
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#172120] sm:text-4xl">
                    Clarity seeking loop
                  </h2>
                  <p className="mt-3 text-base leading-7 text-[#60706d]">
                    You may be waiting to feel certain before taking the next step.
                  </p>

                  <div className="mt-6 grid gap-3">
                    {signals.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-start justify-between gap-5 rounded-2xl border border-[#edf3f2] bg-[#f8fbfa] p-4"
                      >
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#81908d]">
                          {label}
                        </p>
                        <p className="max-w-[14rem] text-right text-sm font-medium leading-5 text-[#172120]">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-[#dbeae6] bg-[#eef7f4] p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#365c56]">
                      <Waves className="size-4" aria-hidden />
                      60-second funnel test
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#60706d]">
                      The quiz gives a sample result first. Checkout comes after the value is clear.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 grid w-full max-w-4xl gap-3 text-left sm:grid-cols-3">
          {proofPoints.map((point) => (
            <div
              key={point}
              className="flex items-center gap-3 rounded-full border border-[#dfe9e7] bg-white/78 px-4 py-3 text-sm text-[#52625f] shadow-sm"
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
