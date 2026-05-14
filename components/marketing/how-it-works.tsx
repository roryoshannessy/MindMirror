import { getTranslations } from "next-intl/server";

export async function HowItWorks() {
  const t = await getTranslations("how_it_works");

  const steps = [
    { num: "01", titleKey: "step1_title", bodyKey: "step1_body" },
    { num: "02", titleKey: "step2_title", bodyKey: "step2_body" },
    { num: "03", titleKey: "step3_title", bodyKey: "step3_body" },
  ] as const;

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 lg:py-28"
      aria-label="How it works"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ num, titleKey, bodyKey }) => (
            <div key={num} className="rounded-lg border border-border bg-card/40 p-6">
              <span className="text-4xl font-bold tabular-nums text-primary/40">{num}</span>
              <h3 className="mt-8 font-semibold text-foreground">{t(titleKey)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t(bodyKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
