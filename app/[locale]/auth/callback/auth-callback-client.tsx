"use client";

import { useEffect, useState } from "react";
import { isSignInWithEmailLink } from "firebase/auth";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { completeMagicLinkSignIn } from "@/lib/auth";
import { getClientAuth } from "@/lib/firebase";
import { sanitizeReturnTo } from "@/lib/safe-return-to";

export function AuthCallbackClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const auth = getClientAuth();
    const href = window.location.href;

    if (!isSignInWithEmailLink(auth, href)) {
      toast.error(t("callback_invalid"));
      router.replace("/auth/login");
      return;
    }

    if (auth.currentUser) {
      const url = new URL(href);
      router.replace(sanitizeReturnTo(url.searchParams.get("returnTo") ?? "/"));
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const { returnTo } = await completeMagicLinkSignIn();
        if (cancelled) return;
        router.replace(returnTo);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : t("error_generic");
        setMessage(msg);
        toast.error(msg);
        router.replace("/auth/login");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, t]);

  return (
    <div className="mx-auto max-w-sm space-y-4 text-center">
      <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-muted" />
      <p className="text-sm text-muted-foreground">
        {message ?? t("callback_working")}
      </p>
    </div>
  );
}
