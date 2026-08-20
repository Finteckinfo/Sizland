"use client";

import React, { useState, useRef } from "react";
import { hashPhone, isValidKenyanPhone } from "@/lib/mytab/phone-hash";
import { OTP_LENGTH } from "@/lib/mytab/constants";
import { setStoredPhoneHash } from "@/lib/mytab/profile-store";

interface PhoneVerifyProps {
  accountAddress?: string | null;
  onVerified: (phone: string, phoneHash?: string) => void;
  onSkip?: () => void;
}

export const PhoneVerify: React.FC<PhoneVerifyProps> = ({
  accountAddress,
  onVerified,
  onSkip,
}) => {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = async () => {
    if (!isValidKenyanPhone(phone)) {
      setError("Enter a valid Kenyan phone number");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/mytab/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, action: "send" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Enter the full verification code");
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/mytab/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, action: "verify" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      let phoneHash: string | undefined;

      if (accountAddress && data.verificationToken) {
        phoneHash = await hashPhone(phone);
        const hashRes = await fetch("/api/mytab/phone/register-hash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verificationToken: data.verificationToken,
            phoneHash,
            accountAddress,
          }),
        });
        const hashData = await hashRes.json();
        if (!hashRes.ok) {
          throw new Error(hashData.error || "Phone hash registration failed");
        }
        setStoredPhoneHash(phoneHash);
      }

      onVerified(phone, phoneHash);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="flex flex-col gap-4">
        <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant">
          Enter verification code
        </label>
        <p className="font-body text-sm text-mt-on-surface-variant">
          We sent a {OTP_LENGTH}-digit code to{" "}
          <span className="text-mt-ledger-white font-medium">{phone}</span>
          {process.env.NODE_ENV === "development" && (
            <span className="block text-xs mt-1 text-mt-primary/80">
              Dev: check server console for OTP
            </span>
          )}
        </p>

        <div className="flex gap-3 justify-center">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              className="w-12 h-14 text-center bg-mt-pure-black/30 border border-mt-glass-border rounded-xl font-mono text-xl text-mt-ledger-white focus:border-mt-primary focus:outline-none focus:ring-4 focus:ring-mt-primary/10 transition-all shadow-inner"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(i, e)}
              inputMode="numeric"
            />
          ))}
        </div>

        {error && <p className="text-mt-error text-sm font-body">{error}</p>}

        <button
          type="button"
          onClick={handleVerifyOtp}
          disabled={verifying || otp.join("").length < OTP_LENGTH}
          className="w-full bg-mt-primary text-mt-pure-black font-body text-base font-bold rounded-full py-4 hover:bg-mt-primary-fixed hover:shadow-[0_0_24px_rgba(66,238,147,0.4)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {verifying ? (
            <span className="material-symbols-outlined animate-spin">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined">verified</span>
          )}
          {verifying ? "Verifying..." : "Verify Phone"}
        </button>

        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setOtp(Array(OTP_LENGTH).fill(""));
            setError(null);
          }}
          className="text-mt-on-surface-variant text-sm font-body hover:text-mt-ledger-white transition-colors"
        >
          Change phone number
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant mb-2 block">
          Phone verification
        </label>
        <p className="font-body text-sm text-mt-on-surface-variant mb-4">
          Anchor your identity with a phone number. Only a hash is stored — your
          number never leaves this device.
        </p>
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mt-on-surface-variant material-symbols-outlined group-focus-within:text-mt-primary transition-colors">
            phone
          </span>
          <input
            className="w-full bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl pl-12 pr-4 py-4 font-mono text-[15px] leading-[20px] tracking-[0.02em] font-medium text-mt-ledger-white focus:border-mt-primary focus:bg-mt-pure-black/50 focus:outline-none focus:ring-4 focus:ring-mt-primary/10 placeholder:text-mt-on-surface-variant/50 transition-all duration-300 shadow-inner"
            placeholder="+254 7XX XXX XXX"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError(null);
            }}
            type="tel"
          />
        </div>
        {error && (
          <p className="text-mt-error text-sm mt-2 font-body">{error}</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleSendOtp}
        disabled={sending || !phone}
        className="w-full bg-mt-primary text-mt-pure-black font-body text-base font-bold rounded-full py-4 hover:bg-mt-primary-fixed hover:shadow-[0_0_24px_rgba(66,238,147,0.4)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {sending ? (
          <span className="material-symbols-outlined animate-spin">
            progress_activity
          </span>
        ) : (
          <span className="material-symbols-outlined">sms</span>
        )}
        {sending ? "Sending..." : "Send Verification Code"}
      </button>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="text-mt-on-surface-variant text-sm font-body hover:text-mt-ledger-white transition-colors"
        >
          Skip for now
        </button>
      )}
    </div>
  );
};
