"use client";

import React, { useState } from "react";
import {
  createSmartAccount,
  loadSmartAccountAddress,
} from "@/lib/mytab/smart-account";
import { buildAliasRegisterMessage } from "@/lib/mytab/alias-sign";
import { privateKeyToAccount } from "viem/accounts";

interface SmartAccountSetupProps {
  alias: string;
  onConnected: (address: string) => void;
}

export const SmartAccountSetup: React.FC<SmartAccountSetupProps> = ({
  alias,
  onConnected,
}) => {
  const [address, setAddress] = useState<string | null>(loadSmartAccountAddress);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  const handleCreate = () => {
    setError(null);
    const account = createSmartAccount();
    setAddress(account.address);
  };

  const handleRegister = async () => {
    if (!address) return;
    setRegistering(true);
    setError(null);

    try {
      const privateKey = (
        await import("@/lib/mytab/smart-account")
      ).loadSmartAccountPrivateKey();
      if (!privateKey) throw new Error("Smart account key not found");

      const account = privateKeyToAccount(privateKey);
      const message = buildAliasRegisterMessage({
        alias,
        address: account.address,
        domain: window.location.host,
      });

      const signature = await account.signMessage({ message });

      const res = await fetch("/api/mytab/alias/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alias,
          address: account.address,
          signature,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Alias registration failed");

      onConnected(account.address);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-mt-primary/5 border border-mt-primary/15 rounded-2xl p-4">
        <p className="font-body text-sm text-mt-on-surface-variant leading-relaxed">
          We generate a secure wallet in your browser. Keys stay on this device —
          gas is sponsored once ERC-4337 paymaster is live on Base.
        </p>
      </div>

      {!address ? (
        <button
          type="button"
          onClick={handleCreate}
          className="w-full bg-mt-primary text-mt-pure-black font-body text-base font-bold rounded-full py-4 hover:bg-mt-primary-fixed transition-all flex justify-center items-center gap-2"
        >
          <span className="material-symbols-outlined">auto_awesome</span>
          Generate Smart Account
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl px-5 py-4 font-mono text-[13px] text-mt-ledger-white break-all">
            {address}
          </div>
          <span className="bg-mt-primary/10 border border-mt-primary/20 text-mt-primary px-3 py-1.5 rounded-full font-label text-[10px] tracking-wider uppercase text-center w-fit mx-auto">
            Gas-free (when paymaster live)
          </span>

          <button
            type="button"
            disabled={registering}
            onClick={handleRegister}
            className="w-full bg-mt-primary text-mt-pure-black font-body text-base font-bold rounded-full py-4 hover:bg-mt-primary-fixed transition-all disabled:opacity-40 flex justify-center items-center gap-2"
          >
            {registering ? (
              <span className="material-symbols-outlined animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined">draw</span>
            )}
            {registering ? "Registering…" : `Sign & Bind @${alias}`}
          </button>
        </div>
      )}

      {error && (
        <p className="text-mt-error text-sm font-body text-center">{error}</p>
      )}
    </div>
  );
};
