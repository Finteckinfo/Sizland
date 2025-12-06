"use client";

import React from "react";
import Image from "next/image";
import { Button1 } from "@/components/ui/button1";
import ModalVideo from "@/components/modalVideo";
import SplitText from "./ui/splittext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Magnet from "./ui/magnet";
import AuroraText from "./ui/aurora-text";

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
      className="relative pt-10 pb-12 sm:pt-12 sm:pb-14 lg:pt-10 lg:pb-16 xl:pb-16 transition-colors duration-300"
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 relative">
        {/* Headline + subcopy */}
        <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl sm:leading-tight lg:leading-tight lg:text-6xl">
            Welcome to Sizland
              </h1>
              <SplitText
            text=" Learn. Earn. Invest. Grow."
                className="text-2xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl sm:leading-tight lg:leading-tight lg:text-6xl font-pj"
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

          <p className="mt-3 text-md text-gray-500 dark:text-gray-400 sm:mt-5 font-inter max-w-2xl mx-auto">
          Sizland unites remote teams, founders, and freelancers on a decentralized platform where tasks, payments, and growth live transparently on the blockchain.
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
          </div>

      {/* Video Section - separate section */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 mt-16">
          <div className="flex justify-center">
          <div className="w-full max-w-5xl">
            <ModalVideo
              thumb="/video-thumb.jpg"
              thumbWidth={768}
              thumbHeight={432}
              thumbAlt="Watch Sizland Intro"
              youtubeUrl="https://www.youtube.com/embed/uZ6vXVTzisw?si=8sNAT0YaHpmdae2v"
            />
          </div>
        </div>
      </div>

      {/* Image + Content Section - separate section */}
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Image */}
          <div className="w-full">
            <Image
              src="/pictureinaddedherosection.jpg"
              alt="Sizland Ecosystem"
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg"
              priority={false}
            />
          </div>

          {/* Right: Text Content */}
          <div className="w-full space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Sizland is a thriving ecosystem built on a fully decentralized{" "}
              <AuroraText className="inline-block text-emerald-400">
                foundation.
              </AuroraText>
            </h2>

            <div className="space-y-4 text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
              <p>
                Experience Blockchain-Powered Investment and Business Management with Sizland What sets us apart is our blockchain-powered ERP system, the heart of our ecosystem. Tailored specifically for remote teams, our ERP simplifies enterprise financial management by automating workflows and enabling real-time tracking, ensuring smooth operations and enhanced efficiency.
              </p>
              <p>
                But that's not all, our platform also provides access to various investment opportunities, from traditional assets to decentralized finance. With Sizland, you'll experience the power of having a cutting-edge business solution and a comprehensive investment platform, all in one place.
              </p>
            </div>

            {/* Get Started Button */}
            <div className="pt-4">
              <Magnet padding={50} disabled={false} magnetStrength={50}>
                <Button1
                  onClick={handleGetStartedClick}
                  className="px-8 py-3 text-lg font-bold text-white bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 rounded-lg transition-all duration-200 w-full sm:w-auto cursor-pointer"
                >
                  Get Started
                </Button1>
              </Magnet>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero };
