import React, { useEffect, useState } from "react";
import featuresData from "@/types/featuresData.json";
import { useTheme } from "next-themes";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import AuroraText from "./ui/aurora-text";

const Features = () => {
  const { resolvedTheme: theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const renderCard = (feature: (typeof featuresData)[number], index: number) => {
    const Icon =
      (Icons[feature.icon as keyof typeof Icons] as LucideIcon) || Icons.Star;

    const isHighlight = feature.title === "Siz Token";
    const isDex = feature.title === "DEX";

    // Determine link for each card
    const isERP = feature.title === "ERP";
    const isFundManager = feature.title === "Fund Manager";
    let href = "#";
    let isExternal = false;
    if (isERP) {
      href = "https://erp.siz.land";
      isExternal = true;
    } else if (isFundManager) {
      href = "https://sandbox.sizland.tech/";
      isExternal = true;
    }

    const cardBaseClasses =
      isHighlight
        ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-slate-900 border-transparent shadow-[0_0_35px_rgba(16,185,129,0.45)]"
        : isDark
          ? "bg-neutral-900/80 text-white border-white/10"
          : "bg-black/5 text-gray-900 border-black/5";

    const hoverClasses = isHighlight
      ? "hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(16,185,129,0.45)]"
      : "hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(16,185,129,0.18)] hover:border-emerald-400/35";

    const iconClasses = isHighlight
      ? "text-emerald-900"
      : isDark
        ? "text-neutral-300"
        : "text-gray-800";

    const titleClasses = isHighlight
      ? "text-slate-900"
      : isDark
        ? "text-white"
        : "text-gray-900";

    const descClasses = isHighlight
      ? "text-slate-800"
      : isDark
        ? "text-neutral-300"
        : "text-gray-700";

    return (
      <a
        key={index}
        href={href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="no-underline"
      >
        <div
          className={`group flex h-full flex-col justify-between border px-6 py-6 md:px-7 md:py-7 transition-all duration-300 cursor-pointer ${cardBaseClasses} ${hoverClasses}`}
        >
          <div
            className={
              isDex
                ? "flex items-start gap-4"
                : "flex flex-col items-start gap-3"
            }
          >
            <Icon size={isDex ? 40 : 32} className={iconClasses} />
            <div className="space-y-1">
              <h3 className={`text-lg font-semibold ${titleClasses}`}>
                {feature.title}
              </h3>
              <p className={`text-sm leading-relaxed ${descClasses}`}>
                {feature.description}
              </p>
            </div>
          </div>
        </div>
      </a>
    );
  };

  const mainCards = featuresData.filter((f) => f.title !== "DEX");
  const dexCard = featuresData.find((f) => f.title === "DEX");

  return (
    <section className="relative pt-8 pb-20 lg:pt-10 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 lg:mb-16 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] items-start">
          {/* Left column: section intro */}
          <div className="space-y-4 max-w-xl">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              Everything You Need to Work and Grow{" "}
              <AuroraText className="inline-block text-emerald-400">
                On-Chain
              </AuroraText>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              From unified wallets to complete ERP tools — each feature is designed to make decentralized work simple,
              fast, and powerful.
            </p>
          </div>

          {/* Right column: cards grid + DEX footer card */}
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              {mainCards.map((feature, index) => renderCard(feature, index))}
            </div>
            {dexCard && (
              <div>
                {renderCard(dexCard, mainCards.length)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
