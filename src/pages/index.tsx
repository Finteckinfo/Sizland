import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import { NextPage } from "next/types";
import React from "react";
import { Typography } from "@/components/ui/typography";
import Link from "next/link";
import { GitFork, StarIcon } from "lucide-react";
import { GitHubIcon } from "@/assets/icons/social";

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
        href="#"
        className="my-12"
      >
        <Button className="gap-2">
          <GitFork />
          Get Sizld
        </Button>
      </Link>
    </PageLayout>
  );
};

export default HomePage;
