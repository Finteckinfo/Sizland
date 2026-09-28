"use client";

import { packages, type PackageTier } from "@/lib/solutions/pricing";
import type { GeoCurrencyHook } from "@/lib/solutions/use-geo-currency";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { Box, Check, Layers, Rocket, Shield, type LucideIcon } from "lucide-react";
import { useRef, useState, type MouseEvent, type ReactNode } from "react";

const TIER_ICONS: Record<PackageTier["icon"], LucideIcon> = {
  Rocket,
  Shield,
  Layers,
};

function TiltCard({
  featured,
  children,
}: {
  featured?: boolean;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    setTilt({ x: (py - 0.5) * -8, y: (px - 0.5) * 10 });
  };

  const reset = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "solutions-glass solutions-bento flex h-full flex-col rounded-2xl p-6 sm:p-8",
        featured &&
          "ring-1 ring-emerald-500/40 solutions-glow dark:ring-[#00E07A]/40"
      )}
    >
      {children}
    </div>
  );
}

export function SolutionsRateCards({
  geo,
  compare,
}: {
  geo: GeoCurrencyHook;
  compare: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
      {packages.map((tier) => (
        <RateCard key={tier.id} tier={tier} geo={geo} compare={compare} />
      ))}
    </div>
  );
}

function RateCard({
  tier,
  geo,
  compare,
}: {
  tier: PackageTier;
  geo: GeoCurrencyHook;
  compare: boolean;
}) {
  const Icon = TIER_ICONS[tier.icon] || Box;

  return (
    <TiltCard featured={tier.featured}>
      {tier.featured && (
        <span className="mb-4 inline-flex w-fit rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:bg-[#00E07A]/20 dark:text-[#00E07A]">
          Most popular
        </span>
      )}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
        <Icon size={24} aria-hidden />
      </div>
      <p className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
        {tier.tag}
      </p>
      <h3 className="mt-1 text-xl font-bold text-on-surface dark:text-white">
        {tier.name}
      </h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums text-on-surface sm:text-4xl dark:text-white">
          {geo.loading ? "—" : geo.formatKes(tier.amountKes)}
        </span>
      </div>
      <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300/90">
        {tier.structure}
      </p>
      <p className="mt-4 flex-grow text-sm leading-relaxed text-on-surface-variant dark:text-gray-300">
        {tier.summary}
      </p>
      {compare && (
        <motion.ul
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-5 space-y-2.5 overflow-hidden"
        >
          {tier.highlights.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                aria-hidden
              />
              <span className="text-on-surface-variant dark:text-gray-300">
                {item}
              </span>
            </li>
          ))}
        </motion.ul>
      )}
      <div className="mt-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
          The Sizland edge
        </p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface dark:text-gray-200">
          {tier.edge}
        </p>
      </div>
    </TiltCard>
  );
}
