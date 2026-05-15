'use client';

import { PageLayout } from "@/components/page-layout";
import { AuroraText } from "@/components/ui/aurora-text";
import { useTheme } from "next-themes";
import Head from "next/head";
import Link from "next/link";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

const MAIN_DOMAIN = "https://siz.land";
const WHATSAPP_CONTACT = "https://chat.whatsapp.com/FY0OAor6s72ErtxgxaP1ZL";

const SEO = {
  title: "Web Development Rate Card | Sizland Solutions",
  description:
    "Transparent web development packages for professionals and growing brands in Kenya. Launchpad, Authority, and Ecosystem tiers with clear pricing in KES.",
  keywords:
    "web development Kenya, website packages, Sizland rate card, M-Pesa website, SEO Kenya, business website KES",
  baseUrl: "https://solutions.siz.land/ratecard",
  ogImage: "https://siz.land/logo1.png",
  ogImageAlt: "Sizland web development rate card",
  subject: "Web Development Services",
};

type Tier = {
  icon: keyof typeof Icons;
  name: string;
  tag: string;
  price: string;
  structure: string;
  summary: string;
  highlights: string[];
  edge: string;
  featured?: boolean;
};

const tiers: Tier[] = [
  {
    icon: "Rocket",
    name: "Sizland Launchpad",
    tag: "Entry",
    price: "25,000",
    structure: "3 high-conversion pages",
    summary:
      "Designed for individual professionals and small service startups that need a strong, conversion-focused online presence.",
    highlights: [
      "Hero landing page built around your unique selling proposition",
      "Rate card or package section to filter serious leads",
      "FAQ with social proof to build trust from day one",
      "Lead capture via WhatsApp, email, or custom contact form CTAs",
    ],
    edge:
      "Mobile-first build with load speeds under two seconds for a smooth experience from the first click.",
  },
  {
    icon: "Shield",
    name: "Sizland Authority",
    tag: "Standard",
    price: "35,000",
    structure: "5 strategic pages",
    featured: true,
    summary:
      "Ideal for established brands strengthening their online presence and showing up more consistently in search results.",
    highlights: [
      "Everything in Launchpad, plus an industry blog or insights section",
      "Dedicated About or Portfolio page for credibility and past work",
      "Three-month content strategy: keyword research and content pillars",
      "Advanced on-page SEO with schema markup and meta optimization",
    ],
    edge:
      "Advanced on-page SEO—including schema markup and meta optimization—to improve visibility when clients search for your services.",
  },
  {
    icon: "Layers",
    name: "Sizland Ecosystem",
    tag: "Pro / Exec",
    price: "45,000",
    structure: "Full technical infrastructure",
    summary:
      "For business owners who want more than a website—automation, client management, and efficient scaling.",
    highlights: [
      "Everything in Authority, plus integrated M-Pesa, bank, and card payments",
      "Automated receipt generation and secure admin dashboard",
      "Built-in client database with full data ownership and export",
      "Customer service tools: live chat or ticketing system",
    ],
    edge:
      "A complete business-in-a-box setup designed for control, efficiency, and frictionless scaling.",
  },
];

const addOns = [
  {
    service: "SEO Maintenance",
    rate: "10k/mo (Months 1–3)",
    details: "Intensive ranking and content creation.",
  },
  {
    service: "SEO Retainer",
    rate: "5k/mo (Month 4+)",
    details: "Ongoing monitoring and minor updates.",
  },
  {
    service: "Identity Branding",
    rate: "5,000 KES",
    details: "Professional logo and brand color palette.",
  },
  {
    service: "Growth Ads",
    rate: "Custom Quote",
    details: "Infographics, video ads, or PPC campaigns.",
  },
  {
    service: "Sizland Care",
    rate: "Free (6 Months)",
    details: "Technical health, security, and hosting oversight.",
  },
];

