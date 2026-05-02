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
    title: "First, what best describes you?",
    subtitle: "We'll tailor your MindMirror profile to your life.",
    options: [
      { value: "founder_entrepreneur", label: "Founder / Entrepreneur" },
      { value: "professional", label: "Professional / Executive" },
      { value: "creative", label: "Creative / Artist" },
      { value: "student", label: "Student" },
      { value: "other", label: "Something else" },
    ],
    next: { fallback: "q2_struggle" },
  },
  q2_struggle: {
    id: "q2_struggle",
    kind: "question_single",
    title: "What's your biggest mental challenge right now?",
    options: [
      { value: "overthinking", label: "I overthink everything and go in circles" },
      { value: "no_clarity", label: "I struggle to get clear on what I actually want" },
      { value: "stuck", label: "I keep setting goals but never follow through" },
      { value: "stress", label: "I carry stress without knowing why" },
      { value: "patterns", label: "I feel like I keep repeating the same mistakes" },
    ],
    next: { fallback: "q3_journal" },
  },
  q3_journal: {
    id: "q3_journal",
    kind: "question_single",
    title: "How often do you currently journal or reflect?",
    options: [
      { value: "never", label: "Never — I don't have a habit" },
      { value: "sometimes", label: "Sometimes — but I'm not consistent" },
      { value: "regularly", label: "Regularly — but I don't get much from it" },
      { value: "always", label: "Always — I journal a lot" },
    ],
    next: { fallback: "interstitial_1" },
  },
  interstitial_1: {
    id: "interstitial_1",
    kind: "interstitial",
    progressStep: false,
    variant: "stat",
    headline:
      "78% of MindMirror users discover a thought pattern they had no idea existed — within their first week.",
    body: "Most people journal without ever seeing the bigger picture. MindMirror is the first app that connects the dots across everything you've said.",
    ctaLabel: "Continue →",
    next: { fallback: "q4_goal" },
  },
  q4_goal: {
    id: "q4_goal",
    kind: "question_single",
    title: "What would getting clarity on your thinking patterns give you?",
    subtitle: "Pick the one that resonates most.",
    options: [
      { value: "confidence", label: "More confidence in my decisions" },
      { value: "momentum", label: "Finally make progress on my goals" },
      { value: "peace", label: "Less mental noise and stress" },
      { value: "understanding", label: "Understand why I keep self-sabotaging" },
      { value: "growth", label: "Accelerate my personal growth" },
    ],
    next: { fallback: "q5_awareness" },
  },
  q5_awareness: {
    id: "q5_awareness",
    kind: "question_single",
    title: "How self-aware do you think you are?",
    subtitle: "Be honest — this shapes your results.",
    options: [
      { value: "very", label: "Very — I reflect constantly" },
      { value: "somewhat", label: "Somewhat — I try but miss things" },
      { value: "not_much", label: "Not much — I'm not sure where to start" },
      { value: "unsure", label: "I genuinely don't know" },
    ],
    next: { fallback: "interstitial_2" },
  },
  interstitial_2: {
    id: "interstitial_2",
    kind: "interstitial",
    progressStep: false,
    variant: "testimonial",
    headline: "\"I didn't realise I had been talking about quitting my job for 9 months until MindMirror showed me.\"",
    body: "— James R., Founder, London\n\nMindMirror doesn't just store your thoughts. It shows you what they mean over time.",
    ctaLabel: "See your profile →",
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
    title: "Enter your email to unlock your pattern profile",
    subtitle: "We'll save your result so you can continue to checkout. No report email.",
    placeholder: "your@email.com",
    // Transition to theater is handled by enterTheater() in GateEmail.onSuccess,
    // not through getNextNodeId routing, so no `next` field is needed.
  },
  theater: {
    id: "theater",
    kind: "theater",
    progressStep: false,
    steps: [
      { id: "s1", text: "Analysing your responses...", durationMs: stepDuration },
      { id: "s2", text: "Mapping your thought patterns...", durationMs: stepDuration },
      { id: "s3", text: "Building your personal profile...", durationMs: stepDuration },
      { id: "s4", text: "Your MindMirror is ready.", durationMs: stepDuration },
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
  founder_entrepreneur: {
    label: "Founder's loop",
    value: "You treat thinking as a form of working. More analysis = more progress. Until it doesn't.",
  },
  professional: {
    label: "Perfectionist loop",
    value: "You optimize decisions but delay action. The standard keeps rising. Execution gets pushed back.",
  },
  creative: {
    label: "Inspiration trap",
    value: "You wait for the right feeling or idea before starting. But momentum, not perfection, creates the work.",
  },
  student: {
    label: "Understanding before action",
    value: "You need to fully grasp something before trying it. But sometimes trying teaches understanding.",
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

