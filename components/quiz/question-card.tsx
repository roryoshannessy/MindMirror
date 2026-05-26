"use client";

import { Check } from "lucide-react";
import type { QuestionSingleNode } from "@/config/quiz";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  node: QuestionSingleNode;
  value: string | undefined;
  onSelect: (optionValue: string) => void;
};

export function QuestionCard({ node, value, onSelect }: Props) {
  return (
    <Card className="mm-fade-up overflow-hidden border-border bg-card/80 shadow-2xl">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <CardHeader className="gap-3 px-5 pb-5 pt-7 sm:px-7 sm:pt-8">
        <p className="text-xs font-medium uppercase text-primary">Answer privately</p>
        <CardTitle className="text-balance text-2xl font-semibold leading-tight sm:text-3xl">
          {node.title}
        </CardTitle>
        {node.subtitle ? (
          <CardDescription className="text-base leading-7 text-muted-foreground">
            {node.subtitle}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3 px-5 pb-7 sm:px-7">
        {node.options.map((opt, index) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={cn(
                "group flex min-h-16 w-full items-center justify-between gap-4 rounded-lg border px-4 py-4 text-left text-base font-medium transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_12px_36px_rgb(99_102_241/0.22)]"
                  : "border-border bg-background/80 text-foreground hover:border-primary/60 hover:bg-muted",
              )}
              onClick={() => onSelect(opt.value)}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md border text-xs tabular-nums",
                    selected
                      ? "border-primary-foreground/40 bg-primary-foreground/15 text-primary-foreground"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 text-pretty">{opt.label}</span>
              </span>
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border",
                  selected
                    ? "border-primary-foreground/70 bg-primary-foreground text-primary"
                    : "border-muted-foreground/40 text-transparent group-hover:border-primary",
                )}
                aria-hidden
              >
                <Check className="size-3.5" />
              </span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
