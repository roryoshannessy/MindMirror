import { getTranslations } from "next-intl/server";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export async function SocialProof() {
  const t = await getTranslations("social_proof");

  const stats = [
    t("stat1"),
    t("stat2"),
    t("stat3"),
  ] as const;

  const quotes = [
    t("quote1"),
    t("quote2"),
    t("quote3"),
  ] as const;

  return (
    <section className="border-t border-[#e6edf0] bg-white px-4 py-14 text-[#172120] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-[#42615d]">
              <ShieldCheck className="size-4" aria-hidden />
              Clear funnel test
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#172120] sm:text-3xl">
              Simple enough to test.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#60706d]">
            The page has one job: help someone understand the promise, take the quiz, and decide whether early access is worth paying for.
          </p>
        </div>
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-2xl border border-[#dfe9e7] bg-[#f8fbfa] px-4 py-3 text-sm text-[#172120]"
            >
              <CheckCircle2 className="size-4 text-[#42615d]" aria-hidden />
              <span>{stat}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {quotes.map((quote, i) => (
            <blockquote
              key={i}
              className="rounded-2xl border border-[#dfe9e7] bg-white p-5 text-sm leading-6 text-[#60706d] shadow-sm"
            >
              {quote}
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
