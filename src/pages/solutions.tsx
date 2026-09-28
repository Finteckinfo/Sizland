'use client';

import { SolutionsBento } from "@/components/solutions/bento";
import { SolutionsBooking } from "@/components/solutions/booking";
import { SolutionsHero } from "@/components/solutions/hero";
import { SolutionsHowTo } from "@/components/solutions/how-to";
import { SolutionsRatePreview } from "@/components/solutions/rate-preview";
import { SolutionsSectionNav } from "@/components/solutions/section-nav";
import { SolutionsStartKit } from "@/components/solutions/start-kit";
import { PageLayout } from "@/components/page-layout";
import { packages } from "@/lib/solutions/pricing";
import { useGeoCurrency } from "@/lib/solutions/use-geo-currency";
import { NextPage } from "next";
import Head from "next/head";

const SEO = {
  baseUrl: "https://solutions.siz.land",
  title: "Solutions - Sizland | Digital Economy Infrastructure & Blockchain ERP",
  alternateNames: [
    "Sizland Solutions | Digital Economy Infrastructure Kenya",
    "Blockchain ERP Solutions | Sizland Enterprise Infrastructure",
    "DeFi Infrastructure | Token-Based Access & Automation",
  ],
  description:
    "Deploy scalable, secure infrastructure for the next generation of digital economies. Sizland Solutions offers economy infrastructure, growth architecture, treasury systems, and automation—audited, resilient, and ready for integration.",
  keywords:
    "Sizland solutions, digital economy infrastructure, blockchain ERP, token-based access, multi-signature vaults, DeFi infrastructure, SME automation, enterprise blockchain, Algorand, decentralized finance, Kenya blockchain, digital economy Kenya",
  ogImage: "https://solutions.siz.land/SEOimage.png",
  ogImageAlt: "Sizland Solutions - Digital economy infrastructure and blockchain ERP platform",
  subject: "Digital Economy Infrastructure, Blockchain ERP, DeFi Solutions, Enterprise Automation",
};

const SolutionsPage: NextPage = () => {
  const geo = useGeoCurrency();

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
        { "@type": "ListItem", position: 2, name: "Solutions", item: SEO.baseUrl },
      ],
    },
    inLanguage: "en-KE",
    publisher: {
      "@type": "Organization",
      name: "Sizland Solutions",
      url: "https://siz.land",
      areaServed: { "@type": "Country", name: "Kenya" },
      logo: {
        "@type": "ImageObject",
        url: "https://siz.land/logo1.png",
      },
    },
    mainEntity: {
      "@type": "SoftwareApplication",
      name: "Sizland Solutions",
      alternateName: SEO.alternateNames,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: packages.map((tier) => ({
        "@type": "Offer",
        name: tier.name,
        price: String(Math.round(geo.convertKes(tier.amountKes))),
        priceCurrency: geo.currency,
        description: tier.summary,
      })),
      featureList: [
        "Economy Infrastructure",
        "Growth Architecture",
        "Treasury & Reputation",
        "System Automation",
      ],
    },
  };

  return (
    <>
      <Head>
        <meta name="keywords" content={SEO.keywords} />
        <link rel="canonical" href={SEO.baseUrl} />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Sizland" />
        <meta property="og:image:alt" content={SEO.ogImageAlt} />
        <meta name="twitter:image:alt" content={SEO.ogImageAlt} />
        <meta property="og:image:secure_url" content={SEO.ogImage} />
        <meta property="og:image:type" content="image/png" />
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Kenya" />
        <meta name="ICBM" content="-1.2921, 36.8219" />
        <meta name="DC.title" content={SEO.title} />
        <meta name="subject" content={SEO.subject} />
        <meta name="topic" content={SEO.subject} />
        <meta name="classification" content="Business, Technology, Blockchain" />
        <meta name="distribution" content="global" />
        <meta name="target" content="all" />
        <meta name="application-name" content="Sizland Solutions" />
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
            <SolutionsSectionNav />
            <SolutionsHero />
            <SolutionsBento />
            <SolutionsHowTo />
            <SolutionsStartKit geo={geo} />
            <SolutionsRatePreview geo={geo} />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SolutionsBooking />
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default SolutionsPage;