const RatecardPage: NextPage = () => {
  const { theme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const cardBase = (featured?: boolean) =>
    `rounded-2xl border p-6 sm:p-8 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 ${
      featured
        ? isDark
          ? "border-emerald-400/50 bg-emerald-500/10 ring-1 ring-emerald-400/30"
          : "border-emerald-500 bg-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
        : isDark
          ? "border-white/10 bg-white/5 hover:border-emerald-500/30"
          : "border-emerald-500/20 bg-white/90 hover:border-emerald-500/40"
    }`;

  const edgeBoxClass = isDark
    ? "rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
    : "rounded-xl border border-emerald-500/25 bg-emerald-50/80 p-4";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: SEO.title,
    description: SEO.description,
    url: SEO.baseUrl,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://siz.land" },
        { "@type": "ListItem", position: 2, name: "Solutions", item: "https://solutions.siz.land" },
        { "@type": "ListItem", position: 3, name: "Rate Card", item: SEO.baseUrl },
      ],
    },
    offers: tiers.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      price: tier.price.replace(/,/g, ""),
      priceCurrency: "KES",
      description: tier.summary,
    })),
  };

  return (
    <>
      <Head>
        <meta name="keywords" content={SEO.keywords} />
        <link rel="canonical" href={SEO.baseUrl} />
        <meta name="robots" content="index, follow" />
        <meta property="og:image:alt" content={SEO.ogImageAlt} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <PageLayout
        title={SEO.title}
        description={SEO.description}
        url={SEO.baseUrl}
        image={SEO.ogImage}
        requireAuth={false}
        setSocialMetadata={true}
      >
        <div className="min-h-screen w-full">
          {/* Hero */}
          <section className="relative pt-4 sm:pt-6 md:pt-8 pb-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
            >
              <Link
                href="/solutions"
                className={`inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors ${
                  isDark
                    ? "text-emerald-300 hover:text-emerald-200"
                    : "text-emerald-700 hover:text-emerald-800"
                }`}
              >
                <Icons.ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                Back to Solutions
              </Link>

              <div className="max-w-3xl space-y-6">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-2 w-2 rounded-full ${
                      isDark ? "bg-emerald-400" : "bg-emerald-500"
                    }`}
                  />
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500 dark:text-emerald-300">
                    Web Development · Kenya
                  </span>
                </div>

                <h1
                  className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Sizland <AuroraText>Rate Card.</AuroraText>
                </h1>

                <p
                  className={`text-lg md:text-xl leading-relaxed ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Professional, high-performance websites built for conversion—not generic freelance deliverables.
                  Choose the tier that matches your stage, then scale with add-ons when you are ready.
                </p>
              </div>
            </motion.div>
          </section>

          {/* Tiers */}
          <section className="relative pb-20 w-full" aria-labelledby="tiers-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-12 space-y-3 max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500 dark:text-emerald-300">
                  Core Packages
                </span>
                <h2
                  id="tiers-heading"
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Three tiers. One standard of craft.
                </h2>
              </div>

              <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
                {tiers.map((tier) => {
                  const Icon = (Icons[tier.icon] as LucideIcon) || Icons.Box;
                  return (
                    <article key={tier.name} className={cardBase(tier.featured)}>
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col h-full"
                      >
                        {tier.featured && (
                          <span
                            className={`mb-4 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                              isDark
                                ? "bg-emerald-400/20 text-emerald-300"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            Most Popular
                          </span>
                        )}

                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                            isDark
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          <Icon size={24} aria-hidden />
                        </div>

                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">
                          {tier.tag}
                        </p>
                        <h3
                          className={`mt-1 text-xl font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {tier.name}
                        </h3>

                        <div className="mt-4 flex items-baseline gap-1">
                          <span
                            className={`text-3xl sm:text-4xl font-bold tabular-nums ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {tier.price}
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            KES
                          </span>
                        </div>

                        <p
                          className={`mt-1 text-sm font-semibold ${
                            isDark ? "text-emerald-300/90" : "text-emerald-700"
                          }`}
                        >
                          {tier.structure}
                        </p>

                        <p
                          className={`mt-4 text-sm leading-relaxed flex-grow ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {tier.summary}
                        </p>

                        <ul className="mt-5 space-y-2.5">
                          {tier.highlights.map((item) => (
                            <li key={item} className="flex gap-2.5 text-sm">
                              <Icons.Check
                                className={`mt-0.5 h-4 w-4 shrink-0 ${
                                  isDark ? "text-emerald-400" : "text-emerald-600"
                                }`}
                                aria-hidden
                              />
                              <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <motion.div
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.15, duration: 0.35 }}
                          className={`mt-6 ${edgeBoxClass}`}
                        >
                          <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-300">
                            The Sizland Edge
                          </p>
                          <p
                            className={`mt-2 text-sm leading-relaxed ${
                              isDark ? "text-gray-200" : "text-gray-800"
                            }`}
                          >
                            {tier.edge}
                          </p>
                        </motion.div>
                      </motion.div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Add-ons */}
          <section
            className={`relative py-20 w-full ${
              isDark ? "bg-white/[0.02]" : "bg-emerald-50/40"
            }`}
            aria-labelledby="addons-heading"
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 space-y-3 max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-500 dark:text-emerald-300">
                  Add-on Services
                </span>
                <h2
                  id="addons-heading"
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  The upsell menu
                </h2>
                <p className={`text-base ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Extend any package when you need ongoing growth, branding, or campaign support.
                </p>
              </div>

              {/* Desktop table */}
              <div
                className={`hidden md:block overflow-hidden rounded-2xl border ${
                  isDark ? "border-white/10" : "border-emerald-500/20"
                }`}
              >
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr
                      className={
                        isDark
                          ? "border-b border-white/10 bg-white/5"
                          : "border-b border-emerald-500/15 bg-white"
                      }
                    >
                      <th
                        scope="col"
                        className={`px-6 py-4 font-bold uppercase tracking-wider text-xs ${
                          isDark ? "text-emerald-300" : "text-emerald-700"
                        }`}
                      >
                        Service
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-4 font-bold uppercase tracking-wider text-xs ${
                          isDark ? "text-emerald-300" : "text-emerald-700"
                        }`}
                      >
                        Rate
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-4 font-bold uppercase tracking-wider text-xs ${
                          isDark ? "text-emerald-300" : "text-emerald-700"
                        }`}
                      >
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {addOns.map((row, i) => (
                      <tr
                        key={row.service}
                        className={
                          i < addOns.length - 1
                            ? isDark
                              ? "border-b border-white/5"
                              : "border-b border-emerald-500/10"
                            : ""
                        }
                      >
                        <td
                          className={`px-6 py-4 font-semibold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {row.service}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap tabular-nums ${
                            isDark ? "text-emerald-300" : "text-emerald-700"
                          }`}
                        >
                          {row.rate}
                        </td>
                        <td
                          className={`px-6 py-4 ${
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {row.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden grid gap-4">
                {addOns.map((row) => (
                  <article
                    key={row.service}
                    className={`rounded-2xl border p-5 ${
                      isDark
                        ? "border-white/10 bg-white/5"
                        : "border-emerald-500/20 bg-white"
                    }`}
                  >
                    <h3
                      className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {row.service}
                    </h3>
                    <p
                      className={`mt-1 text-sm font-semibold ${
                        isDark ? "text-emerald-300" : "text-emerald-700"
                      }`}
                    >
                      {row.rate}
                    </p>
                    <p
                      className={`mt-2 text-sm ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {row.details}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section
            className={`relative w-full py-12 md:py-14 ${
              isDark
                ? "bg-[#0a0f0d]"
                : "bg-gradient-to-t from-green-100/90 via-green-50/70 to-white"
            }`}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
                <span
                  className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                    isDark ? "text-[#00E07A]" : "text-emerald-600"
                  }`}
                >
                  Ready to build?
                </span>
                <h2
                  className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                    isDark ? "text-[#E6FFF2]" : "text-[#0B1F16]"
                  }`}
                >
                  Let&apos;s scope your package.
                </h2>
                <p className={`text-base ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  Tell us which tier fits—or mix in add-ons. We respond within two hours on business days.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center pt-2">
                  <Link
                    href={isLoggedIn ? WHATSAPP_CONTACT : `${MAIN_DOMAIN}/auth-choice`}
                    className={`inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-all ${
                      isDark
                        ? "bg-[#00E07A] text-[#0B1F16] hover:bg-[#00c96a]"
                        : "bg-emerald-500 text-white hover:bg-emerald-600"
                    }`}
                    {...(isLoggedIn && { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    Contact Architects
                  </Link>
                  <Link
                    href="/solutions"
                    className={`inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold uppercase tracking-wider rounded-lg transition-all border ${
                      isDark
                        ? "border-[#00E07A] text-[#E6FFF2] hover:bg-white/5"
                        : "border-emerald-600 text-[#0B1F16] hover:bg-emerald-50"
                    }`}
                  >
                    View Solutions
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </PageLayout>
    </>
  );
};

export default RatecardPage;
