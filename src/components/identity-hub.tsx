"use client";

import React from "react";
import { Network } from "lucide-react";

/** Five wallet-supported chains — positions are on the static frame (desktop) */
const CHAIN_PILLS = [
  {
    label: "Algorand",
    position: "top-[3%] left-1/2 -translate-x-1/2",
    line: { x2: 50, y2: 7 },
  },
  {
    label: "Base",
    position: "top-[14%] right-[3%]",
    line: { x2: 88, y2: 20 },
  },
  {
    label: "BNB Chain",
    position: "bottom-[14%] right-[3%]",
    line: { x2: 88, y2: 80 },
  },
  {
    label: "Sui",
    position: "bottom-[14%] left-[3%]",
    line: { x2: 12, y2: 80 },
  },
  {
    label: "TON",
    position: "bottom-[3%] left-1/2 -translate-x-1/2",
    line: { x2: 50, y2: 93 },
  },
] as const;

function ChainPill({ label }: { label: string }) {
  return (
    <span className="bg-surface-base px-2.5 py-1.5 md:px-3 md:py-1.5 border border-border-subtle rounded-full font-label text-[9px] sm:text-[10px] md:text-xs text-on-surface whitespace-nowrap">
      {label}
    </span>
  );
}

function HubLines() {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none overflow-visible hidden md:block"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {CHAIN_PILLS.map((pill) => (
        <line
          key={pill.label}
          x1="50"
          y1="50"
          x2={pill.line.x2}
          y2={pill.line.y2}
          stroke="rgba(229, 226, 225, 0.2)"
          strokeWidth="0.2"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

export function IdentityHubDiagram() {
  return (
    <div className="relative mx-auto aspect-square w-full min-w-0 max-w-none">
      <div className="absolute inset-[6%] animate-[spin_90s_linear_infinite]">
        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-on-surface/30 rotate-[15deg]" />
      </div>

      <div className="absolute inset-[8%] rounded-2xl border border-on-surface/45 pointer-events-none z-[10]" />

      <HubLines />

      {CHAIN_PILLS.map((pill) => (
        <div
          key={pill.label}
          className={`absolute z-20 hidden md:block ${pill.position}`}
        >
          <ChainPill label={pill.label} />
        </div>
      ))}

      <div className="absolute inset-0 z-30 flex items-center justify-center">
        <div className="flex flex-col items-center text-center">
          <Network
            className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 text-terminal-green mb-3 md:mb-4"
            strokeWidth={1.5}
          />
          <div className="font-label text-xs sm:text-sm md:text-base text-on-surface">
            ONE IDENTITY
          </div>
        </div>
      </div>
    </div>
  );
}
