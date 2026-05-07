import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isCheckoutSessionId } from "@/lib/checkout-session";
import { CheckoutReturnClient } from "./checkout-return-client";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session?: string; token?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("return_meta_title") };
}

export default async function CheckoutReturnPage({ searchParams }: Props) {
  const sp = await searchParams;
  const session = sp.session?.trim();
  const token = sp.token?.trim();
  if (!session || !isCheckoutSessionId(session)) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <CheckoutReturnClient checkoutSessionId={session} resumeToken={token} />
    </div>
  );
}
