"use client";

import type { GeoCurrencyHook } from "@/lib/solutions/use-geo-currency";
import { cn } from "@/lib/utils";

export function CurrencySwitcher({
  currency,
  setCurrency,
  currencies,
  loading,
  country,
  className,
}: Pick<GeoCurrencyHook, "currency" | "setCurrency" | "currencies" | "loading" | "country"> & {
  className?: string;
}) {
  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/5 px-3 py-1.5",
        className
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
        {loading ? "Detecting" : country}
      </span>
      <select
        value={currency}
        onChange={(event) =>
          setCurrency(event.target.value as GeoCurrencyHook["currency"])
        }
        className="bg-transparent font-mono text-xs font-semibold uppercase tracking-wider text-on-surface outline-none dark:text-white"
        aria-label="Display currency"
      >
        {currencies.map((code) => (
          <option key={code} value={code} className="text-gray-900">
            {code}
          </option>
        ))}
      </select>
    </label>
  );
}
