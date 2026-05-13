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
    <Card className="border-border bg-card shadow-xl">
      <CardHeader className="px-5 pt-6 sm:px-6">
        <CardTitle className="text-balance text-2xl font-semibold leading-tight text-foreground">
          {node.headline}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 sm:px-6">
        <p className="whitespace-pre-line text-base leading-8 text-muted-foreground">
          {node.body}
        </p>
      </CardContent>
      <CardFooter className="px-5 pb-6 sm:px-6">
        <Button type="button" className="w-full sm:w-auto" size="lg" onClick={onContinue}>
          {node.ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
