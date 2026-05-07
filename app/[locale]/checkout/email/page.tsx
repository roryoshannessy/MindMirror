import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CheckoutEmailClient } from "./checkout-email-client";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ planId?: string; session?: string; qz?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("email_meta_title") };
}

export default async function CheckoutEmailPage({ searchParams }: Props) {
  const sp = await searchParams;
  const planId = sp.planId?.trim() ?? "";
  const sessionSource = sp.session?.trim() ?? "pricing";
  const quizSessionId = sp.qz?.trim() ?? null;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <CheckoutEmailClient
        planId={planId}
        sessionSource={sessionSource}
        quizSessionId={quizSessionId}
      />
    </div>
  );
}
