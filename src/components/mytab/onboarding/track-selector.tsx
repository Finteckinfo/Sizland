"use client";

import React from "react";
import type { WalletTrack } from "@/lib/mytab/constants";

interface TrackSelectorProps {
  selected: WalletTrack | null;
  onSelect: (track: WalletTrack) => void;
}

export const TrackSelector: React.FC<TrackSelectorProps> = ({
  selected,
  onSelect,
}) => (
  <div className="flex flex-col gap-4">
    <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant">
      Choose your wallet track
    </label>

    {/* Track 1 — External Wallet */}
    <button
      onClick={() => onSelect("external")}
      className={`relative w-full text-left p-6 rounded-3xl border transition-all duration-300 group ${
        selected === "external"
          ? "border-mt-primary bg-mt-primary/10 shadow-[0_0_20px_rgba(66,238,147,0.15)]"
          : "border-mt-glass-border bg-mt-pure-black/20 hover:border-mt-primary/40 hover:bg-mt-pure-black/30"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-2xl border ${
            selected === "external"
              ? "bg-mt-primary/20 border-mt-primary/30"
              : "bg-mt-surface-container-highest/50 border-mt-glass-border"
          }`}
        >
          <span className="material-symbols-outlined text-2xl text-mt-primary">
            account_balance_wallet
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline text-lg text-mt-ledger-white font-bold mb-1 normal-case tracking-normal">
            Connect Existing Wallet
          </h3>
          <p className="font-body text-sm text-mt-on-surface-variant leading-relaxed">
            Use MetaMask, Coinbase Wallet, or any WalletConnect-compatible wallet. You manage your own keys and pay gas fees.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="bg-mt-surface-container-high/80 border border-mt-glass-border text-mt-on-surface-variant px-2.5 py-1 rounded-full font-label text-[10px] tracking-wider uppercase">
              Self-custody
            </span>
            <span className="bg-mt-surface-container-high/80 border border-mt-glass-border text-mt-on-surface-variant px-2.5 py-1 rounded-full font-label text-[10px] tracking-wider uppercase">
              Gas fees apply
            </span>
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-all ${
          selected === "external"
            ? "border-mt-primary bg-mt-primary"
            : "border-mt-outline"
        }`}>
          {selected === "external" && (
            <span className="material-symbols-outlined text-mt-pure-black text-[14px]">check</span>
          )}
        </div>
      </div>
    </button>

    {/* Track 2 — Smart Account */}
    <button
      onClick={() => onSelect("smart_account")}
      className={`relative w-full text-left p-6 rounded-3xl border transition-all duration-300 group ${
        selected === "smart_account"
          ? "border-mt-primary bg-mt-primary/10 shadow-[0_0_20px_rgba(66,238,147,0.15)]"
          : "border-mt-glass-border bg-mt-pure-black/20 hover:border-mt-primary/40 hover:bg-mt-pure-black/30"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-2xl border ${
            selected === "smart_account"
              ? "bg-mt-primary/20 border-mt-primary/30"
              : "bg-mt-surface-container-highest/50 border-mt-glass-border"
          }`}
        >
          <span className="material-symbols-outlined text-2xl text-mt-primary">
            auto_awesome
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline text-lg text-mt-ledger-white font-bold mb-1 normal-case tracking-normal">
            Create Smart Account
          </h3>
          <p className="font-body text-sm text-mt-on-surface-variant leading-relaxed">
            We generate a secure wallet for you. No browser extensions needed.
            Gas fees are sponsored — completely free to start.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="bg-mt-primary/10 border border-mt-primary/20 text-mt-primary px-2.5 py-1 rounded-full font-label text-[10px] tracking-wider uppercase">
              Recommended
            </span>
            <span className="bg-mt-surface-container-high/80 border border-mt-glass-border text-mt-on-surface-variant px-2.5 py-1 rounded-full font-label text-[10px] tracking-wider uppercase">
              Gas-free
            </span>
            <span className="bg-mt-surface-container-high/80 border border-mt-glass-border text-mt-on-surface-variant px-2.5 py-1 rounded-full font-label text-[10px] tracking-wider uppercase">
              ERC-4337
            </span>
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-all ${
          selected === "smart_account"
            ? "border-mt-primary bg-mt-primary"
            : "border-mt-outline"
        }`}>
          {selected === "smart_account" && (
            <span className="material-symbols-outlined text-mt-pure-black text-[14px]">check</span>
          )}
        </div>
      </div>
    </button>
  </div>
);
