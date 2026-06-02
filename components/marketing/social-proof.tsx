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
    <section className="border-t border-border bg-card/20 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <ShieldCheck className="size-4" aria-hidden />
              Clear product ladder
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
              Start useful. Get sharper.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            MindMirror should earn trust quickly: one thought gives a first read, then more evidence improves the map.
          </p>
        </div>
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground"
            >
              <CheckCircle2 className="size-4 text-primary" aria-hidden />
              <span>{stat}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {quotes.map((quote, i) => (
            <blockquote
              key={i}
              className="rounded-lg border border-border bg-background/80 p-5 text-sm leading-6 text-muted-foreground"
            >
              {quote}
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
