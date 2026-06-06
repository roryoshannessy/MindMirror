"use client";

import { useState } from "react";
import {
  AudioLines,
  BrainCircuit,
  CheckCircle2,
  LineChart,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

const workflowSteps = [
  {
    body: "A quick voice note or typed entry captures the real situation before it disappears.",
    eyebrow: "Step 1",
    Icon: MessageSquareText,
    title: "Capture the thought",
  },
  {
    body: "MindMirror reads for emotion, repeated language, likely triggers, and underlying beliefs.",
    eyebrow: "Step 2",
    Icon: BrainCircuit,
    title: "Recognise the pattern",
  },
  {
    body: "The user gets a clearer reflection, one useful question, and a next action to try.",
    eyebrow: "Step 3",
    Icon: Sparkles,
    title: "Receive the mirror",
  },
  {
    body: "Over time, saved reflections become a map of recurring topics, confidence, habits, and progress.",
    eyebrow: "Step 4",
    Icon: LineChart,
    title: "Track self-awareness",
  },
] as const;

const mockupCopy = [
  {
    chips: ["social plans", "anxiety", "drinking"],
    heading: "I get anxious before going out.",
    note: "I want to see friends, but I start imagining it going badly. Then I either cancel or drink so I feel less awkward.",
    sideTitle: "Voice journal captured",
    sideBody: "Messy thought saved as evidence.",
  },
  {
    chips: ["emotion: anxious", "trigger: social", "belief: I won't cope"],
    heading: "Possible recurring thought",
    note: "This looks similar to previous reflections before weekends and social events.",
    sideTitle: "Pattern recognition",
    sideBody: "MindMirror compares emotion, situation, and repeated phrasing.",
  },
  {
    chips: ["prompt", "insight", "next step"],
    heading: "You handled this before.",
    note: "Three weeks ago, a short walk before the event helped you stay calm and avoid drinking.",
    sideTitle: "Useful reflection",
    sideBody: "One question and one practical action, not a wall of advice.",
  },
  {
    chips: ["14 mentions", "90 days", "confidence +18%"],
    heading: "Progress over time",
    note: "Relationships are your most discussed topic this month. Confidence language has increased since May.",
    sideTitle: "Self-awareness map",
    sideBody: "The value grows as more reflections become evidence.",
  },
] as const;

export function ProductWorkflow() {
  const [activeStep, setActiveStep] = useState(0);
  const active = workflowSteps[activeStep];
  const copy = mockupCopy[activeStep];
  const ActiveIcon = active.Icon;

  return (
    <section
      id="product-workflow"
      className="border-t border-[#dce8e5] bg-white px-4 py-18 text-[#172120] sm:px-6 lg:py-24"
      aria-label="See MindMirror in action"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d9e6e3] bg-[#f7fbfa] px-3 py-1.5 text-sm font-medium text-[#42615d]">
            <AudioLines className="size-4" aria-hidden />
            See it in action
          </p>
          <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-[#172120] sm:text-5xl">
            From one messy thought to a useful mirror.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#60706d]">
            MindMirror is designed to turn everyday thoughts into pattern recognition,
            reflection prompts, and progress you can actually understand.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-stretch">
          <div className="grid gap-3">
            {workflowSteps.map(({ Icon, body, eyebrow, title }, index) => {
              const isActive = activeStep === index;
              return (
                <button
                  key={title}
                  type="button"
                  className={`group rounded-2xl border p-4 text-left transition duration-300 ${
                    isActive
                      ? "border-[#9fbeb8] bg-[#eef7f4] shadow-[0_18px_50px_rgb(64_108_100/0.16)]"
                      : "border-[#dfe9e7] bg-white hover:border-[#bdd2ce] hover:bg-[#f8fbfa]"
                  }`}
                  onClick={() => setActiveStep(index)}
                  aria-pressed={isActive}
                >
                  <div className="flex gap-4">
                    <span
                      className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${
                        isActive
                          ? "border-[#9fbeb8] bg-white text-[#365c56]"
                          : "border-[#dfe9e7] bg-[#f8fbfa] text-[#42615d]"
                      }`}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81908d]">
                        {eyebrow}
                      </span>
                      <span className="mt-1 block text-base font-semibold text-[#172120]">
                        {title}
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-[#60706d]">{body}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-[#dfe9e7] bg-[#f7fbfa] p-4 shadow-[0_28px_90px_rgb(51_84_79/0.16)] sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgb(185_221_212/0.5),transparent_34%)]" aria-hidden />
            <div className="relative rounded-[1.5rem] border border-[#dfe9e7] bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-[#edf3f2] pb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#172120]">
                  <span className="size-2 rounded-full bg-[#42615d]" aria-hidden />
                  MindMirror preview
                </div>
                <div className="flex items-center gap-2 text-xs text-[#74827f]">
                  <ActiveIcon className="size-4" aria-hidden />
                  {active.eyebrow}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
                <div className="rounded-[1.35rem] border border-[#edf3f2] bg-[#101918] p-4 text-white">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/72">
                      live entry
                    </span>
                    <div className="mm-voice-bars text-white" aria-hidden>
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                  <div className="mm-fade-up mt-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                      What is on your mind?
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight">{copy.heading}</h3>
                    <p className="mt-4 text-sm leading-7 text-white/68">{copy.note}</p>
                  </div>
                  <div className="mt-7 flex flex-wrap gap-2">
                    {copy.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs text-white/70"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-[#dfe9e7] bg-[#eef7f4] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81908d]">
                      Outcome
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[#172120]">{copy.sideTitle}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#60706d]">{copy.sideBody}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#edf3f2] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81908d]">
                        Pattern
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6 text-[#172120]">
                        Social anxiety before plans
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#edf3f2] bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#81908d]">
                        Evidence
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6 text-[#172120]">
                        14 similar reflections
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[#edf3f2] bg-white p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#42615d]" aria-hidden />
                      <p className="text-sm leading-6 text-[#60706d]">
                        The product should help users notice patterns between real-world support,
                        not diagnose them or replace professional care.
                      </p>
                    </div>
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
