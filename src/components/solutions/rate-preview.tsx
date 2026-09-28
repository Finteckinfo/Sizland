"use client";

import type { GeoCurrencyHook } from "@/lib/solutions/use-geo-currency";
import { CurrencySwitcher } from "./currency-switcher";
import { SolutionsRateCards } from "./rate-cards";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function SolutionsRatePreview({ geo }: { geo: GeoCurrencyHook }) {
  const [compare, setCompare] = useState(true);

  return (
    <section
      id="rates"
      className="relative scroll-mt-28 py-16 md:py-20"
      aria-labelledby="rates-heading"
    >
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300">
            Rate card
          </span>
          <h2
            id="rates-heading"
            className="text-3xl font-bold tracking-tight text-on-surface sm:text-4xl dark:text-white"
          >
            Three tiers. One standard of craft.
          </h2>
          <p className="text-base text-on-surface-variant dark:text-gray-300">
            Prices convert to your local currency. Open the full rate card for add-ons
            and a complete comparison.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CurrencySwitcher {...geo} />
          <button
            type="button"
            onClick={() => setCompare((value) => !value)}
            className="rounded-full border border-emerald-500/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-800 hover:bg-emerald-500/10 dark:text-emerald-200"
          >
            {compare ? "Hide highlights" : "Compare highlights"}
          </button>
          <Link
            href="/ratecard"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 px-5 py-2 text-sm font-bold text-white hover:from-emerald-500 hover:to-emerald-700"
          >
            Open full rate card
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <SolutionsRateCards geo={geo} compare={compare} />
    </section>
  );
}
