"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ThemeToggler } from "../ui/theme-toggler";
import { Button } from "../ui/button";
import { HeaderSheet } from "./header-sheet";
import { ConnectWalletButton } from "../ui/connect-button";
import { loadWallet } from "@/lib/algorand/walletGenerator";
import PillNav from "../ui/PillNav";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  ListItem,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import { Typography } from "../ui/typography";
import { Separator } from "@radix-ui/react-separator";

// Utility to scroll with offset for fixed navbar
const scrollToSection = (
  e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>,
  id: string
) => {
  e.preventDefault();
  const section = document.querySelector(id) as HTMLElement;
  if (section) {
    window.scrollTo({
      top: section.offsetTop - 70,
      behavior: "smooth",
    });
  }
};

interface DropdownLinks {
  label: string;
  paths: {
    href: string;
    label: string;
    description: string;
  }[];
}

interface NavLink {
  label: string;
  href: string;
}

const productLinks: DropdownLinks[] = [
  {
    label: "Siz",
    paths: [
      {
        href: "#hero",
        label: "Intro",
        description: "Introduction to Sizland",
      },
      {
        href: "#roadmap",
        label: "Roadmap",
        description: "Sizland Roadmap",
      },
      {
        href: "#about",
        label: "About",
        description: "About Sizland",
      },
      {
        href: "#team",
        label: "Team",
        description: "Sizland Team",
      },
    ],
  },
];

export const Navbar: React.FC = () => {
  const [hasGeneratedWallet, setHasGeneratedWallet] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const wallet = loadWallet();
    setHasGeneratedWallet(!!wallet);

    // Listen for wallet generation events
    const handleWalletGenerated = () => {
      setHasGeneratedWallet(true);
    };

    const handleWalletCleared = () => {
      setHasGeneratedWallet(false);
    };

    window.addEventListener('walletGenerated', handleWalletGenerated);
    window.addEventListener('walletCleared', handleWalletCleared);

    return () => {
      window.removeEventListener('walletGenerated', handleWalletGenerated);
      window.removeEventListener('walletCleared', handleWalletCleared);
    };
  }, []);

  const navItems = [
    {
      label: "Siz",
      href: "#hero",
    },
    {
      label: "Whitepaper",
      href: "/whitepaper",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "Wallet",
      href: "/wallet",
    },
    // Conditionally add New Wallet link
    ...(hasGeneratedWallet ? [{
      label: "New Wallet",
      href: "/new-wallet",
    }] : []),
  ];

  return (
    <div className="fixed z-50 flex w-full justify-between items-center border-b border-neutral-400/50 bg-white/50 p-4 backdrop-blur-xl dark:bg-black/50 md:px-16 md:py-4">
      {/* Desktop Layout - Three Column Structure */}
      <div className="hidden lg:flex w-full items-center">
        {/* Left Section - Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center justify-start">
            <Image
              src="/logo1.png"
              alt="Sizland Logo"
              width={40}
              height={40}
              className="h-10 w-auto object-contain mr-2"
            />
            <button className="button1" data-text="Awesome">
              <span className="actual-text1 font-pj">&nbsp;SIZLAND&nbsp;</span>
              <span aria-hidden="true" className="hover-text1 font-pj">
                &nbsp;SIZLAND&nbsp;
              </span>
            </button>
          </Link>
        </div>

        {/* Center Section - PillNav (Always Centered) */}
        <div className="flex-1 flex justify-center items-center px-8">
          <PillNav
            logo="/logo1.png"
            logoAlt="Sizland Logo"
            items={navItems}
            activeHref="/"
            className="custom-nav"
            ease="power2.easeOut"
            baseColor="#10b981"
            pillColor="#ffffff"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#10b981"
            productLinks={productLinks}
            onScrollToSection={scrollToSection}
          />
        </div>

        {/* Right Section - Actions */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <ThemeToggler />
          <ConnectWalletButton />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex w-full items-center justify-between">
        {/* Mobile Logo */}
        <Link href="/" className="flex items-center justify-start">
          <Image
            src="/logo1.png"
            alt="Sizland Logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain mr-2"
          />
          <button className="button1-mobile" data-text="Awesome">
            <span className="actual-text1-mobile font-pj">&nbsp;SIZLAND&nbsp;</span>
            <span aria-hidden="true" className="hover-text1-mobile font-pj">
              &nbsp;SIZLAND&nbsp;
            </span>
          </button>
        </Link>

        {/* Mobile Menu */}
        <HeaderSheet otherLinks={navItems.filter(item => item.href !== "#hero")} />
      </div>
    </div>
  );
};

