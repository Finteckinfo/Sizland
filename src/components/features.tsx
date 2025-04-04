import React, { useEffect, useState } from "react";
import PixelCard from "@/components/ui/pixelCard";
import featuresData from "@/types/featuresData.json";
import { useTheme } from "next-themes";

const Features = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative py-24">
      <div
        className={`absolute inset-0 -z-10 ${
          theme === "dark" ? "bg-navy-blue" : "bg-white"
        }`}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 lg:mb-16 flex justify-center items-center flex-col gap-x-0 gap-y-6 lg:gap-y-0 lg:flex-row lg:justify-between max-md:max-w-lg max-md:mx-auto">
          <div className="relative w-full text-center lg:text-left lg:w-2/4">
            <h2
              className={`text-4xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              } leading-[3.25rem] lg:mb-6 mx-auto max-w-max lg:max-w-md lg:mx-0`}
            >
              Enjoy the finest features with SIZLAND.
            </h2>
          </div>
          <div className="relative w-full text-center lg:text-left lg:w-2/4">
            <p
              className={`text-lg font-normal ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              } mb-5`}
            >
              We provide all the advantages that can simplify all your financial transactions without any further requirements
            </p>
            <a
              href="#"
              className={`flex flex-row items-center justify-center gap-2 text-base font-semibold ${
                theme === "dark"
                  ? "text-indigo-400 hover:text-indigo-500"
                  : "text-indigo-600 hover:text-indigo-700"
              } lg:justify-start`}
            >
              Features
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 15L11.0858 11.4142C11.7525 10.7475 12.0858 10.4142 12.0858 10C12.0858 9.58579 11.7525 9.25245 11.0858 8.58579L7.5 5"
                  stroke="#4F46E5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </a>
          </div>
        </div>

        {/* Pixel Cards - Scrollable & Smaller */}
        <div className="overflow-x-auto">
          <div className="flex gap-3 w-max px-1">
            {featuresData.map((feature, index) => {
              const variant = theme === "dark" ? "blue" : "green";

              return (
                <PixelCard
                  key={index}
                  variant={variant}
                  className="min-w-[160px] h-[180px] flex-shrink-0"
                >
                  <h3
                    className={`text-sm font-semibold ${
                      theme === "dark" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={`text-xs mt-1 ${
                      theme === "dark" ? "text-gray-600" : "text-gray-300"
                    }`}
                  >
                    {feature.description}
                  </p>
                </PixelCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;