import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("login_title") };
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <Suspense
        fallback={
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        }
      >
        <LoginForm mode="login" />
      </Suspense>
    </div>
  );
}
