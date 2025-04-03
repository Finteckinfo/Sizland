import { PageLayout } from "@/components/page-layout";
import { NextPage } from "next/types";
import React from "react";
import { Hero } from "@/components/hero"; // Import the Hero component
import Features from "@/components/features";

const HomePage: NextPage = () => {
  return (
    <>
      <PageLayout title="Homepage" description="Welcome to Sizland">
        <Hero /> {/* Use the Hero component */}
      </PageLayout>
    </>
  );
};

export default HomePage;
