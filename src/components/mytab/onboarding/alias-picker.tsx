"use client";

import React, { useState, useCallback } from "react";
import { validateAlias } from "@/lib/mytab/constants";

interface AliasPickerProps {
  onAliasConfirmed: (alias: string) => void;
}

export const AliasPicker: React.FC<AliasPickerProps> = ({ onAliasConfirmed }) => {
  const [alias, setAlias] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const checkAvailability = useCallback(async (value: string) => {
    const validationError = validateAlias(value);
    if (validationError) {
      setError(validationError);
      setAvailable(null);
      return;
    }

    setChecking(true);
    setError(null);

    try {
      const res = await fetch(`/api/mytab/alias/check?alias=${encodeURIComponent(value)}`);
      const data = await res.json();
      setAvailable(data.available);
      if (!data.available) setError("Username already taken");
    } catch {
      setError("Could not check availability");
    } finally {
      setChecking(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setAlias(value);
    setAvailable(null);
    setError(null);

    if (value.length >= 3) {
      const timeout = setTimeout(() => checkAvailability(value), 400);
      return () => clearTimeout(timeout);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="font-label text-[12px] leading-[16px] tracking-[0.05em] font-bold uppercase text-mt-on-surface-variant mb-2 block">
          Choose your username
        </label>
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mt-on-surface-variant font-headline text-lg">
            @
          </span>
          <input
            className="w-full bg-mt-pure-black/30 border border-mt-glass-border rounded-2xl pl-10 pr-12 py-4 font-mono text-[15px] leading-[20px] tracking-[0.02em] font-medium text-mt-ledger-white focus:border-mt-primary focus:bg-mt-pure-black/50 focus:outline-none focus:ring-4 focus:ring-mt-primary/10 placeholder:text-mt-on-surface-variant/50 transition-all duration-300 shadow-inner"
            placeholder="your_username"
            value={alias}
            onChange={handleChange}
            maxLength={20}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {checking && (
              <span className="material-symbols-outlined text-mt-on-surface-variant animate-spin text-[20px]">
                progress_activity
              </span>
            )}
            {!checking && available === true && (
              <span className="material-symbols-outlined text-mt-primary text-[20px]">
                check_circle
              </span>
            )}
            {!checking && available === false && (
              <span className="material-symbols-outlined text-mt-error text-[20px]">
                cancel
              </span>
            )}
          </div>
        </div>
        {error && (
          <p className="text-mt-error text-sm mt-2 font-body">{error}</p>
        )}
        {available && !error && (
          <p className="text-mt-primary text-sm mt-2 font-body">
            @{alias} is available
          </p>
        )}
      </div>

      <button
        disabled={!available || !!error}
        onClick={() => onAliasConfirmed(alias)}
        className="w-full bg-mt-primary text-mt-pure-black font-body text-base font-bold rounded-full py-4 hover:bg-mt-primary-fixed hover:shadow-[0_0_24px_rgba(66,238,147,0.4)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex justify-center items-center gap-2"
      >
        <span className="material-symbols-outlined">verified</span>
        Claim @{alias || "username"}
      </button>
    </div>
  );
};
