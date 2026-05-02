import { redirect } from "@/i18n/navigation";
import { hashResumeToken } from "@/lib/checkout-session";
import { getAdminDb } from "@/lib/firebase-admin";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
};

export default async function CheckoutRecoverPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const resumeToken = sp.token?.trim() ?? "";
  if (!resumeToken) {
    redirect({ href: "/pricing", locale });
  }

  const hash = hashResumeToken(resumeToken);
  const q = await getAdminDb()
    .collection("checkout_sessions")
    .where("resumeTokenHash", "==", hash)
    .limit(1)
    .get();

  if (q.empty) {
    redirect({ href: "/pricing", locale });
  }

  const id = q.docs[0]!.id;
  redirect({
    href: { pathname: "/checkout/review", query: { session: id } },
    locale,
  });
}
