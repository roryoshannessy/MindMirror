"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  LockKeyhole,
  Waypoints,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getPostHog, initPostHog } from "@/lib/posthog";
import { QUIZ_ID, QUIZ_TESTIMONIALS, getInsightForRole, getPatternForStruggle } from "@/config/quiz";
import { getCatalog } from "@/config/commercial-catalog";
import { formatPrice } from "@/lib/format-price";
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

  // Fire quiz_completed on the user reaching results, not on backend sync.
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
  const catalog = getCatalog();
  const primaryPlan =
    catalog.plans.find((plan) => plan.id === "mindmirror-monthly") ??
    catalog.plans.find((plan) => plan.id === catalog.defaultPlanId) ??
    catalog.plans[0];
  const primaryPlanId = primaryPlan?.id ?? catalog.defaultPlanId;
  const primaryPlanPrice = primaryPlan
    ? formatPrice(primaryPlan.amountCents, primaryPlan.currency)
    : "$12.99";
  const primaryCheckout = `/checkout/email?planId=${encodeURIComponent(primaryPlanId)}&session=quiz&qz=${encodeURIComponent(sessionId)}`;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 px-4 py-8 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-primary">Your sample profile</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold leading-tight sm:text-5xl">
          {name}, here&apos;s what your mind keeps doing.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
          This is a preview of the kind of pattern dashboard MindMirror is being built to create from real entries over time.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-primary/25 bg-card/80 shadow-2xl">
          <div className="h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <CardHeader className="pb-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-primary">
              <BrainCircuit className="size-4" aria-hidden />
              Pattern detected
            </div>
            <CardTitle className="text-2xl leading-tight sm:text-3xl">{pattern.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm text-muted-foreground">
            <p className="text-base leading-7">{pattern.body}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background/80 p-4">
                <p className="text-xs text-muted-foreground">Signal</p>
                <p className="mt-2 font-medium text-foreground">repeated thought loop</p>
              </div>
              <div className="rounded-lg border border-border bg-background/80 p-4">
                <p className="text-xs text-muted-foreground">Area</p>
                <p className="mt-2 font-medium text-foreground">decisions and momentum</p>
              </div>
              <div className="rounded-lg border border-border bg-background/80 p-4">
                <p className="text-xs text-muted-foreground">Next</p>
                <p className="mt-2 font-medium text-foreground">watch it over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/70">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2 text-sm text-primary">
              <Waypoints className="size-4" aria-hidden />
              Role insight
            </div>
            <CardTitle className="text-xl">{insight.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-muted-foreground">{insight.value}</p>
            <div className="rounded-lg border border-border bg-background/80 p-4">
              <p className="text-xs text-muted-foreground">Dashboard direction</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                Voice entries, habits, goals, and patterns in one place.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 bg-background/80">
          <CardContent className="pt-6">
            <Activity className="size-5 text-emerald-300" aria-hidden />
            <p className="mt-3 text-sm font-medium text-foreground">Built around real entries</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The full product direction starts with voice and expands from there.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-background/80">
          <CardContent className="pt-6">
            <CheckCircle2 className="size-5 text-primary" aria-hidden />
            <p className="mt-3 text-sm font-medium text-foreground">Waitlist-only checkout</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              You are testing early access demand, not buying a live app today.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 bg-background/80">
          <CardContent className="pt-6">
            <LockKeyhole className="size-5 text-amber-200" aria-hidden />
            <p className="mt-3 text-sm font-medium text-foreground">Data stays yours</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Privacy, export, and ownership stay core to the product direction.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-border bg-card/70 p-5 text-center shadow-2xl sm:p-6">
        <h2 className="text-xl font-semibold text-foreground">Join the early-access waitlist</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          If this pattern feels useful, reserve early access. This checkout is refundable and does not unlock a live app today.
        </p>
        <div className="mt-5 flex flex-col items-stretch gap-3 sm:items-center">
          <Button asChild size="lg" className="w-full max-w-md self-center">
            <Link href={primaryCheckout}>
              Join early access - refundable {primaryPlanPrice}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Early-access demand test. Waitlist only. Your data is yours.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-center text-lg font-semibold">What people want MindMirror to solve</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {QUIZ_TESTIMONIALS.map((x) => (
            <Card key={x.name} className="border-border/80 bg-background/80">
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
            <Link href={primaryCheckout}>Join early access</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
