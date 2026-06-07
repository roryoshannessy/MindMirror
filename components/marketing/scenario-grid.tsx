import {
  BriefcaseBusiness,
  HeartHandshake,
  Medal,
  PiggyBank,
  SmilePlus,
  WineOff,
} from "lucide-react";

const scenarios = [
  {
    icon: SmilePlus,
    label: "Social anxiety",
    thought: "I will be awkward, so I need a buffer.",
    result: "Prepare before the event, not after the spiral.",
  },
  {
    icon: BriefcaseBusiness,
    label: "Founder stress",
    thought: "I keep planning because choosing feels risky.",
    result: "Catch when research is replacing action.",
  },
  {
    icon: WineOff,
    label: "Habits",
    thought: "It is only this once. I deserve the release.",
    result: "See the trigger before the habit wins again.",
  },
  {
    icon: HeartHandshake,
    label: "Relationships",
    thought: "I rehearse the conversation but never have it.",
    result: "Find the avoided conversation inside the entry.",
  },
  {
    icon: Medal,
    label: "Performance",
    thought: "One mistake means the whole session is ruined.",
    result: "Separate the moment from the story around it.",
  },
  {
    icon: PiggyBank,
    label: "Money pressure",
    thought: "If this fails, I am back at zero.",
    result: "Notice when pressure becomes panic decisions.",
  },
] as const;

export function ScenarioGrid() {
  return (
    <section
      id="scenarios"
      className="border-t border-[#dce8e5] bg-white px-4 py-14 text-[#172120] sm:px-6 lg:py-18"
      aria-label="Where MindMirror helps"
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#60706d]">
            Where patterns show up
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            It is not just journaling. It is preparation.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#60706d]">
            The point is to recognise the thought before it runs the same behaviour again.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.4rem] border border-[#dfe9e7] bg-[#f8fbfa] shadow-sm">
          {scenarios.map((scenario, index) => {
            const Icon = scenario.icon;
            return (
              <article
                key={scenario.label}
                className={`grid gap-4 bg-white/72 p-4 sm:grid-cols-[12rem_1fr_0.9fr] sm:items-center sm:p-5 ${
                  index === 0 ? "" : "border-t border-[#dfe9e7]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full border border-[#d8e7e3] bg-[#eef7f4] text-[#42615d]">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <p className="text-sm font-semibold text-[#172120]">{scenario.label}</p>
                </div>
                <p className="text-base font-semibold leading-7 text-[#172120]">
                  “{scenario.thought}”
                </p>
                <p className="text-sm leading-6 text-[#60706d]">{scenario.result}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
