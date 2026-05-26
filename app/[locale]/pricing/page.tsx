import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { getCatalog } from "@/config/commercial-catalog";
import { buildPageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildPageMetadata({
    title: t("pricing_title"),
    description: t("pricing_description"),
    path: "/pricing",
  });
}

export default async function PricingPage() {
  const catalog = getCatalog();
  const t = await getTranslations("pricing");

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="mb-12 text-center">
        <p className="text-sm font-medium text-primary">Early access</p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-5xl">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t("subtitle")}</p>
      </header>
      <PricingPlans catalog={catalog} />
    </div>
  );
}
