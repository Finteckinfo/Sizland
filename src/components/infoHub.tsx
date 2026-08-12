"use client";

import React from "react";
import { Code, Users } from "lucide-react";
import ScrollReveal from "./ui/scroll-reveal";
import { SIZLAND_WALLET_URL } from "@/lib/external-apps";

const InfoHub = () => {
  return (
    <section
      id="community"
      className="py-8 md:py-24 lg:py-32 px-4 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto text-center border-t border-border-subtle"
    >
      <ScrollReveal>
        <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-on-surface mb-4 md:mb-6 tracking-headline leading-snug">
          Join the Off-Grid Remote Economy.
        </h2>
      </ScrollReveal>
      <ScrollReveal delay={0.08}>
        <p className="font-body text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed">
          Help us build the invisible infrastructure. Whether you&apos;re a sovereign worker or a protocol developer, your node belongs here.
        </p>
      </ScrollReveal>
      <ScrollReveal delay={0.16} className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center max-w-lg sm:max-w-none mx-auto">
        <a
          href="https://twitter.com/sizlandofficial"
          target="_blank"
          rel="noopener noreferrer"
          className="stitch-btn bg-surface-elevated border border-border-subtle text-on-surface font-label text-sm px-5 sm:px-8 py-3.5 sm:py-4 rounded hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
        >
          <Code className="h-4 w-4 shrink-0" />
          Build in Public
        </a>
        <a
          href={SIZLAND_WALLET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="stitch-btn bg-transparent border border-terminal-green text-terminal-green font-label text-sm px-5 sm:px-8 py-3.5 sm:py-4 rounded hover:bg-terminal-green/10 transition-colors flex items-center justify-center gap-2"
        >
          <Users className="h-4 w-4 shrink-0" />
          Join Our Developer Community
        </a>
      </ScrollReveal>
    </section>
  );
};

export default InfoHub;
