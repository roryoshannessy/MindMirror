"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const faqKeys = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;

export function Faq() {
  const t = useTranslations("faq");
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section
      className="border-t border-[#e6edf0] bg-[#f7fbfa] px-4 py-20 text-[#172120] sm:px-6 lg:py-24"
      aria-label="FAQ"
    >
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[#172120] sm:text-3xl">
          Frequently asked questions
        </h2>
        <dl className="divide-y divide-[#dfe9e7] rounded-2xl border border-[#dfe9e7] bg-white px-5 shadow-sm">
          {faqKeys.map((key) => {
            const qKey = key as (typeof faqKeys)[number];
            const aKey = `a${key.slice(1)}` as `a${string}`;
            const isOpen = open === key;

            return (
              <div key={key}>
                <dt>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-5 text-left text-sm font-medium text-[#172120]"
                    onClick={() => setOpen(isOpen ? null : key)}
                    aria-expanded={isOpen}
                  >
                    <span>{t(qKey)}</span>
                    <span
                      className={cn(
                        "ml-4 shrink-0 text-[#81908d] transition-transform duration-200",
                        isOpen && "rotate-45",
                      )}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                </dt>
                {isOpen && (
                  <dd className="pb-5 text-sm leading-relaxed text-[#60706d]">
                    {t(aKey as Parameters<typeof t>[0])}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
