"use client";

import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useLocale } from "next-intl";
import { getPostHog, initPostHog } from "@/lib/posthog";
import { QUIZ_ID, QUIZ_NODES, type InterstitialNode, type QuestionSingleNode } from "@/config/quiz";
import { Button } from "@/components/ui/button";
import {
  getCurrentNodeId,
  getProgressCount,
  useQuizStore,
} from "@/stores/quiz-store";
import { GateEmail } from "./gate-email";
import { GateName } from "./gate-name";
import { InterstitialCard } from "./interstitial-card";
import { CompletionShell } from "./completion-shell";
import { QuestionCard } from "./question-card";
import { QuizProgressBar } from "./progress-bar";
import { TheaterScreen } from "./theater-screen";

export function QuizExperience() {
  const locale = useLocale();
  const ensureFreshSession = useQuizStore((s) => s.ensureFreshSession);
  const phase = useQuizStore((s) => s.phase);
  const nodeStack = useQuizStore((s) => s.nodeStack);
  const firstName = useQuizStore((s) => s.firstName);
  const email = useQuizStore((s) => s.email);
  const answers = useQuizStore((s) => s.answers);
  const sessionId = useQuizStore((s) => s.sessionId);
  const quizStartedTracked = useQuizStore((s) => s.quizStartedTracked);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const setFirstName = useQuizStore((s) => s.setFirstName);
  const goForward = useQuizStore((s) => s.goForward);
  const goBack = useQuizStore((s) => s.goBack);
  const enterTheater = useQuizStore((s) => s.enterTheater);
  const enterResults = useQuizStore((s) => s.enterResults);
  const setQuizStartedTracked = useQuizStore((s) => s.setQuizStartedTracked);
  const currentId = useQuizStore((s) => getCurrentNodeId(s));

  useEffect(() => {
    ensureFreshSession();
  }, [ensureFreshSession]);

  // Fire quiz_started exactly once per session, guarded by persisted flag so
  // component remounts (navigation away and back) don't duplicate the event.
  useEffect(() => {
    if (quizStartedTracked) return;
    if (phase !== "quiz") return;
    try {
      initPostHog();
      getPostHog().capture("quiz_started", { quizId: QUIZ_ID, sessionId, locale });
    } catch {
      /* optional */
    }
    setQuizStartedTracked();
  }, [quizStartedTracked, phase, sessionId, locale, setQuizStartedTracked]);

  const progress = getProgressCount(nodeStack);
  const canBack = (phase === "quiz" && nodeStack.length > 1) || phase === "theater";
  const quizPayload = {
    quizId: QUIZ_ID,
    sessionId,
    path: nodeStack,
    answers,
    firstName: firstName.trim(),
  };

  if (phase === "theater") {
    const theater = QUIZ_NODES.theater;
    if (theater?.kind === "theater") {
      return (
        <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-10">
          <div className="mb-4 flex items-center">
            {canBack ? (
              <Button type="button" variant="ghost" size="icon" onClick={goBack} aria-label="Back">
                <ChevronLeft className="size-4" />
              </Button>
            ) : null}
          </div>
          <TheaterScreen node={theater} onComplete={enterResults} />
        </div>
      );
    }
  }

  if (phase === "results") {
    return <CompletionShell />;
  }

  if (!currentId) {
    return null;
  }

  const node = QUIZ_NODES[currentId];
  if (!node) {
    return <p className="px-4 text-sm text-destructive">Unknown quiz step. Reset and try again.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-10">
      <div className="mb-4 flex items-center justify-between gap-2">
        {canBack ? (
          <Button type="button" variant="ghost" size="icon" onClick={goBack} aria-label="Back">
            <ChevronLeft className="size-4" />
          </Button>
        ) : (
          <span className="w-10" />
        )}
      </div>

      {progress.total > 0 ? (
        <QuizProgressBar current={progress.current} total={progress.total} className="mb-6" />
      ) : null}

      {node.kind === "question_single" ? (
        <QuestionCard
          node={node as QuestionSingleNode}
          value={
            typeof answers[node.id] === "string" ? (answers[node.id] as string) : undefined
          }
          onSelect={(v) => {
            setAnswer(node.id, v);
            goForward();
          }}
        />
      ) : null}

      {node.kind === "interstitial" ? (
        <InterstitialCard
          node={node as InterstitialNode}
          onContinue={() => {
            goForward();
          }}
        />
      ) : null}

      {node.kind === "gate_name" ? (
        <GateName
          node={node}
          defaultName={firstName}
          onSubmit={(name) => {
            setFirstName(name);
            goForward();
          }}
        />
      ) : null}

      {node.kind === "gate_email" ? (
        <GateEmail
          node={node}
          defaultEmail={email}
          quizPayload={quizPayload as Record<string, unknown>}
          onSuccess={() => {
            enterTheater();
          }}
        />
      ) : null}
    </div>
  );
}
