import { PageLayout } from "@/components/page-layout";
import { NextPage } from "next/types";
import React from "react";
import { Hero } from "@/components/hero"; // Import the Hero component
import Features from "@/components/features";
import About from "@/components/about";
import InfoHub from "@/components/infoHub";
import Roadmap from "@/components/roadmap";

const HomePage: NextPage = () => {
  return (
    <>
      <PageLayout title="Homepage" description="Welcome to Sizland">
        <section id="hero">
          <Hero /> {/* Use the Hero component */}
        </section>
      </PageLayout>
      <Features />
      <PageLayout title="#about" description="About sizland">
        <section id="about">
          <About />
        </section>
      </PageLayout>
      <InfoHub />
      <PageLayout title="#roadmap" description="roadmap to sizland">
        <section id="roadmap">
          <Roadmap />
        </section>
      </PageLayout>
    </>
  );
};

export default HomePage;
