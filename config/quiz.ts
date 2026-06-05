/**
 * MindMirror quiz tree — M7. Source: MindMirror_Product_Deck.md + FOUNDATION.md §12.
 */

import { brand } from "./brand";

export const QUIZ_ID = "mindmirror-v1";
export const QUIZ_START_NODE_ID = "q1_role";
export const THEATER_TOTAL_MS = 3500;
/** Countable progress steps: Q1–Q5 + name + email (interstitials + theater + results are excluded). */
export const QUIZ_DISPLAY_TOTAL_STEPS = 7;

export type QuizNodeKind =
  | "question_single"
  | "question_multi"
  | "question_binary"
  | "interstitial"
  | "gate_name"
  | "gate_email"
  | "theater";

type NodeBase = {
  id: string;
  kind: QuizNodeKind;
  /** false for interstitials (and theater handled separately in UI). */
  progressStep?: boolean;
  next?: { rules?: Rule[]; fallback: string };
};

export type Rule = { when?: { key: string; equals?: string; includes?: string }; next: string };

export type ChoiceOption = { value: string; label: string };

export type QuestionSingleNode = NodeBase & {
  kind: "question_single";
  title: string;
  subtitle?: string;
  options: ChoiceOption[];
};

export type QuestionMultiNode = NodeBase & {
  kind: "question_multi";
  title: string;
  subtitle?: string;
  minSelections: number;
  maxSelections: number;
  options: ChoiceOption[];
};

export type QuestionBinaryNode = NodeBase & {
  kind: "question_binary";
  title: string;
  subtitle?: string;
  trueLabel: string;
  falseLabel: string;
};

export type InterstitialVariant = "stat" | "stepper" | "testimonial" | "pillars";

export type InterstitialNode = NodeBase & {
  kind: "interstitial";
  progressStep: false;
  variant: InterstitialVariant;
  headline: string;
  body: string;
  ctaLabel: string;
};

export type GateNameNode = NodeBase & {
  kind: "gate_name";
  title: string;
  subtitle: string;
  placeholder: string;
};

export type GateEmailNode = NodeBase & {
  kind: "gate_email";
  title: string;
  subtitle: string;
  placeholder: string;
};

export type TheaterStep = { id: string; text: string; durationMs: number };

export type TheaterNode = NodeBase & {
  kind: "theater";
  progressStep: false;
  steps: TheaterStep[];
};

export type QuizNode =
  | QuestionSingleNode
  | QuestionMultiNode
  | QuestionBinaryNode
  | InterstitialNode
  | GateNameNode
  | GateEmailNode
  | TheaterNode;

const stepDuration = Math.floor(THEATER_TOTAL_MS / 4);

