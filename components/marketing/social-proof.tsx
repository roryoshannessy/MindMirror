import { getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";

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
    <section className="border-t border-border bg-secondary/20 px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-foreground">
              <CheckCircle2 className="size-4 text-primary" aria-hidden />
              <span>{stat}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {quotes.map((quote, i) => (
            <blockquote
              key={i}
              className="bg-background p-5 text-sm leading-6 text-muted-foreground"
            >
              {quote}
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
