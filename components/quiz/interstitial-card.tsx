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
    <Card className="mm-fade-up overflow-hidden rounded-[2rem] border-[#d6e6e1] bg-white/88 text-[#172120] shadow-[0_28px_90px_rgb(51_84_79/0.16)] backdrop-blur">
      <div className="h-px bg-gradient-to-r from-transparent via-[#7aa39c] to-transparent" />
      <CardHeader className="px-5 pt-6 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#42615d]">Pattern checkpoint</p>
        <CardTitle className="text-balance text-2xl font-semibold leading-tight text-[#172120]">
          {node.headline}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 sm:px-6">
        <p className="whitespace-pre-line text-base leading-8 text-[#60706d]">
          {node.body}
        </p>
      </CardContent>
      <CardFooter className="px-5 pb-6 sm:px-6">
        <Button
          type="button"
          className="w-full rounded-full bg-[#172120] text-white hover:bg-[#263533] sm:w-auto"
          size="lg"
          onClick={onContinue}
        >
          {node.ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
