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
    <Card className="mm-fade-up overflow-hidden rounded-[2rem] border-[#d6e6e1] bg-white/88 text-[#172120] shadow-[0_28px_90px_rgb(51_84_79/0.16)] backdrop-blur">
      <div className="h-px bg-gradient-to-r from-transparent via-[#7aa39c] to-transparent" />
      <CardHeader className="gap-3 px-5 pb-5 pt-7 sm:px-7 sm:pt-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#42615d]">Private quiz</p>
        <CardTitle className="text-balance text-2xl font-semibold leading-tight sm:text-3xl">
          {node.title}
        </CardTitle>
        {node.subtitle ? (
          <CardDescription className="text-base leading-7 text-[#60706d]">
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
                "group flex min-h-16 w-full items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left text-base font-medium transition-colors",
                selected
                  ? "border-[#172120] bg-[#172120] text-white shadow-[0_12px_36px_rgb(23_33_32/0.2)]"
                  : "border-[#dfe9e7] bg-[#f8fbfa] text-[#172120] hover:border-[#9fbdb7] hover:bg-white",
              )}
              onClick={() => onSelect(opt.value)}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md border text-xs tabular-nums",
                    selected
                      ? "border-white/40 bg-white/15 text-white"
                      : "border-[#dfe9e7] bg-white text-[#81908d]",
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
                    ? "border-white bg-white text-[#172120]"
                    : "border-[#9fb0ac] text-transparent group-hover:border-[#42615d]",
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
