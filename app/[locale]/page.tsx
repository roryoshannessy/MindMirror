import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ProductWorkflow } from "@/components/marketing/product-workflow";
import { Features } from "@/components/marketing/features";
import { ProfessionalGuidance } from "@/components/marketing/professional-guidance";
import { Faq } from "@/components/marketing/faq";
import { CtaBanner } from "@/components/marketing/cta-banner";
import { buildPageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildPageMetadata({
    title: t("home_title"),
    description: t("home_description"),
    path: "/",
    absoluteTitle: true,
  });
}

export default function Home() {
  return (
    <>
      <ProductWorkflow />
      <Features />
      <ProfessionalGuidance />
      <Faq />
      <CtaBanner />
    </>
  );
}
