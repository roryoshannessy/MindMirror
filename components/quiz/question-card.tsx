"use client";

import type { QuestionSingleNode } from "@/config/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  node: QuestionSingleNode;
  value: string | undefined;
  onSelect: (optionValue: string) => void;
};

export function QuestionCard({ node, value, onSelect }: Props) {
  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader className="gap-2">
        <CardTitle className="text-balance text-xl font-semibold leading-tight tracking-tight">
          {node.title}
        </CardTitle>
        {node.subtitle ? (
          <CardDescription className="text-sm text-muted-foreground">{node.subtitle}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="grid gap-2 px-6 pb-6">
        {node.options.map((opt) => {
          const selected = value === opt.value;
          return (
            <Button
              key={opt.value}
              type="button"
              variant={selected ? "default" : "secondary"}
              className={cn(
                "h-auto min-h-12 w-full justify-start whitespace-normal py-3 text-left text-sm",
                !selected && "bg-secondary/80",
              )}
              onClick={() => onSelect(opt.value)}
            >
              {opt.label}
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
