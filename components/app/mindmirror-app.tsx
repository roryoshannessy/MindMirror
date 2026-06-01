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

function MirrorMark({ active }: { active: boolean }) {
  return (
    <div
      aria-hidden
      className={`relative h-20 w-20 shrink-0 rounded-full border border-white/15 bg-white text-black shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${
        active ? "animate-pulse" : ""
      }`}
    >
      <div className="absolute left-4 top-5 h-7 w-8 rounded-full border-2 border-black" />
      <div className="absolute left-8 top-5 h-7 w-8 rounded-full border-2 border-black" />
      <div className="absolute left-5 top-8 h-7 w-10 rounded-b-full border-x-2 border-b-2 border-black" />
      <div className="absolute bottom-4 right-3 h-8 w-8 rounded-full border-2 border-black bg-white" />
      <div className="absolute bottom-7 right-6 h-5 w-px rotate-45 bg-black" />
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save entry.");
    } finally {
      setIsSaving(false);
    }
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
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
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
            <MirrorMark active={isSaving || Boolean(savedEntryId)} />
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
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm leading-6 text-primary">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>Saved. Your latest mirror is ready.</p>
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
                {latestEntry ? "Latest read from your saved reflection." : "Waiting for a reflection."}
              </p>
            </div>
            {latestEntry ? (
              <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                {latestEntry.analysis.confidence ?? "low"} confidence
              </span>
            ) : null}
          </div>

          {isLoading ? (
            <div className="rounded-lg border border-border bg-background/60 p-4 text-sm text-muted-foreground">
              Loading your mirror...
            </div>
          ) : latestEntry ? (
            <div className="space-y-4">
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
                    ? "border-primary/45 bg-primary/10"
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
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-primary">
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
