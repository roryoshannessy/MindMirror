"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  LineChart,
  Mic,
  Sparkles,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const demoFrames = [
  {
    eyebrow: "Tap to speak",
    title: "Capture the real thought",
    body: "A user opens MindMirror before a night out and speaks naturally.",
    status: "Ready",
  },
  {
    eyebrow: "Listening",
    title: "Voice becomes a journal entry",
    body: "The app shows the mic is active, then drops the transcript into the entry.",
    status: "Recording",
  },
  {
    eyebrow: "Analysing",
    title: "AI reads for patterns",
    body: "MindMirror checks emotion, situation, repeated phrases, and likely beliefs.",
    status: "Analysing",
  },
  {
    eyebrow: "Mirror ready",
    title: "The user gets a useful result",
    body: "Recurring thoughts, evidence, and next options appear inside the same interface.",
    status: "Ready",
  },
] as const;

const timeline = [
  "Press mic",
  "Speak freely",
  "Analyse pattern",
  "Choose next step",
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

function PhoneDemo({ frame }: { frame: number }) {
  const isCapture = frame === 0;
  const isListening = frame === 1;
  const isAnalysing = frame === 2;
  const isResult = frame === 3;

  return (
    <div className="relative mx-auto w-full max-w-[23rem] rounded-[2.2rem] border border-[#d8e7e3] bg-[#101918] p-3 shadow-[0_30px_90px_rgb(23_33_32/0.22)]">
      <div className="rounded-[1.7rem] bg-[#f7fbfa] p-4 text-[#172120]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#60706d]">MindMirror</span>
          <span className="rounded-full border border-[#dfe9e7] bg-white px-2.5 py-1 text-[0.68rem] font-medium text-[#60706d]">
            {demoFrames[frame].status}
          </span>
        </div>

        <div className="relative mt-5 min-h-[28rem] overflow-hidden rounded-[1.25rem] border border-[#dfe9e7] bg-white">
          <div
            className={`absolute inset-0 p-5 transition duration-500 ${
              isCapture ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#81908d]">
              Before the event
            </p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight">
              What are you noticing?
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#60706d]">
              Start with a voice note. You do not need to write perfectly.
            </p>

            <div className="mt-10 flex flex-col items-center">
              <button
                type="button"
                className="mm-demo-press flex size-24 items-center justify-center rounded-full bg-[#172120] text-white shadow-[0_18px_44px_rgb(23_33_32/0.28)]"
                aria-label="Demo microphone button"
              >
                <Mic className="size-9" aria-hidden />
              </button>
              <p className="mt-4 text-sm font-medium text-[#172120]">Press to talk</p>
              <p className="mt-2 text-center text-xs leading-5 text-[#81908d]">
                The demo starts with the same action the user takes.
              </p>
            </div>
          </div>

          <div
            className={`absolute inset-0 p-5 transition duration-500 ${
              isListening ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#81908d]">
                Listening
              </p>
              <VoiceBars />
            </div>
            <div className="mt-6 rounded-2xl border border-[#dfe9e7] bg-[#f7fbfa] p-4">
              <p className="text-sm leading-7 text-[#172120]">
                I am going out tonight and I already feel anxious. I keep thinking I will be
                awkward, then I end up drinking so I feel more normal.
              </p>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#dfe9e7] bg-white p-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#eef7f4] text-[#42615d]">
                <Mic className="size-5" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold">Transcript added</p>
                <p className="text-xs text-[#60706d]">The thought is saved first.</p>
              </div>
            </div>
          </div>

          <div
            className={`absolute inset-0 p-5 transition duration-500 ${
              isAnalysing ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#81908d]">
              Analysing
            </p>
            <div className="mt-8 flex flex-col items-center text-center">
              <div className="mm-demo-orbit relative flex size-32 items-center justify-center rounded-full bg-[#eef7f4] text-[#42615d]">
                <BrainCircuit className="size-12" aria-hidden />
              </div>
              <h3 className="mt-6 text-2xl font-semibold">Looking for recurring thoughts</h3>
              <p className="mt-3 text-sm leading-6 text-[#60706d]">
                Emotion, trigger, belief, repeated phrase, and previous similar moments.
              </p>
            </div>
            <div className="mt-6 grid gap-2">
              {["Emotion: anxious", "Trigger: social event", "Belief: I will not cope"].map((item) => (
                <div
                  key={item}
                  className="mm-demo-scan rounded-2xl border border-[#dfe9e7] bg-white px-4 py-3 text-sm text-[#172120]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`absolute inset-0 p-5 transition duration-500 ${
              isResult ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
          >
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
                Social anxiety before plans
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#60706d]">
                This has appeared 14 times in the last 90 days, usually before weekends.
              </p>
            </div>
            <div className="mt-3 grid gap-3">
              <div className="rounded-2xl border border-[#dfe9e7] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81908d]">
                  You handled this before
                </p>
                <p className="mt-2 text-sm leading-6 text-[#172120]">
                  Three weeks ago, a walk before the event helped you stay calm.
                </p>
              </div>
              <div className="grid gap-2">
                {["Prepare for tonight", "Answer one reflection", "View similar entries"].map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      className="flex items-center justify-between rounded-full border border-[#dfe9e7] bg-white px-4 py-3 text-left text-sm font-medium text-[#172120]"
                    >
                      {option}
                      <ArrowRight className="size-4 text-[#42615d]" aria-hidden />
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
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
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  const active = demoFrames[frame];
  const progressWidth = useMemo(() => `${((frame + 1) / demoFrames.length) * 100}%`, [frame]);

  return (
    <section
      id="product-workflow"
      className="relative overflow-hidden border-b border-[#dce8e5] bg-[#eef7f4] px-4 py-10 text-[#172120] sm:px-6 lg:py-16"
      aria-label="See MindMirror in action"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#ffffff_0%,#f6fbfa_38%,#dcefeb_100%)]" aria-hidden />
      <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-[#b9ddd4]/35 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d9e6e3] bg-[#f7fbfa] px-3 py-1.5 text-sm font-medium text-[#42615d]">
            <Sparkles className="size-4" aria-hidden />
            AI journal that reflects back
          </p>
          <h1 className="mt-5 max-w-2xl text-balance text-4xl font-semibold leading-[1.04] tracking-tight text-[#101918] sm:text-6xl">
            See the pattern your mind keeps repeating.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#60706d]">
            Watch MindMirror turn one messy thought into a recurring-pattern insight, then show
            what to do with it next.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="min-h-12 rounded-full bg-[#172120] px-6 text-white shadow-[0_14px_34px_rgb(23_33_32/0.22)] hover:bg-[#263533]"
            >
              <Link href="/quiz">
                Start the quiz
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="min-h-12 rounded-full border-[#d5e4df] bg-white/78 px-6 text-[#172120] hover:bg-white"
            >
              <a href="#features">What it tracks</a>
            </Button>
          </div>

          <div className="mt-7 overflow-hidden rounded-full bg-[#e2eeeb]">
            <div
              className="h-2 rounded-full bg-[#172120] transition-all duration-500"
              style={{ width: progressWidth }}
            />
          </div>

          <div className="mt-5 grid gap-2">
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

          <p className="mt-5 text-sm leading-6 text-[#60706d]">{active.body}</p>
        </div>

        <div className="relative">
          <div className="absolute inset-8 rounded-[3rem] bg-[#b9ddd4]/45 blur-3xl" aria-hidden />
          <div className="relative rounded-[2rem] border border-[#dfe9e7] bg-[#f7fbfa] p-4 shadow-[0_28px_90px_rgb(51_84_79/0.16)] sm:p-6">
            <PhoneDemo frame={frame} />
            <div className="mt-5 grid grid-cols-4 gap-2">
              {timeline.map((item, index) => (
                <div
                  key={item}
                  className={`rounded-full px-2 py-2 text-center text-[0.68rem] font-medium ${
                    frame >= index
                      ? "bg-[#172120] text-white"
                      : "border border-[#dfe9e7] bg-white text-[#81908d]"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
