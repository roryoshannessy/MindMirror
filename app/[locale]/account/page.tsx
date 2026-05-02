import { getTranslations } from "next-intl/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AccountPage() {
  const t = await getTranslations("account");

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("welcome_title")}</CardTitle>
          <CardDescription>{t("welcome_body")}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
