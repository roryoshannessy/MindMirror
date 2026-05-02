import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthCallbackClient } from "./auth-callback-client";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("callback_title") };
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <AuthCallbackClient />
    </div>
  );
}
