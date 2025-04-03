"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { GitFork } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import ModalVideo from "@/components/modalVideo";

const Hero = () => {
  return (
    <section id="hero" className="relative py-12 sm:py-16 lg:pt-5 xl:pb-0 transition-colors duration-300">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid max-w-lg grid-cols-1 mx-auto lg:max-w-full lg:items-center lg:grid-cols-2 gap-y-12 lg:gap-x-8">
          <div>
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl sm:leading-tight lg:leading-tight lg:text-6xl font-pj">
                Welcome to <span className="text-primary">Sizland</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 sm:mt-6 font-inter">
                Sizland is a decentralized ecosystem designed that lets you get started! 
              </p>

              <p className="mt-2 text-md text-gray-500 dark:text-gray-400 sm:mt-4 font-inter">
                We provide essential services to help founders and startups launch and grow their business.
              </p>

              <div className="mt-6 sm:mt-8">
                <Button className="px-6 py-3 text-lg font-bold text-white bg-gray-900 dark:bg-gray-800 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700">
                  Get Started
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center mt-10 space-x-6 lg:justify-start sm:space-x-8">
              <div className="flex items-center">
                <p className="text-3xl font-medium text-gray-900 dark:text-white sm:text-4xl font-pj">
                  2943
                </p>
                <p className="ml-3 text-sm text-gray-900 dark:text-gray-300 font-pj">
                  Connected Wallets
                </p>
              </div>

              <div className="hidden sm:block">
                <svg
                  className="text-gray-400 dark:text-gray-600"
                  width="16"
                  height="39"
                  viewBox="0 0 16 39"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1="0.72265" y1="10.584" x2="15.7226" y2="0.583975"></line>
                  <line x1="0.72265" y1="17.584" x2="15.7226" y2="7.58398"></line>
                  <line x1="0.72265" y1="24.584" x2="15.7226" y2="14.584"></line>
                  <line x1="0.72265" y1="31.584" x2="15.7226" y2="21.584"></line>
                  <line x1="0.72265" y1="38.584" x2="15.7226" y2="28.584"></line>
                </svg>
              </div>

              <div className="flex items-center">
                <p className="text-3xl font-medium text-gray-900 dark:text-white sm:text-4xl font-pj">
                  $1M+
                </p>
                <p className="ml-3 text-sm text-gray-900 dark:text-gray-300 font-pj">
                  Transactions Processed
                </p>
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="flex justify-center">
            <ModalVideo
              thumb="/video-thumb.jpg"
              thumbWidth={768}
              thumbHeight={432}
              thumbAlt="Watch Sizland Intro"
              video="/videos/sizland-intro.mp4"
              videoWidth={1920}
              videoHeight={1080}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
