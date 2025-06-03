import React, { useEffect, useState } from "react";
import PixelCard from "@/components/ui/pixelCard";
import featuresData from "@/types/featuresData.json";
import { useTheme } from "next-themes";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const Features = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative py-24">
      <p className="text-center text-base font-semibold leading-7 text-indigo-600">
        Features
      </p>
      <h2 className="text-center font-display mb-12 text-3xl font-bold tracking-tight text-slate-900 dark:text-green-500 md:text-4xl">
        <span className="font-pj">Why choose SIZLAND?</span>
      </h2>
      <div
        className={`absolute inset-0 -z-10 ${theme === "dark" ? "bg-navy-blue inset-shadow-2xl inset-shadow-black shadow-lg shadow-black" : "bg-white shadow-lg"
          }`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 lg:mb-16 flex justify-center items-center flex-col gap-x-0 gap-y-6 lg:gap-y-0 lg:flex-row lg:justify-between max-md:max-w-lg max-md:mx-auto">
          <div className="relative w-full text-center lg:text-left lg:w-2/4">
            <h2
              className={`text-4xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"
                } leading-[3.25rem] lg:mb-6 mx-auto max-w-max lg:max-w-md lg:mx-0`}
            >
              Sizland is a thriving ecosystem built on a decentralised space
            </h2>
          </div>
          <div className="relative w-full text-center lg:text-left lg:w-2/4">
            <p
              className={`text-lg font-normal ${theme === "dark" ? "text-gray-400" : "text-gray-500"
                } mb-5`}
            >
              Experience Blockchain-Powered Investment and Business Management with Sizland
What sets us apart is our blockchain-powered ERP system, the heart of our ecosystem. Tailored specifically for remote teams, our ERP simplifies enterprise financial management by automating workflows and enabling real-time tracking, ensuring smooth operations and enhanced efficiency.
But that’s not all, our platform also provides access to various investment opportunities, from traditional assets to decentralized finance. With Sizland, you’ll experience the power of having a cutting-edge business solution and a comprehensive investment platform, all in one place.
            </p>
            <a
              href="#"
              className={`flex flex-row items-center justify-center gap-2 text-base font-semibold ${theme === "dark"
                ? "text-indigo-600 hover:text-green-400"
                : "text-indigo-600 hover:text-green-400"
                } lg:justify-start`}
            >
              Button CTA
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`${theme === "dark"
                    ? "text-indigo-600 hover:text-green-400"
                    : "text-indigo-600 hover:text-green-400"
                  }`}
              >
                <path
                  d="M7.5 15L11.0858 11.4142C11.7525 10.7475 12.0858 10.4142 12.0858 10C12.0858 9.58579 11.7525 9.25245 11.0858 8.58579L7.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="flex justify-center items-center gap-x-5 gap-y-8 lg:gap-y-0 flex-wrap md:flex-wrap lg:flex-nowrap lg:flex-row lg:justify-between lg:gap-x-8">
          {featuresData.map((feature, index) => {
            const Icon =
              (Icons[feature.icon as keyof typeof Icons] as LucideIcon) ||
              Icons.Star;

            const variant = theme === "dark" ? "blue" : "green";

            return (
              <PixelCard
                key={index}
                variant={variant}
                className="w-full max-w-sm flex flex-col items-center text-center p-6 min-h-[300px]" // sets equal height
              >
                <div className="h-12 flex items-center justify-center mb-4">
                  <Icon size={32} className="text-indigo-500" />
                </div>
                <h3
                  className={`text-xl font-semibold ${theme === "dark" ? "text-gray-900" : "text-white"
                    }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`text-sm mt-2 ${theme === "dark" ? "text-gray-600" : "text-gray-300"
                    }`}
                >
                  {feature.description}
                </p>
              </PixelCard>

            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
