'use client';

import React from 'react';
import ScrollReveal from './ui/scroll-reveal';

interface Phase {
  label: string;
  labelColor: string;
  dotClass: string;
  cardHoverClass: string;
  title: string;
  description: string;
  detail?: string;
  reverse?: boolean;
}

const phases: Phase[] = [
  {
    label: 'Complete',
    labelColor: 'text-terminal-green',
    dotClass: 'bg-terminal-green shadow-[0_0_10px_#10B981]',
    cardHoverClass: 'group-hover:border-terminal-green/50',
    title: 'Foundation',
    detail: 'Delivered June 2026.',
    description:
      'Core DiD infrastructure launch. Sizland Identity Protocol, multi-chain wallet factory layer, and production-ready secure API layer.',
    reverse: false,
  },
  {
    label: 'In progress',
    labelColor: 'text-neon-accent',
    dotClass: 'bg-neon-accent animate-pulse',
    cardHoverClass: 'group-hover:border-neon-accent/50',
    title: 'Reputation Engine',
    description:
      'ERP automated bridges, signed credential generation network, decentralized score computation on SizChain X, and the SIZ token staking contract release.',
    reverse: true,
  },
  {
    label: 'Planned',
    labelColor: 'text-on-surface-variant',
    dotClass:
      'bg-surface-variant border border-border-subtle animate-planned-pulse',
    cardHoverClass: 'group-hover:border-terminal-green/50',
    title: 'Scale & Sovereignty',
    description:
      'Stablecoin milestone escrow contracts, full multi-chain payment factories, sovereign data indexing, and on-chain reputation-backed DeFi lending protocols.',
    reverse: false,
  },
];

const Roadmap = () => {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto bg-surface-elevated/30 border-t border-border-subtle">
      <div className="text-center mb-10 md:mb-16">
        <h2 className="font-headline text-xl sm:text-2xl md:text-3xl text-on-surface tracking-headline">
          Engineering Total Sovereignty
        </h2>
      </div>

      <div className="relative border-l-2 border-border-subtle ml-4 md:ml-0 md:pl-0 space-y-10 md:space-y-12">
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border-subtle -translate-x-1/2" />

        {phases.map((phase, index) => (
          <ScrollReveal key={phase.title} delay={index * 0.1} y={20}>
            <div
              className={`relative pl-8 md:pl-0 flex flex-col ${
                phase.reverse ? 'md:flex-row-reverse' : 'md:flex-row'
              } items-center md:justify-between group`}
            >
            <div
              className={`absolute left-[-5px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full shrink-0 ${phase.dotClass}`}
            />

            <div
              className={`w-full md:w-[45%] ${
                phase.reverse
                  ? 'md:text-left pl-0 md:pl-8 pb-4 md:pb-0'
                  : 'md:text-right pr-0 md:pr-8 pb-4 md:pb-0'
              }`}
            >
              <p className={`font-label text-xs sm:text-sm mb-1 ${phase.labelColor}`}>
                Phase {index + 1} · {phase.label}
              </p>
              <h3 className="font-headline text-lg sm:text-xl text-on-surface tracking-headline">{phase.title}</h3>
            </div>

            <div
              className={`w-full md:w-[45%] ${
                phase.reverse ? 'pr-0 md:pr-8 text-left md:text-right' : 'pl-0 md:pl-8'
              }`}
            >
              <div
                className={`glass-panel stitch-card p-5 sm:p-6 border border-border-subtle rounded transition-colors duration-200 ${phase.cardHoverClass}`}
              >
                {phase.detail && (
                  <p className="text-sm text-on-surface-variant mb-2">{phase.detail}</p>
                )}
                <p className="font-body text-sm sm:text-base text-on-surface leading-relaxed">{phase.description}</p>
              </div>
            </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
};

export default Roadmap;
