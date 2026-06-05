"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  LockKeyhole,
  Waypoints,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getPostHog, initPostHog } from "@/lib/posthog";
import { QUIZ_ID, QUIZ_TESTIMONIALS, getInsightForRole, getPatternForStruggle } from "@/config/quiz";
import { getCatalog } from "@/config/commercial-catalog";
import { formatPrice } from "@/lib/format-price";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuizStore } from "@/stores/quiz-store";
import { PricingWall } from "./pricing-wall";

const triggerCopy: Record<string, { label: string; value: string }> = {
  anxiety_social_event: {
    label: "Next trigger",
    value: "Before a social event, MindMirror would remind you what your anxiety usually predicts and what response you already chose.",
  },
  anxiety_meeting: {
    label: "Next trigger",
    value: "Before a meeting or moment where you are being seen, MindMirror would show the anxious script before it takes over.",
  },
  anxiety_conversation: {
    label: "Next trigger",
    value: "Before a difficult conversation, MindMirror would help you separate the old fear from the actual situation.",
  },
  anxiety_travel: {
    label: "Next trigger",
    value: "Before plans or travel disrupt your routine, MindMirror would help you prepare for the thoughts that usually spike.",
  },
  anxiety_evening: {
    label: "Next trigger",
    value: "Before an evening where your mind may spiral, MindMirror would remind you what usually helps you settle.",
  },
  anxiety_not_sure: {
    label: "Next trigger",
    value: "As you add reflections, MindMirror would learn where anxiety repeats and help you prepare earlier.",
  },
  founder_launch: {
    label: "Next trigger",
    value: "Before launching or showing the product, MindMirror would show whether you are acting from signal or doubt.",
  },
  founder_ads: {
    label: "Next trigger",
    value: "Before ads or funnel tests, MindMirror would help you catch the urge to overthink instead of learn from data.",
  },
  founder_customer: {
    label: "Next trigger",
    value: "Before user conversations, MindMirror would remind you what usually makes you avoid direct feedback.",
  },
  founder_money: {
    label: "Next trigger",
    value: "Before pricing or money pressure, MindMirror would help you separate practical planning from panic.",
  },
  founder_schedule: {
    label: "Next trigger",
    value: "Before your routine gets squeezed, MindMirror would remind you which basics protect your momentum.",
  },
  founder_not_sure: {
    label: "Next trigger",
    value: "As you build, MindMirror would learn which founder moments create the same thinking loop.",
  },
  performance_training: {
    label: "Next trigger",
    value: "Before training, MindMirror would remind you what usually changes your self-talk or discipline.",
  },
  performance_competition: {
    label: "Next trigger",
    value: "Before competition or performance, MindMirror would help you prepare for the pressure script.",
  },
  performance_feedback: {
    label: "Next trigger",
    value: "Before feedback lands, MindMirror would help you hear the useful part without turning it into identity.",
  },
  performance_recovery: {
    label: "Next trigger",
    value: "Before a recovery day, MindMirror would help you protect consistency without forcing it.",
  },
  performance_progress: {
    label: "Next trigger",
    value: "Before checking progress, MindMirror would remind you how comparison usually changes your mindset.",
  },
  performance_not_sure: {
    label: "Next trigger",
    value: "As you reflect, MindMirror would learn which performance moments repeat the same mental pattern.",
  },
  relationship_date: {
    label: "Next trigger",
    value: "Before a date, message, or dating uncertainty, MindMirror would show the story you usually bring into it.",
  },
  relationship_partner_talk: {
    label: "Next trigger",
    value: "Before a partner conversation, MindMirror would help you pause before the old reaction takes over.",
  },
  relationship_family: {
    label: "Next trigger",
    value: "Before a family interaction, MindMirror would remind you which triggers pull you into an older version of yourself.",
  },
  relationship_friend: {
    label: "Next trigger",
    value: "Before a friendship conversation, MindMirror would help you name what you need instead of replaying it later.",
  },
  relationship_boundary: {
    label: "Next trigger",
    value: "Before holding a boundary, MindMirror would remind you what guilt or fear usually says.",
  },
  relationship_not_sure: {
    label: "Next trigger",
    value: "As you add reflections, MindMirror would learn which relationship patterns repeat most.",
  },
  habit_night_out: {
    label: "Next trigger",
    value: "Before a night out or weekend, MindMirror would remind you what usually pulls you toward alcohol, vaping, or old habits.",
  },
  habit_stress_day: {
    label: "Next trigger",
    value: "Before a stressful workday, MindMirror would help you spot the release story before the habit wins.",
  },
  habit_boredom: {
    label: "Next trigger",
    value: "Before boredom becomes the trigger, MindMirror would remind you what you chose instead.",
  },
  habit_morning: {
    label: "Next trigger",
    value: "Before the morning routine drops, MindMirror would help you protect the smallest useful version of it.",
  },
  habit_late_night: {
    label: "Next trigger",
    value: "Before a late night where old habits return, MindMirror would show the pattern early enough to choose.",
  },
  habit_not_sure: {
    label: "Next trigger",
    value: "As you add reflections, MindMirror would learn which habit tests repeat and help you prepare before them.",
  },
  self_work: {
    label: "Next trigger",
    value: "Before work or decisions, MindMirror would show which thoughts repeat and what they usually cost.",
  },
  self_social: {
    label: "Next trigger",
    value: "Before social moments, MindMirror would help you recognise the pattern before it shapes your behaviour.",
  },
  self_relationships: {
    label: "Next trigger",
    value: "Before relationship moments, MindMirror would help you see the repeated story sooner.",
  },
  self_health: {
    label: "Next trigger",
    value: "Before health or energy dips, MindMirror would show what tends to pull you off track.",
  },
  self_emotions: {
    label: "Next trigger",
    value: "Before mood or anxiety patterns build, MindMirror would help you see what is returning.",
  },
  self_not_sure: {
    label: "Next trigger",
    value: "As you add reflections, MindMirror would learn where your recurring thoughts show up most.",
  },
  social_event: {
    label: "Next trigger",
    value: "Before a social event or night out, MindMirror would remind you what this loop usually says and how you want to respond.",
  },
  work_business: {
    label: "Next trigger",
    value: "Before a work or business decision, MindMirror would show whether you are planning clearly or repeating a doubt loop.",
  },
  performance: {
    label: "Next trigger",
    value: "Before training, sport, or performance, MindMirror would help you recognise the pressure script before it takes over.",
  },
  relationship_talk: {
    label: "Next trigger",
    value: "Before a relationship conversation, MindMirror would help you see the old story before you react from it.",
  },
  habit_test: {
    label: "Next trigger",
    value: "Before a habit test, MindMirror would remind you what usually pulls you back into the old identity.",
  },
  not_sure: {
    label: "Next trigger",
    value: "As you add reflections, MindMirror would learn where this loop appears and help you prepare before it repeats.",
  },
};

