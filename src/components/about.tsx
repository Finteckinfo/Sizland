import React from "react";
import { Button1 } from "@/components/ui/button1";
import { useTheme } from "next-themes";
import MagicBento from "@/components/ui/MagicBento";

const About = () => {
  const { theme } = useTheme();

  // Custom card data for SIZ content
  const sizCardData = [
    {
      color: "linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%)",
      title: "SIZ Platform",
      description: "Multi-chain ecosystem",
      label: "Core",
      content: "Built on blockchain platforms. Algorand & Sui."
    },
    {
      color: "linear-gradient(135deg, #0a1a0a 0%, #1a3a1a 100%)",
      title: "Algorand",
      description: "Fast & secure",
      label: "Blockchain",
      content: "Ideal for SIZ utility token."
    },
    {
      color: "linear-gradient(135deg, #1a0a1a 0%, #3a1a3a 100%)",
      title: "Sui",
      description: "High throughput",
      label: "Blockchain",
      content: "High throughput and efficient data storage."
    },
    {
      color: "linear-gradient(135deg, #1a1a0a 0%, #3a3a1a 100%)",
      title: "Base",
      description: "Ethereum L2",
      label: "Blockchain",
      content: "Coinbase-built secure platform."
    },
    {
      color: "linear-gradient(135deg, #0a1a1a 0%, #1a3a3a 100%)",
      title: "BNB Smart Chain",
      description: "Growing access",
      label: "Blockchain",
      content: "Connects to Africa and underserved economies."
    }
  ];

  return (
    <section className="overflow-hidden pt-20 pb-12 lg:pt-[120px] lg:pb-[90px] bg-transparent">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          {/* SIZLAND Logo Image */}
          <div className="flex justify-center mb-6">
            <img 
              src="/siz_land_cover-removebg-preview.png" 
              alt="SIZLAND Logo" 
              className="w-full max-w-[280px] sm:max-w-[350px] md:max-w-[450px] lg:max-w-[500px] h-auto object-contain"
            />
          </div>
          
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
