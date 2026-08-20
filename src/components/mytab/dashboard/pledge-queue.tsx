"use client";

import React from "react";
import type { PledgeView } from "@/lib/mytab/pledge-client";
import { formatPledgeAmount } from "@/lib/mytab/pledge-client";

interface PledgeQueueProps {
  pledges: PledgeView[];
  loading?: boolean;
}

export const PledgeQueue: React.FC<PledgeQueueProps> = ({
  pledges,
  loading = false,
}) => (
  <section className="bg-mt-surface-container-lowest/40 backdrop-blur-xl border border-mt-glass-border rounded-[2rem] p-8 flex flex-col h-full relative overflow-hidden shadow-2xl">
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-mt-liquid-mint/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

    <header className="flex items-center justify-between mb-8 border-b border-mt-glass-border pb-5 relative z-10">
      <div className="flex items-center gap-4">
        <div className="bg-mt-tertiary-container/20 p-2 rounded-2xl border border-mt-tertiary-container/30">
          <span className="material-symbols-outlined text-mt-tertiary-container text-2xl">
            pending_actions
          </span>
        </div>
        <h3 className="font-headline text-[24px] leading-[32px] font-bold text-mt-ledger-white">
          PLEDGES (Incoming)
        </h3>
      </div>
      <span className="bg-mt-surface-container-highest/80 backdrop-blur-sm border border-mt-glass-border text-mt-on-surface px-3 py-1.5 rounded-full font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase shadow-inner">
        {pledges.length} PENDING
      </span>
    </header>

    <div className="flex flex-col gap-5 flex-1 relative z-10">
      {loading && (
        <p className="text-mt-on-surface-variant font-body text-sm text-center py-8">
          Loading pledges…
        </p>
      )}

      {!loading && pledges.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
          <span className="material-symbols-outlined text-4xl text-mt-on-surface-variant opacity-60">
            inbox
          </span>
          <p className="font-body text-mt-on-surface-variant">
            No incoming pledges yet
          </p>
          <p className="font-body text-sm text-mt-on-surface-variant/70 max-w-xs">
            When someone sends you a request, it will appear here for approval.
          </p>
        </div>
      )}

      {!loading &&
        pledges.map((pledge) => (
          <article
            key={pledge.id}
            className="bg-mt-pure-black/30 backdrop-blur-md border border-mt-glass-border rounded-3xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 hover:border-mt-primary/40 hover:bg-mt-pure-black/40 transition-all duration-300 group shadow-lg"
          >
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-body text-[18px] leading-[24px] text-mt-ledger-white font-bold">
                  {pledge.lenderAlias}
                </span>
                <span className="text-mt-on-surface-variant font-body text-sm">
                  requests
                </span>
                <span className="font-mono text-[18px] leading-[24px] text-mt-primary bg-mt-primary/10 px-3 py-1 rounded-lg border border-mt-primary/20">
                  {formatPledgeAmount(pledge.amount, pledge.currency)}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                {pledge.isUrgent ? (
                  <span className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-error flex items-center gap-1.5 bg-mt-error/10 px-2 py-0.5 rounded-md border border-mt-error/20">
                    <span className="material-symbols-outlined text-[16px]">
                      warning
                    </span>
                    Due: {pledge.dueDate}
                  </span>
                ) : (
                  <span className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] opacity-70">
                      calendar_today
                    </span>
                    Due: {pledge.dueDate}
                  </span>
                )}
                <span className="bg-mt-surface-container-high/80 border border-mt-glass-border text-mt-on-surface px-2.5 py-1 rounded-full font-label text-[10px] tracking-wider uppercase shadow-inner">
                  {pledge.status === "PendingCoSign" ? "Unsettled" : pledge.status}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                className="flex-1 sm:flex-none bg-mt-pure-black/50 border border-mt-glass-border text-mt-on-surface hover:text-mt-error hover:border-mt-error/50 px-4 py-2.5 rounded-full font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,180,171,0.2)]"
              >
                Decline
              </button>
              <button
                type="button"
                className="flex-1 sm:flex-none bg-mt-primary text-mt-pure-black hover:bg-mt-primary-fixed hover:shadow-[0_0_20px_rgba(66,238,147,0.4)] px-5 py-2.5 rounded-full font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase transition-all duration-300 hover:-translate-y-0.5"
              >
                Approve
              </button>
            </div>
          </article>
        ))}
    </div>

    {!loading && pledges.length > 0 && (
      <div className="mt-8 pt-5 border-t border-mt-glass-border relative z-10">
        <p className="font-body text-sm text-mt-on-surface-variant text-center bg-mt-surface/30 rounded-xl py-3 px-4 backdrop-blur-sm border border-white/5">
          Tired of waiting for approval?
          <a
            className="text-mt-liquid-mint hover:text-mt-primary hover:underline hover:underline-offset-2 font-bold ml-1 transition-colors drop-shadow-[0_0_4px_rgba(0,245,140,0.5)]"
            href="#"
          >
            Pay Through the App
          </a>
          <span className="opacity-80"> for instant, automatic settlement.</span>
        </p>
      </div>
    )}
  </section>
);