const goalCopy: Record<string, string> = {
  anxiety_prepare: "Prepare before anxiety takes over",
  anxiety_reframe: "Question what anxiety exaggerates",
  anxiety_body_reset: "Calm your body before the spiral",
  anxiety_stay: "Stay present instead of escaping",
  anxiety_aftercare: "Learn from the moment afterwards",
  founder_decide: "Catch decision avoidance",
  founder_ship: "Ship before over-polishing",
  founder_sales: "Prepare before asking people to buy",
  founder_energy: "Protect action when energy dips",
  founder_confidence: "Return to what you already decided",
  performance_reset: "Reset self-talk before pressure",
  performance_prepare: "Prepare before training or competition",
  performance_recover: "Recover faster after mistakes",
  performance_consistency: "Keep consistency when motivation dips",
  performance_identity: "Remember the athlete you are becoming",
  relationship_pause: "Pause before reacting",
  relationship_story: "Spot the old relationship story",
  relationship_need: "Name what you actually need",
  relationship_boundaries: "Hold boundaries without guilt",
  relationship_repair: "Repair faster after the moment",
  habit_precommit: "Pre-commit before the trigger arrives",
  habit_identity: "Remember the identity you are choosing",
  habit_urge: "Notice the urge before acting on it",
  habit_social_script: "Handle social pressure clearly",
  habit_recover: "Recover after one slip without spiralling",
  self_name_pattern: "Name the pattern you repeat",
  self_find_trigger: "Find what triggers certain thoughts",
  self_prepare: "Prepare before the pattern returns",
  self_choose: "Choose better in the moment",
  self_track_time: "See how your thoughts change over time",
  prepare: "Prepare before the loop starts",
  notice: "Notice it while it is happening",
  choose: "Choose your response instead of reacting",
  calm: "Reduce anxiety and mental noise",
  follow_through: "Follow through on your identity",
};

