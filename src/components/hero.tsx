"use client";

import React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { SIZLAND_WALLET_URL } from "@/lib/external-apps";

const easeOut = [0.22, 1, 0.36, 1] as const;

const scrollToSection = (id: string) => {
  const section = document.querySelector(id) as HTMLElement;
  if (section) {
    window.scrollTo({ top: section.offsetTop - 80, behavior: "smooth" });
  }
};

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-center px-4 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto overflow-hidden pt-2 pb-10 md:pt-6 md:pb-20"
    >
      <motion.div
        className="relative z-10 text-center w-full max-w-4xl mx-auto flex flex-col items-center gap-6 md:gap-8"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={item}
          className="font-headline text-[1.65rem] leading-snug sm:text-3xl md:text-4xl lg:text-5xl text-on-surface tracking-headline"
        >
          The Remote Economy, Decentralized.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-green-600 to-teal-600 dark:from-terminal-green dark:to-neon-accent animate-gradient-shift">
            Zero Data. Zero Footprint.
          </span>
          <br />
          Total Sovereignty.
        </motion.h1>

        <motion.p
          variants={item}
          className="font-body text-sm sm:text-base md:text-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed"
        >
          Sizland is the invisible, censorship-resistant infrastructure layer for the global remote workforce. We don&apos;t just process payments; we provide the decentralized tools—starting with revolutionary, user-side Digital Identity (DiD)—that empower workers to own their reputation, unify their chains, and secure their financial future without leaving a digital trace.
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto max-w-md sm:max-w-none"
        >
          <a
            href={SIZLAND_WALLET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="stitch-btn bg-terminal-green text-surface-base font-label text-sm px-5 sm:px-8 py-3.5 sm:py-4 rounded hover:bg-neon-accent terminal-glow w-full sm:w-auto text-center"
          >
            Generate Your DiD (Non-Custodial)
          </a>
          <button
            onClick={() => scrollToSection("#features")}
            className="stitch-btn bg-transparent border border-border-subtle text-on-surface font-label text-sm px-5 sm:px-8 py-3.5 sm:py-4 rounded hover:border-terminal-green hover:text-terminal-green w-full sm:w-auto"
          >
            Explore the Remote Stack
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        className="w-full max-w-5xl mt-6 md:mt-16 relative z-10 glass-panel rounded overflow-hidden aspect-[4/3] sm:aspect-video border border-border-subtle stitch-card"
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.45, ease: easeOut }}
      >
        <Image
          src="/hero-node-network.jpg"
          alt="Decentralized node network schematic"
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 1024px"
        />
      </motion.div>
    </section>
  );
};

export { Hero };
