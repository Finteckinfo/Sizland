"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { MyTabAmbientBg } from "@/components/mytab/layout/mytab-ambient-bg";
import { AliasPicker } from "@/components/mytab/onboarding/alias-picker";
import { TrackSelector } from "@/components/mytab/onboarding/track-selector";
import { ExternalWalletSetup } from "@/components/mytab/onboarding/external-wallet-setup";
import { SmartAccountSetup } from "@/components/mytab/onboarding/smart-account-setup";
import { PhoneVerify } from "@/components/mytab/onboarding/phone-verify";
import type { WalletTrack } from "@/lib/mytab/constants";
import {
  setStoredProfile,
  setStoredWalletTrack,
} from "@/lib/mytab/profile-store";

type OnboardingStep =
  | "alias"
  | "track"
  | "wallet"
  | "phone"
  | "complete";

const STEP_META: Record<
  OnboardingStep,
  { title: string; subtitle: string; icon: string }
> = {
  alias: {
    title: "Pick your identity",
    subtitle: "Your @username is how others find you on MyTab.",
    icon: "badge",
  },
  track: {
    title: "Choose your wallet track",
    subtitle: "External wallet or gas-free smart account.",
    icon: "account_balance_wallet",
  },
  wallet: {
    title: "Connect your wallet",
    subtitle: "Sign to bind your @username to your address.",
    icon: "draw",
  },
  phone: {
    title: "Verify your phone",
    subtitle: "Anchor your identity for recovery and trust scoring.",
    icon: "smartphone",
  },
  complete: {
    title: "You're all set",
    subtitle: "Your MyTab ledger is ready to use.",
    icon: "celebration",
  },
};

const STEPS: OnboardingStep[] = [
  "alias",
  "track",
  "wallet",
  "phone",
  "complete",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<OnboardingStep>("alias");
  const [alias, setAlias] = useState("");
  const [track, setTrack] = useState<WalletTrack | null>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const currentIndex = STEPS.indexOf(step);
  const meta = STEP_META[step];

  const handleAliasConfirmed = (confirmed: string) => {
    setAlias(confirmed);
    setStep("track");
  };

  const handleTrackContinue = () => {
    if (track) setStep("wallet");
  };

  const handleWalletConnected = (address: string) => {
    setAccountAddress(address);
    setStep("phone");
  };

  const handlePhoneVerified = () => {
    setPhoneVerified(true);
    setStep("complete");
  };

  const handleFinish = async () => {
    setStoredProfile({
      alias,
      walletTrack: track,
      accountAddress,
      phoneVerified,
    });
    if (track) setStoredWalletTrack(track);

    await update?.({
      mytabAlias: alias,
      mytabAccountAddress: accountAddress,
      walletTrack: track,
      phoneVerified,
    });

    router.push("/mytab");
  };

  return (
    <>
      <Head>
        <title>Set Up MyTab</title>
        <meta name="description" content="Create your MyTab identity" />
      </Head>

      <div className="mytab-app flex min-h-screen relative text-mt-on-background selection:bg-mt-primary/30 selection:text-mt-primary">
        <MyTabAmbientBg />

        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-full px-4 py-12 relative z-10">
          <div className="w-full max-w-md min-w-0 mb-8 sm:mb-12">
            <div className="flex items-center justify-between gap-1 mb-2">
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 overflow-hidden rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      i <= currentIndex
                        ? "bg-mt-primary text-mt-pure-black shadow-[0_0_12px_rgba(66,238,147,0.4)]"
                        : "bg-mt-surface-container-highest/50 text-mt-on-surface-variant border border-mt-glass-border"
                    }`}
                  >
                    {i < currentIndex ? (
                      <span className="material-symbols-outlined text-[16px]">
                        check
                      </span>
                    ) : (
                      i + 1
                    )}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 min-w-0 h-0.5 mx-0.5 sm:mx-1 rounded transition-all duration-500 ${
                        i < currentIndex ? "bg-mt-primary" : "bg-mt-glass-border"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md min-w-0 bg-mt-surface-container-lowest/40 backdrop-blur-xl border border-mt-glass-border rounded-[2rem] p-5 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-mt-primary/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />

            <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8 relative z-10 min-w-0">
              <div className="shrink-0 bg-mt-primary/20 p-2.5 sm:p-3 rounded-2xl border border-mt-primary/20">
                <span className="material-symbols-outlined text-mt-primary text-2xl">
                  {meta.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-headline text-lg sm:text-xl text-mt-ledger-white font-bold normal-case tracking-normal break-words">
                  {meta.title}
                </h2>
                <p className="font-body text-sm text-mt-on-surface-variant mt-0.5">
                  {meta.subtitle}
                </p>
              </div>
            </div>

            <div className="relative z-10 min-w-0">
              {step === "alias" && (
                <AliasPicker onAliasConfirmed={handleAliasConfirmed} />
              )}

              {step === "track" && (
                <div className="flex flex-col gap-6 min-w-0">
                  <TrackSelector
                    selected={track}
                    onSelect={setTrack}
                  />
                  <button
                    type="button"
                    disabled={!track}
                    onClick={handleTrackContinue}
                    className="w-full min-w-0 bg-mt-primary text-mt-pure-black font-body text-base font-bold rounded-full py-4 hover:bg-mt-primary-fixed hover:shadow-[0_0_24px_rgba(66,238,147,0.4)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex justify-center items-center gap-2"
                  >
                    <span className="material-symbols-outlined">arrow_forward</span>
                    Continue
                  </button>
                </div>
              )}

              {step === "wallet" && track === "external" && (
                <ExternalWalletSetup
                  alias={alias}
                  onConnected={handleWalletConnected}
                />
              )}

              {step === "wallet" && track === "smart_account" && (
                <SmartAccountSetup
                  alias={alias}
                  onConnected={handleWalletConnected}
                />
              )}

              {step === "phone" && (
                <PhoneVerify
                  accountAddress={accountAddress}
                  onVerified={handlePhoneVerified}
                  onSkip={() => setStep("complete")}
                />
              )}

              {step === "complete" && (
                <div className="flex flex-col items-center text-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-mt-primary/20 border border-mt-primary/30 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-4xl text-mt-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      celebration
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 w-full">
                    <div className="bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl p-4 text-left">
                      <p className="font-label text-[10px] tracking-wider uppercase text-mt-on-surface-variant mb-1">
                        Username
                      </p>
                      <p className="font-mono text-lg text-mt-primary">@{alias}</p>
                    </div>
                    <div className="bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl p-4 text-left">
                      <p className="font-label text-[10px] tracking-wider uppercase text-mt-on-surface-variant mb-1">
                        Wallet
                      </p>
                      <p className="font-mono text-xs text-mt-ledger-white break-all">
                        {accountAddress}
                      </p>
                    </div>
                    <div className="bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl p-4 text-left">
                      <p className="font-label text-[10px] tracking-wider uppercase text-mt-on-surface-variant mb-1">
                        Phone
                      </p>
                      <p className="font-body text-mt-ledger-white">
                        {phoneVerified
                          ? "Verified & hash registered"
                          : "Skipped — verify later in Settings"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleFinish}
                    className="w-full bg-mt-primary text-mt-pure-black font-body text-base font-bold rounded-full py-4 hover:bg-mt-primary-fixed hover:shadow-[0_0_24px_rgba(66,238,147,0.4)] hover:-translate-y-1 transition-all duration-300 flex justify-center items-center gap-2"
                  >
                    <span className="material-symbols-outlined">dashboard</span>
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
