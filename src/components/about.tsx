"use client";

import React from "react";
import ScrollReveal from "./ui/scroll-reveal";
import { IdentityHubDiagram } from "./identity-hub";

export const SUPPORTED_CHAINS = [
  "Algorand",
  "Base",
  "BNB Chain",
  "Sui",
  "TON",
] as const;

const chainStatus = [
  "Algorand Integration Active",
  "Base Network Bridges Linked",
  "BNB Chain Settlement Verified",
  "Sui Network Sync Verified",
  "TON Network Sync Verified",
];

const About = () => {
  return (
    <section className="py-8 md:py-24 px-4 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto">
      <div className="flex flex-col md:flex-row gap-10 md:gap-12 lg:gap-16 items-center">
        <ScrollReveal className="w-full md:w-1/2 min-w-0 self-stretch flex flex-col justify-center">
          <IdentityHubDiagram />
          <div className="flex flex-wrap justify-center gap-2 md:hidden mt-4">
            {SUPPORTED_CHAINS.map((chain) => (
              <span
                key={chain}
                className="bg-surface-base px-3 py-1.5 border border-border-subtle rounded-full font-label text-[10px] text-on-surface"
              >
                {chain}
              </span>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal className="w-full md:w-1/2 min-w-0 space-y-4 md:space-y-6" delay={0.1}>
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] text-on-surface tracking-headline leading-tight">
            One Identity,{" "}
            <span className="text-terminal-green">Unlimited Chains.</span>
          </h2>
          <p className="font-body text-sm sm:text-base md:text-lg text-on-surface-variant leading-relaxed">
            Sizland&apos;s architecture abstracts network complexity into unified access. Your single Decentralized Identity acts as a universal passport—manage tasks on one chain and settle payments on another seamlessly, because the client-side cryptographic layer unifies them all.
          </p>
          <ul className="space-y-3 sm:space-y-4 font-mono-custom text-sm mt-4 md:mt-8">
            {chainStatus.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 pb-3 sm:pb-4 border-b border-border-subtle"
              >
                <span className="w-2 h-2 rounded-full bg-terminal-green shrink-0" />
                <span className="text-on-surface-variant leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default About;
