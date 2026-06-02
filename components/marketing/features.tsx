import { getTranslations } from "next-intl/server";
import {
  AudioLines,
  Brain,
  ChartNoAxesColumnIncreasing,
  LockKeyhole,
  Search,
  Sparkles,
  Waypoints,
} from "lucide-react";
import { cn } from "@/lib/utils";

const featureKeys = ["f1", "f2", "f3", "f4", "f5", "f6"] as const;

const icons = {
  f1: AudioLines,
  f2: Search,
  f3: Waypoints,
  f4: Brain,
  f5: ChartNoAxesColumnIncreasing,
  f6: LockKeyhole,
};

const cardStyles = {
  f1: "lg:col-span-2",
  f2: "",
  f3: "",
  f4: "lg:row-span-2",
  f5: "lg:col-span-2",
  f6: "",
} as const;

export async function Features() {
  const t = await getTranslations("features");

  return (
    <section
      id="features"
      className="scroll-mt-20 border-t border-border bg-card/10 px-4 py-20 sm:px-6 lg:py-28"
      aria-label="Features"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" aria-hidden />
            What MindMirror does first
          </p>
          <h2 className="mt-5 text-balance text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
            Less diary. More mirror.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            The first product loop is simple: capture what is on your mind, show the possible pattern, then ask the next useful question.
          </p>
          <div className="mt-7 rounded-lg border border-border bg-background/70 p-4 text-sm leading-6 text-muted-foreground">
            MindMirror gets sharper as it has more evidence. One reflection is a first read; ten reflections begin a clearer map.
          </div>
        </div>
        <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((key) => {
            const Icon = icons[key];
            return (
              <div
                key={key}
                className={cn(
                  "group relative overflow-hidden rounded-lg border border-border bg-background/80 p-6 transition-colors hover:border-primary/40",
                  cardStyles[key],
                )}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-card">
                  <Icon className="size-5 text-primary" aria-hidden />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{t(`${key}.title`)}</h3>
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
