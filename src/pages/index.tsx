import { PageLayout } from "@/components/page-layout";
import { NextPage } from "next/types";
import Head from "next/head";
import React from "react";
import { Hero } from "@/components/hero"; // Import the Hero component
import Features from "@/components/features";
import About from "@/components/about";
import InfoHub from "@/components/infoHub";
import Roadmap from "@/components/roadmap";
import CTASection from "@/components/cta-section";

const HomePage: NextPage = () => {
  return (
    <>
      {/* Single Head component with homepage metadata - ensures WhatsApp sees correct metadata */}
      <Head>
        <title>Sizland - Decentralized Platform for Remote Teams</title>
        <meta name="description" content="Sizland unites remote teams, founders, and freelancers on a decentralized platform where tasks, payments, and growth live transparently on the blockchain. Experience blockchain-powered ERP and investment opportunities." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.siz.land/" />
        <meta property="og:title" content="Sizland - Decentralized Platform for Remote Teams" />
        <meta property="og:description" content="Sizland unites remote teams, founders, and freelancers on a decentralized platform where tasks, payments, and growth live transparently on the blockchain. Experience blockchain-powered ERP and investment opportunities." />
        <meta property="og:image" content="https://www.siz.land/metaimage.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Sizland" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sizlandofficial" />
        <meta name="twitter:creator" content="@sizlandofficial" />
        <meta name="twitter:title" content="Sizland - Decentralized Platform for Remote Teams" />
        <meta name="twitter:description" content="Sizland unites remote teams, founders, and freelancers on a decentralized platform where tasks, payments, and growth live transparently on the blockchain. Experience blockchain-powered ERP and investment opportunities." />
        <meta name="twitter:image" content="https://www.siz.land/metaimage.png" />
      </Head>
      
      <PageLayout 
        title="Sizland - Decentralized Platform for Remote Teams" 
        description="Sizland unites remote teams, founders, and freelancers on a decentralized platform where tasks, payments, and growth live transparently on the blockchain. Experience blockchain-powered ERP and investment opportunities."
        requireAuth={false}
        setSocialMetadata={false}
      >
        <section id="hero">
          <Hero /> {/* Use the Hero component */}
        </section>
      </PageLayout>
      <Features />
      <PageLayout title="#about" description="About sizland" requireAuth={false} setSocialMetadata={false}>
        <section id="about">
          <About />
        </section>
      </PageLayout>
      <InfoHub />
      <PageLayout title="#roadmap" description="roadmap to sizland" requireAuth={false} setSocialMetadata={false}>
        <section id="roadmap">
          <Roadmap />
        </section>
      </PageLayout>
      <CTASection />
    </>
  );
};

export default HomePage;
