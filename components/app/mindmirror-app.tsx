"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AudioLines,
  BrainCircuit,
  CalendarDays,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  async function saveEntry() {
    const clean = text.trim();
    if (clean.length < 10) {
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
        body: JSON.stringify({ text: clean, source }),
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
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-4">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="size-4" aria-hidden />
            MindMirror workspace
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            What keeps coming back?
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Capture one honest reflection. MindMirror will keep the language careful while the
            evidence is still thin.
          </p>
        </div>

        <Card className="border-primary/25 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <AudioLines className="size-5 text-primary" aria-hidden />
              Capture a reflection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setSource("text");
                setSavedEntryId(null);
              }}
              placeholder="What has been taking up space in your mind today?"
              className="min-h-48 w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-base leading-7 text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary sm:text-sm sm:leading-6"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant={isListening ? "outline" : "default"}
                  className="w-full sm:w-auto"
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
                  className="w-full border-border bg-transparent sm:w-auto"
                  disabled={isSaving}
                  onClick={saveEntry}
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Plus className="size-4" aria-hidden />
                  )}
                  {isSaving ? "Saving..." : "Save reflection"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {isListening
                  ? "Listening through browser dictation"
                  : text.trim().length > 0
                    ? `${text.trim().length} characters`
                    : "Private by default"}
              </p>
            </div>
            {savedEntryId ? (
              <p className="rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
                Saved. Your dashboard has one more piece of evidence.
              </p>
            ) : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>

        {entries.length === 0 && !isLoading ? (
          <div className="grid gap-2 rounded-lg border border-border bg-card/50 p-4 text-sm text-muted-foreground sm:grid-cols-3">
            <p className="text-foreground">Start anywhere.</p>
            <p>A loop you keep replaying.</p>
            <p>A decision you are avoiding.</p>
          </div>
        ) : null}

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Recent entries</h2>
          {isLoading ? (
            <div className="rounded-lg border border-border bg-card/60 p-4 text-sm text-muted-foreground">
              Loading your mirror...
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-lg border border-border bg-card/60 p-4 text-sm leading-6 text-muted-foreground">
              Your first reflection will appear here with its early read.
            </div>
          ) : (
            entries.slice(0, 6).map((entry) => (
              <article
                key={entry.id}
                className={`rounded-lg border p-4 transition ${
                  entry.id === savedEntryId
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-card/60"
                }`}
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" aria-hidden />
                  <span>{formatDate(entry.createdAt)}</span>
                  <span className="rounded-full border border-border px-2 py-0.5">
                    {entry.source === "voice" ? "voice" : "text"}
                  </span>
                  {entry.id === savedEntryId ? (
                    <span className="rounded-full border border-primary/30 px-2 py-0.5 text-primary">
                      saved
                    </span>
                  ) : null}
                </div>
                <p className="text-sm leading-6 text-foreground">{entry.text}</p>
                <p className="mt-3 text-sm text-primary">
                  Early read: {entry.analysis.patternLabel}
                </p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Confidence: {entry.analysis.confidence ?? "low"}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 border-border bg-transparent px-2 text-xs text-muted-foreground"
                    disabled={deletingEntryId === entry.id}
                    onClick={() => deleteEntry(entry.id)}
                  >
                    {deletingEntryId === entry.id ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="size-3.5" aria-hidden />
                    )}
                    Delete
                  </Button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <Card className="border-border bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BrainCircuit className="size-5 text-primary" aria-hidden />
              Early signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm leading-6 text-muted-foreground">
              This view gets more useful with repetition. For now, treat it as a careful read of
              what is present, not a verdict.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Evidence</p>
                <p className="mt-1 text-2xl font-semibold">{entries.length}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {entries.length === 1 ? "entry" : "entries"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Emotion showing up</p>
                <p className="mt-1 text-sm font-medium">
                  {dashboard.emotions[0]?.[0] ?? "still forming"}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <p className="text-xs text-muted-foreground">Pattern hint</p>
                <p className="mt-1 text-sm font-medium">
                  {dashboard.patterns[0]?.[0] ?? "needs more entries"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground">Repeated hints</h3>
              <div className="mt-3 space-y-2">
                {dashboard.patterns.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    A few reflections will make this less noisy.
                  </p>
                ) : (
                  dashboard.patterns.map(([label, count]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <span>{label}</span>
                      <span className="text-muted-foreground">
                        seen {count} {count === 1 ? "time" : "times"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground">Topics in the evidence</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {dashboard.topics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No topic evidence yet.</p>
                ) : (
                  dashboard.topics.map(([topic, count]) => (
                    <span
                      key={topic}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                    >
                      {topic} · {count}
                    </span>
                  ))
                )}
              </div>
            </div>

            {dashboard.latest ? (
              <div className="rounded-lg border border-primary/25 bg-primary/10 p-4">
                <p className="text-xs font-medium text-primary">Latest early read</p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {dashboard.latest.analysis.summary}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Evidence: {dashboard.latest.analysis.signals.join(", ") || "still forming"}
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm text-foreground">Waiting for the first reflection.</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Once saved, MindMirror will show a cautious summary and the signals it used.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
