'use client';

import { SolutionsBooking } from "@/components/solutions/booking";
import { CurrencySwitcher } from "@/components/solutions/currency-switcher";
import { SolutionsRateCards } from "@/components/solutions/rate-cards";
import { PageLayout } from "@/components/page-layout";
import { AuroraText } from "@/components/ui/aurora-text";
import { addOns, packages } from "@/lib/solutions/pricing";
import { useGeoCurrency } from "@/lib/solutions/use-geo-currency";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import { NextPage } from "next";
import { useState } from "react";

const SEO = {
  title: "Web Development Rate Card | Sizland Solutions",
  description:
    "Transparent web development packages for professionals and growing brands. Launchpad, Authority, and Ecosystem tiers with localized pricing.",
  keywords:
    "web development Kenya, website packages, Sizland rate card, M-Pesa website, SEO Kenya, business website",
  baseUrl: "https://solutions.siz.land/ratecard",
  ogImage: "https://siz.land/logo1.png",
  ogImageAlt: "Sizland web development rate card",
  subject: "Web Development Services",
};

const RatecardPage: NextPage = () => {
  const geo = useGeoCurrency();
  const [compare, setCompare] = useState(true);

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
    offers: packages.map((tier) => ({
      "@type": "Offer",
      name: tier.name,
      price: String(Math.round(geo.convertKes(tier.amountKes))),
      priceCurrency: geo.currency,
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <section className="relative pb-12 pt-4 sm:pt-6 md:pt-8">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <Link
                  href="/solutions"
                  className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                  Back to Solutions
                </Link>

                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl space-y-6">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300">
                        Web development · localized rates
                      </span>
                    </div>
                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-on-surface sm:text-5xl lg:text-6xl dark:text-white">
                      Sizland <AuroraText>Rate Card.</AuroraText>
                    </h1>
                    <p className="text-lg leading-relaxed text-on-surface-variant md:text-xl dark:text-gray-300">
                      Professional, high-performance websites built for conversion—not generic freelance
                      deliverables. Amounts follow your region; switch currency any time.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <CurrencySwitcher {...geo} />
                    <button
                      type="button"
                      onClick={() => setCompare((value) => !value)}
                      className="rounded-full border border-emerald-500/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-emerald-800 hover:bg-emerald-500/10 dark:text-emerald-200"
                    >
                      {compare ? "Hide highlights" : "Compare highlights"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </section>

            <section className="relative pb-20" aria-labelledby="tiers-heading">
              <div className="mb-12 max-w-2xl space-y-3">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300">
                  Core packages
                </span>
                <h2
                  id="tiers-heading"
                  className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl dark:text-white"
                >
                  Three tiers. One standard of craft.
                </h2>
              </div>
              <SolutionsRateCards geo={geo} compare={compare} />
            </section>
          </div>

          <section
            className="relative py-20"
            aria-labelledby="addons-heading"
            style={{ background: "color-mix(in srgb, var(--stitch-surface-elevated) 55%, transparent)" }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 max-w-2xl space-y-3">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-300">
                  Add-on services
                </span>
                <h2
                  id="addons-heading"
                  className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl dark:text-white"
                >
                  The upsell menu
                </h2>
                <p className="text-base text-on-surface-variant dark:text-gray-300">
                  Extend any package when you need ongoing growth, branding, or campaign support.
                </p>
              </div>

              <div className="hidden overflow-hidden rounded-2xl border border-emerald-500/20 md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-emerald-500/15 bg-emerald-500/5">
                      <th className="px-6 py-4 font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        Service
                      </th>
                      <th className="px-6 py-4 font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        Rate
                      </th>
                      <th className="px-6 py-4 font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {addOns.map((row, i) => (
                      <tr
                        key={row.id}
                        className={i < addOns.length - 1 ? "border-b border-emerald-500/10" : ""}
                      >
                        <td className="px-6 py-4 font-semibold text-on-surface dark:text-white">
                          {row.service}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 font-mono tabular-nums text-emerald-700 dark:text-emerald-300">
                          {formatAddOn(row, geo)}
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant dark:text-gray-300">
                          {row.details}
                          {row.window ? ` (${row.window})` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 md:hidden">
                {addOns.map((row) => (
                  <article key={row.id} className="solutions-glass rounded-2xl p-5">
                    <h3 className="font-bold text-on-surface dark:text-white">{row.service}</h3>
                    <p className="mt-1 font-mono text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      {formatAddOn(row, geo)}
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant dark:text-gray-300">
                      {row.details}
                      {row.window ? ` (${row.window})` : ""}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SolutionsBooking />
          </div>
        </div>
      </PageLayout>
    </>
  );
};

function formatAddOn(
  row: (typeof addOns)[number],
  geo: ReturnType<typeof useGeoCurrency>
): string {
  if (row.custom) return "Custom quote";
  if (row.amountKes === 0) return "Included";
  if (row.amountKes == null) return "Custom quote";
  if (geo.loading) return "…";
  const price = geo.formatKes(row.amountKes, row.period);
  return row.window ? `${price} · ${row.window}` : price;
}

export default RatecardPage;
