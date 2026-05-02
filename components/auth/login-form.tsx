"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { signInWithGoogle, sendAuthMagicLink } from "@/lib/auth";
import { sanitizeReturnTo } from "@/lib/safe-return-to";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CloudflareTurnstile,
  type CloudflareTurnstileHandle,
} from "@/components/turnstile/cloudflare-turnstile";

const schema = z.object({
  email: z.string().email().max(320),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  mode: "login" | "signup";
};

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

export function LoginForm({ mode }: Props) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));
  const turnstileRef = useRef<CloudflareTurnstileHandle>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      let turnstileToken: string | undefined;
      if (turnstileSiteKey) {
        turnstileToken = turnstileRef.current?.getToken();
        if (!turnstileToken) {
          toast.error(t("turnstile_required"));
          return;
        }
      }
      await sendAuthMagicLink(
        data.email,
        returnTo,
        mode === "signup" ? "signup" : "login",
        locale,
        turnstileToken,
      );
      toast.success(t("magic_link_sent"));
      turnstileRef.current?.reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("error_generic"));
    }
  };

  const onGoogle = async () => {
    try {
      await signInWithGoogle(locale);
      toast.success(t("signed_in"));
      router.replace(returnTo);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("error_generic"));
    }
  };

  return (
    <Card className="mx-auto w-full max-w-sm border-border shadow-none">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {mode === "signup" ? t("signup_title") : t("login_title")}
        </CardTitle>
        <CardDescription>
          {mode === "signup" ? t("signup_subtitle") : t("login_subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          type="button"
          variant="outline"
          className="w-full border-border bg-transparent"
          onClick={onGoogle}
        >
          {t("continue_google")}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">{t("or_email")}</span>
          </div>
        </div>

        {/* eslint-disable-next-line react-hooks/refs */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email_label")}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="h-10 rounded-lg bg-background"
              placeholder={t("email_placeholder")}
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          {turnstileSiteKey ? <CloudflareTurnstile ref={turnstileRef} /> : null}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("sending") : t("send_magic_link")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
