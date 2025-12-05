'use client';

import { PageLayout } from "@/components/page-layout";
import TwitterWidgetsLoader from "@/components/twitter-widgets-loader";
import TwitterEmbed from "@/components/twitter-embed";
import TweetEmbed from "@/components/tweet-embed";
import { useTheme } from "next-themes";
import { AuroraText } from "@/components/ui/aurora-text";
import InfoHub from "@/components/infoHub";
import Link from "next/link";
import { NextPage } from "next";
import { useEffect, useState } from "react";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

const BlogPage: NextPage = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <PageLayout
      title="Sizland Blog - Latest Updates & Insights"
      description="Stay updated with the latest news, updates, and insights from Sizland. Follow our journey building the future of remote team management and blockchain solutions."
      requireAuth={false}
    >
      <TwitterWidgetsLoader />
      
      <div className="min-h-screen w-full">
        {/* Hero Section */}
        <section className="relative pt-12 sm:pt-16 md:pt-24 pb-24 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8 text-center">
              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                <span className={isDark ? "text-white" : "text-black"}>
                  Sizland{" "}
                </span>
                <AuroraText>Blog</AuroraText>
              </h1>

              {/* Description */}
              <p className={`text-lg md:text-xl leading-relaxed ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Stay updated with the latest news, updates, and insights from the Sizland ecosystem. Follow our journey as we build the future of remote team management and blockchain solutions.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://twitter.com/sizlandofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-bold text-white bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <ExternalLink className="w-5 h-5" />
                  Follow us on X/Twitter
                </a>

                <Link
                  href="/"
                  className={`inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-bold rounded-full transition-all duration-200 border-2 ${
                    isDark
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  Join our community
                </Link>
              </div>

              {/* Stats Section - Below buttons */}
              <div className="flex items-center justify-center mt-16 sm:mt-20 md:mt-24 space-x-10 sm:space-x-16 md:space-x-20">
                {/* Live Updates */}
                <div className="flex flex-col items-center text-center">
                  <p className={`text-3xl font-medium sm:text-4xl font-pj ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    Live
                  </p>
                  <p className={`mt-1 text-sm font-pj ${
                    isDark ? "text-gray-300" : "text-gray-900"
                  }`}>
                    Updates
                  </p>
                </div>

                {/* spacer */}
                <div className="hidden sm:block">
                  <svg
                    className={isDark ? "text-gray-600" : "text-gray-400"}
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

                {/* Daily Posts */}
                <div className="flex flex-col items-center text-center">
                  <p className={`text-3xl font-medium sm:text-4xl font-pj ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    Daily
                  </p>
                  <p className={`mt-1 text-sm font-pj ${
                    isDark ? "text-gray-300" : "text-gray-900"
                  }`}>
                    Posts
                  </p>
                </div>

                {/* spacer */}
                <div className="hidden sm:block">
                  <svg
                    className={isDark ? "text-gray-600" : "text-gray-400"}
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

                {/* Public Building */}
                <div className="flex flex-col items-center text-center">
                  <p className={`text-3xl font-medium sm:text-4xl font-pj ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}>
                    Public
                  </p>
                  <p className={`mt-1 text-sm font-pj ${
                    isDark ? "text-gray-300" : "text-gray-900"
                  }`}>
                    Building
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Updates Section */}
        <section className="relative py-24 w-full">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="mb-12 text-center">
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 ${
                isDark ? "text-white" : "text-black"
              }`}>
                Live Updates from Sizland
              </h2>
              <p className={`text-base md:text-lg leading-relaxed max-w-3xl mx-auto ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Follow our journey as we build the boring rails remote teams need. We ship in public, daily updates on our progress.
              </p>
            </div>

            {/* Blog Grid - Individual Tweet Embeds */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* First Tweet */}
              <div className="flex justify-center">
                <div className="w-full max-w-sm sm:max-w-md">
                  <TweetEmbed 
                    tweetId="1958067960506900738"
                    username="sizlandofficial"
                    title="Building Remote Rails"
                  />
                </div>
              </div>
              
              {/* Second Tweet */}
              <div className="flex justify-center">
                <div className="w-full max-w-sm sm:max-w-md">
                  <TweetEmbed 
                    tweetId="1980965670717190421"
                    username="sizlandofficial"
                    title="Latest Update"
                  />
                </div>
              </div>

              {/* Additional tweets can be added here */}
              {/* You can add more TweetEmbed components with different tweet IDs */}
            </div>

            {/* Twitter Timeline - Additional tweets */}
            <div className="mb-12">
              <TwitterEmbed 
                username="sizlandofficial"
                showTimeline={true}
                maxTweets={5}
              />
            </div>
          </div>
        </section>

        {/* InfoHub Section */}
        <InfoHub />

        {/* Stay Connected Section */}
        <section className={`relative py-24 ${
          isDark 
            ? "bg-gradient-to-t from-green-950/40 via-green-900/25 to-transparent" 
            : "bg-gradient-to-t from-green-100/90 via-green-50/70 to-white"
        }`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Main heading */}
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight max-w-4xl ${
                isDark ? "text-white" : "text-black"
              }`}>
                Stay Connected
              </h2>

              {/* Description */}
              <p className={`text-base md:text-lg leading-relaxed max-w-2xl ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}>
                Follow us on Twitter for the latest updates, join our community, and be part of the Sizland journey.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <a
                  href="https://twitter.com/sizlandofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-bold rounded-full transition-all duration-200 border-2 ${
                    isDark
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  <ExternalLink className="w-5 h-5" />
                  Follow @sizlandofficial
                </a>

                <Link
                  href="/"
                  className={`inline-flex items-center justify-center gap-2 px-8 py-3 text-lg font-bold rounded-full transition-all duration-200 border-2 ${
                    isDark
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                >
                  Join our community
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default BlogPage;
