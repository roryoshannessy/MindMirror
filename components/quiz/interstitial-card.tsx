"use client";

import type { InterstitialNode } from "@/config/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  node: InterstitialNode;
  onContinue: () => void;
};

export function InterstitialCard({ node, onContinue }: Props) {
  return (
    <Card className="border-border bg-card/80 shadow-lg">
      <CardHeader>
        <CardTitle className="text-balance text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
          {node.headline}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
          {node.body}
        </p>
      </CardContent>
      <CardFooter>
        <Button type="button" className="w-full sm:w-auto" size="lg" onClick={onContinue}>
          {node.ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
