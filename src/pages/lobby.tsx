import React, { useEffect, useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useWallet } from "@txnlab/use-wallet-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

const ERP_URL = process.env.NEXT_PUBLIC_ERP_URL || "https://erp.siz.land";

type OnboardingStep = {
  title: string;
  description: string;
  bullets: string[];
  icon: keyof typeof Icons;
  pill: string;
};

type RoleQuickStart = {
  role: string;
  focus: string;
  action: string;
  helper: string;
};

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Frame the Workspace",
    description: "Spin up your Sizland org, invite collaborators, and map departments so every task inherits the right budget owner automatically.",
    bullets: ["Create workspace + departments", "Assign project owners & reviewers", "Define payment currencies"],
    icon: "LayoutDashboard",
    pill: "Step 1"
  },
  {
    title: "Plan & Fund Tasks",
    description: "Break work into token-funded tasks, set clear deliverables, and allocate escrow in the same flow.",
    bullets: ["Draft monthly sprints or milestones", "Attach SIZ or fiat payouts per task", "Fund escrow during assignment"],
    icon: "Coins",
    pill: "Step 2"
  },
  {
    title: "Approve & Automate Payouts",
    description: "Supervisors review submissions, approvals trigger instant releases, and accountants just monitor the audit trail.",
    bullets: ["Supervisors review & approve tasks", "Escrow releases to contributor wallets", "Analytics + logs stay in sync"],
    icon: "ShieldCheck",
    pill: "Step 3"
  }
];

