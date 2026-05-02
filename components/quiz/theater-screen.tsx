"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { TheaterNode } from "@/config/quiz";

type Props = {
  node: TheaterNode;
  onComplete: () => void;
};

export function TheaterScreen({ node, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const onDoneRef = useRef(onComplete);

  useLayoutEffect(() => {
    onDoneRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const done = { cancelled: false };
    (async function run() {
      for (let i = 0; i < node.steps.length; i++) {
        if (done.cancelled) return;
        setIndex(i);
        const ms = node.steps[i]?.durationMs ?? 0;
        await new Promise((r) => setTimeout(r, ms));
      }
      if (!done.cancelled) {
        onDoneRef.current();
      }
    })();
    return () => {
      done.cancelled = true;
    };
  }, [node.id, node.steps]);

  return (
    <div
      className="flex min-h-[min(100dvh,640px)] flex-col items-center justify-center gap-8 px-4 py-12"
      style={{ minHeight: "50vh" }}
    >
      <div className="relative h-16 w-16">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <div className="min-h-24 w-full max-w-md text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={node.steps[index]?.id ?? index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-base font-medium text-foreground sm:text-lg"
          >
            {node.steps[index]?.text ?? ""}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
