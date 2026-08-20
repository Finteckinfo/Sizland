"use client";

import React from "react";

interface ReputationBadgeProps {
  level: number; // 0-5; 5 = blacklisted
  alias: string;
}

const LEVEL_STYLES: Record<number, { overlay: string; label: string; border: string }> = {
  0: { overlay: "", label: "Good Standing", border: "border-mt-primary/20" },
  1: { overlay: "grayscale-[25%] opacity-90", label: "1 Disapproval", border: "border-mt-on-surface-variant/30" },
  2: { overlay: "grayscale-[50%] opacity-80", label: "2 Disapprovals", border: "border-mt-on-surface-variant/40" },
  3: { overlay: "grayscale-[65%] opacity-70", label: "3 Disapprovals", border: "border-mt-on-surface-variant/50" },
  4: { overlay: "grayscale-[80%] opacity-60", label: "4 Disapprovals", border: "border-mt-error/30" },
  5: { overlay: "grayscale opacity-50", label: "Blacklisted", border: "border-mt-error/60" },
};

export const ReputationBadge: React.FC<ReputationBadgeProps> = ({ level, alias }) => {
  const clamped = Math.min(Math.max(level, 0), 5);
  const style = LEVEL_STYLES[clamped];
  const isBlacklisted = clamped >= 5;

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full bg-mt-surface-container-highest/50 border ${style.border} flex items-center justify-center ${style.overlay} transition-all duration-300`}
      >
        <span
          className={`material-symbols-outlined text-[18px] ${
            isBlacklisted ? "text-mt-error" : "text-mt-primary"
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isBlacklisted ? "block" : "person"}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="font-body text-sm text-mt-ledger-white font-bold">
          {alias}
        </span>
        {clamped > 0 && (
          <span
            className={`font-label text-[10px] tracking-wider uppercase ${
              isBlacklisted ? "text-mt-error" : "text-mt-on-surface-variant"
            }`}
          >
            {style.label}
          </span>
        )}
      </div>
    </div>
  );
};
