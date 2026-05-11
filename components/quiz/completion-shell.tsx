"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getPostHog, initPostHog } from "@/lib/posthog";
import { QUIZ_ID, QUIZ_TESTIMONIALS, getInsightForRole, getPatternForStruggle } from "@/config/quiz";
import { getCatalog } from "@/config/commercial-catalog";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuizStore } from "@/stores/quiz-store";
import { PricingWall } from "./pricing-wall";

export function CompletionShell() {
  const tFaq = useTranslations("faq");
  const locale = useLocale();
  const firstName = useQuizStore((s) => s.firstName);
  const answers = useQuizStore((s) => s.answers);
  const sessionId = useQuizStore((s) => s.sessionId);
  const trackedRef = useRef(false);

  // Fire quiz_completed on the user reaching results — not on backend sync.
  // Lead capture (with full quiz data) already happened at the email gate.
  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    try {
      initPostHog();
      getPostHog().capture("quiz_completed", {
        quizId: QUIZ_ID,
        sessionId,
        locale,
      });
    } catch {
      /* optional */
    }
  }, [sessionId, locale]);

  const name = firstName.trim() || "there";
  const struggle = String(answers.q2_struggle ?? "");
  const role = String(answers.q1_role ?? "");
  const pattern = getPatternForStruggle(struggle);
  const insight = getInsightForRole(role);
  const defaultPlan = getCatalog().defaultPlanId;
  const primaryCheckout = `/checkout/email?planId=${encodeURIComponent(defaultPlan)}&session=quiz&qz=${encodeURIComponent(sessionId)}`;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-12 px-4 py-8 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6">
      <div className="text-center">
        <h1 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
          {name}, here&apos;s what your mind keeps doing.
        </h1>
      </div>

      <div className="grid gap-4">
        <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-lg">Your pattern</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{pattern.title}</p>
            <p className="leading-relaxed">{pattern.body}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{insight.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{insight.value}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:items-center">
        <Button asChild size="lg" className="w-full max-w-md self-center">
          <Link href={primaryCheckout}>Start your 7-day free trial — $0 today</Link>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Trusted by {brand.SOCIAL_PROOF_COUNT} founders and professionals
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Cancel anytime · No questions asked · Your data is yours
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-center text-lg font-semibold">What people say</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {QUIZ_TESTIMONIALS.map((x) => (
            <Card key={x.name} className="border-border/80">
              <CardContent className="pt-5 text-sm">
                <p className="text-muted-foreground">{x.quote}</p>
                <p className="mt-3 font-medium text-foreground">
                  {x.name}
                  <span className="block text-xs font-normal text-muted-foreground">{x.title}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-center text-lg font-semibold">FAQ</h2>
        <ul className="space-y-2">
          {([1, 2, 3, 4, 5] as const).map((n) => {
            const qk = `q${n}` as "q1" | "q2" | "q3" | "q4" | "q5";
            const ak = `a${n}` as "a1" | "a2" | "a3" | "a4" | "a5";
            return (
              <li key={n} className="rounded-lg border border-border/80 bg-card/50">
                <details className="group">
                  <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-foreground">
                    <span className="flex w-full items-center justify-between gap-2">
                      {tFaq(qk)}
                      <span className="text-muted-foreground transition group-open:rotate-90">▸</span>
                    </span>
                  </summary>
                  <div className="border-t border-border/60 px-4 pb-3 pt-0 text-sm text-muted-foreground">
                    {tFaq(ak)}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-6">
        <PricingWall showHeading />
        <div className="flex justify-center">
          <Button asChild size="lg" variant="default" className="min-w-[12rem]">
            <Link href={primaryCheckout}>Unlock MindMirror</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
