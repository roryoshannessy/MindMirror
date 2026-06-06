import { BadgeCheck, HeartPulse, MessageCircleHeart, ShieldCheck } from "lucide-react";

export function ProfessionalGuidance() {
  return (
    <section className="border-t border-[#e6edf0] bg-white px-4 py-16 text-[#172120] sm:px-6 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d9e6e3] bg-[#f7fbfa] px-3 py-1.5 text-sm font-medium text-[#42615d]">
              <ShieldCheck className="size-4" aria-hidden />
              Responsible product design
            </p>
            <h2 className="mt-5 max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight text-[#172120] sm:text-5xl">
              Designed to support self-awareness, not replace support.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#60706d]">
              MindMirror is not therapy, counselling, diagnosis, or crisis support. It is a
              reflection tool for noticing patterns between the moments where real-world support,
              relationships, coaches, counsellors, or doctors may matter.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#dfe9e7] bg-[#f7fbfa] p-4 shadow-[0_24px_70px_rgb(51_84_79/0.12)] sm:p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#dfe9e7] bg-white p-4">
                <BadgeCheck className="size-5 text-[#42615d]" aria-hidden />
                <p className="mt-3 text-sm font-semibold text-[#172120]">Input, not endorsement</p>
                <p className="mt-2 text-xs leading-5 text-[#60706d]">
                  We will only add professional quotes or claims when we have real permission and
                  evidence.
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
                <HeartPulse className="size-5 text-[#42615d]" aria-hidden />
                <p className="mt-3 text-sm font-semibold text-[#172120]">Crisis-aware</p>
                <p className="mt-2 text-xs leading-5 text-[#60706d]">
                  If someone is struggling, the page points them toward qualified support instead of
                  pretending software is enough.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
