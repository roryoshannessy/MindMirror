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
    <Card className="border-border bg-card shadow-xl">
      <CardHeader className="gap-3 px-5 pb-4 pt-6 sm:px-6">
        <CardTitle className="text-balance text-2xl font-semibold leading-tight">
          {node.title}
        </CardTitle>
        {node.subtitle ? (
          <CardDescription className="text-base leading-7 text-muted-foreground">
            {node.subtitle}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-3 px-5 pb-6 sm:px-6">
        {node.options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={cn(
                "group flex min-h-14 w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-left text-base font-medium transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/60 hover:bg-muted",
              )}
              onClick={() => onSelect(opt.value)}
            >
              <span className="min-w-0 text-pretty">{opt.label}</span>
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
