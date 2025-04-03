// src/components/hero.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { GitFork } from "lucide-react";
import { Typography } from "@/components/ui/typography";

const Hero = () => {
  return (
    <section id="hero" className="text-center">
      <Typography variant="h1" className="mb-16">
        SIZLAND
      </Typography>
      <Typography variant="h2" className="mb-24">
        Sizland, a decentralized ecosystem that gets you started!
      </Typography>
      <a
        href="https://linktr.ee/sizlandinvest"
        target="_blank"
        rel="noopener noreferrer"
        className="my-12"
      >
        <Button className="gap-2">
          <GitFork />
          Get Sizld
        </Button>
      </a>
    </section>
  );
};

export { Hero };