export const QUIZ_NODES: Record<string, QuizNode> = {
  q1_role: {
    id: "q1_role",
    kind: "question_single",
    title: "Where do recurring thoughts show up most for you?",
    subtitle: "MindMirror is built to spot patterns in the situations you actually live through.",
    options: [
      { value: "anxiety_social", label: "Anxiety, social events, or overthinking" },
      { value: "founder_entrepreneur", label: "Building a business or side project" },
      { value: "athlete_performer", label: "Sport, training, or performance pressure" },
      { value: "relationships", label: "Dating, relationships, or family patterns" },
      { value: "habits_identity", label: "Habits, discipline, alcohol, vaping, or identity" },
      { value: "self_awareness", label: "I just want to understand myself better" },
    ],
    next: { fallback: "q2_struggle" },
  },
  q2_struggle: {
    id: "q2_struggle",
    kind: "question_single",
    title: "What loop would you most want to catch earlier?",
    subtitle: "Pick the one that feels most familiar.",
    options: [
      { value: "social_anxiety", label: "I get anxious before people, events, or plans" },
      { value: "business_doubt", label: "I doubt myself when I need to take action" },
      { value: "performance_pressure", label: "Pressure changes how I think or perform" },
      { value: "relationship_reactivity", label: "I react the same way in relationships" },
      { value: "habit_relapse", label: "I slip back into habits I said I was done with" },
      { value: "overthinking", label: "I overthink and keep replaying the same thought" },
    ],
    next: { fallback: "q3_journal" },
  },
  q3_journal: {
    id: "q3_journal",
    kind: "question_single",
    title: "How do you usually process what is going on?",
    subtitle: "MindMirror should be easier than forcing a perfect journaling habit.",
    options: [
      { value: "voice_notes", label: "Voice notes or talking it out" },
      { value: "journal_sometimes", label: "Journaling sometimes, but not consistently" },
      { value: "think_alone", label: "Mostly in my head, which can spiral" },
      { value: "messages", label: "Texts, notes, screenshots, or random reminders" },
      { value: "avoid", label: "I avoid it until it catches up with me" },
    ],
    next: { fallback: "interstitial_1" },
  },
  interstitial_1: {
    id: "interstitial_1",
    kind: "interstitial",
    progressStep: false,
    variant: "stat",
    headline: "Journaling records what happened. MindMirror is being built to prepare you for what repeats.",
    body: "The useful moment is not just writing after the event. It is recognising: \"I have felt this before, in this exact type of situation.\"",
    ctaLabel: "Continue",
    next: { fallback: "q4_goal" },
  },
  q4_goal: {
    id: "q4_goal",
    kind: "question_single",
    title: "What would you want MindMirror to help you do next time?",
    subtitle: "This shapes the kind of sample result you see.",
    options: [
      { value: "prepare", label: "Prepare before a trigger, event, or hard moment" },
      { value: "notice", label: "Notice the loop while it is happening" },
      { value: "choose", label: "Make a better choice instead of reacting" },
      { value: "calm", label: "Reduce anxiety and mental noise" },
      { value: "follow_through", label: "Follow through on who I said I wanted to be" },
    ],
    next: { fallback: "q5_awareness" },
  },
  q5_awareness: {
    id: "q5_awareness",
    kind: "question_single",
    title: "Is there something coming up where this would help?",
    subtitle: "Think about a weekend, meeting, competition, date, conversation, or decision.",
    options: [
      { value: "social_event", label: "A social event or night out" },
      { value: "work_business", label: "A work or business decision" },
      { value: "performance", label: "Training, sport, or a performance moment" },
      { value: "relationship_talk", label: "A relationship conversation" },
      { value: "habit_test", label: "A habit test: alcohol, vaping, scrolling, discipline" },
      { value: "not_sure", label: "Not sure yet — I just want the pattern" },
    ],
    next: { fallback: "interstitial_2" },
  },
  interstitial_2: {
    id: "interstitial_2",
    kind: "interstitial",
    progressStep: false,
    variant: "testimonial",
    headline: "\"I do not need another diary. I need something that tells me when I am about to repeat myself.\"",
    body: "That is the point of MindMirror: voice-first reflection, recurring thought detection, and preparation for the next real-life trigger.",
    ctaLabel: "See your sample profile",
    next: { fallback: "gate_name" },
  },
  gate_name: {
    id: "gate_name",
    kind: "gate_name",
    title: "What should we call you?",
    subtitle: "Your results will be personalized to you.",
    placeholder: "Your first name",
    next: { fallback: "gate_email" },
  },
  gate_email: {
    id: "gate_email",
    kind: "gate_email",
    title: "Enter your email to unlock your sample pattern",
    subtitle: "We'll save your quiz result so you can review the sample and decide whether early access is worth it.",
    placeholder: "your@email.com",
    // Transition to theater is handled by enterTheater() in GateEmail.onSuccess,
    // not through getNextNodeId routing, so no `next` field is needed.
  },
  theater: {
    id: "theater",
    kind: "theater",
    progressStep: false,
    steps: [
      { id: "s1", text: "Reading your real-life trigger...", durationMs: stepDuration },
      { id: "s2", text: "Finding the recurring thought loop...", durationMs: stepDuration },
      { id: "s3", text: "Preparing your next-moment mirror...", durationMs: stepDuration },
      { id: "s4", text: "Your sample pattern is ready.", durationMs: stepDuration },
    ],
  },
};

export function getNextNodeId(
  fromNode: QuizNode,
  context: { answers: Record<string, string | string[]> },
): string | null {
  if (fromNode.id === "theater") {
    return null;
  }
  const next = fromNode.next;
  if (!next) return null;
  if (next.rules) {
    for (const rule of next.rules) {
      if (!rule.when) continue;
      const v = context.answers[rule.when.key];
      const s = Array.isArray(v) ? v.join(",") : String(v ?? "");
      if (rule.when.equals != null) {
        if (s === rule.when.equals) return rule.next;
      }
      if (rule.when.includes != null) {
        if (s.includes(rule.when.includes)) return rule.next;
      }
    }
  }
  return next.fallback;
}

