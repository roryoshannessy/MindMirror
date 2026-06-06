import { AudioLines, BadgeCheck, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";

const productProof = [
  {
    icon: AudioLines,
    title: "Voice capture tested",
    body: "The first mobile test captured a long spoken reflection clearly enough to produce a mirror.",
  },
  {
    icon: MessageSquareText,
    title: "First mirror worked",
    body: "The app returned a possible loop, cost, question, next action, and evidence from the entry.",
  },
  {
    icon: ShieldCheck,
    title: "Checkout rails tested",
    body: "Stripe checkout, refund handling, and funnel analytics have been wired for the purchase-intent test.",
  },
] as const;

const feedbackCards = [
  {
    label: "User outcome",
    title: "Understand the thought before it repeats.",
    body: "The product should make a recurring thought easier to notice in the moment it usually takes over.",
  },
  {
    label: "Product promise",
    title: "One voice note should become a useful mirror.",
    body: "The first experience needs to feel valuable before asking anyone to build a long journaling habit.",
  },
  {
    label: "Funnel proof",
    title: "People should understand the value before checkout.",
    body: "The page is designed to test whether recurring thought recognition is clear enough to pay for.",
  },
] as const;

export function ProofSection() {
  return (
    <section
      className="border-t border-[#dce8e5] bg-[#f6fbfa] px-4 py-16 text-[#172120] sm:px-6 lg:py-20"
      aria-label="Proof and trust"
    >
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-[#d8e7e3] bg-white p-5 shadow-[0_24px_70px_rgb(51_84_79/0.12)] sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#d8e7e3] bg-[#f7fbfa] px-3 py-1.5 text-sm font-medium text-[#42615d]">
                <BadgeCheck className="size-4" aria-hidden />
                Honest proof
              </p>
              <h2 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                Trust should come from what we can actually show.
              </h2>
              <p className="mt-5 text-base leading-7 text-[#60706d]">
                We are not pretending MindMirror is clinically proven or already used by thousands.
                The current goal is cleaner: show the product promise, test purchase intent, and
                keep the mental-health boundary responsible.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {productProof.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-[#dfe9e7] bg-[#f8fbfa] p-4">
                    <Icon className="size-5 text-[#42615d]" aria-hidden />
                    <p className="mt-3 text-sm font-semibold">{item.title}</p>
                    <p className="mt-2 text-xs leading-5 text-[#60706d]">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {feedbackCards.map((card) => (
            <article
              key={card.label}
              className="rounded-[1.45rem] border border-[#dfe9e7] bg-white p-5 shadow-sm"
            >
              <Sparkles className="size-5 text-[#42615d]" aria-hidden />
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#81908d]">
                {card.label}
              </p>
              <h3 className="mt-3 text-lg font-semibold leading-tight text-[#172120]">
                {card.title}
              </h3>
              <p className="mt-4 text-sm leading-6 text-[#60706d]">
                {card.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
