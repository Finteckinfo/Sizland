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
    <section id="hero" className="relative py-12 sm:py-16 lg:pt-5 xl:pb-0 transition-colors duration-300">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid max-w-lg grid-cols-1 mx-auto lg:max-w-full lg:items-center lg:grid-cols-2 gap-y-12 lg:gap-x-8">
          <div>
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl sm:leading-tight lg:leading-tight lg:text-6xl">
                Welcome to <SplitText
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
              </h1>
              <SplitText
                text=" Learn. Earn. Invest. Grow. "
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

              <p className="mt-2 text-md text-gray-500 dark:text-gray-400 sm:mt-4 font-inter">
                We provide essential services to help founders and startups launch and grow their business.
              </p>

              <div className="mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Magnet padding={50} disabled={false} magnetStrength={50}>
                    <Button1 
                      onClick={handleGetStartedClick}
                      className="px-8 py-3 text-lg font-bold text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 w-full sm:w-auto cursor-pointer"
                    >
                      {isLoaded && session?.user ? 'Go to Dashboard' : 'Get Started'}
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
