"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AudioLines,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Loader2,
  Mic,
  MicOff,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { getClientAuth } from "@/lib/firebase";
import type { MindMirrorFollowUp, MindMirrorInsight } from "@/lib/ai/mindmirror";
import type { ReflectionAnalysis, ReflectionSource } from "@/lib/app-patterns";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

type JournalEntry = {
  id: string;
  text: string;
  source: ReflectionSource;
  analysis: ReflectionAnalysis;
  mindMirror?: MindMirrorInsight;
  followUps: MindMirrorFollowUpThread[];
  createdAt: string;
};

type MindMirrorFollowUpThread = {
  answer: string;
  createdAt: string;
  question: string;
  response: MindMirrorFollowUp;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<{
    0: { transcript: string };
    isFinal: boolean;
  }>;
};

function recognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  }).format(new Date(iso));
}

function countBy<T extends string>(items: T[]): Array<[T, number]> {
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function mirrorField(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function greetingLabel(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "good morning.";
  if (hour < 17) return "good afternoon.";
  return "good evening.";
}

function nextUnlockLabel(entryCount: number): string {
  if (entryCount < 1) return "First mirror unlocks after one reflection.";
  if (entryCount < 3) return `${3 - entryCount} more to unlock early signals.`;
  if (entryCount < 10) return `${10 - entryCount} more to unlock your pattern map.`;
  return "Pattern map unlocked.";
}

function BrainMirrorMascot({ active, compact = false }: { active: boolean; compact?: boolean }) {
  return (
    <div
      aria-hidden
      className={`mm-brain-mirror relative shrink-0 ${active ? "is-active" : ""} ${
        compact ? "scale-75" : ""
      }`}
    >
      <svg viewBox="0 0 220 220" role="img" focusable="false">
        <path
          className="mm-brain-body"
          d="M71 93c-18-2-31-16-31-34 0-21 17-37 38-36 8-14 24-22 41-18 14 3 24 13 29 26 19 1 34 17 34 36 0 17-11 31-27 36 2 17-9 33-26 37-13 4-26-1-34-11-13 7-30 5-41-6-13-13-13-33 0-46 5-5 10-8 17-10z"
        />
        <circle className="mm-brain-eye left" cx="91" cy="93" r="4" />
        <circle className="mm-brain-eye right" cx="124" cy="93" r="4" />
        <path className="mm-brain-line" d="M75 54c14 1 22 9 23 22" />
        <path className="mm-brain-line" d="M121 45c-10 7-14 17-11 30" />
        <path className="mm-brain-line" d="M139 75c-13 0-22 6-27 18" />
        <path className="mm-brain-line" d="M78 96c9-7 21-8 34-3" />
        <path className="mm-brain-line" d="M111 105c3 13 11 21 24 24" />
        <path className="mm-neural-pulse one" d="M62 34c-10-8-20-10-31-4" />
        <path className="mm-neural-pulse two" d="M158 36c12-8 24-8 36 0" />
        <path className="mm-neural-pulse three" d="M107 12c1-12 7-21 18-27" />
        <path className="mm-brain-arm left" d="M65 123c-18 14-29 27-34 41" />
        <path className="mm-brain-arm right" d="M149 122c18 10 30 18 41 28" />
        <path className="mm-brain-leg left" d="M87 137v39" />
        <path className="mm-brain-leg right" d="M119 137v39" />
        <path className="mm-brain-foot left" d="M72 177h28" />
        <path className="mm-brain-foot right" d="M108 177h29" />
        <circle className="mm-mascot-mirror" cx="179" cy="150" r="24" />
        <path className="mm-mascot-handle" d="M162 167l-19 20" />
        <path className="mm-mascot-shine" d="M169 144c5-6 12-9 20-7" />
      </svg>
    </div>
  );
}

async function authHeaders(): Promise<HeadersInit> {
  const user = getClientAuth().currentUser;
  if (!user) throw new Error("Sign in again to save entries.");
  return { authorization: `Bearer ${await user.getIdToken()}` };
}

export function MindMirrorApp() {
  const isLoadingAuth = useAuthStore((s) => s.isLoading);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState("");
  const [source, setSource] = useState<ReflectionSource>("text");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingMirror, setIsGeneratingMirror] = useState(false);
  const [isAnsweringFollowUp, setIsAnsweringFollowUp] = useState(false);
  const [isRevealingMirror, setIsRevealingMirror] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voiceDisclosureAccepted, setVoiceDisclosureAccepted] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionLike | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [followUpAnswer, setFollowUpAnswer] = useState("");

  const cleanText = text.trim();
  const characterCount = cleanText.length;
  const hasEntries = entries.length > 0;
  const canSave = characterCount >= 10 && !isSaving;
  const starterPrompts = [
    "The thought that keeps coming back is...",
    "I feel stuck because...",
    "The decision I keep avoiding is...",
  ];
  const firstUseSteps = [
    {
      label: "Capture",
      note: "Speak or type the thought.",
    },
    {
      label: "Mirror",
      note: "See the pattern underneath it.",
    },
    {
      label: "Go deeper",
      note: "Answer one better question.",
    },
  ];

  useEffect(() => {
    if (isLoadingAuth) return;
    let alive = true;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/app/entries", {
          cache: "no-store",
          headers: await authHeaders(),
        });
        if (!res.ok) throw new Error("Could not load your entries.");
        const json = (await res.json()) as { entries: JournalEntry[] };
        if (alive) setEntries(json.entries);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Could not load your entries.");
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isLoadingAuth]);

  useEffect(() => {
    if (!savedEntryId) return;
    const timeout = window.setTimeout(() => setSavedEntryId(null), 6500);
    return () => window.clearTimeout(timeout);
  }, [savedEntryId]);

  useEffect(() => {
    if (!isRevealingMirror) return;
    const timeout = window.setTimeout(() => setIsRevealingMirror(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [isRevealingMirror]);

  const dashboard = useMemo(() => {
    const patterns = countBy(entries.map((entry) => entry.analysis.patternLabel));
    const emotions = countBy(entries.map((entry) => entry.analysis.emotion));
    const topics = countBy(entries.flatMap((entry) => entry.analysis.topics));
    return {
      patterns: patterns.slice(0, 4),
      emotions: emotions.slice(0, 4),
      topics: topics.slice(0, 8),
      latest: entries[0],
    };
  }, [entries]);

  const latestEntry = dashboard.latest;
  const latestMirror = latestEntry?.mindMirror;
  const latestQuestions = latestMirror?.followUpQuestions ?? [];
  const activeQuestionIndex =
    latestQuestions.length > 0
      ? Math.min(selectedQuestionIndex, latestQuestions.length - 1)
      : 0;
  const latestQuestion = mirrorField(
    latestMirror?.followUpQuestions[activeQuestionIndex] ??
      latestMirror?.followUpQuestions[0] ??
      latestEntry?.analysis.nextQuestion,
    "Where does this show up outside this reflection?",
  );
  const latestFollowUp = latestEntry?.followUps.at(-1);
  const activeStep = latestEntry
    ? latestMirror
      ? latestFollowUp
        ? 3
        : 2
      : 1
    : 0;
  const evidenceProgress = Math.min(entries.length, 10);
  const patternMapUnlocked = entries.length >= 10;
  const earlySignalsUnlocked = entries.length >= 3;
  const thoughtChips =
    latestEntry?.analysis.signals.slice(0, 3).filter(Boolean) ??
    (cleanText.length > 0 ? cleanText.split(/\s+/).filter((word) => word.length > 4).slice(0, 3) : []);
  const mirrorChips = thoughtChips.length > 0 ? thoughtChips : ["thought", "pattern", "mirror"];
  const unlockSteps = [
    {
      count: 1,
      description: "Single-entry thought pattern, cost, question, and next action.",
      label: "First mirror",
      unlocked: entries.length >= 1,
    },
    {
      count: 3,
      description: "Repeated topics, emotions, and early language patterns.",
      label: "Early signals",
      unlocked: earlySignalsUnlocked,
    },
    {
      count: 10,
      description: "A clearer map of what keeps coming back.",
      label: "Pattern map",
      unlocked: patternMapUnlocked,
    },
  ];

  async function saveEntry() {
    if (cleanText.length < 10) {
      setError("Write or dictate at least one real sentence.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/app/entries", {
        method: "POST",
        cache: "no-store",
        headers: {
          "content-type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({ text: cleanText, source }),
      });
      const json = (await res.json()) as { entry?: JournalEntry; error?: string };
      if (!res.ok || !json.entry) throw new Error(json.error ?? "Could not save entry.");
      setEntries((current) => [json.entry!, ...current]);
      setText("");
      setSource("text");
      setSavedEntryId(json.entry.id);
      setIsRevealingMirror(true);
      setSelectedQuestionIndex(0);
      setFollowUpAnswer("");
      void generateMirror(json.entry.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save entry.");
    } finally {
      setIsSaving(false);
    }
  }

  async function generateMirror(entryId: string) {
    setIsGeneratingMirror(true);
    setError(null);
    try {
      const res = await fetch("/api/app/mirror", {
        method: "POST",
        cache: "no-store",
        headers: {
          "content-type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({ entryId }),
      });
      const json = (await res.json()) as { mirror?: MindMirrorInsight; error?: string };
      if (!res.ok || !json.mirror) throw new Error(json.error ?? "Could not generate mirror.");
      setEntries((current) =>
        current.map((entry) =>
          entry.id === entryId ? { ...entry, mindMirror: json.mirror } : entry,
        ),
      );
      setSelectedQuestionIndex(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate mirror.");
    } finally {
      setIsGeneratingMirror(false);
      setIsRevealingMirror(false);
    }
  }

  async function answerFollowUp() {
    if (!latestEntry) return;
    const answer = followUpAnswer.trim();
    if (answer.length < 10) {
      setError("Answer the follow-up with at least one honest sentence.");
      return;
    }

    setIsAnsweringFollowUp(true);
    setError(null);
    try {
      const res = await fetch("/api/app/mirror", {
        method: "PATCH",
        cache: "no-store",
        headers: {
          "content-type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({
          answer,
          entryId: latestEntry.id,
          questionIndex: activeQuestionIndex,
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        followUp?: MindMirrorFollowUpThread;
        mirror?: MindMirrorInsight;
      };
      if (!res.ok || !json.followUp) throw new Error(json.error ?? "Could not answer follow-up.");
      const followUp = json.followUp;
      setEntries((current) =>
        current.map((entry) =>
          entry.id === latestEntry.id
            ? {
                ...entry,
                followUps: [...entry.followUps, followUp],
                mindMirror: json.mirror ?? entry.mindMirror,
              }
            : entry,
        ),
      );
      setFollowUpAnswer("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not answer follow-up.");
    } finally {
      setIsAnsweringFollowUp(false);
    }
  }

  function startFromPrompt(prompt: string) {
    setText(prompt);
    setSource("text");
    setSavedEntryId(null);
    setError(null);
  }

  function continueFromQuestion(question: string) {
    setText(`${question}\n\n`);
    setSource("text");
    setSavedEntryId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteEntry(entryId: string) {
    setDeletingEntryId(entryId);
    setError(null);
    try {
      const res = await fetch(`/api/app/entries?id=${encodeURIComponent(entryId)}`, {
        method: "DELETE",
        cache: "no-store",
        headers: await authHeaders(),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Could not delete entry.");
      setEntries((current) => current.filter((entry) => entry.id !== entryId));
      if (savedEntryId === entryId) setSavedEntryId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete entry.");
    } finally {
      setDeletingEntryId(null);
    }
  }

  function toggleDictation() {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
      return;
    }
    const Recognition = recognitionConstructor();
    if (!Recognition) {
      setError("Voice dictation is not available in this browser. Type the entry for now.");
      return;
    }
    if (!voiceDisclosureAccepted) {
      const accepted = window.confirm(
        "Voice dictation uses your browser's speech recognition. Depending on your browser, audio may be processed by the browser provider. Continue?",
      );
      if (!accepted) return;
      setVoiceDisclosureAccepted(true);
    }
    const next = new Recognition();
    next.continuous = true;
    next.interimResults = true;
    next.lang = "en-US";
    next.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");
      setText(transcript);
      setSource("voice");
      setSavedEntryId(null);
    };
    next.onend = () => setIsListening(false);
    setRecognition(next);
    setIsListening(true);
    setError(null);
    next.start();
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-4 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
      <section className="space-y-5">
        <section className="rounded-lg border border-white/10 bg-card/80 p-3 sm:p-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {firstUseSteps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = activeStep === index || (!latestEntry && index === 0);
              const isDone = activeStep >= stepNumber;
              return (
                <div
                  key={step.label}
                  className={`rounded-lg border px-3 py-3 transition ${
                    isActive
                      ? "border-white/25 bg-white/[0.08]"
                      : isDone
                        ? "border-white/15 bg-white/[0.04]"
                        : "border-border bg-background/55"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-6 items-center justify-center rounded-full text-xs font-medium ${
                        isDone
                          ? "bg-foreground text-background"
                          : "border border-border text-muted-foreground"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="size-3.5" aria-hidden /> : stepNumber}
                    </span>
                    <p className="text-sm font-medium text-foreground">{step.label}</p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.note}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div
          className={`overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:p-5 ${
            hasEntries ? "hidden sm:block" : ""
          }`}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Sparkles className="size-4 text-foreground" aria-hidden />
                MindMirror
              </p>
              <div>
                <p className="text-sm text-muted-foreground">{greetingLabel()}</p>
                <h1 className="mt-2 max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  What keeps coming back today?
                </h1>
              </div>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Start with one thought. MindMirror saves it first, then shows the pattern it can
                actually recognise.
              </p>
            </div>
            <div className="relative flex min-h-56 w-full items-end justify-center rounded-lg border border-white/10 bg-background/80 p-4 sm:w-[21rem]">
              <div className="absolute left-4 top-4 max-w-[12rem] space-y-2">
                {mirrorChips.map((chip) => (
                  <span
                    key={chip}
                    className="mm-thought-chip block w-fit rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-muted-foreground"
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <BrainMirrorMascot active={isSaving || isRevealingMirror || Boolean(savedEntryId)} />
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-border bg-background/70 p-3">
            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>{evidenceProgress}/10 reflections</span>
              <span>{nextUnlockLabel(entries.length)}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-foreground transition-all"
                style={{ width: `${Math.max(evidenceProgress * 10, hasEntries ? 10 : 0)}%` }}
              />
            </div>
          </div>
        </div>

        <section className="rounded-lg border border-white/10 bg-card/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.32)] sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <AudioLines className="size-5 text-foreground" aria-hidden />
                Start voice reflection
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Speak the messy thought first. MindMirror saves it, then helps you question why it
                keeps returning.
              </p>
            </div>
            <span className="hidden rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground sm:inline-flex">
              {isListening
                ? "Listening"
                : characterCount > 0
                  ? `${characterCount} chars`
                  : "Private"}
            </span>
          </div>

          {isListening ? (
            <div className="mb-4 rounded-lg border border-white/15 bg-white/[0.04] p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <Mic className="size-6" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">Listening...</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Speak naturally. Your transcript will appear below when you pause.
                  </p>
                  <div className="mm-voice-bars mt-3" aria-hidden>
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setSource("text");
              setSavedEntryId(null);
            }}
            placeholder="I keep thinking about..."
            className="min-h-48 w-full resize-none rounded-lg border border-border bg-background/95 px-4 py-4 text-base leading-7 text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground focus:ring-2 focus:ring-white/10 sm:min-h-56"
          />

          {!hasEntries && characterCount === 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="rounded-full border border-border bg-background/70 px-3 py-2 text-left text-xs text-muted-foreground transition hover:border-white/25 hover:bg-white/[0.06] hover:text-foreground"
                  onClick={() => startFromPrompt(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
            <Button
              type="button"
              variant={isListening ? "outline" : "default"}
              className={`min-h-12 w-full ${
                isListening ? "border-border bg-transparent" : "bg-foreground text-background hover:bg-foreground/90"
              }`}
              onClick={toggleDictation}
            >
              {isListening ? (
                <MicOff className="size-4" aria-hidden />
              ) : (
                <Mic className="size-4" aria-hidden />
              )}
              {isListening ? "Listening... tap to stop" : "Dictate"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-h-12 w-full border-border bg-transparent hover:bg-white/10"
              disabled={!canSave}
              onClick={saveEntry}
            >
              {isSaving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="size-4" aria-hidden />
              )}
              {isSaving ? "Saving..." : "Mirror this"}
            </Button>
            <p className="min-h-5 text-xs text-muted-foreground sm:min-w-24 sm:text-right">
              {isListening
                ? "Browser voice"
                : characterCount > 0
                  ? `${characterCount} chars`
                  : "No rush"}
            </p>
          </div>

          {savedEntryId ? (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-3 py-2 text-sm leading-6 text-foreground">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>Saved. MindMirror is looking for the thought pattern.</p>
            </div>
          ) : null}
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Private to your account. If AI analysis is enabled, your entry may be processed by an
            AI provider only to generate your mirror and follow-up questions.
          </p>
          {error ? (
            <p className="mt-4 rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border border-border bg-card/65 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <BrainCircuit className="size-5 text-foreground" aria-hidden />
                Your mirror
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isRevealingMirror
                  ? "Comparing words, emotion, and possible thought pattern."
                  : latestEntry
                    ? "Latest read from your saved reflection."
                    : "Waiting for a reflection."}
              </p>
            </div>
            {latestEntry && !isRevealingMirror ? (
              <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                {latestEntry.analysis.confidence ?? "low"} confidence
              </span>
            ) : null}
          </div>

          {isLoading ? (
            <div className="rounded-lg border border-border bg-background/60 p-4 text-sm text-muted-foreground">
              Loading your mirror...
            </div>
          ) : isRevealingMirror ? (
            <div className="mm-reveal overflow-hidden rounded-lg border border-white/15 bg-white/[0.04] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex min-h-44 items-end justify-center rounded-lg border border-white/10 bg-background/70 px-8 pt-8 sm:w-64">
                  {mirrorChips.slice(0, 3).map((chip) => (
                    <span
                      key={chip}
                      className="mm-thought-chip absolute rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-muted-foreground first:left-4 first:top-4 [&:nth-child(2)]:right-5 [&:nth-child(2)]:top-10 [&:nth-child(3)]:left-8 [&:nth-child(3)]:top-20"
                    >
                      {chip}
                    </span>
                  ))}
                  <BrainMirrorMascot active compact />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Analysing
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    Finding what this thought keeps doing.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-background/60 p-3">
                  Saving raw thought
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-3">
                  Naming possible pattern
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-3">
                  Choosing next question
                </div>
              </div>
            </div>
          ) : latestEntry ? (
            <div className="mm-reveal">
              <div className="rounded-lg border border-white/15 bg-white/[0.04] p-4 sm:p-5">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Private mirror
                </p>
                <p className="mt-2 text-xl font-semibold leading-8 text-foreground">
                  {latestMirror?.privateMirror ?? latestEntry.analysis.summary}
                </p>
                {isGeneratingMirror ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    Reading for loops, context, and the next question...
                  </div>
                ) : null}

                <div className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Repeated thought loops
                    </p>
                    <div className="mt-2 space-y-2">
                      {(latestMirror?.repeatedThoughtLoops ?? [latestEntry.analysis.patternLabel]).map(
                        (loop) => (
                          <div
                            key={loop}
                            className="rounded-lg border border-border bg-background/60 px-3 py-2 text-sm leading-6 text-foreground"
                          >
                            {loop}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Emotional pattern
                    </p>
                    <p className="mt-2 rounded-lg border border-border bg-background/60 px-3 py-2 text-sm leading-6 text-foreground">
                      {latestMirror?.emotionalPattern ?? latestEntry.analysis.emotion}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Trigger / context
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {latestMirror?.triggerContext ??
                        (latestEntry.analysis.topics.length > 0
                          ? latestEntry.analysis.topics.join(", ")
                          : "Still forming from your saved reflections.")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      What you might be forgetting
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {latestMirror?.whatYouMightBeForgetting ?? latestEntry.analysis.note}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-border bg-background/60 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    One next action
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {latestMirror?.oneNextAction ??
                      mirrorField(
                        latestEntry.analysis.smallestAction,
                        "Save one more honest reflection when the thought returns.",
                      )}
                  </p>
                </div>

                <div className="mt-5 rounded-lg border border-white/15 bg-white/[0.04] p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Follow-up questions
                  </p>
                  <div className="mt-3 space-y-2">
                    {(latestMirror?.followUpQuestions ?? [latestQuestion]).map((question, index) => (
                      <button
                        key={question}
                        type="button"
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm leading-6 transition ${
                          activeQuestionIndex === index
                            ? "border-white/25 bg-white/[0.08] text-foreground"
                            : "border-border bg-background/60 text-muted-foreground hover:border-white/20 hover:text-foreground"
                        }`}
                        onClick={() => setSelectedQuestionIndex(index)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={followUpAnswer}
                    onChange={(event) => setFollowUpAnswer(event.target.value)}
                    placeholder="Answer the question honestly..."
                    className="mt-3 min-h-28 w-full resize-none rounded-lg border border-border bg-background/95 px-3 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground focus:ring-2 focus:ring-white/10"
                  />
                  <Button
                    type="button"
                    className="mt-3 min-h-11 w-full rounded-full bg-foreground px-5 text-background hover:bg-foreground/90 sm:w-auto"
                    disabled={isAnsweringFollowUp || followUpAnswer.trim().length < 10}
                    onClick={answerFollowUp}
                  >
                    {isAnsweringFollowUp ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Sparkles className="size-4" aria-hidden />
                    )}
                    {isAnsweringFollowUp ? "Going deeper..." : "Go one layer deeper"}
                  </Button>
                </div>

                {latestFollowUp ? (
                  <div className="mt-4 rounded-lg border border-white/15 bg-white/[0.06] p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Second-layer reflection
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      {latestFollowUp.response.reflection}
                    </p>
                    <div className="mt-3 rounded-lg border border-border bg-background/60 p-3">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Deeper question
                      </p>
                      <p className="mt-2 text-lg font-medium leading-7 text-foreground">
                        {latestFollowUp.response.deeperQuestion}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      Next: {latestFollowUp.response.oneNextAction}
                    </p>
                  </div>
                ) : null}

                <div className="mt-4 text-xs leading-5 text-muted-foreground">
                  Evidence: {latestEntry.analysis.signals.join(", ") || "still forming"}
                  {latestMirror ? ` · ${latestMirror.provider}` : ""}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="mt-5 min-h-12 w-full border-border bg-transparent hover:bg-white/10 sm:w-auto"
                  onClick={() => continueFromQuestion(latestQuestion)}
                >
                  Use this question as a new entry
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-background/55 p-5">
              <p className="text-sm font-medium text-foreground">Start ordinary.</p>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-3">
                <p>A thought you keep replaying.</p>
                <p>A decision you are avoiding.</p>
                <p>A feeling that keeps returning.</p>
              </div>
            </div>
          )}
        </section>

        <details className="group space-y-3 rounded-lg border border-border bg-card/45 p-4">
          <summary className="flex cursor-pointer list-none items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium text-foreground">Reflection history</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasEntries ? "Newest first" : "Your saved reflections collect here"}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {hasEntries ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"}` : "Open"}
            </span>
          </summary>
          <div className="mt-4 space-y-3">
            {!hasEntries && !isLoading ? (
              <div className="rounded-lg border border-border bg-card/45 p-4 text-sm leading-6 text-muted-foreground">
                No saved reflections yet.
              </div>
            ) : (
              entries.slice(0, 5).map((entry) => (
                <article
                  key={entry.id}
                  className={`rounded-lg border p-4 transition ${
                    entry.id === savedEntryId
                      ? "border-white/25 bg-white/[0.06]"
                      : "border-border bg-card/55"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" aria-hidden />
                      <span>{formatDate(entry.createdAt)}</span>
                      <span className="rounded-full border border-border bg-background/60 px-2 py-0.5">
                        {entry.source === "voice" ? "Voice" : "Text"}
                      </span>
                      {entry.id === savedEntryId ? (
                        <span className="rounded-full border border-white/20 bg-white/[0.06] px-2 py-0.5 text-foreground">
                          New
                        </span>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      disabled={deletingEntryId === entry.id}
                      aria-label="Delete entry"
                      onClick={() => deleteEntry(entry.id)}
                    >
                      {deletingEntryId === entry.id ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <Trash2 className="size-4" aria-hidden />
                      )}
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{entry.text}</p>
                </article>
              ))
            )}
          </div>
        </details>
      </section>

      <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block lg:self-start">
        <section className="rounded-lg border border-white/10 bg-card/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">Evidence ladder</h2>
            <span className="rounded-full border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground">
              {entries.length}/10
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {unlockSteps.map((step) => (
              <div
                key={step.label}
                className={`rounded-lg border p-3 ${
                  step.unlocked
                    ? "border-white/20 bg-white/[0.06]"
                    : "border-border bg-background/55"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{step.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.description}</p>
                  </div>
                  {step.unlocked ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                  ) : (
                    <CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{step.count} reflection{step.count === 1 ? "" : "s"}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card/70 p-4">
          <h2 className="text-sm font-semibold text-foreground">Repeated thoughts</h2>
          <div className="mt-3 space-y-2">
            {!earlySignalsUnlocked ? (
              <p className="text-sm leading-6 text-muted-foreground">
                Unlocks after 3 reflections. Until then, each entry gets one useful mirror.
              </p>
            ) : dashboard.patterns.length === 0 ? (
              <p className="text-sm leading-6 text-muted-foreground">More entries will sharpen this.</p>
            ) : (
              dashboard.patterns.map(([label, count]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background/70 px-3 py-2 text-sm"
                >
                  <span className="leading-6">{label}</span>
                  <span className="shrink-0 text-xs leading-6 text-muted-foreground">{count}x</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card/70 p-4">
          <h2 className="text-sm font-semibold text-foreground">Topics</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {!patternMapUnlocked ? (
              <p className="text-sm leading-6 text-muted-foreground">
                Pattern map unlocks at 10 reflections, with enough evidence to compare.
              </p>
            ) : dashboard.topics.length === 0 ? (
              <p className="text-sm text-muted-foreground">No topic evidence yet.</p>
            ) : (
              dashboard.topics.map(([topic, count]) => (
                <span
                  key={topic}
                  className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs leading-5 text-muted-foreground"
                >
                  {topic} · {count}
                </span>
              ))
            )}
          </div>
        </section>
      </aside>
    </main>
  );
}
