import { getTranslations } from "next-intl/server";

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
    <section className="border-t border-border bg-secondary/30 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 grid gap-6 text-center sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div key={i} className="space-y-1">
              <p className="text-sm font-medium text-primary">{stat}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {quotes.map((quote, i) => (
            <blockquote
              key={i}
              className="rounded-xl border border-border bg-background p-5 text-sm italic text-muted-foreground"
            >
              {quote}
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
