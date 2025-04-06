"use client";

import React from "react";
import { Button1 } from "@/components/ui/button1";
import { GitFork } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import ModalVideo from "@/components/modalVideo";
import SplitText from "./ui/splittext";
import Magnet from "./ui/magnet"

const Hero = () => {
  return (
    <section id="hero" className="relative py-12 sm:py-16 lg:pt-5 xl:pb-0 transition-colors duration-300">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid max-w-lg grid-cols-1 mx-auto lg:max-w-full lg:items-center lg:grid-cols-2 gap-y-12 lg:gap-x-8">
          <div>
            <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl sm:leading-tight lg:leading-tight lg:text-6xl">
                Welcome to 
              </h1>
              <SplitText
                text="Sizland"
                className="text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl sm:leading-tight lg:leading-tight lg:text-6xl font-pj"
                delay={100}
                animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                easing={(t) => t * (2 - t)} // easeOutQuad
                threshold={0.25}
                rootMargin="-50px"
                onLetterAnimationComplete={() => {
                  console.log("Hero heading animation done.");
                }}
              />
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 sm:mt-6 font-inter">
                Sizland is a decentralized ecosystem that lets you get started!
              </p>

              <p className="mt-2 text-md text-gray-500 dark:text-gray-400 sm:mt-4 font-inter">
                We provide essential services to help founders and startups launch and grow they're business.
              </p>

              <div className="mt-6 sm:mt-8">
              <Magnet padding={50} disabled={false} magnetStrength={50}>
                <Button1 className="px-6 py-3 text-lg font-bold text-white bg-gray-900 dark:bg-gray-800 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-700">
                  Get Started
                </Button1>
                </Magnet>
                {/* <button className="group group-hover:before:duration-500 group-hover:after:duration-500 after:duration-500 hover:border-green-400 hover:before:[box-shadow:_20px_20px_20px_30px_#1e3a8a] duration-500 before:duration-500 hover:duration-500 underline underline-offset-2 hover:after:-right-8 hover:before:right-12 hover:before:-bottom-8 hover:before:blur hover:underline hover:underline-offset-4 origin-left hover:decoration-2 hover:text-green-400 relative bg-neutral-800 h-16 w-64 border text-left p-3 text-gray-50 text-base font-bold rounded-lg overflow-hidden before:absolute before:w-12 before:h-12 before:content-[''] before:right-1 before:top-1 before:z-10 before:bg-blue-900 before:rounded-full before:blur-lg after:absolute after:z-10 after:w-20 after:h-20 after:content-[''] after:bg-green-400 after:right-8 after:top-3 after:rounded-full after:blur-lg">
                    Get Sizld
                </button> */}

              </div>
            </div>

            <div className="flex items-center justify-center mt-10 space-x-6 lg:justify-start sm:space-x-8">
              <div className="flex items-center">
                <p className="text-3xl font-medium text-gray-900 dark:text-white sm:text-4xl font-pj">
                  0
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
                  $0
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
