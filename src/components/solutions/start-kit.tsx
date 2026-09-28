"use client";

import { startKitItems } from "@/lib/solutions/content";
import { passThroughFees } from "@/lib/solutions/pricing";
import type { GeoCurrencyHook } from "@/lib/solutions/use-geo-currency";
import { cn } from "@/lib/utils";
import { CurrencySwitcher } from "./currency-switcher";
import { Check, Palette, Server, Globe2, ImageIcon } from "lucide-react";
import { useState } from "react";

const ICONS = {
  logo: ImageIcon,
  palette: Palette,
  railway: Server,
  domain: Globe2,
};

export function SolutionsStartKit({ geo }: { geo: GeoCurrencyHook }) {
  const [openId, setOpenId] = useState<string | null>("logo");

  return (
    <section
      id="start-kit"
      className="relative scroll-mt-28 py-16 md:py-20"
      aria-labelledby="startkit-heading"
    >
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300">
            Required to start
          </span>
          <h2
            id="startkit-heading"
            className="text-3xl font-bold tracking-tight text-on-surface sm:text-4xl dark:text-white"
          >
            What we need before a build begins
          </h2>
          <p className="text-base leading-relaxed text-on-surface-variant dark:text-gray-300">
            Brand assets you send once. Hosting and domain fees are pass-through provider
            costs, shown in the currency for your region.
          </p>
        </div>
        <CurrencySwitcher {...geo} />
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {startKitItems.map((item) => {
          const Icon = ICONS[item.id as keyof typeof ICONS] ?? Check;
          const open = openId === item.id;
          const fee =
            item.kind === "fee" ? passThroughFees[item.feeKey] : null;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : item.id)}
                className={cn(
                  "solutions-glass solutions-bento w-full rounded-2xl p-6 text-left",
                  open && "ring-1 ring-emerald-500/30"
                )}
                aria-expanded={open}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <Icon size={22} aria-hidden />
                  </div>
                  {fee ? (
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-semibold tabular-nums text-emerald-800 dark:text-emerald-200">
                      {geo.loading
                        ? "…"
                        : geo.formatKes(fee.amountKes, fee.period)}
                    </span>
                  ) : (
                    <span className="rounded-full border border-emerald-500/30 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Asset
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-bold text-on-surface dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant dark:text-gray-300">
                  {item.summary}
                </p>
                {open && (
                  <p className="mt-4 border-t border-emerald-500/15 pt-4 text-sm leading-relaxed text-on-surface dark:text-gray-200">
                    {item.detail}
                    {fee ? ` ${fee.note}` : ""}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
