export type ReflectionSource = "text" | "voice";

export type ReflectionAnalysis = {
  summary: string;
  emotion: string;
  patternKey: string;
  patternLabel: string;
  topics: string[];
  signals: string[];
  confidence: "low" | "medium" | "high";
  evidence: string[];
  note: string;
  loopCost: string;
  nextQuestion: string;
  smallestAction: string;
};

const STOP_WORDS = new Set([
  "able",
  "about",
  "after",
  "again",
  "almost",
  "also",
  "another",
  "around",
  "away",
  "because",
  "been",
  "before",
  "being",
  "better",
  "cannot",
  "could",
  "didn",
  "doesn",
  "doing",
  "done",
  "else",
  "every",
  "feel",
  "feeling",
  "felt",
  "find",
  "first",
  "from",
  "getting",
  "going",
  "good",
  "got",
  "have",
  "having",
  "into",
  "just",
  "keep",
  "kind",
  "know",
  "like",
  "maybe",
  "more",
  "much",
  "need",
  "now",
  "only",
  "other",
  "over",
  "quite",
  "really",
  "right",
  "same",
  "some",
  "something",
  "still",
  "that",
  "them",
  "then",
  "their",
  "there",
  "these",
  "they",
  "thing",
  "things",
  "think",
  "thinking",
  "this",
  "thought",
  "today",
  "very",
  "want",
  "wanted",
  "wasn",
  "when",
  "where",
  "which",
  "with",
  "without",
  "would",
  "your",
]);

const PATTERNS = [
  {
    key: "clarity_loop",
    label: "Possible clarity-seeking loop",
    loopCost: "More thinking may be replacing the discomfort of choosing.",
    nextQuestion: "What would you do next if certainty was not required?",
    smallestAction: "Pick one decision and define the next visible step.",
    words: [
      "certain",
      "clarity",
      "confused",
      "decide",
      "decision",
      "doubt",
      "overthink",
      "ruminate",
      "sure",
      "unclear",
      "unsure",
    ],
    phrases: [
      "can't decide",
      "cannot decide",
      "keep thinking",
      "make the wrong choice",
      "not sure",
      "over and over",
      "second guessing",
      "too many options",
    ],
  },
  {
    key: "avoidance_loop",
    label: "Possible avoidance loop",
    loopCost: "Delay can make the task feel heavier than the task itself.",
    nextQuestion: "What are you avoiding feeling by not starting?",
    smallestAction: "Do the first two minutes, then stop if you still want to.",
    words: [
      "avoid",
      "delay",
      "distract",
      "later",
      "postpone",
      "procrastinate",
      "scroll",
      "stuck",
      "waiting",
    ],
    phrases: [
      "didn't start",
      "keep putting",
      "put it off",
      "putting it off",
      "start tomorrow",
      "wasting time",
    ],
  },
  {
    key: "momentum_reset_loop",
    label: "Possible momentum reset loop",
    loopCost: "A small interruption may be turning into a full reset of identity and direction.",
    nextQuestion: "What helped you care about this before life interrupted it?",
    smallestAction: "Recover the smallest version of the routine today, even if it is imperfect.",
    words: [
      "back",
      "consistent",
      "direction",
      "discipline",
      "forgot",
      "lost",
      "momentum",
      "routine",
      "spiral",
      "track",
    ],
    phrases: [
      "fell off",
      "get back",
      "get lost",
      "life gets in the way",
      "lost momentum",
      "lost my way",
      "pick this back up",
      "why i started",
    ],
  },
  {
    key: "numbing_escape_loop",
    label: "Possible discomfort escape loop",
    loopCost: "Short-term relief may be keeping you away from the feeling that needs attention.",
    nextQuestion: "What feeling are you trying not to sit with right now?",
    smallestAction: "Delay the escape by ten minutes and record what feeling shows up.",
    words: [
      "alcohol",
      "binge",
      "craving",
      "doomscroll",
      "drink",
      "escape",
      "jerking",
      "numb",
      "porn",
      "relapse",
      "scrolling",
      "vape",
    ],
    phrases: [
      "doom scrolling",
      "get away from",
      "jerk off",
      "numb out",
      "scroll instead",
      "touch myself",
      "want to drink",
      "want to vape",
    ],
  },
  {
    key: "pressure_loop",
    label: "Possible pressure and expectation loop",
    loopCost: "Pressure may be turning progress into proof that you are enough.",
    nextQuestion: "Whose standard are you trying to satisfy right now?",
    smallestAction: "Name the one thing that would count as enough for today.",
    words: [
      "behind",
      "expect",
      "failure",
      "guilty",
      "perfect",
      "pressure",
      "prove",
      "should",
      "supposed",
    ],
    phrases: [
      "falling behind",
      "have to",
      "not enough",
      "should be",
      "supposed to",
      "what if i fail",
    ],
  },
  {
    key: "work_loop",
    label: "Possible work identity loop",
    loopCost: "Work may be carrying more of your identity than it needs to.",
    nextQuestion: "What part of this is the actual work, and what part is self-worth?",
    smallestAction: "Separate the next work task from the story about what it means.",
    words: [
      "boss",
      "career",
      "client",
      "company",
      "deadline",
      "founder",
      "manager",
      "meeting",
      "project",
      "team",
      "work",
    ],
    phrases: ["at work", "my job", "performance review", "work email", "work feels"],
  },
  {
    key: "relationship_loop",
    label: "Possible relationship meaning loop",
    loopCost: "A relationship moment may be becoming a larger story about your value.",
    nextQuestion: "What did they actually do, and what meaning did your mind add?",
    smallestAction: "Write the fact and the interpretation as two separate lines.",
    words: [
      "alone",
      "family",
      "friend",
      "ignored",
      "mother",
      "partner",
      "relationship",
      "said",
      "texted",
    ],
    phrases: [
      "didn't reply",
      "felt ignored",
      "my dad",
      "my mom",
      "my partner",
      "my relationship",
      "they said",
    ],
  },
  {
    key: "energy_loop",
    label: "Possible energy and capacity loop",
    loopCost: "Low capacity can make every thought feel more urgent and final.",
    nextQuestion: "What would this look like if tiredness was part of the data?",
    smallestAction: "Choose one recovery action before solving the whole problem.",
    words: [
      "burned",
      "capacity",
      "depleted",
      "drained",
      "energy",
      "exhausted",
      "rest",
      "sleep",
      "tired",
    ],
    phrases: [
      "burned out",
      "can't focus",
      "couldn't sleep",
      "low energy",
      "need rest",
      "no energy",
    ],
  },
  {
    key: "self_trust_loop",
    label: "Possible self-trust loop",
    loopCost: "Self-blame may be using energy that could go into repair.",
    nextQuestion: "What would rebuilding trust look like in one small action?",
    smallestAction: "Do one repair step and record it as evidence.",
    words: [
      "ashamed",
      "blame",
      "confidence",
      "failure",
      "guilt",
      "mistake",
      "regret",
      "trust",
      "worth",
    ],
    phrases: [
      "beat myself up",
      "don't trust myself",
      "i messed up",
      "my fault",
      "not good enough",
      "why can't i",
    ],
  },
];

