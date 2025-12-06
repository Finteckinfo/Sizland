import React, { useEffect, useState } from "react";
import { PageLayout } from "@/components/page-layout";
import PixelCard from "@/components/ui/pixelCard";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useWallet } from "@txnlab/use-wallet-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

const ERP_URL = process.env.NEXT_PUBLIC_ERP_URL || "https://erp.siz.land";

const LobbyPage = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { activeAccount, isReady } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthed = !!session?.user || (!!activeAccount && isReady);

  // Handle ERP navigation with SSO token
  const handleERPClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    console.log('[Lobby] ERP clicked');
    console.log('[Lobby] Session status:', status);
    console.log('[Lobby] Has session user:', !!session?.user);
    console.log('[Lobby] Has active account:', !!activeAccount);

    // For wallet users without NextAuth session, redirect directly
    if (!session?.user && activeAccount) {
      console.log('[Lobby] Wallet user detected, creating wallet session...');
      // Try to create a session first by logging in with wallet
      try {
        const walletAddress = activeAccount.address;
        const signInResponse = await fetch('/api/auth/wallet-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            chainId: 'algorand',
            domain: window.location.hostname
          })
        });

        if (signInResponse.ok) {
          // Session created, reload to get updated session
          window.location.reload();
          return;
        }
      } catch (walletError) {
        console.error('[Lobby] Wallet session creation failed:', walletError);
      }
    }

    if (!session?.user) {
      console.error('[Lobby] No session found for SSO');
      alert('Please ensure you are logged in');
      return;
    }

    setIsGeneratingToken(true);
    try {
      console.log('[Lobby] Generating SSO token...');
      // Generate SSO token
      const response = await fetch('/api/auth/sso-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('[Lobby] SSO token response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[Lobby] SSO token error:', errorData);
        throw new Error(errorData.error || 'Failed to generate SSO token');
      }

      const { ssoToken } = await response.json();
      console.log('[Lobby] SSO token generated and set as cookie, redirecting to ERP...');

      // Redirect to ERP without token in URL (token is in cookie)
      window.location.href = ERP_URL;
    } catch (error) {
      console.error('[Lobby] Error generating SSO token:', error);
      alert('Failed to access ERP. Please try again.');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  // Dapp tiles configuration
  const dappTiles = [
    {
      title: "ERP",
      description: "At the heart of Sizland lies the ERP solution created for today's decentralized world",
      icon: "Workflow",
      // SSO via shared NextAuth session cookies on .siz.land domain
      href: ERP_URL,
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

  useEffect(() => {
    if (mounted && !isAuthed && status !== "loading" && isReady) {
      // Redirect to login if neither NextAuth session nor wallet is available
      router.push("/login");
    }
  }, [mounted, isAuthed, status, isReady, router]);

  if (!mounted || (!isAuthed && (status === "loading" || !isReady))) {
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

  if (!isAuthed) {
    return null; // Will redirect via useEffect when unauthenticated and no wallet connected
  }

  return (
    <PageLayout title="Dashboard - Sizland" description="Your Sizland Dashboard" requireAuth={true}>
      <div className="min-h-screen">
        {/* Header Section */}
        <div className="bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 drop-shadow-lg">
                Welcome back, {(session?.user?.name || session?.user?.email?.split("@")[0] || activeAccount?.address?.slice(0, 8)) ?? "User"}!
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
                    className={`w-full max-w-xs flex flex-col items-center text-center p-4 min-h-[220px] transition-all duration-300 ${tile.isClickable
                        ? 'cursor-pointer hover:shadow-lg hover:scale-105 transform'
                        : 'cursor-not-allowed opacity-60'
                      }`}
                  >
                    <div className="h-12 flex items-center justify-center mb-4">
                      <Icon
                        size={32}
                        className={`${tile.isClickable
                            ? 'text-indigo-500'
                            : 'text-gray-400'
                          }`}
                      />
                    </div>
                    <h3
                      className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-gray-900" : "text-white"
                        }`}
                    >
                      {tile.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed ${theme === "dark" ? "text-gray-600" : "text-gray-300"
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
                  // Special handling for ERP with SSO token
                  if (tile.title === "ERP") {
                    return (
                      <a
                        key={index}
                        href={tile.href}
                        onClick={handleERPClick}
                        className="relative"
                      >
                        {isGeneratingToken && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg z-10">
                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                          </div>
                        )}
                        {tileContent}
                      </a>
                    );
                  }

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
