/**
 * MindMirror quiz tree — M7. Source: MindMirror_Product_Deck.md + FOUNDATION.md §12.
 */

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

const audienceBranchRules: Rule[] = [
  { when: { key: "q1_role", equals: "anxiety_social" }, next: "q2_anxiety" },
  { when: { key: "q1_role", equals: "founder_entrepreneur" }, next: "q2_founder" },
  { when: { key: "q1_role", equals: "athlete_performer" }, next: "q2_performance" },
  { when: { key: "q1_role", equals: "relationships" }, next: "q2_relationships" },
  { when: { key: "q1_role", equals: "habits_identity" }, next: "q2_habits" },
  { when: { key: "q1_role", equals: "self_awareness" }, next: "q2_self" },
];

const goalBranchRules: Rule[] = [
  { when: { key: "q1_role", equals: "anxiety_social" }, next: "q4_anxiety" },
  { when: { key: "q1_role", equals: "founder_entrepreneur" }, next: "q4_founder" },
  { when: { key: "q1_role", equals: "athlete_performer" }, next: "q4_performance" },
  { when: { key: "q1_role", equals: "relationships" }, next: "q4_relationships" },
  { when: { key: "q1_role", equals: "habits_identity" }, next: "q4_habits" },
  { when: { key: "q1_role", equals: "self_awareness" }, next: "q4_self" },
];

