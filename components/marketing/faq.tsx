"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const faqKeys = ["q1", "q2", "q3", "q4", "q5"] as const;

export function Faq() {
  const t = useTranslations("faq");
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="border-t border-border px-4 py-20 sm:px-6" aria-label="FAQ">
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Frequently asked questions
        </h2>
        <dl className="divide-y divide-border">
          {faqKeys.map((key) => {
            const qKey = key as (typeof faqKeys)[number];
            const aKey = `a${key.slice(1)}` as `a${string}`;
            const isOpen = open === key;

            return (
              <div key={key}>
                <dt>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-5 text-left text-sm font-medium text-foreground"
                    onClick={() => setOpen(isOpen ? null : key)}
                    aria-expanded={isOpen}
                  >
                    <span>{t(qKey)}</span>
                    <span
                      className={cn(
                        "ml-4 shrink-0 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-45",
                      )}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                </dt>
                {isOpen && (
                  <dd className="pb-5 text-sm leading-relaxed text-muted-foreground">
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
