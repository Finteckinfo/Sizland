"use client";

import React from "react";
import Link from "next/link";

interface MyTabSidebarProps {
  alias?: string | null;
  phoneVerified?: boolean;
}

interface NavItem {
  icon: string;
  label: string;
  active?: boolean;
  href?: string;
}

const mainNav: NavItem[] = [
  { icon: "receipt_long", label: "Ledger", active: true, href: "/mytab" },
  { icon: "event_note", label: "Timeline", href: "/mytab" },
  { icon: "account_balance_wallet", label: "Wallet", href: "/mytab" },
  { icon: "waves", label: "Security", href: "/mytab/settings" },
];

const footerNav: NavItem[] = [
  { icon: "settings", label: "Settings", href: "/mytab/settings" },
  { icon: "help", label: "Support", href: "#" },
];

export const MyTabSidebar: React.FC<MyTabSidebarProps> = ({
  alias,
  phoneVerified = false,
}) => {
  const displayAlias = alias ? `@${alias}` : null;

  return (
    <nav className="hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-mt-glass-border bg-mt-surface/30 backdrop-blur-xl w-64 z-50 rounded-r-[2.5rem] shadow-2xl">
      <div className="p-8 flex flex-col items-center relative z-10">
        <div className="w-20 h-20 rounded-full bg-mt-surface-container-highest/50 backdrop-blur-md border border-mt-glass-border flex items-center justify-center mb-4 shadow-inner">
          <span
            className="material-symbols-outlined text-4xl text-mt-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            person
          </span>
        </div>

        {displayAlias ? (
          <h2 className="font-headline text-[20px] leading-[28px] font-bold text-mt-ledger-white tracking-tight">
            {displayAlias}
          </h2>
        ) : (
          <Link
            href="/mytab/onboarding"
            className="font-body text-sm text-mt-primary hover:underline text-center"
          >
            Complete onboarding
          </Link>
        )}

        {phoneVerified ? (
          <div className="flex items-center gap-1.5 mt-2 bg-mt-primary/10 px-3 py-1 rounded-full border border-mt-primary/20">
            <span className="w-2 h-2 rounded-full bg-mt-primary block shadow-[0_0_8px_rgba(66,238,147,0.8)]" />
            <p className="font-label text-[12px] leading-[16px] tracking-[0.05em] text-mt-primary uppercase font-bold">
              Verified
            </p>
          </div>
        ) : (
          <Link
            href="/mytab/onboarding"
            className="mt-2 font-label text-[10px] tracking-wider uppercase text-mt-on-surface-variant hover:text-mt-primary transition-colors"
          >
            Verify phone
          </Link>
        )}

        <button
          type="button"
          className="mt-8 w-full py-3 px-4 bg-mt-primary/10 text-mt-primary border border-mt-primary/30 hover:bg-mt-primary hover:text-mt-on-primary hover:border-mt-primary hover:shadow-[0_0_20px_rgba(66,238,147,0.3)] font-body text-base font-bold rounded-full flex items-center justify-center gap-2 transition-all duration-300"
        >
          <span className="material-symbols-outlined">add</span> New Request
        </button>
      </div>

      <div className="flex-1 py-4 px-6 flex flex-col gap-3 relative z-10">
        {mainNav.map((item) => (
          <Link
            key={item.label}
            href={item.href || "#"}
            className={
              item.active
                ? "bg-mt-primary/20 text-mt-primary border border-mt-primary/20 font-bold rounded-2xl px-5 py-3 flex items-center gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform duration-300"
                : "text-mt-on-surface hover:text-mt-primary hover:bg-white/5 border border-transparent hover:border-mt-glass-border rounded-2xl px-5 py-3 flex items-center gap-3 transition-all duration-300"
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-body">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="p-6 border-t border-mt-glass-border flex flex-col gap-3 relative z-10">
        {footerNav.map((item) => (
          <Link
            key={item.label}
            href={item.href || "#"}
            className="text-mt-on-surface-variant hover:text-mt-ledger-white hover:bg-white/5 border border-transparent hover:border-mt-glass-border rounded-2xl px-5 py-3 flex items-center gap-3 transition-all duration-300"
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-body">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
