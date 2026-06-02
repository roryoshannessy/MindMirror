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
      className="scroll-mt-20 border-t border-[#e6edf0] bg-white px-4 py-20 text-[#172120] sm:px-6 lg:py-24"
      aria-label="How it works"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-medium text-[#42615d]">Simple now. Deeper later.</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#172120] sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base leading-7 text-[#60706d]">{t("subtitle")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {steps.map(({ num, titleKey, bodyKey, Icon }) => (
            <div key={num} className="relative overflow-hidden rounded-2xl border border-[#dfe9e7] bg-[#f8fbfa] p-6 shadow-sm">
              <div className="mb-10 flex items-center justify-between">
                <span className="text-5xl font-semibold tabular-nums text-[#c3d8d4]">{num}</span>
                <span className="flex size-11 items-center justify-center rounded-xl border border-[#dfe9e7] bg-white">
                  <Icon className="size-5 text-[#42615d]" aria-hidden />
                </span>
              </div>
              <h3 className="font-semibold text-[#172120]">{t(titleKey)}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#60706d]">
                {t(bodyKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
