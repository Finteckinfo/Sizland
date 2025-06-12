import React from "react";
import { Button1 } from "@/components/ui/button1";
import { useTheme } from "next-themes";

const About = () => {
  const { theme } = useTheme();

  return (
    <section className="overflow-hidden pt-20 pb-12 lg:pt-[120px] lg:pb-[90px] bg-transparent">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Text Block */}
        <div>
          <span className="block mb-4 text-lg font-semibold text-dark dark:text-white">
            SIZ
          </span>
          <h2 className="mb-5 text-3xl font-bold text-dark dark:text-white sm:text-[40px]/[48px]">
            Built upon state-of-the-art blockchain platforms in a multi-chain world!
          </h2>
          <p className="mb-5 text-base text-body-color dark:text-dark-6">
            Sizland strategically integrates with Algorand, Sui, Base, and BNB to deliver robust, scalable, and efficient blockchain-backed ERP infrastructure.
          </p>
          <a
            href="https://linktr.ee/sizlandinvest"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button1 className="mb-4">Learn More</Button1>
          </a>
        </div>

        {/* Card 1 - Right of Text */}
        <div>
          <img
            src={
              theme === "dark"
                ? "/Algorand-lightmode.jpg"
                : "/Algorand-darkmode.jpg"
            }
            alt="Algorand"
            className="w-full rounded-2xl"
          />
          <p className="mt-3 text-base text-body-color dark:text-dark-6">
            <strong>Algorand:</strong> Algorand provides fast, secure, and low-cost transactions, making it ideal for our SIZ utility token. Its efficient Pure Proof-of-Stake system ensures seamless operations and environmental sustainability.
          </p>
        </div>

        {/* Card 2 - Below Text */}
        <div>
          <div className={`relative z-10 ${theme === "dark" ? "bg-black p-2" : "bg-white p-2 rounded-2xl"}`}>
            <img
              src={
                theme === "dark"
                  ? "/sui-darkmode.png"
                  : "/sui-lightmode.png"
              }
              alt="Sui"
              className="w-full rounded-2xl"
            />
          </div>
          <p className="mt-3 text-base text-body-color dark:text-dark-6">
            <strong>Sui:</strong> Sui's high throughput and efficient data storage capabilities enable us to securely store ERP data on-chain. Its object-centric model ensures fast and reliable access to critical business information.
          </p>
        </div>

        {/* Card 3 - Right Side */}
        <div>
          <img
            src={
              theme === "dark"
                ? "/base-darkmode.jpg"
                : "/base-darkmode.jpg"
            }
            alt="Base"
            className="w-full rounded-2xl"
          />
          <p className="mt-3 text-base text-body-color dark:text-dark-6">
            <strong>Base:</strong> Built by Coinbase, Base offers a secure and developer-friendly Ethereum Layer 2 solution, perfect for tokenizing real-world assets. Its compliance-focused design aligns with our investment fund's needs.
          </p>
        </div>

        {/* Card 4 - Centered on large screens */}
        <div className="lg:col-span-2 flex justify-center">
          <div className="w-full max-w-4xl text-center">
            <img
              src={
                theme === "dark"
                  ? "/bnb-lightmode.png"
                  : "/bnb-lightmode.png"
              }
              alt="BNB Smart Chain"
              className="w-full rounded-2xl mx-auto"
            />
            <p className="mt-3 text-base text-body-color dark:text-dark-6">
              <strong>BNB Smart Chain:</strong> BNB Smart Chain connects us to growing ecosystems in Africa and underserved economies, offering low-cost access to our platform. Its broad adoption and integration with Binance's services support our mission of financial inclusion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
