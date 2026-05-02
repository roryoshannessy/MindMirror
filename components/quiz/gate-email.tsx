"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale } from "next-intl";
import { z } from "zod";
import type { GateEmailNode } from "@/config/quiz";
import { QUIZ_ID } from "@/config/quiz";
import { submitLeadCapture } from "@/lib/lead-capture-client";
import { getPostHog, initPostHog } from "@/lib/posthog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CloudflareTurnstile,
  type CloudflareTurnstileHandle,
} from "@/components/turnstile/cloudflare-turnstile";
import { useQuizStore } from "@/stores/quiz-store";

const schema = z.object({
  email: z.string().email("Enter a valid email").max(320),
});

type Form = z.infer<typeof schema>;

type Props = {
  node: GateEmailNode;
  defaultEmail: string;
  quizPayload: Record<string, unknown>;
  onSuccess: () => void;
};

export function GateEmail({ node, defaultEmail, quizPayload, onSuccess }: Props) {
  const locale = useLocale();
  const setEmailStore = useQuizStore((s) => s.setEmail);
  const setLeadCaptured = useQuizStore((s) => s.setLeadCaptured);
  const sessionId = useQuizStore((s) => s.sessionId);
  const [formError, setFormError] = useState<string | null>(null);
  const turnstileRef = useRef<CloudflareTurnstileHandle>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: defaultEmail || "" },
  });

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{node.title}</CardTitle>
        <CardDescription>{node.subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          // eslint-disable-next-line
          onSubmit={handleSubmit(async (data) => {
            setFormError(null);
            setEmailStore(data.email);

            const turnstileToken = turnstileRef.current?.getToken();

            const res = await submitLeadCapture({
              email: data.email,
              source: "quiz",
              locale,
              turnstileToken,
              quiz: {
                ...quizPayload,
                stage: "complete",
                completed: true,
              },
            });

            if (!res.ok) {
              turnstileRef.current?.reset();
              setFormError(res.error ?? "Could not save. Try again.");
              return;
            }

            setLeadCaptured(true);
            try {
              initPostHog();
              getPostHog().capture("email_captured", {
                source: "quiz",
                quizId: QUIZ_ID,
                sessionId,
              });
            } catch {
              /* optional */
            }
            onSuccess();
          })}
          className="flex flex-col gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="quiz-email">Email</Label>
            <Input
              id="quiz-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder={node.placeholder}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
            {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          </div>

          <CloudflareTurnstile ref={turnstileRef} />

          <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto">
            {isSubmitting ? "Saving…" : "Unlock my pattern"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
