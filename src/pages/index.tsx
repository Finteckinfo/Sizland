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
        <Hero /> {/* Use the Hero component */}
      </PageLayout>
       <Features />
      <PageLayout title="" description="About sizland">
        <About />
      </PageLayout>
      <InfoHub />
      <PageLayout title="" description="roadmap to sizland">
        <Roadmap />
      </PageLayout>
    </>
  );
};

export default HomePage;
