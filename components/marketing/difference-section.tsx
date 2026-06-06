import { BookOpen, BrainCircuit, CircleAlert, LineChart, MessageCircle, Sparkles } from "lucide-react";

const comparisons = [
  {
    icon: BookOpen,
    title: "Not just a diary",
    body: "A diary stores what happened. MindMirror is being built to show what keeps coming back.",
  },
  {
    icon: LineChart,
    title: "Not generic mood tracking",
    body: "The goal is not a colour-coded mood score. It is the thought, trigger, and next behaviour.",
  },
  {
    icon: MessageCircle,
    title: "Not a writing habit app",
    body: "The first action is voice. Speak the messy thought, then let the mirror organise it.",
  },
  {
    icon: CircleAlert,
    title: "Not therapy or diagnosis",
    body: "MindMirror supports self-awareness between real-world support. It does not replace qualified help.",
  },
] as const;

export function DifferenceSection() {
  return (
    <section
      id="how-it-works"
      className="border-t border-[#dce8e5] bg-[#f6fbfa] px-4 py-16 text-[#172120] sm:px-6 lg:py-20"
      aria-label="Why MindMirror is different"
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#d8e7e3] bg-white px-3 py-1.5 text-sm font-medium text-[#42615d] shadow-sm">
            <Sparkles className="size-4" aria-hidden />
            The difference
          </p>
          <h2 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            The value is not the entry. It is what the entry reveals later.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#60706d]">
            Most tools ask you to reflect and move on. MindMirror is designed to remember the
            pattern, so the next time life brings the same situation back, you can recognise it
            sooner.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[#d8e7e3] bg-white p-4 shadow-[0_24px_70px_rgb(51_84_79/0.12)] sm:p-5">
          <div className="rounded-[1.5rem] border border-[#bddbd4] bg-[#eef7f4] p-5 text-[#172120]">
            <div className="flex items-center justify-between border-b border-[#d8e7e3] pb-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-[#42615d] shadow-sm">
                  <BrainCircuit className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold">Pattern memory</p>
                  <p className="text-xs text-[#60706d]">built from your own reflections</p>
                </div>
              </div>
              <span className="rounded-full border border-[#d8e7e3] bg-white px-3 py-1 text-xs text-[#60706d]">
                90 days
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                ["Recurring thought", "I will be awkward"],
                ["Usual trigger", "Before social plans"],
                ["What tends to happen", "Avoid, overthink, or drink"],
                ["What helped before", "Walk + exit plan"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-2 rounded-2xl border border-[#d8e7e3] bg-white p-4 sm:grid-cols-[0.9fr_1.1fr]"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#81908d]">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-[#172120]">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {comparisons.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-[#dfe9e7] bg-[#f8fbfa] p-4">
                  <Icon className="size-5 text-[#42615d]" aria-hidden />
                  <p className="mt-3 text-sm font-semibold">{item.title}</p>
                  <p className="mt-2 text-xs leading-5 text-[#60706d]">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
