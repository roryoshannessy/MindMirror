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
      className="scroll-mt-20 border-t border-border px-4 py-20 sm:px-6 lg:py-28"
      aria-label="Features"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">What MindMirror is testing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything you need to understand your own mind
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            The promise is simple: capture what you say, spot what repeats, and show the pattern clearly enough to act on it.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((key) => {
            const Icon = icons[key];
            return (
              <div
                key={key}
                className="rounded-lg border border-border bg-card/50 p-6 transition-colors hover:border-primary/40"
              >
                <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-background">
                  <Icon className="size-5 text-primary" aria-hidden />
                </div>
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
