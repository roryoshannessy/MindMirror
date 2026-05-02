import { getTranslations } from "next-intl/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = { searchParams: Promise<{ reason?: string }> };

export default async function AccountBillingPage({ searchParams }: Props) {
  const sp = await searchParams;
  const t = await getTranslations("account");

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("billing_title")}</CardTitle>
          <CardDescription>
            {sp.reason === "already_subscribed"
              ? t("billing_already_subscribed")
              : t("welcome_body")}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
