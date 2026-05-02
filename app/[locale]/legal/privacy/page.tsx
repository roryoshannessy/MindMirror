import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/lib/metadata";
import { brand } from "@/config/brand";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return buildPageMetadata({
    title: t("privacy_title"),
    description: t("privacy_description"),
    path: "/legal/privacy",
  });
}

export default async function PrivacyPage() {
  const t = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("privacy_title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("privacy_last_updated")}</p>
      </header>

      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-muted-foreground [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:text-base [&_h2]:mt-8 [&_h2]:mb-3">
        <section>
          <h2>1. What We Collect</h2>
          <p>We collect the following information when you use the Service:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">Account information:</strong> email address, and
              name (if provided during sign-up).
            </li>
            <li>
              <strong className="text-foreground">Journal entries:</strong> voice recordings and
              their transcriptions that you submit to the Service.
            </li>
            <li>
              <strong className="text-foreground">Usage data:</strong> pages visited, features used,
              and device/browser information for analytics purposes.
            </li>
            <li>
              <strong className="text-foreground">Payment information:</strong> billing details are
              processed by Stripe and are not stored by us.
            </li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Provide and improve the Service.</li>
            <li>Transcribe and analyse your journal entries to detect patterns.</li>
            <li>Send transactional emails (sign-in links, receipts).</li>
            <li>Understand how users engage with the product (aggregated analytics).</li>
          </ul>
        </section>

        <section>
          <h2>3. Your Journal Entries Are Private</h2>
          <p>
            Your voice recordings and transcriptions are private to your account. We do not read,
            sell, or share your journal content with third parties. AI processing of your entries
            occurs to power the pattern detection feature and for no other purpose.
          </p>
        </section>

        <section>
          <h2>4. Third-Party Services</h2>
          <p>We use the following third-party services to operate {brand.NAME}:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">Firebase (Google):</strong> authentication and
              database storage.
            </li>
            <li>
              <strong className="text-foreground">Stripe:</strong> payment processing. Stripe&rsquo;s
              privacy policy governs payment data.
            </li>
            <li>
              <strong className="text-foreground">Resend:</strong> transactional email delivery.
            </li>
            <li>
              <strong className="text-foreground">PostHog:</strong> product analytics (no personally
              identifiable data is shared).
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies for authentication (session cookies) and
            analytics. We use Meta Pixel for advertising attribution. You can disable tracking via
            your browser settings; this will not affect core functionality.
          </p>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We retain your account and journal data for as long as your account is active. If you
            delete your account, your data is removed within 30 days except where retention is
            required by law.
          </p>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your account and data.</li>
            <li>Export your journal entries at any time from your account settings.</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{" "}
            <a
              href={`mailto:${brand.EMAIL_SUPPORT}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {brand.EMAIL_SUPPORT}
            </a>
            .
          </p>
        </section>

        <section>
          <h2>8. Security</h2>
          <p>
            We implement industry-standard security measures including encryption in transit (TLS)
            and at rest. No method of transmission over the internet is 100% secure; we cannot
            guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>9. Children</h2>
          <p>
            The Service is not directed to children under 13. We do not knowingly collect personal
            information from children. If you believe a child has provided us with their
            information, contact us and we will delete it.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material
            changes by email or by displaying a notice in the app. Continued use of the Service
            after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            Questions about this policy? Contact us at{" "}
            <a
              href={`mailto:${brand.EMAIL_SUPPORT}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {brand.EMAIL_SUPPORT}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
