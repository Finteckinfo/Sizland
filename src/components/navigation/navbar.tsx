"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ThemeToggler } from "../ui/theme-toggler";
import { Button } from "../ui/button";
import { HeaderSheet } from "./header-sheet";
import { ConnectWalletButton } from "../ui/connect-button";
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

const otherLinks: NavLink[] = [
  {
    label: "White Paper",
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
];

export const Navbar: React.FC = () => {
  return (
    <div className="fixed z-50 flex w-full justify-between items-center border-b border-neutral-400/50 bg-white/50 p-4 backdrop-blur-xl dark:bg-black/50 md:px-16 md:py-4">
      {/* Desktop Logo */}
      <div className="flex-1 hidden md:block">
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

      {/* Mobile Logo */}
      <Link href="/" className="flex items-center justify-start md:hidden">
        <Image
          src="/logo1.png"
          alt="Sizland Logo"
          width={40}
          height={40}
          className="h-10 w-auto object-contain mr-2"
        />
        <Typography variant="h3" className="font-bold font-pj">
          SIZLAND
        </Typography>
      </Link>

      {/* Desktop Nav */}
      <div className="flex-1 justify-center hidden items-center gap-3 lg:flex">
        <NaviLinks />
      </div>

      {/* Actions */}
      <div className="flex-1 justify-end items-center gap-3 hidden lg:flex">
        <ThemeToggler />
        <ConnectWalletButton />
      </div>

      {/* Mobile Menu */}
      <div className="block lg:hidden">
        <HeaderSheet />
      </div>
    </div>
  );
};

export const NaviLinks: React.FC = () => {
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

export const MobileNavLinks: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center space-y-4 px-4 py-2">
      {otherLinks.map((navLink, index) => (
        <Link
          key={index}
          href={navLink.href}
          className="text-lg font-medium text-black dark:text-white hover:text-green-800 transition-colors duration-200"
        >
          {navLink.label}
        </Link>
      ))}

      {productLinks.map((navLink, index) => (
        <div key={index} className="w-full">
          <Typography variant="large" className="mb-2 text-center">
            {navLink.label}
          </Typography>
          <div className="flex flex-col items-center space-y-2">
            {navLink.paths.map((path, index) => (
              <button
                key={index}
                onClick={(e) => scrollToSection(e, path.href)}
                className="text-base text-black dark:text-white hover:text-green-800 transition-colors duration-200"
              >
                {path.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
