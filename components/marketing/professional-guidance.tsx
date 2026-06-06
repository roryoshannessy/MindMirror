import { BadgeCheck, MessageCircleHeart, ShieldCheck } from "lucide-react";

const professionalCards = [
  {
    initials: "C",
    quote:
      "Tools like this can be valuable when they encourage reflection and emotional awareness while still reminding people to seek professional support when needed.",
    role: "Counsellor placeholder",
    status: "Editable placeholder quote",
  },
  {
    initials: "T",
    quote:
      "The responsible direction is to help people notice patterns, language, and triggers without presenting the product as diagnosis or treatment.",
    role: "Therapist placeholder",
    status: "Editable placeholder quote",
  },
  {
    initials: "M",
    quote:
      "Reflection tools are strongest when they support self-awareness between conversations with qualified professionals, friends, family, or support services.",
    role: "Mental health professional placeholder",
    status: "Editable placeholder quote",
  },
] as const;

export function ProfessionalGuidance() {
  return (
    <section className="border-t border-[#e6edf0] bg-white px-4 py-20 text-[#172120] sm:px-6 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d9e6e3] bg-[#f7fbfa] px-3 py-1.5 text-sm font-medium text-[#42615d]">
              <ShieldCheck className="size-4" aria-hidden />
              Responsible product design
            </p>
            <h2 className="mt-5 max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight text-[#172120] sm:text-5xl">
              Built with guidance from real mental health professionals.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#60706d]">
              MindMirror is designed to support reflection and self-awareness. It is not therapy,
              counselling, diagnosis, or crisis support. We are actively speaking with counsellors
              and therapists to shape the product responsibly.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#dfe9e7] bg-[#f7fbfa] p-4 shadow-[0_24px_70px_rgb(51_84_79/0.12)] sm:p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#dfe9e7] bg-white p-4">
                <BadgeCheck className="size-5 text-[#42615d]" aria-hidden />
                <p className="mt-3 text-sm font-semibold text-[#172120]">Input, not endorsement</p>
                <p className="mt-2 text-xs leading-5 text-[#60706d]">
                  Professional feedback helps shape the product without implying clinical approval.
                </p>
              </div>
              <div className="rounded-2xl border border-[#dfe9e7] bg-white p-4">
                <MessageCircleHeart className="size-5 text-[#42615d]" aria-hidden />
                <p className="mt-3 text-sm font-semibold text-[#172120]">Support, not replacement</p>
                <p className="mt-2 text-xs leading-5 text-[#60706d]">
                  MindMirror encourages users to seek qualified support when they need it.
                </p>
              </div>
              <div className="rounded-2xl border border-[#dfe9e7] bg-white p-4">
                <ShieldCheck className="size-5 text-[#42615d]" aria-hidden />
                <p className="mt-3 text-sm font-semibold text-[#172120]">Evidence-aware</p>
                <p className="mt-2 text-xs leading-5 text-[#60706d]">
                  The product avoids diagnosis, medical claims, and overpromising outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {professionalCards.map((card) => (
            <figure
              key={card.role}
              className="rounded-[1.35rem] border border-[#dfe9e7] bg-[#f8fbfa] p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#d9e6e3] bg-white text-base font-semibold text-[#42615d]">
                  {card.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#172120]">{card.role}</p>
                  <p className="mt-1 rounded-full border border-[#dfe9e7] bg-white px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-[#81908d]">
                    {card.status}
                  </p>
                </div>
              </div>
              <blockquote className="mt-5 text-sm leading-7 text-[#60706d]">
                &ldquo;{card.quote}&rdquo;
              </blockquote>
            </figure>
          ))}
        </div>

        <p className="mx-auto mt-7 max-w-3xl rounded-2xl border border-[#dfe9e7] bg-white px-5 py-4 text-center text-sm leading-6 text-[#60706d] shadow-sm">
          We&apos;re currently connecting with counsellors and therapists to help shape the product
          responsibly. The cards above are editable placeholders until real professional feedback
          is added.
        </p>
      </div>
    </section>
  );
}
