"use client";

import React, { useState } from "react";

interface OfframpModalProps {
  open: boolean;
  onClose: () => void;
  availableBalance: number;
  currency: string;
}

export const OfframpModal: React.FC<OfframpModalProps> = ({
  open,
  onClose,
  availableBalance,
  currency,
}) => {
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");

  if (!open) return null;

  const numAmount = parseFloat(amount) || 0;
  const isValid = numAmount > 0 && numAmount <= availableBalance && phone.length >= 10;

  const handleSubmit = async () => {
    if (!isValid) return;
    setStep("confirm");
  };

  const handleConfirm = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/mytab/paystack/offramp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount, phone, currency }),
      });
      if (!res.ok) throw new Error("Transfer failed");
      setStep("success");
    } catch {
      // TODO: show error state
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setStep("form");
    setAmount("");
    setPhone("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-mt-pure-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-mt-surface-container/90 backdrop-blur-xl border border-mt-glass-border rounded-[2rem] p-8 shadow-2xl z-10">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-mt-on-surface-variant hover:text-mt-ledger-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {step === "form" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-mt-primary/20 p-2 rounded-2xl border border-mt-primary/20">
                <span className="material-symbols-outlined text-mt-primary text-2xl">
                  send
                </span>
              </div>
              <h2 className="font-headline text-xl text-mt-ledger-white font-bold normal-case tracking-normal">
                Send to Mobile Money
              </h2>
            </div>

            <div className="flex flex-col gap-5">
              <div className="bg-mt-pure-black/20 border border-mt-glass-border rounded-2xl p-4 flex justify-between items-center">
                <span className="font-label text-[10px] tracking-wider uppercase text-mt-on-surface-variant">
                  Available
                </span>
                <span className="font-mono text-lg text-mt-primary font-bold">
                  {availableBalance.toLocaleString()} {currency}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant">
                  Amount ({currency})
                </label>
                <input
                  className="w-full bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl px-5 py-4 font-mono text-[15px] leading-[20px] tracking-[0.02em] font-medium text-mt-ledger-white focus:border-mt-primary focus:outline-none focus:ring-4 focus:ring-mt-primary/10 placeholder:text-mt-on-surface-variant/50 transition-all shadow-inner"
                  placeholder="0.00"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={availableBalance}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant">
                  M-Pesa Phone Number
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mt-on-surface-variant material-symbols-outlined group-focus-within:text-mt-primary transition-colors">
                    phone
                  </span>
                  <input
                    className="w-full bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl pl-12 pr-4 py-4 font-mono text-[15px] leading-[20px] tracking-[0.02em] font-medium text-mt-ledger-white focus:border-mt-primary focus:outline-none focus:ring-4 focus:ring-mt-primary/10 placeholder:text-mt-on-surface-variant/50 transition-all shadow-inner"
                    placeholder="+254 7XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                  />
                </div>
              </div>

              <button
                disabled={!isValid}
                onClick={handleSubmit}
                className="w-full bg-mt-primary text-mt-pure-black font-body text-base font-bold rounded-full py-4 hover:bg-mt-primary-fixed hover:shadow-[0_0_24px_rgba(66,238,147,0.4)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                <span className="material-symbols-outlined">arrow_forward</span>
                Review Transfer
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-400/20 p-2 rounded-2xl border border-amber-400/20">
                <span className="material-symbols-outlined text-amber-400 text-2xl">
                  warning
                </span>
              </div>
              <h2 className="font-headline text-xl text-mt-ledger-white font-bold normal-case tracking-normal">
                Confirm Transfer
              </h2>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <div className="bg-mt-pure-black/20 border border-mt-glass-border rounded-2xl p-4 flex justify-between">
                <span className="text-mt-on-surface-variant font-body text-sm">Amount</span>
                <span className="font-mono text-mt-ledger-white font-bold">
                  {numAmount.toLocaleString()} {currency}
                </span>
              </div>
              <div className="bg-mt-pure-black/20 border border-mt-glass-border rounded-2xl p-4 flex justify-between">
                <span className="text-mt-on-surface-variant font-body text-sm">To</span>
                <span className="font-mono text-mt-ledger-white">{phone}</span>
              </div>
              <p className="text-mt-on-surface-variant text-xs font-body">
                Your on-chain balance will be converted to {currency} and sent via M-Pesa.
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 bg-mt-pure-black/50 border border-mt-glass-border text-mt-on-surface rounded-full py-3 font-body font-bold transition-all hover:border-mt-primary/30"
              >
                Back
              </button>
              <button
                disabled={sending}
                onClick={handleConfirm}
                className="flex-1 bg-mt-primary text-mt-pure-black rounded-full py-3 font-body font-bold hover:bg-mt-primary-fixed transition-all disabled:opacity-40 flex justify-center items-center gap-2"
              >
                {sending ? (
                  <span className="material-symbols-outlined animate-spin text-[18px]">
                    progress_activity
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">check</span>
                )}
                {sending ? "Sending..." : "Confirm"}
              </button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center text-center gap-6 py-4">
            <div className="w-20 h-20 rounded-full bg-mt-primary/20 border border-mt-primary/30 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-4xl text-mt-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <div>
              <h3 className="font-headline text-xl text-mt-ledger-white font-bold mb-2 normal-case tracking-normal">
                Transfer Initiated
              </h3>
              <p className="font-body text-sm text-mt-on-surface-variant">
                {numAmount.toLocaleString()} {currency} is being sent to {phone}.
                You&apos;ll receive a confirmation SMS shortly.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-mt-primary text-mt-pure-black rounded-full py-4 font-body font-bold transition-all hover:bg-mt-primary-fixed"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