export const NaviLinks: React.FC<{ otherLinks: NavLink[] }> = ({ otherLinks }) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {/* Dropdown */}
        <NavigationMenuItem>
          <NavigationMenuTrigger>Siz</NavigationMenuTrigger>
          <NavigationMenuContent className="flex">
            {productLinks.map((navLink, index) => (
              <ul
                key={index}
                className="flex flex-col w-[200px] gap-3 p-4 md:w-[250px] lg:w-[300px]"
              >
                <Typography variant="large">{navLink.label}</Typography>
                {navLink.paths.map((path, index) => (
                  <React.Fragment key={path.label}>
                    <ListItem
                      title={path.label}
                      href={path.href}
                      onClick={(e) => scrollToSection(e, path.href)}
                    >
                      {path.description}
                    </ListItem>
                    {index !== navLink.paths.length - 1 && (
                      <Separator className="dark:border-[#E8E8E8]/20 border-black/20 border-[1px]" />
                    )}
                  </React.Fragment>
                ))}
              </ul>
            ))}
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Static Links */}
        {otherLinks.map((navLink, index) => (
          <NavigationMenuItem key={index}>
            <Link href={navLink.href} legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                {navLink.label}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export const MobileNavLinks: React.FC<{ otherLinks: NavLink[] }> = ({ otherLinks }) => {
  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Main Navigation Links with PillNav-like styling */}
      {otherLinks.map((navLink, index) => (
        <div key={index} className="w-full mobile-sidebar-item" style={{ '--item-index': index } as React.CSSProperties}>
          <Link
            href={navLink.href}
            className="group relative w-full block"
          >
            <div className="relative overflow-hidden">
              {/* PillNav-like background with vertical animation */}
              <div className="pill-background"></div>
              
              {/* Content with proper padding and centering */}
              <div className="content px-6 py-4 text-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-white transition-colors duration-300">
                  {navLink.label}
                </span>
              </div>
              
              {/* Subtle border glow */}
              <div className="absolute inset-0 rounded-full border-2 border-green-400/30 group-hover:border-green-400/50 transition-all duration-300"></div>
            </div>
          </Link>
        </div>
      ))}

      {/* Product Links Section with enhanced styling */}
      {productLinks.map((navLink, index) => (
        <div key={index} className="w-full space-y-3">
          {/* Section Title with PillNav-like styling */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500/20 to-green-600/20 dark:from-green-500/30 dark:to-green-600/30 rounded-full border border-green-400/30">
              <Typography variant="large" className="font-semibold text-green-700 dark:text-green-300">
                {navLink.label}
              </Typography>
            </div>
          </div>
          
          {/* Product Paths with enhanced styling */}
          <div className="flex flex-col items-center space-y-3">
            {navLink.paths.map((path, pathIndex) => (
              <div key={pathIndex} className="w-full mobile-sidebar-item" style={{ '--item-index': otherLinks.length + pathIndex } as React.CSSProperties}>
                <button
                  onClick={(e) => scrollToSection(e, path.href)}
                  className="group relative w-full block"
                >
                  <div className="relative overflow-hidden">
                    {/* PillNav-like background with vertical animation */}
                    <div className="pill-background"></div>
                    
                    {/* Content with proper padding and centering */}
                    <div className="content px-4 py-3 text-center">
                      <div className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-white transition-colors duration-300">
                        {path.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-green-100 transition-colors duration-300 mt-1">
                        {path.description}
                      </div>
                    </div>
                    
                    {/* Subtle border glow */}
                    <div className="absolute inset-0 rounded-full border border-green-400/30 group-hover:border-green-400/50 transition-all duration-300"></div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
