"use client";

import { cn } from "@/lib/utils";

type Props = {
  current: number;
  total: number;
  className?: string;
};

export function QuizProgressBar({ current, total, className }: Props) {
  const safeTotal = Math.max(1, total);
  const pct = Math.min(100, Math.round((Math.min(current, safeTotal) / safeTotal) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
        <span>Your progress</span>
        <span>
          {Math.min(current, safeTotal)} / {safeTotal}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
