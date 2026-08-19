"use client";

import React from "react";

interface AggregatedBalanceProps {
  expectedIn: number;
  goingOut: number;
  currency: string;
}

export const AggregatedBalance: React.FC<AggregatedBalanceProps> = ({
  expectedIn,
  goingOut,
  currency,
}) => (
  <div className="grid grid-cols-2 gap-4 mb-8">
    <div className="bg-mt-primary/5 border border-mt-primary/15 rounded-2xl p-5 flex flex-col items-center text-center">
      <span className="material-symbols-outlined text-mt-primary text-2xl mb-2">
        south_west
      </span>
      <p className="font-label text-[10px] tracking-wider uppercase text-mt-on-surface-variant mb-1">
        Expected In
      </p>
      <p className="font-mono text-xl text-mt-primary font-bold">
        {expectedIn.toLocaleString()}
      </p>
      <p className="font-mono text-xs text-mt-on-surface-variant">{currency}</p>
    </div>

    <div className="bg-mt-error/5 border border-mt-error/15 rounded-2xl p-5 flex flex-col items-center text-center">
      <span className="material-symbols-outlined text-mt-error text-2xl mb-2">
        north_east
      </span>
      <p className="font-label text-[10px] tracking-wider uppercase text-mt-on-surface-variant mb-1">
        Going Out
      </p>
      <p className="font-mono text-xl text-mt-error font-bold">
        {goingOut.toLocaleString()}
      </p>
      <p className="font-mono text-xs text-mt-on-surface-variant">{currency}</p>
    </div>
  </div>
);
