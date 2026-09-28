"use client";

import { WHITEPAPER_PDF, WHITEPAPER_URL } from "@/lib/solutions/constants";
import { howToSteps } from "@/lib/solutions/content";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Download } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function SolutionsHowTo() {
  const [openId, setOpenId] = useState<string>(howToSteps[0].id);

  return (
    <section
      id="how-to-use"
      className="relative scroll-mt-28 py-16 md:py-20"
      aria-labelledby="howto-heading"
    >
      <div className="mb-10 max-w-2xl space-y-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300">
          Whitepaper digest
        </span>
        <h2
          id="howto-heading"
          className="text-3xl font-bold tracking-tight text-on-surface sm:text-4xl dark:text-white"
        >
          How to use the infrastructure
        </h2>
        <p className="text-base leading-relaxed text-on-surface-variant dark:text-gray-300">
          A condensed walkthrough of the Sizland whitepaper: the problem, the architecture,
          how a company activates modules, and the trust layer around it.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <ol className="hidden lg:sticky lg:top-32 lg:flex lg:flex-col lg:gap-1 lg:self-start">
          {howToSteps.map((step, index) => (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => setOpenId(step.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-mono text-xs uppercase tracking-[0.14em] transition-colors",
                  openId === step.id
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                    : "text-on-surface-variant hover:bg-emerald-500/10 dark:text-gray-400"
                )}
              >
                <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                  0{index + 1}
                </span>
                {step.label}
              </button>
            </li>
          ))}
        </ol>

        <div className="space-y-3">
          {howToSteps.map((step, index) => {
            const open = openId === step.id;
            return (
              <article
                key={step.id}
                className={cn(
                  "solutions-glass overflow-hidden rounded-2xl",
                  open && "solutions-glow ring-1 ring-emerald-500/25"
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  onClick={() => setOpenId(step.id)}
                  aria-expanded={open}
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-emerald-600 dark:text-emerald-300">
                      0{index + 1}
                    </span>
                    <span className="text-base font-bold text-on-surface sm:text-lg dark:text-white">
                      {step.title}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
                    {open ? "Open" : "Read"}
                  </span>
                </button>
                {open && (
                  <div className="border-t border-emerald-500/15 px-5 pb-6 pt-4 sm:px-6">
                    <p className="text-sm leading-relaxed text-on-surface-variant sm:text-base dark:text-gray-300">
                      {step.body}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {step.points.map((point) => (
                        <li
                          key={point}
                          className="flex gap-2 text-sm text-on-surface dark:text-gray-200"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href={WHITEPAPER_URL}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 px-6 py-3 text-sm font-bold text-white hover:from-emerald-500 hover:to-emerald-700"
        >
          Open full whitepaper
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          href={WHITEPAPER_PDF}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-600/50 px-6 py-3 text-sm font-bold text-gray-800 hover:bg-emerald-50 dark:border-emerald-500/40 dark:text-gray-200 dark:hover:bg-emerald-500/10"
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Link>
      </div>
    </section>
  );
}
