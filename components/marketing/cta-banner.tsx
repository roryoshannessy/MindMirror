import { Link } from "@/i18n/navigation";
import { brand } from "@/config/brand";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="border-t border-border px-4 py-20 sm:px-6">
      <div
        className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-primary/20 bg-secondary/50 p-10 text-center"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, var(--primary) 0%, transparent 70%)",
          }}
        />
        <div className="relative">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Start your 7-day free trial — $0 today
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cancel anytime · No questions asked · Your data is yours
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/quiz">Discover your thought patterns →</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full border-border bg-transparent sm:w-auto">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Trusted by {brand.SOCIAL_PROOF_COUNT} founders and professionals
          </p>
        </div>
      </div>
    </section>
  );
}
