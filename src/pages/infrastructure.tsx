'use client';

import { PageLayout } from "@/components/page-layout";
import { AuroraText } from "@/components/ui/aurora-text";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const infrastructureModules = [
  {
    icon: "Coins" as const,
    title: "ECONOMY INFRASTRUCTURE",
    description: "Token-based access, staking, and seamless interoperability between fiat and digital assets across the Sizland ecosystem.",
    features: ["ATOMIC SWAPS", "TOKEN-GATED MODULES", "MULTI-CURRENCY SUPPORT"],
  },
  {
    icon: "TrendingUp" as const,
    title: "GROWTH ARCHITECTURE",
    description: "Scalable SDK framework for integrating third-party apps and extending functionality without compromising security.",
    features: ["MODULAR SDK FRAMEWORK", "APIs FOR THIRD-PARTY", "PLUGIN ECOSYSTEM"],
  },
  {
    icon: "Shield" as const,
    title: "TREASURY & REPUTATION",
    description: "Multi-signature vaults and on-chain reputation for transparent governance and secure fund management.",
    features: ["MULTI-SIGNATURE VAULTS", "ON-CHAIN REPUTATION", "DAO GOVERNANCE"],
  },
  {
    icon: "Settings" as const,
    title: "SYSTEM AUTOMATION",
    description: "Automated workflows and yield optimization bots to reduce manual operations and maximize efficiency.",
    features: ["YIELD OPTIMIZATION BOTS", "WORKFLOW AUTOMATION", "SMART TRIGGERS"],
  },
];

const auditBlocks = [
  {
    icon: "Database" as const,
    title: "DATA SOVEREIGNTY",
    description: "Your data remains under your control. End-to-end encryption and user-controlled permissions ensure full sovereignty over business and financial records.",
  },
  {
    icon: "Globe" as const,
    title: "GLOBAL MESH",
    description: "A distributed infrastructure spanning multiple regions. Resilient to systemic shocks with redundant nodes and instant failover.",
  },
];

const InfrastructurePage: NextPage = () => {
  const { resolvedTheme: theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const iconWrapClass = `flex h-12 w-12 items-center justify-center rounded-xl ${
    isDark ? "bg-emerald-500/15 text-emerald-300" : "bg-emerald-500/10 text-emerald-600"
  }`;

  return (
    <PageLayout
      title="Infrastructure - Sizland Solutions"
      description="Advanced infrastructure for the next generation of digital economies. Deploy scalable, secure, and automated systems with Sizland."
      requireAuth={false}
    >
      <div className="min-h-screen w-full">
        {/* Hero Section */}
        <section className="relative pt-4 sm:pt-6 md:pt-8 pb-24 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Copy */}
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      isDark ? "bg-emerald-400" : "bg-emerald-500"
                    }`}
                  />
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500 dark:text-emerald-300">
                    NETWORK STATUS. OPERATIONAL
                  </span>
                </div>

                <h1
                  className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Establish Your{" "}
                  <AuroraText>Digital Economy.</AuroraText>
                </h1>

                <p
                  className={`text-lg md:text-xl leading-relaxed ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Select a specialized module to deploy. Our architecture provides the technical bedrock for modern infrastructure.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/auth-choice"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-bold text-white bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 rounded-full transition-all duration-200"
                  >
                    INITIALIZE DEPLOYMENT
                  </Link>
                  <Link
                    href="/whitepaper"
                    className={`inline-flex items-center justify-center gap-2 px-8 py-3 text-base font-bold rounded-full transition-all duration-200 ${
                      isDark
                        ? "text-gray-200 border border-emerald-500/40 hover:bg-emerald-500/10"
                        : "text-gray-800 border border-emerald-600/50 hover:bg-emerald-50"
                    }`}
                  >
                    Read Whitepaper
                    <Icons.ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right: Image */}
              <div className="relative w-full aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/firstimage.png"
                  alt="Sizland infrastructure - futuristic circuit"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Available Infrastructure Modules */}
        <section className="relative py-20 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 lg:mb-16 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-start">
              <div className="space-y-4 max-w-xl">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500 dark:text-emerald-300">
                  AVAILABLE INFRASTRUCTURE MODULES
                </span>
                <h2
                  className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Advanced solutions designed for high-availability technical ecosystems.
                </h2>
              </div>
              <p
                className={`text-base md:text-lg leading-relaxed ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Each pillar represents a hardened segment of the Sizland stack, ready for immediate integration into your digital workflow.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {infrastructureModules.map((module) => {
                const Icon = (Icons[module.icon] as LucideIcon) || Icons.Box;
                return (
                  <div
                    key={module.title}
                    className={`rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                      isDark
                        ? "border-white/10 bg-white/5 hover:border-emerald-500/30"
                        : "border-emerald-500/20 bg-white/80 hover:border-emerald-500/40"
                    }`}
                  >
                    <div className={iconWrapClass}>
                      <Icon size={24} />
                    </div>
                    <h3
                      className={`mt-4 text-sm font-bold uppercase tracking-wider ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {module.title}
                    </h3>
                    <p
                      className={`mt-2 text-sm leading-relaxed ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {module.description}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {module.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Icons.ChevronRight
                            className={`h-4 w-4 shrink-0 ${
                              isDark ? "text-emerald-400" : "text-emerald-600"
                            }`}
                          />
                          <span
                            className={
                              isDark ? "text-gray-300" : "text-gray-700"
                            }
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Audits and Results */}
        <section className="relative py-20 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Image */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden order-2 lg:order-1">
                <Image
                  src="/secondimage.png"
                  alt="Sizland global network - Online 25,000 VPN 100+"
                  fill
                  className="object-cover"
                />
                <div
                  className={`absolute bottom-4 left-4 right-4 flex justify-between text-sm font-semibold ${
                    isDark ? "text-gray-200" : "text-gray-800"
                  }`}
                >
                  <span>Online 25,000</span>
                  <span>VPN 100+</span>
                </div>
              </div>

              {/* Right: Copy + blocks */}
              <div className="space-y-8 order-1 lg:order-2">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Icons.Settings
                      className={`h-5 w-5 ${
                        isDark ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    />
                    <span className="text-sm font-semibold text-emerald-500 dark:text-emerald-300">
                      Technical Precision
                    </span>
                  </div>
                  <h2
                    className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Hardened by audits. Driven by results.
                  </h2>
                  <p
                    className={`mt-4 text-base leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    Every line of code in the Sizland stack undergoes rigorous multi-party security audits. Our infrastructure isn&apos;t just fast—it&apos;s immutable and resilient to systemic shocks.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {auditBlocks.map((block) => {
                    const Icon = (Icons[block.icon] as LucideIcon) || Icons.Shield;
                    return (
                      <div
                        key={block.title}
                        className={`rounded-2xl border p-6 ${
                          isDark
                            ? "border-white/10 bg-white/5"
                            : "border-emerald-500/20 bg-white/80"
                        }`}
                      >
                        <div className={iconWrapClass}>
                          <Icon size={24} />
                        </div>
                        <h3
                          className={`mt-4 text-sm font-bold uppercase tracking-wider ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {block.title}
                        </h3>
                        <p
                          className={`mt-2 text-sm leading-relaxed ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {block.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA / Deployment Section */}
        <section
          className={`relative w-full py-[18px] md:py-7 ${
            isDark
              ? "bg-gradient-to-t from-green-950/40 via-green-900/25 to-transparent"
              : "bg-gradient-to-t from-green-100/90 via-green-50/70 to-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center font-inter antialiased">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500 dark:text-emerald-300 mb-6">
                READY FOR DEPLOYMENT
              </span>
              {/* SYSTEM READY. INITIALIZE DEPLOYMENT? - Inter typography spec */}
              <div className="flex flex-col gap-0 max-w-2xl">
                <span
                  className={`uppercase font-bold ${
                    isDark ? "text-[#E6FFF2]" : "text-[#0B1F16]"
                  } text-xl md:text-[28px] tracking-[0.10em] md:tracking-[0.12em] leading-[1.05]`}
                >
                  SYSTEM READY.
                </span>
                <span
                  className="uppercase font-semibold text-[#00E07A] text-base md:text-[20px] tracking-[0.04em] md:tracking-[0.06em] leading-[1.2]"
                >
                  INITIALIZE DEPLOYMENT?
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link
                  href="/auth-choice"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  CONTACT ARCHITECTS
                </Link>
                <Link
                  href="/whitepaper"
                  className={`inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-full transition-all duration-200 ${
                    isDark
                      ? "border border-white/30 text-white hover:bg-white/10"
                      : "border border-gray-800 text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  REQUEST ARCHITECTURE DOCS
                </Link>
              </div>
              <p
                className={`text-sm font-medium uppercase tracking-wider ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                ARCHITECTURAL RESPONSE TIME: &lt; 2 HOURS
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default InfrastructurePage;
