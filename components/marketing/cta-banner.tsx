import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="border-t border-border bg-card/20 px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-8 text-center lg:grid-cols-[1fr_auto] lg:text-left">
        <div>
          <p className="text-sm font-medium text-primary">Ready when you are</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            See your pattern first. Decide after.
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Start with the quiz, preview your result, then choose the 7-day trial if it feels useful.
          </p>
        </div>
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
        <p className="lg:col-span-2 text-xs text-muted-foreground">
          Quiz first. Pattern preview before checkout. Secure payment through Stripe.
        </p>
      </div>
    </section>
  );
}
