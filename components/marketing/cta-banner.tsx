import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="border-t border-border px-4 py-20 sm:px-6">
      <div
        className="mx-auto max-w-3xl rounded-lg border border-primary/20 bg-secondary/50 p-8 text-center sm:p-10"
      >
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Start your 7-day free trial — $0 today
        </h2>
        <p className="mt-4 text-muted-foreground">
          Cancel anytime · No questions asked · Your data is yours
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/quiz">Start the pattern quiz</Link>
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
        <p className="mt-6 text-xs text-muted-foreground">
          Quiz first. Pattern preview before checkout. Secure payment through Stripe.
        </p>
      </div>
    </section>
  );
}
