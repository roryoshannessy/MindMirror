import { getTranslations } from "next-intl/server";
import {
  AudioLines,
  Brain,
  ChartNoAxesColumnIncreasing,
  LockKeyhole,
  Search,
  Waypoints,
} from "lucide-react";

const featureKeys = ["f1", "f2", "f3", "f4", "f5", "f6"] as const;

const icons = {
  f1: AudioLines,
  f2: Search,
  f3: Waypoints,
  f4: Brain,
  f5: ChartNoAxesColumnIncreasing,
  f6: LockKeyhole,
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
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-medium text-primary">What MindMirror is testing</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Everything you need to understand your own mind
          </h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((key) => {
            const Icon = icons[key];
            return (
              <div key={key} className="bg-background p-6">
                <Icon className="size-5 text-primary" aria-hidden />
                <h3 className="mt-5 font-semibold text-foreground">{t(`${key}.title`)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t(`${key}.body`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
