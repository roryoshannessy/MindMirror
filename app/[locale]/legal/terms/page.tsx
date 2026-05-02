import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/metadata";
import { brand } from "@/config/brand";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildPageMetadata({
    title: t("terms_title"),
    description: t("terms_description"),
    path: "/legal/terms",
  });
}

export default async function TermsPage() {
  const t = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("terms_title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("terms_last_updated")}</p>
      </header>

      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-base [&_h2]:mt-8 [&_h2]:mb-3">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using {brand.NAME} (&ldquo;the Service&rdquo;), you agree to be bound
            by these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            {brand.NAME} is a voice-first journaling application that uses AI to detect thought
            patterns over time. The Service is provided as a subscription product. Features may
            change without notice.
          </p>
        </section>

        <section>
          <h2>3. Accounts and Eligibility</h2>
          <p>
            You must be at least 13 years old to use the Service. You are responsible for
            maintaining the confidentiality of your account credentials and for all activity under
            your account.
          </p>
        </section>

        <section>
          <h2>4. Subscriptions and Billing</h2>
          <p>
            Subscriptions are billed in advance on a recurring basis (monthly or annual). You
            authorize us to charge your payment method at the start of each billing period. Prices
            are listed at the time of purchase and may change with 30 days&rsquo; notice.
          </p>
          <p className="mt-3">
            Free trials, where offered, convert to paid subscriptions at the end of the trial
            period unless cancelled before the trial ends.
          </p>
        </section>

        <section>
          <h2>5. Cancellation and Refunds</h2>
          <p>
            You may cancel your subscription at any time from your account settings. Cancellation
            takes effect at the end of the current billing period. We do not provide refunds for
            partial billing periods except where required by law.
          </p>
        </section>

        <section>
          <h2>6. User Content</h2>
          <p>
            You retain ownership of all content you record and submit to the Service. By using the
            Service, you grant {brand.NAME} a limited licence to store and process your content
            solely to provide the Service. We do not sell or share your content with third parties.
          </p>
        </section>

        <section>
          <h2>7. Acceptable Use</h2>
          <p>
            You agree not to misuse the Service, attempt to gain unauthorised access, or use the
            Service for any unlawful purpose. We reserve the right to suspend or terminate accounts
            that violate these terms.
          </p>
        </section>

        <section>
          <h2>8. Disclaimer of Warranties</h2>
          <p>
            The Service is provided &ldquo;as is&rdquo; without warranties of any kind, express or
            implied. We do not guarantee that the Service will be error-free or uninterrupted.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, {brand.LEGAL_ENTITY} shall not be liable for
            any indirect, incidental, or consequential damages arising from your use of the Service.
            Our total liability shall not exceed the amount you paid us in the 12 months preceding
            the claim.
          </p>
        </section>

        <section>
          <h2>10. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the Service after changes
            constitutes acceptance. We will notify you of material changes by email or in-app
            notice.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            Questions about these terms? Contact us at{" "}
            <a
              href={`mailto:${brand.EMAIL_LEGAL}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {brand.EMAIL_LEGAL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
