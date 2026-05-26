import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function CtaBanner() {
  const checks = ["60-second quiz", "pattern preview", "waitlist clarity"] as const;

  return (
    <section className="border-t border-border bg-card/20 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-lg border border-border bg-background">
        <div className="grid items-center gap-8 p-6 text-center sm:p-10 lg:grid-cols-[1fr_auto] lg:text-left">
        <div>
          <p className="text-sm font-medium text-primary">Ready when you are</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-foreground sm:text-4xl">
            See your pattern first. Decide after.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Start with the quiz, preview your result, then join the early-access waitlist if the insight feels useful.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
            {checks.map((check) => (
              <span
                key={check}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5 text-xs text-muted-foreground"
              >
                <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
                {check}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/quiz">
              Start the pattern quiz
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full border-border bg-transparent sm:w-auto"
          >
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground lg:col-span-2">
          Quiz first. Pattern preview before checkout. Waitlist only until the product is live.
        </p>
        </div>
      </div>
    </section>
  );
}
