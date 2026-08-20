"use client";

import React from "react";
import type { TimelineEntry } from "@/lib/mytab/indexer-client";

interface MaturityTimelineProps {
  entries: TimelineEntry[];
  loading?: boolean;
}

const COLOR_MAP = {
  red: {
    dot: "bg-mt-error shadow-[0_0_8px_rgba(255,180,171,0.6)]",
    text: "text-mt-error",
    bg: "bg-mt-error/10 border-mt-error/20",
  },
  amber: {
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    text: "text-amber-400",
    bg: "bg-amber-400/10 border-amber-400/20",
  },
  green: {
    dot: "bg-mt-primary shadow-[0_0_8px_rgba(66,238,147,0.6)]",
    text: "text-mt-primary",
    bg: "bg-mt-primary/10 border-mt-primary/20",
  },
};

function formatDueLabel(entry: TimelineEntry): string {
  const date = new Date(entry.timestamp * 1000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);

  if (due.getTime() === today.getTime()) return "Due Today";
  return `Due ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export const MaturityTimeline: React.FC<MaturityTimelineProps> = ({
  entries,
  loading = false,
}) => (
  <section className="bg-mt-surface-container-lowest/40 backdrop-blur-xl border border-mt-glass-border rounded-[2rem] p-8 shadow-2xl">
    <header className="flex items-center gap-4 mb-6">
      <div className="bg-mt-tertiary-container/20 p-2 rounded-2xl border border-mt-tertiary-container/30">
        <span className="material-symbols-outlined text-mt-tertiary-container text-2xl">
          event_note
        </span>
      </div>
      <h3 className="font-headline text-[20px] leading-[28px] font-bold text-mt-ledger-white normal-case tracking-normal">
        Maturity Timeline
      </h3>
    </header>

    <div className="flex flex-col relative">
      {entries.length > 0 && (
        <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-mt-glass-border" />
      )}

      {loading && (
        <p className="text-mt-on-surface-variant font-body text-sm text-center py-6">
          Loading timeline…
        </p>
      )}

      {!loading &&
        entries.map((item, i) => {
          const c = COLOR_MAP[item.color];
          const alias = item.debtorAlias || item.lenderAlias;
          return (
            <div
              key={item.pledgeId}
              className={`flex items-start gap-4 relative ${i > 0 ? "mt-6" : ""}`}
            >
              <div
                className={`w-6 h-6 rounded-full ${c.dot} flex-shrink-0 z-10 flex items-center justify-center`}
              >
                <div className="w-2 h-2 rounded-full bg-white/80" />
              </div>

              <div
                className={`flex-1 ${c.bg} border rounded-2xl p-4 flex items-center justify-between gap-3`}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-body text-sm text-mt-ledger-white font-bold">
                    {alias}
                  </span>
                  <span
                    className={`font-label text-[11px] tracking-wider uppercase ${c.text}`}
                  >
                    {formatDueLabel(item)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[15px] text-mt-ledger-white font-medium">
                    {item.amount.toLocaleString()} {item.currency}
                  </span>
                  <button
                    type="button"
                    className={`${c.bg} border px-3 py-1.5 rounded-full font-label text-[10px] tracking-wider uppercase font-bold ${c.text} hover:brightness-125 transition-all`}
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}

      {!loading && entries.length === 0 && (
        <p className="text-mt-on-surface-variant font-body text-sm text-center py-6">
          No upcoming deadlines
        </p>
      )}
    </div>
  </section>
);
