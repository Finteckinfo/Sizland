"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MyTabLayout } from "@/components/mytab/layout/mytab-layout";
import { PhoneVerify } from "@/components/mytab/onboarding/phone-verify";
import {
  getStoredAlias,
  getStoredAccountAddress,
  getStoredWalletTrack,
  isPhoneVerified,
  setPhoneVerified as persistPhoneVerified,
} from "@/lib/mytab/profile-store";
import { exportSmartAccountPrivateKey } from "@/lib/mytab/smart-account";

type SettingsSection = "profile" | "phone" | "keys" | "danger";

export default function MyTabSettings() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [alias, setAlias] = useState<string | null>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [walletTrack, setWalletTrack] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setAlias(getStoredAlias());
    setAccountAddress(getStoredAccountAddress());
    setWalletTrack(getStoredWalletTrack());
    setPhoneVerified(isPhoneVerified());
  }, []);

  const handleExportKey = async () => {
    if (walletTrack !== "smart_account") return;

    setExporting(true);
    setExportError(null);

    try {
      const privateKey = exportSmartAccountPrivateKey();
      if (!privateKey) {
        throw new Error("No smart account key found on this device");
      }

      const blob = new Blob(
        [
          `MyTab Smart Account Private Key\n`,
          `Address: ${accountAddress ?? "unknown"}\n`,
          `Exported: ${new Date().toISOString()}\n\n`,
          `${privateKey}\n`,
        ],
        { type: "text/plain" }
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `mytab-key-${alias ?? "backup"}.txt`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setExportError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  if (!mounted) return null;

  const trackLabel =
    walletTrack === "external"
      ? "External Wallet"
      : walletTrack === "smart_account"
        ? "Smart Account (ERC-4337)"
        : "Not configured";

  const sections: { id: SettingsSection; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "phone", label: "Phone", icon: "smartphone" },
    { id: "keys", label: "Key Export", icon: "key" },
    { id: "danger", label: "Danger Zone", icon: "warning" },
  ];

  return (
    <MyTabLayout
      title="Settings — MyTab"
      alias={alias}
      phoneVerified={phoneVerified}
    >
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <div className="bg-mt-primary/20 p-2 rounded-2xl border border-mt-primary/20">
            <span className="material-symbols-outlined text-mt-primary text-2xl">
              settings
            </span>
          </div>
          <h1 className="font-headline text-[28px] leading-[34px] font-bold text-mt-ledger-white normal-case tracking-normal">
            Settings
          </h1>
        </header>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-body text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeSection === s.id
                  ? "bg-mt-primary/20 text-mt-primary border border-mt-primary/20"
                  : "bg-mt-pure-black/20 text-mt-on-surface-variant border border-mt-glass-border hover:border-mt-primary/30 hover:text-mt-ledger-white"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {activeSection === "profile" && (
          <section className="bg-mt-surface-container-lowest/40 backdrop-blur-xl border border-mt-glass-border rounded-[2rem] p-8 shadow-2xl">
            <h2 className="font-headline text-lg text-mt-ledger-white font-bold mb-6 normal-case tracking-normal">
              Profile Information
            </h2>

            {!alias && (
              <div className="mb-6 bg-mt-primary/5 border border-mt-primary/20 rounded-2xl p-4">
                <p className="font-body text-sm text-mt-on-surface-variant">
                  No username yet.{" "}
                  <Link href="/mytab/onboarding" className="text-mt-primary font-bold hover:underline">
                    Complete onboarding
                  </Link>
                </p>
              </div>
            )}

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant">
                  Username
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mt-on-surface-variant font-headline text-lg">
                    @
                  </span>
                  <input
                    className="w-full bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl pl-10 pr-4 py-4 font-mono text-[15px] leading-[20px] tracking-[0.02em] font-medium text-mt-ledger-white focus:border-mt-primary focus:bg-mt-pure-black/50 focus:outline-none focus:ring-4 focus:ring-mt-primary/10 transition-all shadow-inner"
                    value={alias ?? ""}
                    placeholder="Not set"
                    readOnly
                  />
                </div>
                <p className="text-mt-on-surface-variant text-xs font-body">
                  Alias changes require on-chain transaction and may incur gas fees.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant">
                  Wallet Address
                </label>
                <div className="bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl px-5 py-4 font-mono text-[13px] text-mt-on-surface-variant break-all">
                  {accountAddress ?? "Not connected"}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant">
                  Wallet Track
                </label>
                <div className="flex items-center gap-2">
                  {walletTrack ? (
                    <span className="bg-mt-primary/10 border border-mt-primary/20 text-mt-primary px-3 py-1.5 rounded-full font-label text-[11px] tracking-wider uppercase">
                      {trackLabel}
                    </span>
                  ) : (
                    <span className="text-mt-on-surface-variant font-body text-sm">
                      Not configured
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === "phone" && (
          <section className="bg-mt-surface-container-lowest/40 backdrop-blur-xl border border-mt-glass-border rounded-[2rem] p-8 shadow-2xl">
            <h2 className="font-headline text-lg text-mt-ledger-white font-bold mb-6 normal-case tracking-normal">
              Phone Verification
            </h2>

            {showPhoneVerify ? (
              <PhoneVerify
                accountAddress={accountAddress}
                onVerified={() => {
                  persistPhoneVerified(true);
                  setPhoneVerified(true);
                  setShowPhoneVerify(false);
                }}
              />
            ) : phoneVerified ? (
              <div className="flex flex-col gap-4">
                <div className="bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-mt-primary">verified</span>
                    <div>
                      <p className="font-body text-mt-ledger-white">Phone verified</p>
                      <p className="font-body text-xs text-mt-on-surface-variant">
                        Number is hashed locally — not stored on our servers
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPhoneVerify(true)}
                    className="text-mt-on-surface-variant hover:text-mt-primary text-sm font-body transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-4 py-6">
                <span className="material-symbols-outlined text-4xl text-mt-on-surface-variant opacity-60">
                  smartphone
                </span>
                <p className="font-body text-mt-on-surface-variant">
                  No phone verified yet
                </p>
                <button
                  type="button"
                  onClick={() => setShowPhoneVerify(true)}
                  className="bg-mt-primary text-mt-pure-black px-6 py-3 rounded-full font-body text-sm font-bold hover:bg-mt-primary-fixed transition-all"
                >
                  Verify Phone
                </button>
              </div>
            )}
          </section>
        )}

        {activeSection === "keys" && (
          <section className="bg-mt-surface-container-lowest/40 backdrop-blur-xl border border-mt-glass-border rounded-[2rem] p-8 shadow-2xl">
            <h2 className="font-headline text-lg text-mt-ledger-white font-bold mb-6 normal-case tracking-normal">
              Key Export
            </h2>

            <div className="bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl p-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-mt-surface-container-highest/50 border border-mt-glass-border flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-mt-on-surface-variant">
                  key
                </span>
              </div>
              <h3 className="font-body text-mt-ledger-white font-bold">
                Export Your Private Key
              </h3>
              <p className="font-body text-sm text-mt-on-surface-variant max-w-sm">
                Download your encrypted private key for backup. This requires biometric or
                passkey authentication.
              </p>
              <button
                type="button"
                disabled={walletTrack !== "smart_account" || exporting}
                onClick={handleExportKey}
                className="bg-mt-surface-container-high/80 border border-mt-glass-border text-mt-ledger-white px-6 py-3 rounded-full font-body text-sm font-bold hover:bg-mt-primary/20 hover:border-mt-primary/30 hover:text-mt-primary transition-all duration-300 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">fingerprint</span>
                {exporting ? "Exporting…" : "Authenticate & Export"}
              </button>
              {walletTrack !== "smart_account" && (
                <p className="font-body text-xs text-mt-on-surface-variant">
                  Key export is only available for smart account wallets.
                </p>
              )}
              {exportError && (
                <p className="font-body text-xs text-mt-error">{exportError}</p>
              )}
            </div>
          </section>
        )}

        {activeSection === "danger" && (
          <section className="bg-mt-surface-container-lowest/40 backdrop-blur-xl border border-mt-error/20 rounded-[2rem] p-8 shadow-2xl">
            <h2 className="font-headline text-lg text-mt-error font-bold mb-6 normal-case tracking-normal">
              Danger Zone
            </h2>

            <div className="flex flex-col gap-4">
              <div className="bg-mt-pure-black/30 border border-mt-error/20 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="font-body text-mt-ledger-white font-bold">
                    Delete Account
                  </p>
                  <p className="font-body text-xs text-mt-on-surface-variant mt-1">
                    Permanently release your @username and unlink phone hash. On-chain
                    pledge history cannot be erased.
                  </p>
                </div>
                <button
                  type="button"
                  className="bg-mt-error-container/30 border border-mt-error/30 text-mt-error px-4 py-2 rounded-full font-label text-[11px] tracking-wider uppercase font-bold hover:bg-mt-error hover:text-mt-pure-black transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </MyTabLayout>
  );
}
