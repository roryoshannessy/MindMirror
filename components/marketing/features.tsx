import { getTranslations } from "next-intl/server";

const featureKeys = ["f1", "f2", "f3", "f4", "f5", "f6"] as const;

const icons: Record<string, string> = {
  f1: "🎙",
  f2: "✍️",
  f3: "🔁",
  f4: "🪞",
  f5: "📈",
  f6: "🔒",
};

export async function Features() {
  const t = await getTranslations("features");

  return (
    <section
      id="features"
      className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6"
      aria-label="Features"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Everything you need to understand your own mind
          </h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((key) => (
            <div key={key} className="flex flex-col gap-3">
              <span className="text-2xl" aria-hidden>
                {icons[key]}
              </span>
              <h3 className="font-semibold text-foreground">{t(`${key}.title`)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(`${key}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
