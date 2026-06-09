import { analyzeReflection, type ReflectionAnalysis } from "@/lib/app-patterns";

export type MindMirrorInsight = {
  privateMirror: string;
  repeatedThoughtLoops: string[];
  emotionalPattern: string;
  triggerContext: string;
  whatYouMightBeForgetting: string;
  followUpQuestions: string[];
  oneNextAction: string;
  modelUsed: string;
  provider: "openai" | "deterministic";
};

export type MindMirrorFollowUp = {
  reflection: string;
  deeperQuestion: string;
  oneNextAction: string;
  modelUsed: string;
  provider: "openai" | "deterministic";
};

type HistoricalEntry = {
  text: string;
  analysis?: ReflectionAnalysis;
};

type MirrorInput = {
  entryText: string;
  historicalEntries: HistoricalEntry[];
};

type FollowUpInput = {
  entryText: string;
  mirror: MindMirrorInsight;
  question: string;
  answer: string;
};

const DEFAULT_REASONING_MODEL = "gpt-5.5";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

function selectedModel(): string {
  return process.env.MINDMIRROR_AI_MODEL?.trim() || DEFAULT_REASONING_MODEL;
}

function truncate(text: string, max = 900): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

function ensureList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value.map((item) => String(item).trim()).filter(Boolean);
  return items.length > 0 ? items.slice(0, 5) : fallback;
}

function ensureString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function parseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function outputTextFromResponse(data: unknown): string {
  if (data && typeof data === "object" && "output_text" in data) {
    const outputText = (data as { output_text?: unknown }).output_text;
    if (typeof outputText === "string") return outputText;
  }

  const output = (data as { output?: unknown })?.output;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      const content = (item as { content?: unknown })?.content;
      return Array.isArray(content) ? content : [];
    })
    .map((content) => {
      const block = content as { text?: unknown; type?: unknown };
      return typeof block.text === "string" ? block.text : "";
    })
    .join("\n")
    .trim();
}

async function callOpenAiJson(prompt: string): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const res = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: selectedModel(),
      input: prompt,
      reasoning: { effort: "medium" },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`MindMirror AI failed: ${res.status} ${body.slice(0, 220)}`);
  }

  const data = (await res.json()) as unknown;
  return parseJsonObject(outputTextFromResponse(data));
}

function fallbackMirror(entryText: string, history: HistoricalEntry[]): MindMirrorInsight {
  const analysis = analyzeReflection(entryText);
  const historicalPatterns = history
    .map((entry) => entry.analysis?.patternLabel)
    .filter((label): label is string => Boolean(label))
    .slice(0, 3);

  return {
    privateMirror: analysis.summary,
    repeatedThoughtLoops: [
      analysis.patternLabel,
      ...historicalPatterns.filter((label) => label !== analysis.patternLabel),
    ].slice(0, 3),
    emotionalPattern: analysis.emotion,
    triggerContext: analysis.topics.length > 0 ? analysis.topics.join(", ") : "The context is still forming.",
    whatYouMightBeForgetting:
      analysis.note || "This is an early read. Treat it as a question, not a conclusion.",
    followUpQuestions: [
      analysis.nextQuestion,
      "What meaning might your mind be adding to the facts?",
      "Where has this pattern shown up before?",
    ],
    oneNextAction: analysis.smallestAction,
    modelUsed: "deterministic-fallback",
    provider: "deterministic",
  };
}

function fallbackFollowUp(input: FollowUpInput): MindMirrorFollowUp {
  const answerAnalysis = analyzeReflection(input.answer);
  return {
    reflection: `Your answer points toward ${answerAnalysis.patternLabel.toLowerCase()}. The useful question may be less "what am I thinking?" and more "what is this thought trying to protect me from?"`,
    deeperQuestion:
      answerAnalysis.nextQuestion || "What would change if you trusted the feeling without obeying the pattern?",
    oneNextAction:
      answerAnalysis.smallestAction || "Write one fact, one interpretation, and one next action.",
    modelUsed: "deterministic-fallback",
    provider: "deterministic",
  };
}

