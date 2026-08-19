"use client";

import React from "react";

export const RequestForm: React.FC = () => (
  <section className="bg-mt-surface-container-lowest/40 backdrop-blur-xl border border-mt-glass-border rounded-[2rem] p-8 relative overflow-hidden shadow-2xl">
    <div className="absolute top-0 right-0 w-64 h-64 bg-mt-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />

    <header className="flex items-center gap-4 mb-8 border-b border-mt-glass-border pb-5 relative z-10">
      <div className="bg-mt-primary/20 p-2 rounded-2xl border border-mt-primary/20">
        <span className="material-symbols-outlined text-mt-primary text-2xl">
          add_circle
        </span>
      </div>
      <h3 className="font-headline text-[24px] leading-[32px] font-bold text-mt-ledger-white">
        REQUEST (Create)
      </h3>
    </header>

    <form className="flex flex-col gap-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-2">
        <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant">
          Target Identifier
        </label>
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mt-on-surface-variant material-symbols-outlined group-focus-within:text-mt-primary transition-colors">
            alternate_email
          </span>
          <input
            className="w-full bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl pl-12 pr-4 py-4 font-mono text-[15px] leading-[20px] tracking-[0.02em] font-medium text-mt-ledger-white focus:border-mt-primary focus:bg-mt-pure-black/50 focus:outline-none focus:ring-4 focus:ring-mt-primary/10 placeholder:text-mt-on-surface-variant/50 transition-all duration-300 shadow-inner"
            placeholder="username or ID"
            type="text"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant">
            Amount (KES)
          </label>
          <input
            className="w-full bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl px-5 py-4 font-mono text-[15px] leading-[20px] tracking-[0.02em] font-medium text-mt-ledger-white focus:border-mt-primary focus:bg-mt-pure-black/50 focus:outline-none focus:ring-4 focus:ring-mt-primary/10 placeholder:text-mt-on-surface-variant/50 transition-all duration-300 shadow-inner"
            placeholder="0.00"
            type="number"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant">
            Due Date
          </label>
          <input
            className="w-full bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl px-5 py-4 font-mono text-[15px] leading-[20px] tracking-[0.02em] font-medium text-mt-ledger-white focus:border-mt-primary focus:bg-mt-pure-black/50 focus:outline-none focus:ring-4 focus:ring-mt-primary/10 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert transition-all duration-300 shadow-inner"
            type="date"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant">
          Memo (Optional)
        </label>
        <input
          className="w-full bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl px-5 py-4 font-body text-sm text-mt-ledger-white focus:border-mt-primary focus:bg-mt-pure-black/50 focus:outline-none focus:ring-4 focus:ring-mt-primary/10 placeholder:text-mt-on-surface-variant/50 transition-all duration-300 shadow-inner"
          placeholder="e.g. Dinner split"
          type="text"
        />
      </div>

      <button
        className="mt-6 w-full bg-mt-primary text-mt-pure-black font-body text-[18px] leading-[26px] font-bold rounded-full py-4 hover:bg-mt-primary-fixed hover:shadow-[0_0_24px_rgba(66,238,147,0.4)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-3"
        type="button"
      >
        <span className="material-symbols-outlined font-medium">
          send_and_archive
        </span>
        <span>Generate Request</span>
      </button>
    </form>
  </section>
);
