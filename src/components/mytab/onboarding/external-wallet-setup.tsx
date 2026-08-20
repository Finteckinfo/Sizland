"use client";

import React, { useCallback, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { buildAliasRegisterMessage } from "@/lib/mytab/alias-sign";

interface ExternalWalletSetupProps {
  alias: string;
  onConnected: (address: string) => void;
}

export const ExternalWalletSetup: React.FC<ExternalWalletSetupProps> = ({
  alias,
  onConnected,
}) => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  const registerAlias = useCallback(async () => {
    if (!address) return;
    setRegistering(true);
    setError(null);

    try {
      const message = buildAliasRegisterMessage({
        alias,
        address,
        domain: window.location.host,
      });

      const signature = await signMessageAsync({ message });

      const res = await fetch("/api/mytab/alias/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alias, address, signature, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Alias registration failed");

      onConnected(address);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setRegistering(false);
    }
  }, [address, alias, onConnected, signMessageAsync]);

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-mt-primary/5 border border-mt-primary/15 rounded-2xl p-4">
        <p className="font-body text-sm text-mt-on-surface-variant leading-relaxed">
          Connect an existing wallet (MetaMask, Coinbase, etc.). You will sign a
          message to bind <span className="text-mt-primary font-bold">@{alias}</span>{" "}
          to your address. Gas fees apply for on-chain transactions.
        </p>
      </div>

      <div className="flex justify-center">
        <ConnectButton />
      </div>

      {isConnected && address && (
        <div className="flex flex-col gap-3">
          <div className="bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl px-5 py-4 font-mono text-[13px] text-mt-ledger-white break-all">
            {address}
          </div>
          {chain && (
            <p className="font-body text-xs text-mt-on-surface-variant text-center">
              Network: {chain.name}
            </p>
          )}

          <button
            type="button"
            disabled={registering}
            onClick={registerAlias}
            className="w-full bg-mt-primary text-mt-pure-black font-body text-base font-bold rounded-full py-4 hover:bg-mt-primary-fixed transition-all disabled:opacity-40 flex justify-center items-center gap-2"
          >
            {registering ? (
              <span className="material-symbols-outlined animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined">draw</span>
            )}
            {registering ? "Signing…" : `Sign & Bind @${alias}`}
          </button>

          <button
            type="button"
            onClick={() => disconnect()}
            className="text-mt-on-surface-variant text-sm font-body hover:text-mt-error transition-colors"
          >
            Disconnect wallet
          </button>
        </div>
      )}

      {error && (
        <p className="text-mt-error text-sm font-body text-center">{error}</p>
      )}
    </div>
  );
};
