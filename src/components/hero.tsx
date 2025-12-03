"use client";

import React from "react";
import { Button1 } from "@/components/ui/button1";
import ModalVideo from "@/components/modalVideo";
import SplitText from "./ui/splittext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Magnet from "./ui/magnet";

const Hero = () => {
  const { data: session, status } = useSession();
  const isLoaded = status !== "loading";
  const router = useRouter();

  const handleGetStartedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoaded && session?.user) {
      // User is authenticated, redirect to lobby
      router.push('/lobby');
    } else {
      // User is not authenticated, redirect to auth choice page
      router.push('/auth-choice');
    }
  };

  return (
    <section
      id="hero"
      className="relative py-12 sm:py-16 lg:pt-5 xl:pb-0 transition-colors duration-300"
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative">
        {/* Headline + subcopy */}
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl sm:leading-tight lg:leading-tight lg:text-6xl">
            Welcome to Sizland
          </h1>
          <SplitText
            text=" Learn. Earn. Invest. Grow. "
            className="text-2xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl sm:leading-tight lg:leading-tight lg:text-6xl font-pj"
            delay={100}
            animationFrom={{ opacity: 0, transform: "translate3d(0,50px,0)" }}
            animationTo={{ opacity: 1, transform: "translate3d(0,0,0)" }}
            easing={(t) => t * (2 - t)} // easeOutQuad
            threshold={0.25}
            rootMargin="-50px"
            onLetterAnimationComplete={() => {
              console.log("Hero heading animation done.");
            }}
          />

          <p className="mt-3 text-md text-gray-500 dark:text-gray-400 sm:mt-5 font-inter max-w-2xl mx-auto">
            We provide essential services to help founders and startups launch and grow their business.
          </p>

          {/* Primary CTAs */}
          <div className="mt-8 sm:mt-10">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Magnet padding={50} disabled={false} magnetStrength={50}>
                <Button1
                  onClick={handleGetStartedClick}
                  className="px-8 py-3 text-lg font-bold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 w-full sm:w-auto cursor-pointer"
                >
                  {isLoaded && session?.user ? "Go to Dashboard" : "Get Started"}
                </Button1>
              </Magnet>

              <Magnet padding={50} disabled={false} magnetStrength={50}>
                <a
                  href="https://chat.whatsapp.com/FY0OAor6s72ErtxgxaP1ZL"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button1 className="px-8 py-3 text-lg font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 w-full sm:w-auto border border-gray-300 dark:border-gray-600">
                    Join Our Community
                  </Button1>
                </a>
              </Magnet>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center mt-12 space-x-6 sm:space-x-10">
          {/* 08 Connected Wallets */}
          <div className="flex flex-col items-center text-center">
            <p className="text-3xl font-medium text-gray-900 dark:text-white sm:text-4xl font-pj">
              08
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-300 font-pj">
              Connected Wallets
            </p>
          </div>

          {/* spacer */}
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

          {/* $63k Transactions Processed */}
          <div className="flex flex-col items-center text-center">
            <p className="text-3xl font-medium text-gray-900 dark:text-white sm:text-4xl font-pj">
              $63k
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-300 font-pj">
              Transactions Processed
            </p>
          </div>

          {/* spacer */}
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

          {/* 10+ Supported Blockchains */}
          <div className="flex flex-col items-center text-center">
            <p className="text-3xl font-medium text-gray-900 dark:text-white sm:text-4xl font-pj">
              10+
            </p>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-300 font-pj">
              Supported Blockchains
            </p>
          </div>
        </div>

        {/* Video Section positioned under hero content */}
        <div className="mt-16 flex justify-center">
          <div className="w-full max-w-5xl">
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
