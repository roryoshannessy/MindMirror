import { getTranslations } from "next-intl/server";
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function AccountWelcomePage() {
  const t = await getTranslations("account");

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("welcome_purchase_title")}</CardTitle>
          <CardDescription>{t("welcome_purchase_body")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/account">Try your first mirror</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
