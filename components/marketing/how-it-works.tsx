import { getTranslations } from "next-intl/server";
import { AudioLines, BrainCircuit, LayoutDashboard } from "lucide-react";

export async function HowItWorks() {
  const t = await getTranslations("how_it_works");

  const steps = [
    { num: "01", titleKey: "step1_title", bodyKey: "step1_body", Icon: AudioLines },
    { num: "02", titleKey: "step2_title", bodyKey: "step2_body", Icon: BrainCircuit },
    { num: "03", titleKey: "step3_title", bodyKey: "step3_body", Icon: LayoutDashboard },
  ] as const;

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 lg:py-28"
      aria-label="How it works"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Simple now. Deeper later.</p>
          <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ num, titleKey, bodyKey, Icon }) => (
            <div key={num} className="relative overflow-hidden rounded-lg border border-border bg-card/40 p-6">
              <div className="mb-10 flex items-center justify-between">
                <span className="text-5xl font-semibold tabular-nums text-primary/30">{num}</span>
                <span className="flex size-11 items-center justify-center rounded-lg border border-border bg-background">
                  <Icon className="size-5 text-primary" aria-hidden />
                </span>
              </div>
              <h3 className="font-semibold text-foreground">{t(titleKey)}</h3>
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
