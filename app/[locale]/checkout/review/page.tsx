import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPlanById } from "@/config/commercial-catalog";
import { checkoutSessionRef, isCheckoutSessionId } from "@/lib/checkout-session";
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
  if (!sessionId || !isCheckoutSessionId(sessionId)) notFound();

  const snap = await checkoutSessionRef(sessionId).get();
  if (!snap.exists) notFound();
  const data = snap.data()!;
  const planId = typeof data.planId === "string" ? data.planId : null;
  const email = typeof data.email === "string" ? data.email : null;
  if (!planId || !email) notFound();

  const plan = getPlanById(planId);
  if (!plan) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <CheckoutReviewClient
        sessionId={sessionId}
        plan={plan}
        email={email}
      />
    </div>
  );
}