export const QUIZ_NODES: Record<string, QuizNode> = {
  q1_role: {
    id: "q1_role",
    kind: "question_single",
    title: "Where would more self-awareness help you most right now?",
    subtitle: "MindMirror helps you recognise recurring thoughts, see when they show up, and understand what they make you do.",
    options: [
      { value: "anxiety_social", label: "Anxiety, social events, or overthinking" },
      { value: "founder_entrepreneur", label: "Building a business or side project" },
      { value: "athlete_performer", label: "Sport, training, or performance pressure" },
      { value: "relationships", label: "Dating, relationships, or family patterns" },
      { value: "habits_identity", label: "Habits, discipline, alcohol, vaping, or identity" },
      { value: "self_awareness", label: "I just want to understand myself better" },
    ],
    next: { rules: audienceBranchRules, fallback: "q2_self" },
  },
  q2_anxiety: {
    id: "q2_anxiety",
    kind: "question_single",
    title: "When does anxiety usually start building?",
    subtitle: "This helps MindMirror understand the type of trigger to watch for.",
    options: [
      { value: "before_social_plans", label: "Before social plans or nights out" },
      { value: "fear_of_judgement", label: "When I think people are judging me" },
      { value: "uncertainty_spiral", label: "When I do not know how something will go" },
      { value: "conflict_avoidance", label: "Before difficult conversations" },
      { value: "night_overthinking", label: "At night when my mind starts replaying everything" },
      { value: "body_alarm", label: "When physical anxiety makes me panic more" },
    ],
    next: { fallback: "q3_anxiety" },
  },
  q3_anxiety: {
    id: "q3_anxiety",
    kind: "question_single",
    title: "What do you usually do when that anxiety shows up?",
    subtitle: "No judgement. The pattern is the useful part.",
    options: [
      { value: "avoid_plan", label: "I avoid the plan or want to cancel" },
      { value: "overprepare", label: "I over-prepare and rehearse everything" },
      { value: "seek_reassurance", label: "I look for reassurance from someone else" },
      { value: "act_fine", label: "I act fine but feel tense underneath" },
      { value: "numb_scroll", label: "I scroll, distract myself, or shut down" },
      { value: "talk_it_out", label: "I talk it out but forget the lesson later" },
    ],
    next: { fallback: "interstitial_1" },
  },
  q2_founder: {
    id: "q2_founder",
    kind: "question_single",
    title: "Where do your founder thoughts repeat most?",
    subtitle: "MindMirror should help you recognise the thought pattern that slows action.",
    options: [
      { value: "launch_doubt", label: "Before launching or showing people the product" },
      { value: "comparison_spiral", label: "When I compare myself to competitors" },
      { value: "decision_delay", label: "When I need to make a decision" },
      { value: "money_pressure", label: "When money, ads, or runway feel real" },
      { value: "energy_crash", label: "When I lose momentum after a hard day" },
      { value: "imposter_loop", label: "When I wonder if I am really capable" },
    ],
    next: { fallback: "q3_founder" },
  },
  q3_founder: {
    id: "q3_founder",
    kind: "question_single",
    title: "What do you tend to do when that founder thought shows up?",
    subtitle: "This tells the sample result what behaviour the thought is attached to.",
    options: [
      { value: "research_more", label: "I research more instead of shipping" },
      { value: "change_direction", label: "I change direction before testing properly" },
      { value: "work_late", label: "I push harder until I burn out" },
      { value: "avoid_sales", label: "I avoid asking people to buy or give feedback" },
      { value: "overthink_ads", label: "I keep tweaking the funnel instead of testing" },
      { value: "reset_routine", label: "My routine drops and I lose confidence" },
    ],
    next: { fallback: "interstitial_1" },
  },
  q2_performance: {
    id: "q2_performance",
    kind: "question_single",
    title: "Where does pressure change your thinking?",
    subtitle: "Choose the performance moment you most want to prepare for.",
    options: [
      { value: "before_training", label: "Before training, when motivation dips" },
      { value: "before_competition", label: "Before competition or a big performance" },
      { value: "after_mistake", label: "After one mistake changes my whole mindset" },
      { value: "discipline_gap", label: "When discipline drops outside the session" },
      { value: "body_comparison", label: "When I compare my body, stats, or progress" },
      { value: "coach_feedback", label: "When feedback feels personal" },
    ],
    next: { fallback: "q3_performance" },
  },
  q3_performance: {
    id: "q3_performance",
    kind: "question_single",
    title: "What usually happens after that thought shows up?",
    subtitle: "MindMirror can only help if it knows the repeat behaviour too.",
    options: [
      { value: "tighten_up", label: "I tighten up and stop performing naturally" },
      { value: "skip_or_delay", label: "I skip, delay, or do less than I planned" },
      { value: "negative_self_talk", label: "My self-talk turns harsh quickly" },
      { value: "force_it", label: "I force it and ignore what I actually need" },
      { value: "compare_more", label: "I compare more and lose focus" },
      { value: "bounce_back_slowly", label: "It takes too long to reset mentally" },
    ],
    next: { fallback: "interstitial_1" },
  },
  q2_relationships: {
    id: "q2_relationships",
    kind: "question_single",
    title: "Where do relationship patterns repeat most?",
    subtitle: "Pick the situation where you want more self-awareness before reacting.",
    options: [
      { value: "dating_anxiety", label: "Dating, attachment, or waiting for a reply" },
      { value: "same_argument", label: "The same argument or misunderstanding" },
      { value: "family_trigger", label: "Family triggers that pull me backwards" },
      { value: "people_pleasing", label: "People-pleasing and not saying what I need" },
      { value: "jealousy_story", label: "Jealousy, insecurity, or making up stories" },
      { value: "shutdown", label: "Shutting down instead of communicating" },
    ],
    next: { fallback: "q3_relationships" },
  },
  q3_relationships: {
    id: "q3_relationships",
    kind: "question_single",
    title: "What do you usually do in that relationship pattern?",
    subtitle: "The app should help you see the reaction before it runs the conversation.",
    options: [
      { value: "send_reactive_message", label: "I send the message before I have calmed down" },
      { value: "pull_away", label: "I pull away and pretend I do not care" },
      { value: "over_explain", label: "I over-explain and try to control the outcome" },
      { value: "avoid_need", label: "I avoid saying what I actually need" },
      { value: "replay_conversation", label: "I replay the conversation for hours" },
      { value: "repeat_old_story", label: "I repeat an old story from past relationships" },
    ],
    next: { fallback: "interstitial_1" },
  },
  q2_habits: {
    id: "q2_habits",
    kind: "question_single",
    title: "Which habit pattern do you most want to catch before it happens?",
    subtitle: "This path stays focused on discipline, identity, alcohol, vaping, and relapse patterns.",
    options: [
      { value: "alcohol_social", label: "Alcohol around social events or weekends" },
      { value: "vaping_stress", label: "Vaping when I feel stressed, bored, or triggered" },
      { value: "scrolling_escape", label: "Scrolling or dopamine hits when I should reset" },
      { value: "morning_routine_drop", label: "Dropping my morning routine after one bad day" },
      { value: "sleep_break", label: "Staying up late even when I said I would not" },
      { value: "identity_slip", label: "Breaking a promise and thinking I am back to square one" },
    ],
    next: { fallback: "q3_habits" },
  },
  q3_habits: {
    id: "q3_habits",
    kind: "question_single",
    title: "What usually happens right before the habit wins?",
    subtitle: "MindMirror is trying to spot the thought before the behaviour.",
    options: [
      { value: "justify_once", label: "I tell myself it is only this once" },
      { value: "stress_release", label: "I feel like I deserve a release" },
      { value: "social_pressure", label: "I do not want to feel awkward or different" },
      { value: "all_or_nothing", label: "One slip makes me think the whole day is ruined" },
      { value: "tired_unprepared", label: "I am tired and have no plan ready" },
      { value: "forget_reason", label: "I forget why I cared in the first place" },
    ],
    next: { fallback: "interstitial_1" },
  },
  q2_self: {
    id: "q2_self",
    kind: "question_single",
    title: "What would you most want to understand about yourself?",
    subtitle: "This path is for people who do not have one obvious problem yet.",
    options: [
      { value: "recurring_mood", label: "Why my mood shifts the way it does" },
      { value: "same_thoughts", label: "Why the same thoughts keep coming back" },
      { value: "hidden_triggers", label: "What triggers me before I notice it" },
      { value: "decision_patterns", label: "How I make or avoid decisions" },
      { value: "energy_patterns", label: "What affects my energy and motivation" },
      { value: "values_gap", label: "Where my actions drift from my values" },
    ],
    next: { fallback: "q3_self" },
  },
  q3_self: {
    id: "q3_self",
    kind: "question_single",
    title: "How do you usually try to figure yourself out?",
    subtitle: "MindMirror should make reflection easier to use, not just easier to store.",
    options: [
      { value: "think_alone", label: "I think about it alone and go in circles" },
      { value: "voice_notes", label: "I make voice notes or talk it out" },
      { value: "journal_sometimes", label: "I journal sometimes but do not review it" },
      { value: "ask_people", label: "I ask other people for perspective" },
      { value: "ignore_until_big", label: "I ignore it until it becomes obvious" },
      { value: "track_everything", label: "I track things but struggle to see meaning" },
    ],
    next: { fallback: "interstitial_1" },
  },
  interstitial_1: {
    id: "interstitial_1",
    kind: "interstitial",
    progressStep: false,
    variant: "stat",
    headline: "Journaling records what happened. MindMirror helps you recognise what keeps repeating.",
    body: "The useful moment is realising: \"I have had this same thought before, in this same type of situation.\" That is self-awareness you can actually use.",
    ctaLabel: "Continue",
    next: { rules: goalBranchRules, fallback: "q4_self" },
  },
  q4_anxiety: {
    id: "q4_anxiety",
    kind: "question_single",
    title: "Before the next anxious moment, what would help most?",
    subtitle: "This shapes the sample preparation you see.",
    options: [
      { value: "anxiety_prepare", label: "A simple plan before the event" },
      { value: "anxiety_reframe", label: "A reminder of what my mind usually exaggerates" },
      { value: "anxiety_body_reset", label: "A way to calm my body first" },
      { value: "anxiety_stay", label: "Help staying instead of cancelling or escaping" },
      { value: "anxiety_aftercare", label: "A reflection after it happens so I learn from it" },
    ],
    next: { fallback: "q5_anxiety" },
  },
  q5_anxiety: {
    id: "q5_anxiety",
    kind: "question_single",
    title: "What is the next anxiety trigger you would want help with?",
    subtitle: "This makes the result feel practical, not abstract.",
    options: [
      { value: "anxiety_social_event", label: "A social event, party, or night out" },
      { value: "anxiety_meeting", label: "A meeting, call, or moment where I am being seen" },
      { value: "anxiety_conversation", label: "A difficult conversation" },
      { value: "anxiety_travel", label: "Travel, plans, or being out of routine" },
      { value: "anxiety_evening", label: "An evening where I know I may spiral" },
      { value: "anxiety_not_sure", label: "Not sure yet - I just want to see the pattern" },
    ],
    next: { fallback: "interstitial_2" },
  },
  q4_founder: {
    id: "q4_founder",
    kind: "question_single",
    title: "What would make MindMirror useful for you as a founder?",
    subtitle: "Pick the thing that would help you take cleaner action.",
    options: [
      { value: "founder_decide", label: "Show when I am avoiding a decision" },
      { value: "founder_ship", label: "Help me ship before over-polishing" },
      { value: "founder_sales", label: "Prepare me before asking people to buy" },
      { value: "founder_energy", label: "Spot when low energy changes my thinking" },
      { value: "founder_confidence", label: "Remind me what I already decided when doubt returns" },
    ],
    next: { fallback: "q5_founder" },
  },
  q5_founder: {
    id: "q5_founder",
    kind: "question_single",
    title: "What founder moment is coming up?",
    subtitle: "The sample should point to a real situation you can prepare for.",
    options: [
      { value: "founder_launch", label: "Launching, testing, or showing the product" },
      { value: "founder_ads", label: "Running ads or testing a funnel" },
      { value: "founder_customer", label: "Speaking to users or asking for feedback" },
      { value: "founder_money", label: "Money, pricing, or checkout pressure" },
      { value: "founder_schedule", label: "Protecting my routine while building" },
      { value: "founder_not_sure", label: "Not sure yet - I just want the pattern" },
    ],
    next: { fallback: "interstitial_2" },
  },
  q4_performance: {
    id: "q4_performance",
    kind: "question_single",
    title: "Before the next performance moment, what would help most?",
    subtitle: "This makes the sample result specific to training and pressure.",
    options: [
      { value: "performance_reset", label: "Reset my self-talk before I tighten up" },
      { value: "performance_prepare", label: "Prepare before training or competition" },
      { value: "performance_recover", label: "Recover faster after a mistake" },
      { value: "performance_consistency", label: "Stay consistent when motivation dips" },
      { value: "performance_identity", label: "Remember the athlete I am trying to become" },
    ],
    next: { fallback: "q5_performance" },
  },
  q5_performance: {
    id: "q5_performance",
    kind: "question_single",
    title: "What performance moment should the mirror prepare you for?",
    subtitle: "Choose the next real-life place this pattern might show up.",
    options: [
      { value: "performance_training", label: "A training session" },
      { value: "performance_competition", label: "A competition, game, or event" },
      { value: "performance_feedback", label: "Feedback from a coach, teammate, or client" },
      { value: "performance_recovery", label: "A recovery day where discipline may drop" },
      { value: "performance_progress", label: "Checking progress, stats, or body changes" },
      { value: "performance_not_sure", label: "Not sure yet - I just want the pattern" },
    ],
    next: { fallback: "interstitial_2" },
  },
  q4_relationships: {
    id: "q4_relationships",
    kind: "question_single",
    title: "Before the next relationship trigger, what would help most?",
    subtitle: "MindMirror should help you notice the story before you react from it.",
    options: [
      { value: "relationship_pause", label: "Pause before sending or saying something reactive" },
      { value: "relationship_story", label: "See the old story I am bringing into the moment" },
      { value: "relationship_need", label: "Name what I actually need" },
      { value: "relationship_boundaries", label: "Hold a boundary without guilt" },
      { value: "relationship_repair", label: "Reflect after a conversation and repair faster" },
    ],
    next: { fallback: "q5_relationships" },
  },
  q5_relationships: {
    id: "q5_relationships",
    kind: "question_single",
    title: "What relationship moment is coming up?",
    subtitle: "This keeps the sample grounded in something real.",
    options: [
      { value: "relationship_date", label: "A date, message, or dating uncertainty" },
      { value: "relationship_partner_talk", label: "A conversation with a partner" },
      { value: "relationship_family", label: "A family interaction" },
      { value: "relationship_friend", label: "A friendship conversation" },
      { value: "relationship_boundary", label: "A boundary I need to hold" },
      { value: "relationship_not_sure", label: "Not sure yet - I just want the pattern" },
    ],
    next: { fallback: "interstitial_2" },
  },
  q4_habits: {
    id: "q4_habits",
    kind: "question_single",
    title: "Before the next habit test, what would help most?",
    subtitle: "This path is about preparation, not shame.",
    options: [
      { value: "habit_precommit", label: "A clear plan before the trigger arrives" },
      { value: "habit_identity", label: "A reminder of the identity I am choosing" },
      { value: "habit_urge", label: "Help recognising the urge before I act on it" },
      { value: "habit_social_script", label: "A script for social pressure around alcohol or vaping" },
      { value: "habit_recover", label: "A way to recover after one slip without spiralling" },
    ],
    next: { fallback: "q5_habits" },
  },
  q5_habits: {
    id: "q5_habits",
    kind: "question_single",
    title: "What habit test is coming up soon?",
    subtitle: "Pick the situation where a pattern warning would actually help.",
    options: [
      { value: "habit_night_out", label: "A night out, event, or weekend" },
      { value: "habit_stress_day", label: "A stressful workday" },
      { value: "habit_boredom", label: "A quiet moment where boredom usually wins" },
      { value: "habit_morning", label: "A morning where I need to protect my routine" },
      { value: "habit_late_night", label: "A late night where old habits come back" },
      { value: "habit_not_sure", label: "Not sure yet - I just want the pattern" },
    ],
    next: { fallback: "interstitial_2" },
  },
  q4_self: {
    id: "q4_self",
    kind: "question_single",
    title: "What would make self-awareness useful instead of just interesting?",
    subtitle: "The result should show you something you can actually use.",
    options: [
      { value: "self_name_pattern", label: "Name the pattern I keep repeating" },
      { value: "self_find_trigger", label: "Find what triggers certain thoughts" },
      { value: "self_prepare", label: "Prepare before the pattern shows up again" },
      { value: "self_choose", label: "Make a better choice in the moment" },
      { value: "self_track_time", label: "See how my thoughts change over time" },
    ],
    next: { fallback: "q5_self" },
  },
  q5_self: {
    id: "q5_self",
    kind: "question_single",
    title: "Where would you want to use that self-awareness next?",
    subtitle: "Choose the real-life area where a mirror would be useful.",
    options: [
      { value: "self_work", label: "Work, decisions, or ambition" },
      { value: "self_social", label: "Social life and confidence" },
      { value: "self_relationships", label: "Relationships and communication" },
      { value: "self_health", label: "Health, habits, and energy" },
      { value: "self_emotions", label: "Mood, anxiety, and emotional patterns" },
      { value: "self_not_sure", label: "Not sure yet - I just want the pattern" },
    ],
    next: { fallback: "interstitial_2" },
  },
  interstitial_2: {
    id: "interstitial_2",
    kind: "interstitial",
    progressStep: false,
    variant: "testimonial",
    headline: "\"I do not need another diary. I need something that shows me the thoughts I keep repeating.\"",
    body: "That is the point of MindMirror: voice-first reflection, self-awareness, and thought pattern recognition over time.",
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
      { id: "s2", text: "Finding the recurring thought pattern...", durationMs: stepDuration },
      { id: "s3", text: "Building your self-awareness mirror...", durationMs: stepDuration },
      { id: "s4", text: "Your sample thought pattern is ready.", durationMs: stepDuration },
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
  before_social_plans: {
    title: "Anxious thoughts before plans",
    body: "Before social plans, your mind starts predicting danger before the event has even happened. MindMirror would help you prepare while the pattern is still small.",
  },
  fear_of_judgement: {
    title: "Assuming people are judging you",
    body: "Your mind starts acting like other people's opinions are already confirmed. MindMirror would help you separate the prediction from the evidence.",
  },
  uncertainty_spiral: {
    title: "Overthinking uncertainty",
    body: "When you cannot know the outcome, your mind keeps rehearsing possibilities. MindMirror would help you spot the spiral before it becomes the plan.",
  },
  conflict_avoidance: {
    title: "Avoiding hard conversations",
    body: "Difficult conversations start costing energy before they happen. MindMirror would help you name the fear and prepare your response.",
  },
  night_overthinking: {
    title: "Replaying thoughts at night",
    body: "At night, your mind starts replaying and predicting while your body needs to rest. MindMirror would help you recognise the familiar script earlier.",
  },
  body_alarm: {
    title: "Physical anxiety becoming fear",
    body: "Physical anxiety becomes proof that something is wrong. MindMirror would help you remember when this sensation has appeared before and what helped.",
  },
  launch_doubt: {
    title: "Doubt before showing your work",
    body: "The closer you get to showing the product, the louder the doubt becomes. MindMirror would help you tell the difference between useful feedback and avoidance.",
  },
  comparison_spiral: {
    title: "Comparing yourself to competitors",
    body: "Looking at competitors can turn from research into self-attack. MindMirror would help you notice when comparison stops helping you build.",
  },
  decision_delay: {
    title: "Delaying decisions",
    body: "The decision keeps moving because certainty feels safer than action. MindMirror would help you see when thinking has replaced choosing.",
  },
  money_pressure: {
    title: "Money pressure changing your thoughts",
    body: "When money feels real, your thoughts can swing between urgency and avoidance. MindMirror would help you ground the next practical step.",
  },
  energy_crash: {
    title: "Losing momentum after a hard day",
    body: "A hard day can start to feel like proof that the whole mission is slipping. MindMirror would help you protect the smallest next action.",
  },
  imposter_loop: {
    title: "Questioning whether you are capable",
    body: "Your mind starts questioning whether you are the person who can build this. MindMirror would help you return to evidence instead of identity panic.",
  },
  before_training: {
    title: "Negotiating with yourself before training",
    body: "The thought arrives before the session and tries to negotiate the standard down. MindMirror would help you prepare before motivation dips.",
  },
  before_competition: {
    title: "Pressure before performance",
    body: "The moment starts before the moment. MindMirror would help you catch the pressure script before it changes how you perform.",
  },
  after_mistake: {
    title: "Turning one mistake into a bigger story",
    body: "One mistake starts speaking for your whole identity. MindMirror would help you recover faster and keep the next action clean.",
  },
  discipline_gap: {
    title: "Discipline dropping when nobody is watching",
    body: "The pattern appears outside the session, when nobody is watching. MindMirror would help you see the thought that weakens consistency.",
  },
  body_comparison: {
    title: "Comparison changing your self-talk",
    body: "Stats, body, or progress checks start shaping your self-talk. MindMirror would help you notice when comparison steals focus.",
  },
  coach_feedback: {
    title: "Taking feedback personally",
    body: "Feedback can start feeling like a verdict. MindMirror would help you separate the useful signal from the personal story.",
  },
  dating_anxiety: {
    title: "Making a story from dating uncertainty",
    body: "A message, delay, or small cue starts becoming a whole story. MindMirror would help you see the story before reacting to it.",
  },
  same_argument: {
    title: "Repeating the same argument",
    body: "Different moments keep becoming the same conversation. MindMirror would help you notice the pattern before it repeats again.",
  },
  family_trigger: {
    title: "Old reactions around family",
    body: "Family moments can pull you into an older version of yourself quickly. MindMirror would help you prepare before that role takes over.",
  },
  people_pleasing: {
    title: "People-pleasing instead of saying what you need",
    body: "You trade honesty for short-term peace, then carry the cost later. MindMirror would help you notice where your needs disappear.",
  },
  jealousy_story: {
    title: "Filling gaps with an insecurity story",
    body: "Your mind fills in gaps with a painful story. MindMirror would help you separate the trigger from the conclusion.",
  },
  shutdown: {
    title: "Shutting down when emotion rises",
    body: "When emotion rises, silence starts to feel safer than expression. MindMirror would help you notice the moment before you close off.",
  },
  alcohol_social: {
    title: "Justifying alcohol before social events",
    body: "Before a night out or weekend, your mind starts justifying the old pattern. MindMirror would help you prepare before the social pressure arrives.",
  },
  vaping_stress: {
    title: "Reaching for vaping when stress hits",
    body: "Stress or boredom creates a quick-release story. MindMirror would help you catch the thought before the automatic reach.",
  },
  scrolling_escape: {
    title: "Escaping uncomfortable thoughts by scrolling",
    body: "A small uncomfortable feeling becomes a reason to disappear into scrolling. MindMirror would help you notice the escape before it takes the evening.",
  },
  morning_routine_drop: {
    title: "Dropping your routine after one bad morning",
    body: "One messy morning starts to feel like the whole routine is gone. MindMirror would help you restart from the smallest version.",
  },
  sleep_break: {
    title: "Letting old habits back in at night",
    body: "The day is over, but the old habit gets another chance. MindMirror would help you see the thought that makes late nights feel harmless.",
  },
  identity_slip: {
    title: "Thinking one slip means you are back to square one",
    body: "One slip starts telling you the old identity is back. MindMirror would help you recover without turning one moment into a full reset.",
  },
  recurring_mood: {
    title: "Mood changes that keep repeating",
    body: "Your mood shifts can feel random until you see what keeps preceding them. MindMirror would help connect those moments over time.",
  },
  same_thoughts: {
    title: "The same thought keeps coming back",
    body: "The thought keeps returning because something underneath still wants attention. MindMirror would help you see when and why it comes back.",
  },
  hidden_triggers: {
    title: "Triggers you only notice afterwards",
    body: "The trigger happens before you notice the reaction. MindMirror would help you build a clearer map of what sets the pattern off.",
  },
  decision_patterns: {
    title: "How you make or avoid decisions",
    body: "The same decision style shows up in different parts of life. MindMirror would help you see how you choose, delay, or avoid.",
  },
  energy_patterns: {
    title: "Energy patterns over time",
    body: "Energy and motivation are not random. MindMirror would help you notice what supports them and what quietly drains them.",
  },
  values_gap: {
    title: "The gap between your values and actions",
    body: "The gap between who you want to be and what you do keeps creating friction. MindMirror would help you see where the drift begins.",
  },
  social_anxiety: {
    title: "Anxious thoughts before things happen",
    body: "Before an event, your mind starts rehearsing what could go wrong. MindMirror would help you recognise this earlier and prepare before the anxiety becomes the plan.",
  },
  business_doubt: {
    title: "Doubt replacing action",
    body: "When the next move matters, your thinking can turn into self-questioning. MindMirror would show when doubt is replacing action so you can choose the next step sooner.",
  },
  performance_pressure: {
    title: "Pressure changing your thoughts",
    body: "Your thoughts tighten before the moment arrives. MindMirror would help you notice the pattern before training, competition, or performance so you can reset earlier.",
  },
  relationship_reactivity: {
    title: "Repeating the same relationship reaction",
    body: "The same emotional script can come back in different conversations. MindMirror would help you see the trigger, the story you tell yourself, and the response you usually repeat.",
  },
  habit_relapse: {
    title: "One habit slip changing how you see yourself",
    body: "A small trigger can become a full reset: one drink, one scroll, one missed routine, then the old story returns. MindMirror would help you prepare before that moment.",
  },
  overthinking: {
    title: "Trying to think your way into certainty",
    body: "You keep trying to feel completely sure before you act. MindMirror would help you recognise when more thinking is no longer creating more self-awareness.",
  },
  no_clarity: {
    title: "Waiting until everything feels clear",
    body: "You can't move forward until everything makes sense. But understanding often comes from action, not reflection.",
  },
  stuck: {
    title: "Returning to the same unresolved thought",
    body: "You keep returning to the same thought, decision, or worry. The pattern feels familiar, and familiar can start to feel safe.",
  },
  stress: {
    title: "Overwhelm that keeps coming back",
    body: "You spiral between overwhelm and the stories you tell yourself about why you're overwhelmed. The pattern repeats weekly.",
  },
  patterns: {
    title: "Seeing the pattern but not changing it",
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
    value: "Your mirror should help you separate useful planning from avoidance, doubt, and recurring thoughts that slow momentum.",
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
    label: "Your thought pattern",
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
