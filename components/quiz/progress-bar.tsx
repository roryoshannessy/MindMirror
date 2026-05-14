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
      <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          Question {Math.min(current, safeTotal)} of {safeTotal}
        </span>
        <span>
          about 60 sec
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
