"use client";

import React from "react";

export const MyTabTopBar: React.FC = () => (
  <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:hidden h-20 bg-mt-surface/40 backdrop-blur-xl border-b border-mt-glass-border">
    <h1 className="font-headline text-[28px] leading-[34px] font-bold text-mt-primary">
      MyTab
    </h1>
    <div className="flex gap-4">
      <button className="text-mt-on-surface hover:text-mt-primary transition-colors bg-mt-surface-container-highest/50 p-2 rounded-full border border-mt-glass-border">
        <span className="material-symbols-outlined">qr_code_scanner</span>
      </button>
      <button className="text-mt-on-surface hover:text-mt-primary transition-colors bg-mt-surface-container-highest/50 p-2 rounded-full border border-mt-glass-border">
        <span className="material-symbols-outlined">account_balance_wallet</span>
      </button>
    </div>
  </header>
);

interface BottomNavItem {
  icon: string;
  label: string;
  active?: boolean;
}

const bottomItems: BottomNavItem[] = [
  { icon: "list_alt", label: "Ledger", active: true },
  { icon: "history", label: "Activity" },
  { icon: "payments", label: "Wallet" },
  { icon: "person", label: "Profile" },
];

export const MyTabBottomNav: React.FC = () => (
  <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center py-4 md:hidden bg-mt-surface/60 backdrop-blur-xl border-t border-mt-glass-border rounded-t-3xl">
    {bottomItems.map((item) => (
      <a
        key={item.label}
        href="#"
        className={
          item.active
            ? "flex flex-col items-center justify-center text-mt-primary font-bold transition-all duration-300 scale-105"
            : "flex flex-col items-center justify-center text-mt-on-surface-variant hover:text-mt-ledger-white transition-colors"
        }
      >
        <span
          className={`material-symbols-outlined mb-1 ${
            item.active
              ? "text-2xl drop-shadow-[0_0_8px_rgba(66,238,147,0.5)]"
              : ""
          }`}
        >
          {item.icon}
        </span>
        <span className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase">
          {item.label}
        </span>
      </a>
    ))}
  </nav>
);
