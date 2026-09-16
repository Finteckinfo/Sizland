import { PageLayout } from "@/components/page-layout";
import { NextPage } from "next/types";
import Head from "next/head";
import React from "react";
import { Hero } from "@/components/hero";
import IdentityPivot from "@/components/identity-pivot";
import Features from "@/components/features";
import About from "@/components/about";
import InfoHub from "@/components/infoHub";
import Roadmap from "@/components/roadmap";

const SITE_NAME = "Sizland";
const SITE_URL = "https://www.siz.land/";
const SITE_TITLE = "Sizland | The Decentralized Operating System for Sovereign Remote Workers";
const SITE_DESCRIPTION =
  "Invisible, censorship-resistant infrastructure for the global remote workforce — client-side DiD, multi-chain unified wallets, and sovereign reputation.";
const SITE_IMAGE = "https://www.siz.land/metaimage.png";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: SITE_IMAGE,
      sameAs: ["https://twitter.com/sizlandofficial"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />
        <link rel="canonical" href={SITE_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content={SITE_IMAGE} />
        <meta property="og:image:alt" content={SITE_TITLE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sizlandofficial" />
        <meta name="twitter:creator" content="@sizlandofficial" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content={SITE_IMAGE} />
        <meta name="twitter:image:alt" content={SITE_TITLE} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <PageLayout
        title={SITE_TITLE}
        description={SITE_DESCRIPTION}
        url={SITE_URL}
        requireAuth={false}
        setSocialMetadata={false}
      >
        <section id="hero">
          <Hero />
        </section>
      </PageLayout>

      <IdentityPivot />

      <Features />

      <PageLayout requireAuth={false} includeHead={false}>
        <section id="technology">
          <About />
        </section>
      </PageLayout>

      <PageLayout requireAuth={false} includeHead={false}>
        <section id="roadmap">
          <Roadmap />
        </section>
      </PageLayout>

      <InfoHub />
    </>
  );
};

export default HomePage;