/* --- Results wall: derived copy from Q1 + Q2 (Product deck §5) --- */

const q2PatternHeadlines: Record<string, { title: string; body: string }> = {
  social_anxiety: {
    title: "Anticipation anxiety loop",
    body: "Before an event, your mind starts rehearsing what could go wrong. MindMirror would help you recognise this earlier and prepare before the anxiety becomes the plan.",
  },
  business_doubt: {
    title: "Founder doubt loop",
    body: "When the next move matters, your thinking can turn into self-questioning. MindMirror would show when doubt is replacing action so you can choose the next step sooner.",
  },
  performance_pressure: {
    title: "Pressure-before-performance loop",
    body: "Your thoughts tighten before the moment arrives. MindMirror would help you notice the pattern before training, competition, or performance so you can reset earlier.",
  },
  relationship_reactivity: {
    title: "Relationship reaction loop",
    body: "The same emotional script can come back in different conversations. MindMirror would help you see the trigger, the story you tell yourself, and the response you usually repeat.",
  },
  habit_relapse: {
    title: "Identity reset loop",
    body: "A small trigger can become a full reset: one drink, one scroll, one missed routine, then the old story returns. MindMirror would help you prepare before that moment.",
  },
  overthinking: {
    title: "Clarity seeking loop",
    body: "You keep trying to think your way into certainty before you act. The more you think, the less sure you feel.",
  },
  no_clarity: {
    title: "Decision paralysis",
    body: "You can't move forward until everything makes sense. But understanding often comes from action, not reflection.",
  },
  stuck: {
    title: "Repetition without resolution",
    body: "You keep returning to the same thought, decision, or worry. The loop feels familiar—and that feels safe.",
  },
  stress: {
    title: "Overwhelm cycling",
    body: "You spiral between overwhelm and the stories you tell yourself about why you're overwhelmed. The pattern repeats weekly.",
  },
  patterns: {
    title: "Meta-awareness trap",
    body: "You can see your patterns, but seeing them hasn't changed them. Awareness without action starts to feel pointless.",
  },
};

const q1RoleStats: Record<string, { label: string; value: string }> = {
  anxiety_social: {
    label: "Anxiety context",
    value: "Your mirror should help you prepare before social plans, conversations, or situations where your mind starts predicting danger.",
  },
  founder_entrepreneur: {
    label: "Founder context",
    value: "Your mirror should help you separate useful planning from avoidance, doubt, and decision loops that slow momentum.",
  },
  athlete_performer: {
    label: "Performance context",
    value: "Your mirror should help you spot the thoughts that appear before training, competition, discipline dips, or pressure moments.",
  },
  relationships: {
    label: "Relationship context",
    value: "Your mirror should help you notice repeated stories, reactions, and fears before the next conversation happens.",
  },
  habits_identity: {
    label: "Identity context",
    value: "Your mirror should help you recognise the thoughts that show up before you break a promise to yourself.",
  },
  self_awareness: {
    label: "Self-awareness context",
    value: "Your mirror should help you turn scattered reflections into a pattern you can actually use.",
  },
  other: {
    label: "Your pattern loop",
    value: "Most people get stuck on the same type of thought. This quiz starts to reveal what yours is.",
  },
};

export function getPatternForStruggle(
  value: string | undefined,
): { title: string; body: string } {
  if (value && q2PatternHeadlines[value]) {
    return q2PatternHeadlines[value];
  }
  return {
    title: "Your patterns are in your language",
    body: "Whatever you bring, MindMirror connects entries over time so you can see what keeps showing up — not what you hope shows up.",
  };
}

export function getInsightForRole(
  value: string | undefined,
): { label: string; value: string } {
  if (value && q1RoleStats[value]) {
    return q1RoleStats[value];
  }
  return {
    label: "Personalized to you",
    value: "Your voice entries turn into a timeline of what you actually return to — not what you think you return to.",
  };
}

export const QUIZ_TESTIMONIALS = [
  {
    name: "James R.",
    title: "Founder",
    quote: "\"I didn't realise I had been talking about quitting for 9 months.\"",
  },
  {
    name: "Priya M.",
    title: "Product lead",
    quote: "\"It's like therapy, but it actually shows you the data.\"",
  },
  {
    name: "Tom K.",
    title: "Engineer",
    quote: "\"Finally an app that tells me the truth about my own thinking.\"",
  },
] as const;
