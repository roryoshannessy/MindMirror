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
      className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6"
      aria-label="How it works"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {steps.map(({ num, titleKey, bodyKey }) => (
            <div key={num} className="flex flex-col gap-4">
              <span className="text-4xl font-bold tabular-nums text-primary/30">{num}</span>
              <h3 className="font-semibold text-foreground">{t(titleKey)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(bodyKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
