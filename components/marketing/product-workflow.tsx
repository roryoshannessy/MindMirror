"use client";

import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  FileText,
  ListChecks,
  Loader2,
  Mic,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const liveWords = [
  "I",
  "am",
  "going",
  "out",
  "tonight",
  "and",
  "I",
  "already",
  "feel",
  "anxious.",
  "I",
  "keep",
  "thinking",
  "I",
  "will",
  "be",
  "awkward,",
  "then",
  "I",
  "drink",
  "so",
  "I",
  "feel",
  "normal.",
] as const;

const analysisRows = [
  "Emotion: anxious",
  "Trigger: social event",
  "Loop: I need a buffer",
  "Evidence: 14 similar entries",
] as const;

const historyRows = [
  ["3 weeks ago", "Walk + clear exit plan helped"],
  ["Last month", "Same thought before a work event"],
] as const;

const steps = ["Record", "Transcribe", "Analyse", "Mirror"] as const;

function VoiceBars() {
  return (
    <div className="mm-voice-bars text-current" aria-hidden>
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function RecordingPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-3xl border border-[#dfe9e7] bg-white p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="mm-record-label text-xs font-semibold uppercase tracking-[0.14em] text-[#60706d]">
          Recording
        </span>
        <div className="rounded-full bg-[#172120] px-3 py-1.5 text-white">
          <VoiceBars />
        </div>
      </div>
      <p
        className={`font-semibold text-[#172120] ${
          compact
            ? "min-h-[8.5rem] text-[0.98rem] leading-7"
            : "min-h-40 text-lg leading-8"
        }`}
      >
        {liveWords.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="mm-live-word mr-1.5 inline-block"
            style={{ animationDelay: `${index * 90 - 900}ms` }}
          >
            {word}
          </span>
        ))}
      </p>
      <div className="mm-cursor mt-1 h-1 w-20 rounded-full bg-[#172120]" aria-hidden />
    </div>
  );
}

function AnalysisPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="mm-flow-analysis mt-2 rounded-2xl border border-[#dfe9e7] bg-white p-3 sm:mt-3">
      <div className="mb-3 flex items-center gap-2">
        <BrainCircuit className="size-5 text-[#42615d]" aria-hidden />
        <p className="text-sm font-semibold">Finding what keeps repeating</p>
      </div>
      <div className="grid gap-2">
        {analysisRows.map((row) => (
          <div
            key={row}
            className="mm-flow-analysis-row flex items-center gap-2 rounded-xl border border-[#dfe9e7] bg-[#f7fbfa] px-3 py-2 text-xs text-[#60706d]"
          >
            <Loader2 className="size-3.5 animate-spin text-[#42615d]" aria-hidden />
            {row}
          </div>
        ))}
      </div>
      {compact ? null : (
        <div className="mt-3 flex flex-wrap gap-2">
          {["anxiety", "social event", "alcohol"].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-[#dfe9e7] bg-[#f7fbfa] px-3 py-1.5 text-xs font-medium text-[#60706d]"
            >
              {chip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MirrorResult({ compact = false }: { compact?: boolean }) {
  return (
    <div className="mm-flow-result absolute inset-x-3 bottom-3 rounded-3xl border border-[#bddbd4] bg-[#eef7f4] p-3 shadow-[0_18px_50px_rgb(51_84_79/0.16)] sm:inset-x-4 sm:bottom-4 sm:p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81908d]">
            Pattern summary
          </p>
          <h3 className="mt-2 text-base font-semibold leading-tight sm:text-lg">
            “I need alcohol to feel normal socially.”
          </h3>
        </div>
        <CheckCircle2 className="size-5 shrink-0 text-[#42615d]" aria-hidden />
      </div>
      <p className="mt-3 text-sm leading-6 text-[#60706d]">
        This has appeared 14 times in 90 days. Three weeks ago, a walk and clear exit plan helped.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="flex items-center justify-between rounded-full border border-[#d8e7e3] bg-white px-3 py-2 text-xs font-semibold text-[#172120]"
        >
          Next steps
          <ListChecks className="size-4 text-[#42615d]" aria-hidden />
        </button>
        <button
          type="button"
          className="flex items-center justify-between rounded-full border border-[#d8e7e3] bg-white px-3 py-2 text-xs font-semibold text-[#172120]"
        >
          Past logs
          <FileText className="size-4 text-[#42615d]" aria-hidden />
        </button>
      </div>

      {compact ? null : (
        <div className="mt-3 grid gap-2">
          {historyRows.map(([date, note]) => (
            <div
              key={date}
              className="rounded-2xl border border-[#d8e7e3] bg-white/70 px-3 py-2"
            >
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#81908d]">
                {date}
              </p>
              <p className="mt-1 text-xs font-medium text-[#42615d]">{note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileWorkflowDemo() {
  return (
    <div className="lg:hidden">
      <div className="relative min-h-[31rem] overflow-hidden rounded-[1.55rem] border border-[#d8e7e3] bg-[#f7fbfa] p-3 shadow-[0_20px_60px_rgb(51_84_79/0.14)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#81908d]">
              Live demo
            </p>
            <h2 className="mt-2 text-xl font-semibold leading-tight">
              Speak one thought. See the loop.
            </h2>
          </div>
          <div className="mm-record-dot flex size-11 shrink-0 items-center justify-center rounded-full bg-[#172120] text-white">
            <Mic className="size-5" aria-hidden />
          </div>
        </div>
        <div className="mt-3">
          <RecordingPanel compact />
        </div>
        <AnalysisPanel compact />
        <MirrorResult compact />
      </div>
    </div>
  );
}

function DesktopPhoneDemo() {
  return (
    <div className="relative mx-auto w-full max-w-[25rem] rounded-[2.25rem] border border-[#d8e7e3] bg-[#f7fbfa] p-3 shadow-[0_32px_100px_rgb(51_84_79/0.2)]">
      <div className="rounded-[1.75rem] bg-white p-4 text-[#172120]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#60706d]">MindMirror</span>
          <span className="mm-flow-status rounded-full border border-[#dfe9e7] bg-[#f7fbfa] px-2.5 py-1 text-[0.68rem] font-medium text-[#60706d]">
            live demo
          </span>
        </div>

        <div className="relative mt-4 min-h-[34rem] overflow-hidden rounded-[1.3rem] border border-[#dfe9e7] bg-[#f7fbfa] p-4 shadow-inner">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#81908d]">
                Voice journal
              </p>
              <h3 className="mt-2 text-2xl font-semibold leading-tight">
                What is taking up space in your mind?
              </h3>
            </div>
            <div className="mm-record-dot flex size-12 shrink-0 items-center justify-center rounded-full bg-[#172120] text-white">
              <Mic className="size-5" aria-hidden />
            </div>
          </div>

          <div className="mt-5">
            <RecordingPanel />
          </div>

          <div className="mm-flow-save mt-3 rounded-2xl border border-[#dfe9e7] bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Transcript saved</p>
                <p className="text-xs text-[#60706d]">The messy thought becomes an entry.</p>
              </div>
              <CheckCircle2 className="size-5 shrink-0 text-[#42615d]" aria-hidden />
            </div>
          </div>

          <AnalysisPanel />
          <MirrorResult />
        </div>
      </div>
    </div>
  );
}

export function ProductWorkflow() {
  return (
    <section
      id="product-workflow"
      className="relative overflow-hidden border-b border-[#dce8e5] bg-[#eef7f4] px-4 py-5 text-[#172120] sm:px-6 lg:py-14"
      aria-label="See MindMirror in action"
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#ffffff_0%,#f6fbfa_38%,#dcefeb_100%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d9e6e3] bg-[#f7fbfa] px-3 py-1.5 text-sm font-medium text-[#42615d]">
            <Sparkles className="size-4" aria-hidden />
            Voice-first thought pattern recognition
          </p>
          <h1 className="mt-4 max-w-2xl text-balance text-[2.35rem] font-semibold leading-[1.04] tracking-tight text-[#101918] sm:text-6xl">
            Find the thought loop you keep repeating.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#60706d] sm:text-lg">
            Speak one honest thought. MindMirror turns it into a private pattern profile: the loop,
            the cost, the evidence, and the next move.
          </p>

          <div className="mt-5 lg:hidden">
            <MobileWorkflowDemo />
          </div>

          <div className="mt-6">
            <Button
              asChild
              size="lg"
              className="min-h-12 w-full rounded-full bg-[#172120] px-6 text-white shadow-[0_14px_34px_rgb(23_33_32/0.22)] hover:bg-[#263533] sm:w-auto"
            >
              <Link href="/quiz">
                See my thought loop
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <p className="mt-3 text-sm leading-6 text-[#60706d]">
              Private. Takes about 3 minutes. Preview your result before checkout.
            </p>
          </div>

          <div className="mt-6 hidden max-w-xl overflow-hidden rounded-full bg-[#e2eeeb] lg:block">
            <div className="mm-flow-progress h-2 rounded-full bg-[#172120]" />
          </div>

          <div className="mt-5 hidden grid-cols-4 gap-2 lg:grid">
            {steps.map((step) => (
              <div
                key={step}
                className="mm-flow-step rounded-2xl border border-[#dfe9e7] bg-white px-4 py-3 text-left"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81908d]">
                  {step}
                </span>
                <span className="mt-1 block text-sm font-semibold text-[#172120]">
                  {step === "Record" && "Hold the mic"}
                  {step === "Transcribe" && "Words become an entry"}
                  {step === "Analyse" && "Pattern check runs"}
                  {step === "Mirror" && "Summary + next step"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-8 rounded-[3rem] bg-[#b9ddd4]/45 blur-3xl" aria-hidden />
          <div className="relative rounded-[2rem] border border-[#dfe9e7] bg-[#f7fbfa] p-6 shadow-[0_28px_90px_rgb(51_84_79/0.16)]">
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#dfe9e7] bg-white px-4 py-3">
              <span className="text-sm font-semibold text-[#172120]">Live product demo</span>
              <span className="text-xs font-medium text-[#60706d]">recording to mirror</span>
            </div>
            <DesktopPhoneDemo />
            <div className="mt-5 grid grid-cols-4 gap-2">
              {steps.map((item) => (
                <span
                  key={item}
                  className="mm-flow-pill rounded-full border border-[#dfe9e7] bg-white px-2 py-2 text-center text-[0.7rem] font-medium text-[#81908d]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
