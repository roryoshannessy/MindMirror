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
    result: "Notice the pattern before the event, not after the spiral.",
    accent: "bg-[#eef7f4] border-[#bddbd4]",
    iconBg: "bg-[#dcefeb] text-[#315c55]",
  },
  {
    icon: BriefcaseBusiness,
    label: "Founder stress",
    thought: "I keep planning because choosing feels risky.",
    result: "Spot when research is replacing action.",
    accent: "bg-[#f5f2ff] border-[#d8cef7]",
    iconBg: "bg-[#e5defb] text-[#4b3f72]",
  },
  {
    icon: WineOff,
    label: "Habits",
    thought: "It is only this once. I deserve the release.",
    result: "See the trigger before the habit wins again.",
    accent: "bg-[#fff7ed] border-[#f2d1a8]",
    iconBg: "bg-[#f9dfb8] text-[#72512b]",
  },
  {
    icon: HeartHandshake,
    label: "Relationships",
    thought: "I rehearse the conversation but never have it.",
    result: "Find the avoided conversation hiding inside the entry.",
    accent: "bg-[#fff1f3] border-[#f3c4cc]",
    iconBg: "bg-[#ffdbe1] text-[#7a3441]",
  },
  {
    icon: Medal,
    label: "Performance",
    thought: "One mistake means the whole session is ruined.",
    result: "Separate one moment from the story you attach to it.",
    accent: "bg-[#eef6ff] border-[#c5d9ee]",
    iconBg: "bg-[#d9ebff] text-[#2f5578]",
  },
  {
    icon: PiggyBank,
    label: "Money pressure",
    thought: "If this fails, I am back at zero.",
    result: "Track when pressure turns into panic decisions.",
    accent: "bg-[#f4f7ea] border-[#d8e3b5]",
    iconBg: "bg-[#e5edc9] text-[#53622d]",
  },
] as const;

export function ScenarioGrid() {
  return (
    <section
      id="scenarios"
      className="border-t border-[#dce8e5] bg-white px-4 py-16 text-[#172120] sm:px-6 lg:py-20"
      aria-label="Where MindMirror helps"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#60706d]">
            Where patterns show up
          </p>
          <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Different life. Same repeating thought.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#60706d]">
            MindMirror is for the moment you realise the same thought keeps arriving in different
            outfits: before a night out, a business decision, a training session, or a hard
            conversation.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <article
                key={scenario.label}
                className={`${scenario.accent} flex min-h-[13.5rem] flex-col rounded-[1.55rem] border p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgb(51_84_79/0.13)] md:min-h-[15.5rem]`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div
                    className={`${scenario.iconBg} flex size-11 items-center justify-center rounded-2xl`}
                  >
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <span className="rounded-full border border-white/70 bg-white/65 px-3 py-1 text-xs font-medium text-[#60706d]">
                    {scenario.label}
                  </span>
                </div>
                <p className="mt-7 text-xl font-semibold leading-tight text-[#172120]">
                  “{scenario.thought}”
                </p>
                <p className="mt-auto pt-6 text-sm leading-6 text-[#60706d]">
                  {scenario.result}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
