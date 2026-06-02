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
import type { ReflectionAnalysis, ReflectionSource } from "@/lib/app-patterns";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

type JournalEntry = {
  id: string;
  text: string;
  source: ReflectionSource;
  analysis: ReflectionAnalysis;
  createdAt: string;
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
        <path className="mm-brain-line" d="M75 54c14 1 22 9 23 22" />
        <path className="mm-brain-line" d="M121 45c-10 7-14 17-11 30" />
        <path className="mm-brain-line" d="M139 75c-13 0-22 6-27 18" />
        <path className="mm-brain-line" d="M78 96c9-7 21-8 34-3" />
        <path className="mm-brain-line" d="M111 105c3 13 11 21 24 24" />
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
  const [isRevealingMirror, setIsRevealingMirror] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voiceDisclosureAccepted, setVoiceDisclosureAccepted] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionLike | null>(null);

  const cleanText = text.trim();
  const characterCount = cleanText.length;
  const hasEntries = entries.length > 0;
  const canSave = characterCount >= 10 && !isSaving;
  const starterPrompts = [
    "The thought that keeps coming back is...",
    "I feel stuck because...",
    "The decision I keep avoiding is...",
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
  const evidenceProgress = Math.min(entries.length, 10);
  const patternMapUnlocked = entries.length >= 10;
  const earlySignalsUnlocked = entries.length >= 3;
  const thoughtChips =
    latestEntry?.analysis.signals.slice(0, 3).filter(Boolean) ??
    (cleanText.length > 0 ? cleanText.split(/\s+/).filter((word) => word.length > 4).slice(0, 3) : []);
  const mirrorChips = thoughtChips.length > 0 ? thoughtChips : ["thought", "loop", "mirror"];
  const unlockSteps = [
    {
      count: 1,
      description: "Single-entry loop, cost, question, and next action.",
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save entry.");
    } finally {
      setIsSaving(false);
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
    <main className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
      <section className="space-y-5">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:p-5">
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
                Start with one thought. MindMirror saves it first, then shows the loop it can
                actually see.
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
                Capture
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                What has been taking up space in your mind?
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

          <textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setSource("text");
              setSavedEntryId(null);
            }}
            placeholder="I keep thinking about..."
            className="min-h-64 w-full resize-none rounded-lg border border-border bg-background/95 px-4 py-4 text-base leading-7 text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground focus:ring-2 focus:ring-white/10 sm:min-h-56"
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
              {isListening ? "Stop dictation" : "Dictate"}
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
              <p>Saved. MindMirror is looking for the loop.</p>
            </div>
          ) : null}
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
                Mirror
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isRevealingMirror
                  ? "Comparing words, emotion, and possible loop."
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
                    Finding what this thought is doing.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-background/60 p-3">
                  Saving raw thought
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-3">
                  Naming possible loop
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-3">
                  Choosing next question
                </div>
              </div>
            </div>
          ) : latestEntry ? (
            <div className="mm-reveal space-y-4">
              <div className="rounded-lg border border-white/15 bg-white/[0.04] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Possible loop
                </p>
                <p className="mt-2 text-xl font-semibold leading-8 text-foreground">
                  {latestEntry.analysis.patternLabel}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {latestEntry.analysis.summary}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-border bg-background/70 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Cost
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {mirrorField(
                      latestEntry.analysis.loopCost,
                      "This may be costing attention, momentum, or emotional energy.",
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/70 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Question
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {mirrorField(
                      latestEntry.analysis.nextQuestion,
                      "What is the one thought you would want MindMirror to remember from this?",
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background/70 p-3">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Next
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {mirrorField(
                      latestEntry.analysis.smallestAction,
                      "Save one more honest reflection when the thought returns.",
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background/60 p-3 text-xs leading-5 text-muted-foreground">
                Evidence: {latestEntry.analysis.signals.join(", ") || "still forming"}
              </div>

              <div className="rounded-lg border border-white/15 bg-white/[0.04] p-4">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Continue the thread
                </p>
                <p className="mt-2 text-base font-medium leading-7 text-foreground">
                  {mirrorField(
                    latestEntry.analysis.nextQuestion,
                    "Where does this show up outside this reflection?",
                  )}
                </p>
                <Button
                  type="button"
                  className="mt-4 min-h-11 rounded-full bg-foreground px-5 text-background hover:bg-foreground/90"
                  onClick={() =>
                    continueFromQuestion(
                      mirrorField(
                        latestEntry.analysis.nextQuestion,
                        "Where does this show up outside this reflection?",
                      ),
                    )
                  }
                >
                  Answer this next
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-background/55 p-5">
              <p className="text-sm font-medium text-foreground">Start ordinary.</p>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground sm:grid-cols-3">
                <p>A loop you keep replaying.</p>
                <p>A decision you are avoiding.</p>
                <p>A feeling that keeps returning.</p>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium text-foreground">Entries</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {hasEntries ? "Newest first" : "Your saved reflections collect here"}
              </p>
            </div>
            {hasEntries ? (
              <p className="text-xs text-muted-foreground">
                {entries.length} {entries.length === 1 ? "entry" : "entries"}
              </p>
            ) : null}
          </div>

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
        </section>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
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
          <h2 className="text-sm font-semibold text-foreground">Repeated hints</h2>
          <div className="mt-3 space-y-2">
            {!earlySignalsUnlocked ? (
              <p className="text-sm leading-6 text-muted-foreground">
                Unlocks after 3 reflections. Until then, each entry gets a single mirror.
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
