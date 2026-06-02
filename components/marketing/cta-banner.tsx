import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function CtaBanner() {
  const checks = ["60-second quiz", "sample pattern", "checkout intent"] as const;

  return (
    <section className="border-t border-[#e6edf0] bg-white px-4 py-20 text-[#172120] sm:px-6 lg:py-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#dfe9e7] bg-[#f7fbfa] shadow-sm">
        <div className="grid items-center gap-8 p-6 text-center sm:p-10 lg:grid-cols-[1fr_auto] lg:text-left">
          <div>
            <p className="text-sm font-medium text-[#42615d]">Ready when you are</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-[#172120] sm:text-4xl">
              See the pattern first. Decide after.
            </h2>
            <p className="mt-4 max-w-2xl text-[#60706d]">
              Take the quiz, preview the kind of result MindMirror is being built to create, then choose whether early access is worth it.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
              {checks.map((check) => (
                <span
                  key={check}
                  className="inline-flex items-center gap-2 rounded-full border border-[#dfe9e7] bg-white px-3 py-1.5 text-xs text-[#60706d]"
                >
                  <CheckCircle2 className="size-3.5 text-[#42615d]" aria-hidden />
                  {check}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full rounded-full bg-[#172120] text-white hover:bg-[#263533] sm:w-auto"
            >
              <Link href="/quiz">
                Start the quiz
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full rounded-full border-[#d9e6e3] bg-white/70 text-[#172120] hover:bg-white sm:w-auto"
            >
              <Link href="/auth/signup?returnTo=%2Faccount">Try the first mirror</Link>
            </Button>
          </div>
          <p className="text-xs text-[#74827f] lg:col-span-2">
            The checkout path is the experiment. The first mirror is there to make the product feel real.
          </p>
        </div>
      </div>
    </section>
  );
}