export async function generateMindMirror(input: MirrorInput): Promise<MindMirrorInsight> {
  const fallback = fallbackMirror(input.entryText, input.historicalEntries);
  const recentContext = input.historicalEntries
    .slice(0, 8)
    .map((entry, index) => {
      const label = entry.analysis?.patternLabel ?? "No existing pattern label";
      return `${index + 1}. ${label}: ${truncate(entry.text, 260)}`;
    })
    .join("\n");

  const prompt = `You are MindMirror, a voice-first AI journaling tool for self-awareness and thought pattern recognition.

Important boundaries:
- You are not a therapist, doctor, or crisis service.
- Do not diagnose.
- Do not overclaim certainty.
- Help the user question their thinking in a clear, grounded way.

Task:
Analyze the user's raw reflection and return ONLY valid JSON with these exact keys:
{
  "privateMirror": "A concise, compassionate mirror of what the user seems to be saying.",
  "repeatedThoughtLoops": ["1-4 possible recurring thought loops, written in plain language"],
  "emotionalPattern": "The dominant emotional pattern in plain English.",
  "triggerContext": "The situation, trigger, or context that seems to bring this up.",
  "whatYouMightBeForgetting": "A useful blind spot, missing evidence, or alternate view.",
  "followUpQuestions": ["3 sharp follow-up questions that help the user question why they keep thinking this"],
  "oneNextAction": "One small concrete action for today."
}

Current reflection:
${truncate(input.entryText, 2600)}

Recent saved context:
${recentContext || "No previous entries yet."}`;

  const json = await callOpenAiJson(prompt).catch(() => null);
  if (!json) return fallback;

  return {
    privateMirror: ensureString(json.privateMirror, fallback.privateMirror),
    repeatedThoughtLoops: ensureList(json.repeatedThoughtLoops, fallback.repeatedThoughtLoops),
    emotionalPattern: ensureString(json.emotionalPattern, fallback.emotionalPattern),
    triggerContext: ensureString(json.triggerContext, fallback.triggerContext),
    whatYouMightBeForgetting: ensureString(
      json.whatYouMightBeForgetting,
      fallback.whatYouMightBeForgetting,
    ),
    followUpQuestions: ensureList(json.followUpQuestions, fallback.followUpQuestions).slice(0, 3),
    oneNextAction: ensureString(json.oneNextAction, fallback.oneNextAction),
    modelUsed: selectedModel(),
    provider: "openai",
  };
}

export async function generateMindMirrorFollowUp(input: FollowUpInput): Promise<MindMirrorFollowUp> {
  const fallback = fallbackFollowUp(input);
  const prompt = `You are MindMirror. The user answered a follow-up question after a private journal mirror.

Boundaries:
- Do not diagnose.
- Do not pretend to be therapy.
- Be direct, warm, and useful.
- Help the user examine why this thought pattern keeps returning.

Return ONLY valid JSON with these exact keys:
{
  "reflection": "A deeper second-layer reflection on what their answer reveals.",
  "deeperQuestion": "One sharper question for the user to sit with next.",
  "oneNextAction": "One tiny next action."
}

Original reflection:
${truncate(input.entryText, 1800)}

Previous mirror:
${truncate(input.mirror.privateMirror, 700)}

Question they answered:
${input.question}

Their answer:
${truncate(input.answer, 1800)}`;

  const json = await callOpenAiJson(prompt).catch(() => null);
  if (!json) return fallback;

  return {
    reflection: ensureString(json.reflection, fallback.reflection),
    deeperQuestion: ensureString(json.deeperQuestion, fallback.deeperQuestion),
    oneNextAction: ensureString(json.oneNextAction, fallback.oneNextAction),
    modelUsed: selectedModel(),
    provider: "openai",
  };
}
