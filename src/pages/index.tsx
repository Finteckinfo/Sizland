import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { NextPage } from "next/types";
import React from "react";
import { Typography } from "@/components/ui/typography";
import Link from "next/link";

const HomePage: NextPage = () => {
  return (
    
    <PageLayout title="Homepage" description="Welcome to next-web-template">
      <Typography variant="h1" className="text-center">
      <div id="hero"></div>
        SIZLAND
      </Typography>
      <Typography variant="h2" className="text-center">
        Alright, everyone, welcome to the Sizland community!
      </Typography>
      <Link
        href="https://github.com/new?template_name=next-web3-template&template_owner=CJskii"
        target="_blank"
        className="my-12"
      >
        <Button className="gap-2">
          Get Started
        </Button>
      </Link>
    </PageLayout>
  );
};

export default HomePage;
