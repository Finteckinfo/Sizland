'use client';

import { PageLayout } from "@/components/page-layout";
import PDFViewer from "@/components/pdf-viewer";
import { useTheme } from "next-themes";
import { AuroraText } from "@/components/ui/aurora-text";
import { Download } from "lucide-react";
import Link from "next/link";
import { NextPage } from "next";
import { ReactNode, useEffect, useState } from "react";

type WhitepaperBlock = {
  title: string;
  content: ReactNode;
};

const whitepaperContent: WhitepaperBlock[] = [
  {
    title: "1. Introduction",
    content: (
      <>
        <p>
          SizLand represents a paradigm shift in enterprise technology, combining decentralized finance with business
          process automation. At its core lies a multi-tenant ERP system built on Algorand&apos;s blockchain, engineered
          for remote teams and SMEs across emerging markets.
        </p>
        <p>
          Unlike monolithic legacy ERPs, SizLand ships as a modular stack where companies activate only the
          functionalities they need and access everything through a flexible, token-based model instead of large annual
          licenses. The ERP also powers SizLand&apos;s broader ecosystem (investment fund, unified wallet, exchange) so
          operational data and financial services speak the same language—inventory levels can trigger credit decisions
          and payroll releases can settle instantly in the native SIZ token.
        </p>
        <p>
          Built for Africa&apos;s mobile-first economies, the platform supports USSD access for low-connectivity regions
          while maintaining enterprise-grade security via Algorand&apos;s Pure Proof-of-Stake consensus.
        </p>
      </>
    ),
  },
  {
    title: "2. Problem Statement",
    content: (
      <>
        <p>
          Research from the Economic Commission for Africa (2024) shows 60% of African businesses still rely on outdated
          ERP systems. Traditional providers impose average implementation costs above $50,000 plus 22% maintenance,
          creating three core pain points:
        </p>
        <ol className="list-decimal space-y-2 pl-6 text-left">
          <li>
            <strong>Financial Exclusion:</strong> Opaque records keep SMEs from qualifying for loans, contributing to a
            $331B financing gap (African Development Bank).
          </li>
          <li>
            <strong>Remote Work Friction:</strong> Distributed teams juggle disconnected task, communication, and
            payment tools, losing 15–20% productivity (GSMA).
          </li>
          <li>
            <strong>Crypto Incompatibility:</strong> No major ERP natively supports digital assets, forcing teams to run
            parallel payroll and accounting stacks.
          </li>
        </ol>
        <p>
          SizLand resolves each gap with blockchain-native architecture, immutable financials for lenders, unified
          workflows for remote teams, and built-in crypto/fiat interoperability.
        </p>
      </>
    ),
  },
  {
    title: "3. Solution Architecture",
    content: (
      <>
        <h4 className="text-lg font-semibold">3.1 Technical Infrastructure</h4>
        <ul className="list-disc space-y-2 pl-6">
          <li>4-second transaction finality for real-time reporting.</li>
          <li>Average fees of $0.00001 make microtransactions viable.</li>
          <li>Native ISO 20022 alignment and TEAL smart contracts automate business logic.</li>
        </ul>
        <h4 className="mt-6 text-lg font-semibold">3.2 Modular Functionality</h4>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {[
            {
              phase: "Phase 1 · Remote Work Essentials (Q2 2025)",
              bullets: [
                "Task automation with smart-contract triggers.",
                "Integrated time tracking with geofenced verification.",
                "Multi-currency payroll (SIZ, stablecoins, fiat).",
              ],
            },
            {
              phase: "Phase 2 · SME Business Suite (Q4 2025)",
              bullets: [
                "Accounting: real-time GL, AR/AP, tax compliance.",
                "CRM: lead scoring, sales pipeline, loyalty.",
                "Lending integration: dynamic credit, asset tokenization.",
              ],
            },
            {
              phase: "Phase 3 · Industrial Expansion (Q1 2026)",
              bullets: [
                "IoT integration for manufacturing telemetry.",
                "Tokenized procurement with escrow-backed bidding.",
                "Predictive inventory AI powered by historical data.",
              ],
            },
            {
              phase: "Phase 4 · Procurement Services (Q3 2026)",
              bullets: [
                "Decentralized vendor scoring.",
                "Smart-contract tender evaluations.",
                "QR-code verified goods receipt.",
              ],
            },
          ].map((phase) => (
            <div
              key={phase.phase}
              className="rounded-2xl border border-emerald-500/20 bg-white/60 p-4 shadow-sm backdrop-blur dark:bg-white/5 dark:text-gray-100"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                {phase.phase}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {phase.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    title: "4. Tokenomics & Governance",
    content: (
      <>
        <h4 className="text-lg font-semibold">4.1 Utility Functions</h4>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Access Mechanism:</strong> Businesses stake SIZ per active user to unlock modules while earning APY
            from the investment fund.
          </li>
          <li>
            <strong>Governance:</strong> Token holders vote on treasury allocations, module roadmap priorities, and fee
            structures.
          </li>
        </ul>
        <h4 className="mt-6 text-lg font-semibold">4.2 Vesting Schedule</h4>
        <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-500/20 bg-white/60 shadow-sm dark:bg-white/5">
          <div className="grid grid-cols-4 gap-4 border-b border-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
            <span>Allocation</span>
            <span>Tokens</span>
            <span>Cliff</span>
            <span>Vesting</span>
          </div>
          {[
            { allocation: "Foundation", tokens: "30,000,000", cliff: "24 months", vesting: "60 months" },
            { allocation: "Team", tokens: "7,000,000", cliff: "12 months", vesting: "36 months" },
            { allocation: "Liquidity", tokens: "14,000,000", cliff: "None", vesting: "6 months" },
          ].map((row) => (
            <div
              key={row.allocation}
              className="grid grid-cols-4 gap-4 border-b border-emerald-500/10 px-4 py-2 text-sm last:border-b-0"
            >
              <span className="font-medium">{row.allocation}</span>
              <span>{row.tokens}</span>
              <span>{row.cliff}</span>
              <span>{row.vesting}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm">
          The treasury DAO manages funds with quarterly transparent reporting, preventing market flooding and keeping
          contributors aligned long-term.
        </p>
      </>
    ),
  },
  {
    title: "5. Integration Ecosystem",
    content: (
      <div className="space-y-6">
        {[
          {
            heading: "1. Unified Wallet",
            points: [
              "Pay contractors in fiat or digital assets.",
              "Tokenize physical assets as collateral.",
              "Access working-capital loans with lower rates.",
            ],
          },
          {
            heading: "2. Investment Platform",
            points: [
              "Staking rewards sourced from algorithmic FX, crypto staking, and DeFi yield strategies.",
            ],
          },
          {
            heading: "3. Education Hub",
            points: [
              "Web3 business management courses.",
              "Regulatory compliance training.",
              "Smart-contract development workshops for in-house teams.",
            ],
          },
        ].map((block) => (
          <div
            key={block.heading}
            className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-white/70 to-white/40 p-5 shadow-sm dark:from-white/10 dark:to-white/5"
          >
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{block.heading}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {block.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "6. Competitive Differentiation",
    content: (
      <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-white/60 shadow-sm dark:bg-white/5">
        <div className="grid grid-cols-3 gap-4 border-b border-emerald-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
          <span>Feature</span>
          <span>SizLand ERP</span>
          <span>Traditional Competitors</span>
        </div>
        {[
          { feature: "Implementation", sizland: "4 weeks (modular activation)", legacy: "6–12 month deployment" },
          { feature: "Crypto Integration", sizland: "Native SIZ payments", legacy: "None" },
          { feature: "Lending Access", sizland: "Pre-approved limits", legacy: "Separate application" },
          { feature: "Cost", sizland: "< $20 per month", legacy: "≈ $50K per year" },
        ].map((row) => (
          <div key={row.feature} className="grid grid-cols-3 gap-4 border-b border-emerald-500/10 px-4 py-2 text-sm last:border-b-0">
            <span className="font-medium">{row.feature}</span>
            <span>{row.sizland}</span>
            <span>{row.legacy}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "7. Compliance Framework",
    content: (
      <ol className="list-decimal space-y-3 pl-6">
        <li>
          <strong>Data Protection:</strong> GDPR-compliant storage, end-to-end encryption, user-controlled permissions,
          and right-to-be-forgotten tooling.
        </li>
        <li>
          <strong>Financial Regulation:</strong> In partnership with Kenya&apos;s CMA to secure Digital Asset Service
          Provider licensing plus crowdfunding authorization.
        </li>
        <li>
          <strong>Enterprise Standards:</strong> SOC 2 Type II in progress with recurring smart-contract audits and
          documented remediation plans.
        </li>
      </ol>
    ),
  },
  {
    title: "8. Roadmap & Projections",
    content: (
      <>
        <h4 className="text-lg font-semibold">8.1 Development Timeline</h4>
        <p>Phased rollout (2025–2026) covering remote work tooling, SME suites, industrial expansion, and procurement.</p>
        <h4 className="mt-4 text-lg font-semibold">8.2 Financial Projections</h4>
        <ul className="list-disc space-y-2 pl-6">
          <li>Year 1: 1,200 SME clients (≈ $240K MRR).</li>
          <li>Year 3: 9,500 clients across Africa (≈ $1.9M MRR).</li>
          <li>Year 5: Expansion to Latin America (≈ $4.3M MRR).</li>
        </ul>
      </>
    ),
  },
  {
    title: "9. Conclusion",
    content: (
      <>
        <p>
          SizLand ERP is an economic empowerment platform—blending blockchain transparency with intuitive business
          tooling so teams transact securely anywhere.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6">
          <li>A Nairobi freelancer gets paid instantly once tasks are approved.</li>
          <li>A Buenos Aires retailer accesses inventory financing via tokenized assets.</li>
          <li>A Delhi manufacturer automates cross-border supplier payments.</li>
        </ul>
      </>
    ),
  },
];

const WhitepaperPage: NextPage = () => {
  const { resolvedTheme: theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PageLayout
      title="Sizland Whitepaper - Technical Documentation"
      description="Complete Sizland ecosystem documentation and technical specifications. Learn about our blockchain-powered ERP system, tokenomics, and roadmap for remote teams."
      requireAuth={false}
    >
      <div className="min-h-screen w-full">
        {/* Top Section: Whitepaper Introduction */}
        <section className="relative pt-12 sm:pt-16 md:pt-24 pb-24 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8 text-center">
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                <span className={isDark ? "text-white" : "text-black"}>
                  Sizland White
                </span>
                <AuroraText>paper</AuroraText>
              </h1>

              {/* Description */}
              <p className={`text-lg md:text-xl leading-relaxed ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Discover the complete technical documentation, tokenomics, and roadmap for the Sizland ecosystem. Our comprehensive whitepaper covers everything from blockchain integration to business solutions.
              </p>
                
                {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                      href="/sizland-whitepaper.pdf" 
                      download="Sizland-Whitepaper-3.0.pdf"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-bold text-white bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 rounded-full transition-all duration-200"
                    >
                  <Download className="w-5 h-5" />
                      Download PDF
                    </a>

                <Link
                  href="/"
                  className={`inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-bold rounded-full transition-all duration-200 ${
                    isDark
                      ? "text-gray-900 bg-white hover:bg-gray-100"
                      : "text-gray-900 bg-white hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  Join our community
                    </Link>
                </div>

              {/* Statistics - Below buttons, matching hero section design */}
              <div className="flex items-center justify-center mt-16 sm:mt-20 md:mt-24 space-x-10 sm:space-x-16 md:space-x-20">
                {/* 3.0 Latest Release */}
                <div className="flex flex-col items-center text-center">
                  <p className={`text-5xl font-medium sm:text-6xl md:text-7xl font-pj ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    3.0
                  </p>
                  <p className={`mt-1 text-sm font-pj ${
                    isDark ? "text-gray-300" : "text-gray-900"
                  }`}>
                    Latest Release
                  </p>
              </div>
              
                {/* spacer */}
                <div className="hidden sm:block">
                  <svg
                    className={isDark ? "text-gray-600" : "text-gray-400"}
                    width="16"
                    height="39"
                    viewBox="0 0 16 39"
                    fill="none"
                    stroke="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line x1="0.72265" y1="10.584" x2="15.7226" y2="0.583975"></line>
                    <line x1="0.72265" y1="17.584" x2="15.7226" y2="7.58398"></line>
                    <line x1="0.72265" y1="24.584" x2="15.7226" y2="14.584"></line>
                    <line x1="0.72265" y1="31.584" x2="15.7226" y2="21.584"></line>
                    <line x1="0.72265" y1="38.584" x2="15.7226" y2="28.584"></line>
                  </svg>
                </div>

                {/* 50+ Total Pages */}
                <div className="flex flex-col items-center text-center">
                  <p className={`text-5xl font-medium sm:text-6xl md:text-7xl font-pj ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    50+
                  </p>
                  <p className={`mt-1 text-sm font-pj ${
                    isDark ? "text-gray-300" : "text-gray-900"
                  }`}>
                    Total Pages
                  </p>
                </div>

                {/* spacer */}
                <div className="hidden sm:block">
                  <svg
                    className={isDark ? "text-gray-600" : "text-gray-400"}
                    width="16"
                    height="39"
                    viewBox="0 0 16 39"
                    fill="none"
                    stroke="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line x1="0.72265" y1="10.584" x2="15.7226" y2="0.583975"></line>
                    <line x1="0.72265" y1="17.584" x2="15.7226" y2="7.58398"></line>
                    <line x1="0.72265" y1="24.584" x2="15.7226" y2="14.584"></line>
                    <line x1="0.72265" y1="31.584" x2="15.7226" y2="21.584"></line>
                    <line x1="0.72265" y1="38.584" x2="15.7226" y2="28.584"></line>
                  </svg>
                </div>

                {/* 2025 Updated */}
                <div className="flex flex-col items-center text-center">
                  <p className={`text-5xl font-medium sm:text-6xl md:text-7xl font-pj ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    2025
                  </p>
                  <p className={`mt-1 text-sm font-pj ${
                    isDark ? "text-gray-300" : "text-gray-900"
                  }`}>
                    Updated
                  </p>
              </div>
            </div>
          </div>
        </div>
        </section>

        {/* Middle Section: Whitepaper Narrative */}
        <section className="relative py-16 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
            <div
              className={`rounded-3xl border p-8 shadow-xl ${
                isDark
                  ? "bg-gradient-to-br from-emerald-950/60 via-gray-900/60 to-slate-900/40 border-white/10 text-gray-100"
                  : "bg-gradient-to-br from-white via-emerald-50 to-white border-emerald-100 text-gray-800"
              }`}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-500 dark:text-emerald-300">
                SizLand ERP Whitepaper
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                A Blockchain-Powered Business Automation Platform for Emerging Markets
              </h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                {[
                  { label: "Version", value: "1.1" },
                  { label: "Release", value: "April 2025" },
                  { label: "Focus", value: "Remote Teams • SMEs • Algorand" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs uppercase tracking-widest text-emerald-500 dark:text-emerald-300">
                      {item.label}
                    </p>
                    <p className="text-lg font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {whitepaperContent.map((block) => (
                <article
                  key={block.title}
                  className={`rounded-3xl border p-6 shadow-lg transition ${
                    isDark
                      ? "border-white/10 bg-white/5 text-gray-100"
                      : "border-gray-100 bg-white text-gray-900"
                  }`}
                >
                  <h3 className="text-2xl font-semibold text-emerald-600 dark:text-emerald-300">{block.title}</h3>
                  <div className="prose prose-lg mt-4 max-w-none dark:prose-invert">{block.content}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Middle Section: Interactive PDF Viewer */}
        <section className="py-16 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                <span className={isDark ? "text-white" : "text-black"}>
                Interactive PDF Viewer
                </span>
              </h2>
              <p className={`text-base md:text-lg max-w-2xl mx-auto ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Use the controls below to zoom, rotate, and navigate through the document. Press <kbd className={`px-2 py-1 rounded text-sm ${
                  isDark ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-700"
                }`}>Ctrl+F</kbd> for fullscreen mode.
              </p>
            </div>
            
            {/* PDF Viewer - No background/border container */}
            <div>
            <PDFViewer 
              pdfUrl="/sizland-whitepaper.pdf"
              title="Sizland Whitepaper 3.0"
            />
          </div>
        </div>
        </section>

        {/* Bottom Section: Need More Information? */}
        <section className={`relative py-24 w-full ${
          isDark 
            ? "bg-gradient-to-t from-green-950/40 via-green-900/25 to-transparent" 
            : "bg-gradient-to-t from-green-100/90 via-green-50/70 to-white"
        }`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight max-w-4xl">
                <span className={isDark ? "text-white" : "text-black"}>
                  Need More Information
                </span>
                <AuroraText>?</AuroraText>
              </h2>

              {/* Description */}
              <p className={`text-base md:text-lg leading-relaxed max-w-2xl ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Power your workflows, payments, and investments through a secure, multi-chain platform designed for teams like yours.
              </p>

              {/* CTA Button */}
              <Link
                href="/"
                className={`mt-8 px-8 py-4 text-lg font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                  isDark
                    ? "bg-white text-green-600 hover:bg-green-50"
                    : "bg-white text-green-600 hover:bg-green-50 border-2 border-green-500"
                }`}
              >
                Visit Our Blogs
                  </Link>
              </div>
            </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default WhitepaperPage;