const EMOTIONS = [
  {
    label: "anxious",
    words: ["anxious", "fear", "nervous", "overwhelmed", "panic", "scared", "stress", "worried"],
    phrases: ["what if", "can't relax", "on edge", "worried about"],
  },
  {
    label: "frustrated",
    words: ["angry", "annoyed", "frustrated", "irritated", "resent", "mad"],
    phrases: ["fed up", "so annoying", "tired of"],
  },
  {
    label: "heavy",
    words: [
      "burned",
      "depleted",
      "down",
      "drained",
      "empty",
      "exhausted",
      "flat",
      "heavy",
      "lonely",
      "low",
      "depressed",
      "sad",
      "shame",
      "tired",
    ],
    phrases: ["feel alone", "felt alone", "hard to care"],
  },
  {
    label: "uncertain",
    words: ["confused", "unclear", "unsure", "stuck", "lost", "doubt"],
    phrases: ["don't know", "not sure", "can't tell"],
  },
  {
    label: "motivated",
    words: ["excited", "hopeful", "ready", "clear", "proud", "grateful"],
    phrases: ["looking forward", "feel ready", "more clear"],
  },
];

const TOPIC_PHRASES = [
  "career change",
  "family expectations",
  "friend group",
  "future plans",
  "morning routine",
  "money stress",
  "performance review",
  "relationship",
  "sleep schedule",
  "social media",
  "work email",
  "work project",
];

type Candidate = {
  key?: string;
  label: string;
  loopCost?: string;
  nextQuestion?: string;
  smallestAction?: string;
  words: string[];
  phrases: string[];
};

type ScoredCandidate<T extends Candidate> = T & {
  evidence: string[];
  score: number;
};

function normalizeWord(word: string): string {
  if (word.length > 5 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 5 && word.endsWith("ing")) return word.slice(0, -3);
  if (word.length > 4 && word.endsWith("ed")) return word.slice(0, -2);
  if (word.length > 4 && word.endsWith("s")) return word.slice(0, -1);
  return word;
}

function wordsFrom(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .map((w) => normalizeWord(w.trim().replace(/^'+|'+$/g, "")))
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
}

function cleanText(text: string): string {
  return text.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, " ").trim();
}

function scoreWordMatches(words: string[], candidates: string[]): string[] {
  const bag = new Set(words);
  return candidates.filter((word) => bag.has(normalizeWord(word)));
}

function phraseMatches(text: string, candidates: string[]): string[] {
  return candidates.filter((phrase) => text.includes(phrase));
}

