"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { brand } from "@/config/brand";
import {
  QUIZ_DISPLAY_TOTAL_STEPS,
  QUIZ_NODES,
  QUIZ_START_NODE_ID,
  getNextNodeId,
  type QuizNode,
} from "@/config/quiz";

const STORAGE_KEY = `${brand.STORAGE_PREFIX}_quiz_context`;
const TTL_MS = 24 * 60 * 60 * 1000;

export type QuizPhase = "quiz" | "theater" | "results";

type QuizState = {
  sessionId: string;
  createdAt: number;
  phase: QuizPhase;
  /** Last entry is the active node when phase === "quiz". */
  nodeStack: string[];
  answers: Record<string, string | string[]>;
  firstName: string;
  email: string;
  leadCaptured: boolean;
  /**
   * True once quiz_started has been fired for this session. Persisted so
   * component remounts don't re-fire the event with the same sessionId.
   */
  quizStartedTracked: boolean;
};

type QuizActions = {
  ensureFreshSession: () => void;
  setAnswer: (nodeId: string, value: string | string[]) => void;
  setFirstName: (name: string) => void;
  setEmail: (email: string) => void;
  /** Advance after a choice or interstitial CTA; not used after email (use `enterTheater`). */
  goForward: () => void;
  goBack: () => void;
  enterTheater: () => void;
  enterResults: () => void;
  setLeadCaptured: (v: boolean) => void;
  setQuizStartedTracked: () => void;
  reset: () => void;
};

function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function newInitialState(): QuizState {
  return {
    sessionId: newSessionId(),
    createdAt: Date.now(),
    phase: "quiz",
    nodeStack: [QUIZ_START_NODE_ID],
    answers: {},
    firstName: "",
    email: "",
    leadCaptured: false,
    quizStartedTracked: false,
  };
}

function isExpired(createdAt: number): boolean {
  return Date.now() - createdAt > TTL_MS;
}

export const useQuizStore = create<QuizState & QuizActions>()(
  persist(
    (set, get) => ({
      ...newInitialState(),

      ensureFreshSession: () => {
        const s = get();
        if (isExpired(s.createdAt)) {
          set(newInitialState());
        }
      },

      setAnswer: (nodeId, value) => {
        set((st) => ({
          answers: { ...st.answers, [nodeId]: value },
        }));
      },

      setFirstName: (name) => {
        set({ firstName: name.trim().slice(0, 80) });
      },

      setEmail: (email) => {
        set({ email: email.trim().slice(0, 320) });
      },

      goForward: () => {
        const { nodeStack, answers, phase } = get();
        if (phase !== "quiz" || nodeStack.length === 0) return;
        const currentId = nodeStack[nodeStack.length - 1]!;
        const node = QUIZ_NODES[currentId];
        if (!node) return;

        if (node.kind === "gate_email") {
          return;
        }

        if (node.kind === "gate_name") {
          if (!get().firstName.trim()) return;
        }

        if (
          node.kind === "question_single" ||
          node.kind === "question_multi" ||
          node.kind === "question_binary"
        ) {
          const a = answers[currentId];
          const ok = Array.isArray(a) ? a.length > 0 : Boolean(a);
          if (!ok) return;
        }

        const nextId = getNextNodeId(node, { answers });
        if (!nextId) return;
        set({ nodeStack: [...nodeStack, nextId] });
      },

      goBack: () => {
        const { nodeStack, phase } = get();
        if (phase === "results") {
          return;
        }
        if (phase === "theater") {
          set({ phase: "quiz" });
          return;
        }
        if (nodeStack.length <= 1) return;
        set({ nodeStack: nodeStack.slice(0, -1) });
      },

      enterTheater: () => {
        const { phase, email, nodeStack } = get();
        if (phase !== "quiz" || !email.trim()) return;
        const last = nodeStack[nodeStack.length - 1];
        if (last !== "gate_email") return;
        set({ phase: "theater" });
      },

      enterResults: () => {
        set({ phase: "results" });
      },

      setLeadCaptured: (v) => set({ leadCaptured: v }),
      setQuizStartedTracked: () => set({ quizStartedTracked: true }),

      reset: () => set(newInitialState()),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // email and firstName are intentionally NOT persisted — they are PII and
      // only needed in memory during the active session. Persisting them would
      // expose the previous user's data on shared devices.
      partialize: (s) => ({
        sessionId: s.sessionId,
        createdAt: s.createdAt,
        phase: s.phase,
        nodeStack: s.nodeStack,
        answers: s.answers,
        leadCaptured: s.leadCaptured,
        quizStartedTracked: s.quizStartedTracked,
      }),
    },
  ),
);

export function getCurrentNodeId(state: Pick<QuizState, "nodeStack" | "phase">): string | null {
  if (state.phase !== "quiz" || state.nodeStack.length === 0) {
    return null;
  }
  return state.nodeStack[state.nodeStack.length - 1] ?? null;
}

export function isProgressNode(node: QuizNode | undefined): boolean {
  if (!node) return false;
  if (node.kind === "interstitial" || node.kind === "theater") return false;
  return node.progressStep !== false;
}

export function getProgressCount(nodeStack: string[]): { current: number; total: number } {
  let n = 0;
  for (const id of nodeStack) {
    if (isProgressNode(QUIZ_NODES[id])) n += 1;
  }
  return { current: n, total: QUIZ_DISPLAY_TOTAL_STEPS };
}
