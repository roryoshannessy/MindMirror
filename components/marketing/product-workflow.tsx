"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Loader2,
  Mic,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const demoFrames = [
  {
    eyebrow: "Record",
    title: "Hold to record a thought",
    body: "The visitor sees the exact first action: press the mic and speak naturally.",
  },
  {
    eyebrow: "Speak",
    title: "Words appear while they talk",
    body: "The demo shows live dictation, so it feels familiar and low-friction on mobile.",
  },
  {
    eyebrow: "Transcribe",
    title: "The voice note becomes a journal entry",
    body: "MindMirror saves the messy thought first, before trying to interpret it.",
  },
  {
    eyebrow: "Analyse",
    title: "MindMirror looks for the pattern",
    body: "The AI checks emotion, trigger, repeated language, and similar past entries.",
  },
  {
    eyebrow: "Mirror",
    title: "The user gets a useful next step",
    body: "The result explains what keeps coming back and how to prepare for it next time.",
  },
] as const;

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
  "Emotion detected: anxious",
  "Situation detected: social event",
  "Recurring thought: I will be awkward",
  "Similar entries found: 14 in 90 days",
] as const;

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

function FrameShell({
  active,
  children,
  direction = "right",
}: {
  active: boolean;
  children: ReactNode;
  direction?: "left" | "right";
}) {
  const inactiveTransform = direction === "right" ? "translate-x-8" : "-translate-x-8";

  return (
    <div
      className={`absolute inset-0 p-5 transition duration-500 ${
        active ? "translate-x-0 opacity-100" : `${inactiveTransform} opacity-0`
      }`}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

function PhoneDemo({ frame }: { frame: number }) {
  return (
    <div className="relative mx-auto w-full max-w-[25rem] rounded-[2.25rem] border border-[#d8e7e3] bg-[#101918] p-3 shadow-[0_32px_100px_rgb(23_33_32/0.24)]">
      <div className="rounded-[1.75rem] bg-[#f7fbfa] p-4 text-[#172120]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#60706d]">MindMirror</span>
          <span className="rounded-full border border-[#dfe9e7] bg-white px-2.5 py-1 text-[0.68rem] font-medium text-[#60706d]">
            {demoFrames[frame].eyebrow}
          </span>
        </div>

        <div className="relative mt-4 min-h-[31rem] overflow-hidden rounded-[1.3rem] border border-[#dfe9e7] bg-white shadow-inner">
          <FrameShell active={frame === 0} direction="left">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#81908d]">
              Voice journal
            </p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight">
              What is taking up space in your mind?
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#60706d]">
              Before a night out, the user records what they are worried might happen.
            </p>

            <div className="mt-12 flex flex-col items-center">
              <button
                type="button"
                className="mm-demo-press flex size-28 items-center justify-center rounded-full bg-[#172120] text-white shadow-[0_20px_52px_rgb(23_33_32/0.28)]"
                aria-label="Demo microphone button"
              >
                <Mic className="size-10" aria-hidden />
              </button>
              <p className="mt-5 text-sm font-semibold text-[#172120]">Hold to record</p>
              <p className="mt-2 text-center text-xs leading-5 text-[#81908d]">
                No blank page. No perfect journaling. Just talk.
              </p>
            </div>
          </FrameShell>

          <FrameShell active={frame === 1}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#81908d]">
                Recording
              </p>
              <div className="rounded-full bg-[#172120] px-3 py-1.5 text-white">
                <VoiceBars />
              </div>
            </div>

            <div className="mt-6 min-h-56 rounded-3xl border border-[#dfe9e7] bg-[#f7fbfa] p-4">
              <p className="text-lg font-semibold leading-8 text-[#172120]">
                {liveWords.map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    className="mm-live-word mr-1.5 inline-block"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    {word}
                  </span>
                ))}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-full border border-[#dfe9e7] bg-white p-2 pl-4">
              <span className="text-sm font-medium text-[#60706d]">Tap when finished</span>
              <span className="flex size-12 items-center justify-center rounded-full bg-[#172120] text-white">
                <CheckCircle2 className="size-5" aria-hidden />
              </span>
            </div>
          </FrameShell>

          <FrameShell active={frame === 2}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#81908d]">
              Transcript
            </p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight">Saved as an entry</h3>
            <div className="mt-5 rounded-3xl border border-[#dfe9e7] bg-[#f7fbfa] p-5">
              <p className="text-base leading-7 text-[#172120]">
                I am going out tonight and I already feel anxious. I keep thinking I will be
                awkward, then I end up drinking so I feel more normal.
              </p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {["anxiety", "social event", "alcohol"].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-[#dfe9e7] bg-white px-3 py-2 text-center text-xs font-medium text-[#60706d]"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-[#dfe9e7] bg-white p-4 text-sm leading-6 text-[#60706d]">
              MindMirror keeps the original thought, then starts looking for repeated language.
            </div>
          </FrameShell>

          <FrameShell active={frame === 3}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#81908d]">
              Analysing
            </p>
            <div className="mt-7 flex flex-col items-center text-center">
              <div className="mm-demo-orbit relative flex size-32 items-center justify-center rounded-full bg-[#eef7f4] text-[#42615d]">
                <BrainCircuit className="size-12" aria-hidden />
              </div>
              <h3 className="mt-6 text-2xl font-semibold">Finding what keeps repeating</h3>
              <p className="mt-3 text-sm leading-6 text-[#60706d]">
                It compares this entry with previous moments, emotions, and situations.
              </p>
            </div>
            <div className="mt-6 grid gap-2">
              {analysisRows.map((item) => (
                <div
                  key={item}
                  className="mm-demo-scan flex items-center gap-3 rounded-2xl border border-[#dfe9e7] bg-white px-4 py-3 text-sm text-[#172120]"
                >
                  <Loader2 className="size-4 animate-spin text-[#42615d]" aria-hidden />
                  {item}
                </div>
              ))}
            </div>
          </FrameShell>

          <FrameShell active={frame === 4}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#81908d]">
                Mirror ready
              </p>
              <CheckCircle2 className="size-5 text-[#42615d]" aria-hidden />
            </div>
            <div className="mt-4 rounded-2xl border border-[#dfe9e7] bg-[#eef7f4] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81908d]">
                Recurring thought
              </p>
              <h3 className="mt-2 text-xl font-semibold leading-tight">
                “I need alcohol to feel normal socially.”
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#60706d]">
                This pattern has appeared 14 times in the last 90 days, usually before weekends.
              </p>
            </div>
            <div className="mt-3 grid gap-3">
              <div className="rounded-2xl border border-[#dfe9e7] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81908d]">
                  What helped before
                </p>
                <p className="mt-2 text-sm leading-6 text-[#172120]">
                  Three weeks ago, a walk and a clear exit plan helped you stay calm.
                </p>
              </div>
              <div className="grid gap-2">
                {["Prepare for tonight", "Write the exit plan", "View similar entries"].map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      className="flex items-center justify-between rounded-full border border-[#dfe9e7] bg-white px-4 py-3 text-left text-sm font-medium text-[#172120] transition hover:bg-[#f7fbfa]"
                    >
                      {option}
                      <ArrowRight className="size-4 text-[#42615d]" aria-hidden />
                    </button>
                  ),
                )}
              </div>
            </div>
          </FrameShell>
        </div>
      </div>
    </div>
  );
}

export function ProductWorkflow() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % demoFrames.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, []);

  const active = demoFrames[frame];
  const progressWidth = useMemo(() => `${((frame + 1) / demoFrames.length) * 100}%`, [frame]);

  return (
    <section
      id="product-workflow"
      className="relative overflow-hidden border-b border-[#dce8e5] bg-[#eef7f4] px-4 py-6 text-[#172120] sm:px-6 lg:py-14"
      aria-label="See MindMirror in action"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#ffffff_0%,#f6fbfa_38%,#dcefeb_100%)]" aria-hidden />
      <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-[#b9ddd4]/35 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d9e6e3] bg-[#f7fbfa] px-3 py-1.5 text-sm font-medium text-[#42615d]">
            <Sparkles className="size-4" aria-hidden />
            Voice-first thought pattern recognition
          </p>
          <h1 className="mt-5 max-w-2xl text-balance text-[2.65rem] font-semibold leading-[1.04] tracking-tight text-[#101918] sm:text-6xl">
            See what your mind keeps repeating.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#60706d] sm:text-lg">
            MindMirror turns one spoken thought into a saved journal entry, then shows the
            recurring thoughts, themes, and next steps that are easiest to miss.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="min-h-12 rounded-full bg-[#172120] px-6 text-white shadow-[0_14px_34px_rgb(23_33_32/0.22)] hover:bg-[#263533]"
            >
              <Link href="/quiz">
                Start the 60-second quiz
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-12 rounded-full border-[#d5e4df] bg-white/78 px-6 text-[#172120] hover:bg-white"
            >
              <Link href="/app">Try the first mirror</Link>
            </Button>
          </div>

          <div className="mt-7 overflow-hidden rounded-full bg-[#e2eeeb]">
            <div
              className="h-2 rounded-full bg-[#172120] transition-all duration-500"
              style={{ width: progressWidth }}
            />
          </div>

          <div className="mt-5 hidden gap-2 lg:grid">
            {demoFrames.map((step, index) => (
              <button
                key={step.eyebrow}
                type="button"
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  frame === index
                    ? "border-[#9fbeb8] bg-[#eef7f4]"
                    : "border-[#dfe9e7] bg-white hover:bg-[#f8fbfa]"
                }`}
                onClick={() => setFrame(index)}
              >
                <span className="flex items-center justify-between gap-3">
                  <span>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81908d]">
                      {step.eyebrow}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-[#172120]">
                      {step.title}
                    </span>
                  </span>
                  {frame === index ? (
                    <Clock3 className="size-4 shrink-0 text-[#42615d]" aria-hidden />
                  ) : null}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-5 hidden text-sm leading-6 text-[#60706d] lg:block">{active.body}</p>
        </div>

        <div className="relative">
          <div className="absolute inset-8 rounded-[3rem] bg-[#b9ddd4]/45 blur-3xl" aria-hidden />
          <div className="relative rounded-[2rem] border border-[#dfe9e7] bg-[#f7fbfa] p-4 shadow-[0_28px_90px_rgb(51_84_79/0.16)] sm:p-6">
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#dfe9e7] bg-white px-4 py-3">
              <span className="text-sm font-semibold text-[#172120]">Live product demo</span>
              <span className="text-xs font-medium text-[#60706d]">auto-playing</span>
            </div>
            <PhoneDemo frame={frame} />
            <div className="mt-5 grid grid-cols-5 gap-2">
              {demoFrames.map((item, index) => (
                <button
                  key={item.eyebrow}
                  type="button"
                  className={`rounded-full px-2 py-2 text-center text-[0.66rem] font-medium transition ${
                    frame >= index
                      ? "bg-[#172120] text-white"
                      : "border border-[#dfe9e7] bg-white text-[#81908d]"
                  }`}
                  onClick={() => setFrame(index)}
                >
                  {item.eyebrow}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
