import { PageLayout } from "@/components/page-layout";
import { NextPage } from "next/types";
import React from "react";
import { Hero } from "@/components/hero";  // Import the Hero component

const HomePage: NextPage = () => {
  return (
    <PageLayout title="Homepage" description="Welcome to next-web-template">
      <Hero />  {/* Use the Hero component */}
    </PageLayout>
  );
};

export default HomePage;
