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

const SITE_TITLE = "Sizland | The Decentralized Operating System for Sovereign Remote Workers";
const SITE_DESCRIPTION =
  "Invisible, censorship-resistant infrastructure for the global remote workforce — client-side DiD, multi-chain unified wallets, and sovereign reputation.";

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{SITE_TITLE}</title>
        <meta name="description" content={SITE_DESCRIPTION} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.siz.land/" />
        <meta property="og:title" content={SITE_TITLE} />
        <meta property="og:description" content={SITE_DESCRIPTION} />
        <meta property="og:image" content="https://www.siz.land/metaimage.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Sizland" />
        <meta property="og:locale" content="en_US" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sizlandofficial" />
        <meta name="twitter:creator" content="@sizlandofficial" />
        <meta name="twitter:title" content={SITE_TITLE} />
        <meta name="twitter:description" content={SITE_DESCRIPTION} />
        <meta name="twitter:image" content="https://www.siz.land/metaimage.png" />
      </Head>

      <PageLayout
        title={SITE_TITLE}
        description={SITE_DESCRIPTION}
        requireAuth={false}
        setSocialMetadata={false}
      >
        <section id="hero">
          <Hero />
        </section>
      </PageLayout>

      <IdentityPivot />

      <Features />

      <PageLayout title="#technology" description="Sizland technology" requireAuth={false} setSocialMetadata={false}>
        <section id="technology">
          <About />
        </section>
      </PageLayout>

      <PageLayout title="#roadmap" description="Sizland roadmap" requireAuth={false} setSocialMetadata={false}>
        <section id="roadmap">
          <Roadmap />
        </section>
      </PageLayout>

      <InfoHub />
    </>
  );
};

export default HomePage;
