import { PageLayout } from "@/components/page-layout";
import { NextPage } from "next/types";
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
      <PageLayout 
        title="Sizland - Decentralized Platform for Remote Teams" 
        description="Sizland unites remote teams, founders, and freelancers on a decentralized platform where tasks, payments, and growth live transparently on the blockchain. Experience blockchain-powered ERP and investment opportunities."
        requireAuth={false}
      >
        <section id="hero">
          <Hero /> {/* Use the Hero component */}
        </section>
      </PageLayout>
      <Features />
      <PageLayout title="#about" description="About sizland" requireAuth={false}>
        <section id="about">
          <About />
        </section>
      </PageLayout>
      <InfoHub />
      <PageLayout title="#roadmap" description="roadmap to sizland" requireAuth={false}>
        <section id="roadmap">
          <Roadmap />
        </section>
      </PageLayout>
      <CTASection />
    </>
  );
};

export default HomePage;