function scoreCandidate<T extends Candidate>(
  candidate: T,
  words: string[],
  text: string,
): ScoredCandidate<T> {
  const wordEvidence = scoreWordMatches(words, candidate.words);
  const phraseEvidence = phraseMatches(text, candidate.phrases);
  const evidence = [...phraseEvidence, ...wordEvidence];
  return {
    ...candidate,
    evidence,
    score: phraseEvidence.length * 2 + wordEvidence.length,
  };
}

function bestCandidate<T extends Candidate>(
  candidates: T[],
  words: string[],
  text: string,
): ScoredCandidate<T> {
  return candidates
    .map((candidate) => scoreCandidate(candidate, words, text))
    .sort((a, b) => b.score - a.score || b.evidence.length - a.evidence.length)[0]!;
}

function confidenceFrom(score: number, wordCount: number): ReflectionAnalysis["confidence"] {
  if (score >= 5 && wordCount >= 35) return "high";
  if (score >= 2 && wordCount >= 12) return "medium";
  return "low";
}

function topTerms(words: string[], count: number): string[] {
  const totals = new Map<string, number>();
  for (const word of words) {
    totals.set(word, (totals.get(word) ?? 0) + 1);
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, count)
    .map(([word]) => word);
}

function topTopics(words: string[], text: string, count: number): string[] {
  const phrases = TOPIC_PHRASES.filter((phrase) => text.includes(phrase));
  const terms = topTerms(words, count + 2);
  return [...new Set([...phrases, ...terms])].slice(0, count);
}

function firstSentence(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return "No reflection text was saved.";
  const sentence = clean.match(/^(.{1,160}?[.!?])\s/)?.[1] ?? clean.slice(0, 160);
  return sentence.length < clean.length ? `${sentence.replace(/[.!?]$/, "")}...` : sentence;
}

function evidenceNote(confidence: ReflectionAnalysis["confidence"], hasPattern: boolean): string {
  if (!hasPattern) {
    return "Early read only: there was not enough repeated language to name a specific loop yet.";
  }
  if (confidence === "high") {
    return "This is still a deterministic read, but several words or phrases point in the same direction.";
  }
  if (confidence === "medium") {
    return "A few cues point here; treat this as a prompt to check, not a diagnosis.";
  }
  return "Early read only: this is based on limited evidence from one short reflection.";
}

function defaultLoopCost(hasPattern: boolean): string {
  return hasPattern
    ? "This pattern may be costing attention, momentum, or emotional energy."
    : "There is not enough evidence yet to name a clear cost.";
}

function defaultNextQuestion(hasPattern: boolean): string {
  return hasPattern
    ? "Where does this show up outside this reflection?"
    : "What is the one thought you would want MindMirror to remember from this?";
}

function defaultSmallestAction(hasPattern: boolean): string {
  return hasPattern
    ? "Take one small action that tests the pattern instead of arguing with it."
    : "Save one more honest reflection when the thought returns.";
}

function fallbackTopics(text: string): string[] {
  const summary = firstSentence(text).toLowerCase();
  if (!summary || summary === "no reflection text was saved.") return [];
  return summary
    .replace(/[^a-z0-9\s']/g, " ")
    .split(/\s+/)
    .map((word) => normalizeWord(word.trim()))
    .filter((word) => word.length >= 4 && !STOP_WORDS.has(word))
    .slice(0, 3);
}

export function analyzeReflection(text: string): ReflectionAnalysis {
  const normalizedText = cleanText(text);
  const words = wordsFrom(text);
  const pattern = bestCandidate(PATTERNS, words, normalizedText);
  const emotion = bestCandidate(EMOTIONS, words, normalizedText);
  const hasPattern = pattern.score > 0;
  const patternGuidance = hasPattern ? pattern : undefined;
  const confidence = confidenceFrom(pattern.score + Math.min(emotion.score, 2), words.length);
  const topics = topTopics(words, normalizedText, 5);
  const evidence = [...new Set([...pattern.evidence, ...emotion.evidence])].slice(0, 6);
  const fallbackSignals = topics.length > 0 ? topics.slice(0, 3) : fallbackTopics(text);

  return {
    summary: firstSentence(text),
    emotion: emotion.score > 0 ? emotion.label : "reflective",
    patternKey: hasPattern ? pattern.key! : "emerging_pattern",
    patternLabel: hasPattern ? pattern.label : "Emerging pattern, not enough signal yet",
    topics: topics.length > 0 ? topics : fallbackSignals,
    signals: evidence.length > 0 ? evidence : fallbackSignals,
    confidence,
    evidence,
    note: evidenceNote(confidence, hasPattern),
    loopCost: patternGuidance?.loopCost ?? defaultLoopCost(hasPattern),
    nextQuestion: patternGuidance?.nextQuestion ?? defaultNextQuestion(hasPattern),
    smallestAction: patternGuidance?.smallestAction ?? defaultSmallestAction(hasPattern),
  };
}
