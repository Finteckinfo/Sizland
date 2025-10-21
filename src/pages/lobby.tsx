import React, { useEffect, useState } from "react";
import { PageLayout } from "@/components/page-layout";
import PixelCard from "@/components/ui/pixelCard";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

// Dapp tiles configuration
const dappTiles = [
  {
    title: "ERP",
    description: "At the heart of Sizland lies the ERP solution created for today's decentralized world",
    icon: "Workflow",
    href: "https://erp.siz.land",
    isExternal: true,
    isClickable: true,
    variant: "blue" as const
  },
  {
    title: "Unified Wallets",
    description: "A streamlined, all-in-one wallet that lets users manage fiat and crypto assets side-by-side.",
    icon: "Wallet",
    href: "/wallet",
    isExternal: false,
    isClickable: true,
    variant: "green" as const
  },
  {
    title: "DEX",
    description: "Fast, cost-effective, and flexible, the exchange supports decentralized and centralized trading with full wallet integration.",
    icon: "Shuffle",
    href: "/dex",
    isExternal: false,
    isClickable: true,
    variant: "blue" as const
  },
  {
    title: "Fund Manager",
    description: "Manage your assets efficiently with our decentralized fund management system.",
    icon: "PieChart",
    href: "#",
    isExternal: false,
    isClickable: false,
    variant: "default" as const
  }
];

const LobbyPage = () => {
  const { theme } = useTheme();
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoaded && !user) {
      // Redirect to signup if not authenticated
      router.push('/signup');
    }
  }, [isLoaded, user, router]);

  if (!mounted || !isLoaded) {
    return (
      <PageLayout title="Loading - Sizland" description="Loading your dashboard" requireAuth={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <PageLayout title="Dashboard - Sizland" description="Your Sizland Dashboard" requireAuth={true}>
      <div className="min-h-screen">
        {/* Header Section */}
        <div className="bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 drop-shadow-lg">
                Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0]}!
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto drop-shadow-md">
                Access all Sizland dApps from your personalized dashboard. Manage your business, trade assets, and grow your portfolio - all in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Dapp Tiles Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Tiles Grid */}
          <div className="flex justify-center items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full justify-items-center">
            {dappTiles.map((tile, index) => {
              const Icon = (Icons[tile.icon as keyof typeof Icons] as LucideIcon) || Icons.Star;
              
              const tileContent = (
                <PixelCard
                  variant={tile.variant}
                  className={`w-full max-w-xs flex flex-col items-center text-center p-4 min-h-[220px] transition-all duration-300 ${
                    tile.isClickable 
                      ? 'cursor-pointer hover:shadow-lg hover:scale-105 transform' 
                      : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="h-12 flex items-center justify-center mb-4">
                    <Icon 
                      size={32} 
                      className={`${
                        tile.isClickable 
                          ? 'text-indigo-500' 
                          : 'text-gray-400'
                      }`} 
                    />
                  </div>
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      theme === "dark" ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {tile.title}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${
                      theme === "dark" ? "text-gray-600" : "text-gray-300"
                    }`}
                  >
                    {tile.description}
                  </p>
                  
                  {!tile.isClickable && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </PixelCard>
              );

              if (!tile.isClickable) {
                return (
                  <div key={index}>
                    {tileContent}
                  </div>
                );
              }

              if (tile.isExternal) {
                return (
                  <a
                    key={index}
                    href={tile.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {tileContent}
                  </a>
                );
              }

              return (
                <button
                  key={index}
                  onClick={() => router.push(tile.href)}
                  className="block w-full text-left"
                >
                  {tileContent}
                </button>
              );
            })}
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="mt-16 bg-black/20 dark:bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8 drop-shadow-lg">
              Your Sizland Journey
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-400 mb-2 drop-shadow-lg">4</div>
                <p className="text-gray-700 dark:text-gray-300 drop-shadow-md">dApps Available</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2 drop-shadow-lg">3</div>
                <p className="text-gray-700 dark:text-gray-300 drop-shadow-md">Active Services</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2 drop-shadow-lg">1</div>
                <p className="text-gray-700 dark:text-gray-300 drop-shadow-md">Unified Account</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default LobbyPage;