const roleQuickStarts: RoleQuickStart[] = [
  {
    role: "Project Owners",
    focus: "Spin up projects, set budgets, and delegate managers.",
    action: "Create workspace",
    helper: "Takes ~2 minutes · brings escrow + analytics online."
  },
  {
    role: "Managers & Supervisors",
    focus: "Group tasks, assign contributors, and monitor velocity.",
    action: "Load Kanban board",
    helper: "Drag-and-drop tasks, escalate blockers instantly."
  },
  {
    role: "Contributors",
    focus: "Deliver tasks, track payouts, and sync wallets.",
    action: "Open ERP Workspace",
    helper: "Built-in wallet tutorial + SLA reminders."
  }
];

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

  const baseCardClass = `w-full max-w-xs flex flex-col items-start text-left p-5 rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
    theme === "dark"
      ? "bg-white/5 border-emerald-500/15 shadow-[0_10px_40px_rgba(16,185,129,0.15)]"
      : "bg-white/85 border-emerald-500/15 shadow-[0_14px_50px_rgba(16,185,129,0.14)]"
  }`;

  const iconWrapClass = `mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
    theme === "dark"
      ? "bg-emerald-500/15 text-emerald-300"
      : "bg-emerald-500/10 text-emerald-600"
  }`;

  const titleClass = `text-lg font-semibold mb-2 ${
    theme === "dark" ? "text-white" : "text-gray-900"
  }`;

  const descClass = `text-sm leading-relaxed ${
    theme === "dark" ? "text-gray-300" : "text-gray-600"
  }`;

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
          {/* ERP Onboarding Overview */}
          <section className="mb-12" data-testid="erp-onboarding-hero">
            <div
              className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-white via-emerald-50 to-white p-8 shadow-2xl dark:border-white/10 dark:from-emerald-900/20 dark:via-slate-900/50 dark:to-slate-950"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500 dark:text-emerald-300">
                    Sizland ERP onboarding
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    Make every team ledger-ready in three guided passes
                  </h2>
                  <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
                    We condensed the ERP workflow into a playbook that covers workspace design, escrow-backed tasking,
                    and automated releases. Share it with every role so nobody gets stuck between SSO and the Kanban board.
                  </p>
                </div>
                <div className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <div className="rounded-2xl bg-white/70 p-4 shadow-lg ring-1 ring-black/5 backdrop-blur dark:bg-white/5">
                    <p className="text-xs uppercase tracking-widest text-emerald-500">Need a hand?</p>
                    <p className="mt-1 font-semibold">Wallet + Escrow concierge</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Guided flows for Pera, Defly, WalletConnect.</p>
                  </div>
                  <div className="rounded-2xl bg-black/5 p-4 shadow-lg ring-1 ring-black/5 dark:bg-white/5">
                    <p className="text-xs uppercase tracking-widest text-emerald-500">Average go-live time</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">6h</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">From workspace creation to first payment.</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                {onboardingSteps.map((step, idx) => {
                  const StepIcon = Icons[step.icon] as LucideIcon;
                  return (
                    <div
                      key={step.title}
                      className="group relative flex h-full flex-col rounded-2xl border border-emerald-500/10 bg-white/80 p-6 shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-emerald-200/40 dark:bg-white/5"
                    >
                      <div className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-500 dark:text-emerald-300">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                          {step.pill}
                        </span>
                        <span>ERP flow</span>
                      </div>
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
                          <StepIcon size={24} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{step.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
                      <ul className="mt-4 space-y-2 text-sm text-gray-700 dark:text-gray-200">
                        {step.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {roleQuickStarts.map((card) => (
                  <div
                    key={card.role}
                    className="rounded-2xl border border-white/40 bg-white/90 p-4 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">{card.role}</p>
                    <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">{card.focus}</p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{card.helper}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-300">{card.action}</span>
                      <button
                        className="rounded-full border border-emerald-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 transition hover:bg-emerald-500 hover:text-white dark:border-emerald-300/30 dark:text-emerald-200"
                        onClick={() => {
                          if (card.role === "Project Owners") {
                            router.push("/projects/create");
                          } else if (card.role === "Managers & Supervisors") {
                            router.push("/kanban");
                          } else {
                            window.location.href = ERP_URL;
                          }
                        }}
                      >
                        Launch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Tiles Grid */}
          <div className="flex justify-center items-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full justify-items-center">
              {dappTiles.map((tile, index) => {
                const Icon = (Icons[tile.icon as keyof typeof Icons] as LucideIcon) || Icons.Star;

                const tileContent = (
                  <div
                    className={`${baseCardClass} ${
                      tile.isClickable
                        ? "cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_60px_rgba(16,185,129,0.18)]"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <div className={iconWrapClass}>
                      <Icon size={28} />
                    </div>
                    <h3 className={titleClass}>{tile.title}</h3>
                    <p className={descClass}>{tile.description}</p>

                    {!tile.isClickable && (
                      <div className="mt-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          theme === "dark"
                            ? "bg-white/10 text-gray-100 border border-white/15"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}>
                          Coming Soon
                        </span>
                      </div>
                    )}
                  </div>
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
                        data-testid="erp-tile-link"
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

          {/* Quick Stats Section - match hero/whitepaper style */}
          <div className="mt-16 flex flex-col items-center text-center space-y-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Your Sizland Journey
            </h3>
            <div className="flex items-center justify-center space-x-10 sm:space-x-16 md:space-x-20">
              {/* dApps Available */}
              <div className="flex flex-col items-center text-center">
                <p className={`text-5xl font-medium sm:text-6xl md:text-7xl font-pj ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  4
                </p>
                <p className={`mt-2 text-sm font-pj ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  dApps Available
                </p>
              </div>

              {/* spacer */}
              <div className="hidden sm:block">
                <svg
                  className={theme === "dark" ? "text-gray-600" : "text-gray-400"}
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

              {/* Active Services */}
              <div className="flex flex-col items-center text-center">
                <p className={`text-5xl font-medium sm:text-6xl md:text-7xl font-pj ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  3
                </p>
                <p className={`mt-2 text-sm font-pj ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Active Services
                </p>
              </div>

              {/* spacer */}
              <div className="hidden sm:block">
                <svg
                  className={theme === "dark" ? "text-gray-600" : "text-gray-400"}
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

              {/* Unified Account */}
              <div className="flex flex-col items-center text-center">
                <p className={`text-5xl font-medium sm:text-6xl md:text-7xl font-pj ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}>
                  1
                </p>
                <p className={`mt-2 text-sm font-pj ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Unified Account
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default LobbyPage;
