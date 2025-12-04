import React, { useEffect, useState } from "react";
import { Button1 } from "@/components/ui/button1";
import { useTheme } from "next-themes";
import MagicBento from "@/components/ui/MagicBento";
import AuroraText from "./ui/aurora-text";

const About = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Custom card data for Multi-Chain Ecosystem section
  const sizCardData = [
    {
      color: "transparent",
      title: "SIZ Platform",
      description: "Multi-chain ecosystem",
      label: "CORE",
      content: "Multi-chain ecosystem built on decentralized blockchain infrastructure.",
      image: "/sizland-platform.png",
      imageAlt: "SIZ Platform"
    },
    {
      color: "transparent",
      title: "Algorand",
      description: "Fast, secure, and efficient.",
      label: "BLOCKCHAIN",
      content: "The ideal network for the SIZ utility token.",
      image: "/algorandimage.png",
      imageAlt: "Algorand"
    },
    {
      color: "transparent",
      title: "Sui",
      description: "High throughput.",
      label: "BLOCKCHAIN",
      content: "Optimized for fast execution and data efficiency.",
      image: "/SuiImage.png",
      imageAlt: "Sui"
    },
    {
      color: "transparent",
      title: "Base",
      description: "Ethereum L2.",
      label: "BLOCKCHAIN",
      content: "A Coinbase‑built platform for secure, scalable operations.",
      image: "/baseimage.png",
      imageAlt: "Base"
    },
    {
      color: "transparent",
      title: "BNB Smart Chain",
      description: "Growing global access.",
      label: "BLOCKCHAIN",
      content: "Connecting emerging and underserved markets.",
      image: "/BNBimage.png",
      imageAlt: "BNB Smart Chain"
    }
  ];

  return (
    <section className="overflow-hidden pt-16 pb-6 lg:pt-[96px] lg:pb-[40px] bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.7fr)] items-center">
          <div className="space-y-4">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-gray-600 dark:text-gray-300">
              Multi‑Chain Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              Built upon state-of-the-art blockchain platforms in a{" "}
              <AuroraText className="inline-block text-emerald-400">
                multi‑chain world!
              </AuroraText>
            </h2>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
              Sizland strategically integrates with Algorand, Sui, Base, and BNB to deliver robust, scalable, and
              efficient blockchain‑backed ERP infrastructure.
            </p>
          </div>

          <div className="flex lg:justify-end">
            <a
              href="https://linktr.ee/sizlandinvest"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button1 className="px-8 py-3 text-lg font-bold text-white bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 rounded-full transition-all duration-200">
                Learn More
              </Button1>
            </a>
          </div>
        </div>

        {/* Magic Bento Grid with design images and same effects */}
        <div className="w-full">
          <MagicBento
            textAutoHide={false}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="150, 196, 97"
            customCardData={sizCardData}
          />
        </div>
      </div>
    </section>
  );
};

export default About;