function getFirstAnswer(
  answers: Record<string, string | string[]>,
  keys: string[],
): string {
  for (const key of keys) {
    const value = answers[key];
    if (Array.isArray(value)) {
      if (value[0]) return value[0];
      continue;
    }
    if (value) return value;
  }
  return "";
}

export function CompletionShell() {
  const tFaq = useTranslations("faq");
  const locale = useLocale();
  const firstName = useQuizStore((s) => s.firstName);
  const answers = useQuizStore((s) => s.answers);
  const sessionId = useQuizStore((s) => s.sessionId);
  const trackedRef = useRef(false);

  // Fire quiz_completed on the user reaching results, not on backend sync.
  // Lead capture (with full quiz data) already happened at the email gate.
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    try {
      initPostHog();
      getPostHog().capture("quiz_completed", {
        quizId: QUIZ_ID,
        sessionId,
        locale,
      });
    } catch {
      /* optional */
    }
  }, [sessionId, locale]);

  const name = firstName.trim() || "there";
  const struggle = getFirstAnswer(answers, [
    "q2_anxiety",
    "q2_founder",
    "q2_performance",
    "q2_relationships",
    "q2_habits",
    "q2_self",
    "q2_struggle",
  ]);
  const role = String(answers.q1_role ?? "");
  const upcoming = getFirstAnswer(answers, [
    "q5_anxiety",
    "q5_founder",
    "q5_performance",
    "q5_relationships",
    "q5_habits",
    "q5_self",
    "q5_awareness",
  ]);
  const goal = getFirstAnswer(answers, [
    "q4_anxiety",
    "q4_founder",
    "q4_performance",
    "q4_relationships",
    "q4_habits",
    "q4_self",
    "q4_goal",
  ]);
  const pattern = getPatternForStruggle(struggle);
  const insight = getInsightForRole(role);
  const trigger = triggerCopy[upcoming] ?? triggerCopy.not_sure;
  const goalLabel = goalCopy[goal] ?? "Use the pattern before it repeats";
  const catalog = getCatalog();
  const primaryPlan =
    catalog.plans.find((plan) => plan.id === "mindmirror-monthly") ??
    catalog.plans.find((plan) => plan.id === catalog.defaultPlanId) ??
    catalog.plans[0];
  const primaryPlanId = primaryPlan?.id ?? catalog.defaultPlanId;
  const primaryPlanPrice = primaryPlan
    ? formatPrice(primaryPlan.amountCents, primaryPlan.currency)
    : "$12.99";
  const primaryCheckout = `/checkout/email?planId=${encodeURIComponent(primaryPlanId)}&session=quiz&qz=${encodeURIComponent(sessionId)}`;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8 pb-[calc(6rem+env(safe-area-inset-bottom))] text-[#172120] sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-[#42615d]">Your sample mirror</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight sm:text-5xl">
          {name}, here&apos;s the loop MindMirror would help you prepare for.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#60706d] sm:text-base">
          This is a sample of how AI journaling could turn recurring thoughts into self-awareness you can use before the next real-life trigger.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden rounded-[2rem] border-[#d6e6e1] bg-white/88 shadow-[0_28px_90px_rgb(51_84_79/0.16)] backdrop-blur">
          <div className="h-px bg-gradient-to-r from-transparent via-[#7aa39c] to-transparent" />
          <CardHeader className="pb-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-[#42615d]">
              <BrainCircuit className="size-4" aria-hidden />
              Pattern detected
            </div>
            <CardTitle className="text-2xl leading-tight sm:text-3xl">{pattern.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-[#60706d]">
            <p className="text-base leading-7">{pattern.body}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#edf3f2] bg-[#f8fbfa] p-4">
                <p className="text-xs text-[#81908d]">Signal</p>
                <p className="mt-2 font-medium text-[#172120]">recurring thought loop</p>
              </div>
              <div className="rounded-2xl border border-[#edf3f2] bg-[#f8fbfa] p-4">
                <p className="text-xs text-[#81908d]">Use it for</p>
                <p className="mt-2 font-medium text-[#172120]">{goalLabel}</p>
              </div>
              <div className="rounded-2xl border border-[#edf3f2] bg-[#f8fbfa] p-4">
                <p className="text-xs text-[#81908d]">Next</p>
                <p className="mt-2 font-medium text-[#172120]">prepare before it repeats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-[#d6e6e1] bg-white/78 shadow-sm">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2 text-sm text-[#42615d]">
              <Waypoints className="size-4" aria-hidden />
              {trigger.label}
            </div>
            <CardTitle className="text-xl">{insight.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-[#60706d]">{insight.value}</p>
            <div className="rounded-2xl border border-[#edf3f2] bg-[#f8fbfa] p-4">
              <p className="text-xs text-[#81908d]">Preparation direction</p>
              <p className="mt-2 text-sm font-medium leading-6 text-[#172120]">
                {trigger.value}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-[#d6e6e1] bg-white/78">
          <CardContent className="pt-6">
            <Activity className="size-5 text-[#42615d]" aria-hidden />
            <p className="mt-3 text-sm font-medium text-[#172120]">Built around real entries</p>
            <p className="mt-2 text-sm leading-6 text-[#60706d]">
              Speak, type, or upload reflections. The value comes from what repeats over time.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-[#d6e6e1] bg-white/78">
          <CardContent className="pt-6">
            <CheckCircle2 className="size-5 text-[#42615d]" aria-hidden />
            <p className="mt-3 text-sm font-medium text-[#172120]">Made for preparation</p>
            <p className="mt-2 text-sm leading-6 text-[#60706d]">
              The goal is to notice the pattern before the next trigger, not only reflect after.
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-[#d6e6e1] bg-white/78">
          <CardContent className="pt-6">
            <LockKeyhole className="size-5 text-[#42615d]" aria-hidden />
            <p className="mt-3 text-sm font-medium text-[#172120]">Data stays yours</p>
            <p className="mt-2 text-sm leading-6 text-[#60706d]">
              Privacy, export, and ownership stay core to the product direction.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-[2rem] border border-[#d6e6e1] bg-white/88 p-5 text-center shadow-[0_28px_90px_rgb(51_84_79/0.14)] sm:p-6">
        <h2 className="text-xl font-semibold text-[#172120]">Join the early-access waitlist</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#60706d]">
          If this pattern feels useful, reserve early access. This checkout is refundable and does not unlock a live app today.
        </p>
        <div className="mt-5 flex flex-col items-stretch gap-3 sm:items-center">
          <Button
            asChild
            size="lg"
            className="w-full max-w-md self-center rounded-full bg-[#172120] text-white hover:bg-[#263533]"
          >
            <Link href={primaryCheckout}>
              Join early access - refundable {primaryPlanPrice}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <p className="text-center text-xs text-[#74827f]">
            Early-access demand test. Waitlist only. Your data is yours.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-center text-lg font-semibold">What people want MindMirror to solve</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {QUIZ_TESTIMONIALS.map((x) => (
            <Card key={x.name} className="rounded-2xl border-[#d6e6e1] bg-white/78">
              <CardContent className="pt-5 text-sm">
                <p className="text-[#60706d]">{x.quote}</p>
                <p className="mt-3 font-medium text-[#172120]">
                  {x.name}
                  <span className="block text-xs font-normal text-[#74827f]">{x.title}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-center text-lg font-semibold">FAQ</h2>
        <ul className="space-y-2">
          {([1, 2, 3, 4, 5] as const).map((n) => {
            const qk = `q${n}` as "q1" | "q2" | "q3" | "q4" | "q5";
            const ak = `a${n}` as "a1" | "a2" | "a3" | "a4" | "a5";
            return (
              <li key={n} className="rounded-2xl border border-[#d6e6e1] bg-white/78">
                <details className="group">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-[#172120]">
                    <span className="flex w-full items-center justify-between gap-2">
                      {tFaq(qk)}
                      <span className="text-[#81908d] transition group-open:rotate-90">▸</span>
                    </span>
                  </summary>
                  <div className="border-t border-[#dfe9e7] px-4 pb-3 pt-3 text-sm text-[#60706d]">
                    {tFaq(ak)}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-6">
        <PricingWall showHeading />
        <div className="flex justify-center">
          <Button asChild size="lg" variant="default" className="min-w-[12rem]">
            <Link href={primaryCheckout}>Join early access</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
