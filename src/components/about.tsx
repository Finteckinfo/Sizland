import React from "react";
import { Button1 } from "@/components/ui/button1";
import { useTheme } from "next-themes";
import MagicBento from "@/components/ui/MagicBento";

const About = () => {
  const { theme } = useTheme();

  // Custom card data for SIZ content
  const sizCardData = [
    {
      color: "#060010",
      title: "SIZ",
      description: "Multi-chain blockchain ecosystem",
      label: "Main",
      content: "Strategic integration with Algorand, Sui, Base, and BNB for robust ERP infrastructure."
    },
    {
      color: "#060010",
      title: "Algorand",
      description: "Fast & secure transactions",
      label: "Platform",
      content: "Ideal for SIZ utility token with efficient Pure Proof-of-Stake and environmental sustainability."
    },
    {
      color: "#060010",
      title: "Sui",
      description: "High throughput storage",
      label: "Platform",
      content: "Secure ERP data storage on-chain with fast, reliable access to business information."
    },
    {
      color: "#060010",
      title: "Base",
      description: "Ethereum L2 solution",
      label: "Platform",
      content: "Coinbase-built secure platform perfect for tokenizing real-world assets and compliance."
    },
    {
      color: "#060010",
      title: "BNB Smart Chain",
      description: "Growing ecosystems",
      label: "Platform",
      content: "Connects to Africa and underserved economies with low-cost access and financial inclusion."
    },
    {
      color: "#060010",
      title: "Learn More",
      description: "Explore Sizland",
      label: "Action",
      content: "Discover blockchain-powered business solutions and investment opportunities."
    }
  ];

  return (
    <section className="overflow-hidden pt-20 pb-12 lg:pt-[120px] lg:pb-[90px] bg-transparent">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <span className="block mb-4 text-lg font-semibold text-dark dark:text-white">
            SIZ
          </span>
          <h2 className="mb-5 text-3xl font-bold text-dark dark:text-white sm:text-[40px]/[48px]">
            Built upon state-of-the-art blockchain platforms in a multi-chain world!
          </h2>
          <p className="mb-8 text-base text-body-color dark:text-dark-6 max-w-4xl mx-auto">
            Sizland strategically integrates with Algorand, Sui, Base, and BNB to deliver robust, scalable, and efficient blockchain-backed ERP infrastructure.
          </p>
          <a
            href="https://linktr.ee/sizlandinvest"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button1 className="mb-8">Learn More</Button1>
          </a>
        </div>

        {/* Magic Bento Grid */}
        <div className="flex justify-center">
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
