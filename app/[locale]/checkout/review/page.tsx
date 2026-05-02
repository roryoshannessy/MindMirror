import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPlanById } from "@/config/commercial-catalog";
import { checkoutSessionRef } from "@/lib/checkout-session";
import { CheckoutReviewClient } from "./checkout-review-client";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("review_meta_title") };
}

export default async function CheckoutReviewPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sessionId = sp.session?.trim();
  if (!sessionId?.startsWith("chk_")) notFound();

  const snap = await checkoutSessionRef(sessionId).get();
  if (!snap.exists) notFound();
  const data = snap.data()!;
  const plan = getPlanById(data.planId as string);
  if (!plan) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <CheckoutReviewClient
        sessionId={sessionId}
        plan={plan}
        email={data.email as string}
      />
    </div>
  );
}
