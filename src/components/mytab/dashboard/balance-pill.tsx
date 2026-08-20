"use client";

import React, { useState } from "react";
import { OfframpModal } from "@/components/mytab/fiat/offramp-modal";

interface BalancePillProps {
  amount: number;
  currency: string;
}

export const BalancePill: React.FC<BalancePillProps> = ({ amount, currency }) => {
  const [offrampOpen, setOfframpOpen] = useState(false);
  const displayAmount = amount.toLocaleString();

  return (
    <>
      <section className="bg-mt-surface/30 backdrop-blur-2xl border border-mt-glass-border rounded-full py-5 px-8 mb-12 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group hover:border-mt-primary/30 transition-colors duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-mt-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 text-center md:text-left relative z-10">
          <p className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold text-mt-on-surface-variant uppercase tracking-widest">
            Available Balance
          </p>
          <div className="flex items-baseline justify-center md:justify-start gap-2">
            <h2 className="font-headline text-[48px] leading-[56px] font-bold text-mt-ledger-white tracking-tight drop-shadow-md">
              {displayAmount}
            </h2>
            <span className="font-mono text-[15px] leading-[20px] tracking-[0.02em] font-medium text-mt-liquid-mint">
              {currency}
            </span>
          </div>
        </div>
        <button
          type="button"
          disabled={amount <= 0}
          onClick={() => setOfframpOpen(true)}
          className="bg-white/5 border border-mt-glass-border text-mt-ledger-white px-6 py-3 font-body text-base font-bold rounded-full hover:bg-mt-primary/20 hover:border-mt-primary/50 hover:text-mt-primary transition-all duration-300 flex items-center gap-2 shadow-sm relative z-10 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:border-mt-glass-border disabled:hover:text-mt-ledger-white"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
          <span>Send to Mobile Money</span>
        </button>
      </section>

      <OfframpModal
        open={offrampOpen}
        onClose={() => setOfframpOpen(false)}
        availableBalance={amount}
        currency={currency}
      />
    </>
  );
};
