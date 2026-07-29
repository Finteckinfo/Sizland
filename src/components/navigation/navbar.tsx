"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ThemeToggler } from "../ui/theme-toggler";
import { Button } from "../ui/button";
import { HeaderSheet } from "./header-sheet";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { LogOut } from "lucide-react";
import { SIZLAND_WALLET_URL } from "@/lib/external-apps";

const scrollToSection = (
  e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>,
  id: string
) => {
  e.preventDefault();
  const section = document.querySelector(id) as HTMLElement;
  if (section) {
    window.scrollTo({
      top: section.offsetTop - 80,
      behavior: "smooth",
    });
  }
};

interface NavLink {
  label: string;
  href: string;
}

const buyAppPathPrefixes = [
  "/buy-land",
  "/lands",
  "/browse-land",
  "/admin/land",
  "/admin/users",
] as const;

const marketingNavLinks: NavLink[] = [
  { label: "Solutions", href: "#solutions" },
  { label: "Features", href: "#features" },
  { label: "Technology", href: "#technology" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Community", href: "#community" },
];

function isBuyAppPath(pathname: string): boolean {
  return buyAppPathPrefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

function isMarketingRestrictedHost(): boolean {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname.toLowerCase();
  const onBuy =
    h === "buy.siz.land" ||
    h === "www.buy.siz.land" ||
    h.endsWith(".buy.siz.land");
  const onSolutions =
    h === "solutions.siz.land" ||
    h === "www.solutions.siz.land" ||
    h.endsWith(".solutions.siz.land");
  return onBuy || onSolutions;
}

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const isLoaded = status !== "loading";
  const [marketingRestrictedHost, setMarketingRestrictedHost] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMarketingRestrictedHost(isMarketingRestrictedHost());
  }, []);

  if (!mounted) return null;

  const isSolutionsPage = router.pathname === "/solutions";
  const hideMainMarketingLinks =
    marketingRestrictedHost || isSolutionsPage || isBuyAppPath(router.pathname);

  const secondaryLinks: NavLink[] = !hideMainMarketingLinks
    ? [
        { label: "Whitepaper", href: "/whitepaper" },
        { label: "Blog", href: "/blog" },
      ]
    : [];

  const logoHref = hideMainMarketingLinks ? "/" : "https://siz.land";
  const signInHref = hideMainMarketingLinks
    ? "/auth-choice"
    : "https://siz.land/auth-choice";

  const renderNavLink = (link: NavLink, className: string) => {
    if (link.href.startsWith("#")) {
      return (
        <a
          key={link.href}
          href={link.href}
          onClick={(e) => scrollToSection(e, link.href)}
          className={className}
        >
          {link.label}
        </a>
      );
    }
    return (
      <Link key={link.href} href={link.href} className={className}>
        {link.label}
      </Link>
    );
  };

  const linkClass =
    "font-body text-on-surface-variant text-xs lg:text-sm hover:text-terminal-green transition-colors duration-200 whitespace-nowrap";

  return (
    <nav className="sticky top-0 z-[100] chrome-tint-nav backdrop-blur-md supports-[backdrop-filter]:bg-surface-base/80">
      <div className="flex justify-between items-center w-full px-3 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto h-14 sm:h-16 md:h-20 gap-2 sm:gap-3">
        <Link href={logoHref} className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <Image
            src="/logo1.png"
            alt="Sizland Logo"
            width={40}
            height={40}
            className="h-8 w-8 sm:h-10 sm:w-10 object-contain shrink-0"
            priority
          />
          <span className="font-headline text-base sm:text-lg tracking-headline text-terminal-green truncate">
            Sizland
          </span>
        </Link>

        {!hideMainMarketingLinks && (
          <div className="hidden lg:flex items-center gap-8">
            {marketingNavLinks.map((link) => renderNavLink(link, linkClass))}
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggler />
            {isLoaded && session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user.image || undefined}
                        alt={session.user.name || "User"}
                      />
                      <AvatarFallback>
                        {session.user.name?.charAt(0).toUpperCase() ||
                          session.user.email?.charAt(0).toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{session.user.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              isLoaded && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border-subtle text-on-surface-variant"
                  onClick={() => {
                    window.location.href = signInHref;
                  }}
                >
                  Sign In
                </Button>
              )
            )}
            <a href={SIZLAND_WALLET_URL} target="_blank" rel="noopener noreferrer">
              <button className="stitch-btn bg-terminal-green text-surface-base font-label text-xs lg:text-sm px-4 lg:px-6 py-2 rounded hover:bg-neon-accent terminal-glow whitespace-nowrap">
                Launch Wallet
              </button>
            </a>
          </div>

          <div className="md:hidden">
            <HeaderSheet
              marketingLinks={hideMainMarketingLinks ? [] : marketingNavLinks}
              otherLinks={secondaryLinks}
              signInHref={signInHref}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export const MobileNavLinks: React.FC<{
  marketingLinks: NavLink[];
  otherLinks: NavLink[];
  onNavigate?: () => void;
  signInHref?: string;
}> = ({ marketingLinks, otherLinks, onNavigate, signInHref = "/auth-choice" }) => {
  const linkClass =
    "block w-full text-center py-3 px-4 border border-border-subtle rounded font-label text-sm text-on-surface hover:border-terminal-green hover:text-terminal-green transition-colors duration-200";

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href: string
  ) => {
    scrollToSection(e, href);
    onNavigate?.();
  };

  const renderLink = (link: NavLink) => {
    if (link.href.startsWith("#")) {
      return (
        <a
          key={link.href}
          href={link.href}
          onClick={(e) => handleAnchorClick(e, link.href)}
          className={linkClass}
        >
          {link.label}
        </a>
      );
    }
    return (
      <Link
        key={link.href}
        href={link.href}
        className={linkClass}
        onClick={() => onNavigate?.()}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {marketingLinks.map(renderLink)}
      {otherLinks.map(renderLink)}
      <a
        href={signInHref}
        className={linkClass}
        onClick={() => onNavigate?.()}
      >
        Sign In
      </a>
    </div>
  );
};
