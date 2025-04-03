// import logoDark from "@/assets/dark-logo.svg";
// import logoLight from "@/assets/light-logo.svg";
// import logo from "@/assets/logo-symbol.svg";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggler } from "../ui/theme-toggler";
import { Button } from "../ui/button";
import { HeaderSheet } from "./header-sheet";
import { ConnectWalletButton } from "@/components/ui/connect-button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  ListItem,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Typography } from "../ui/typography";
import { Separator } from "@radix-ui/react-separator";
import React from "react";

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
      }
    ],
  },
];

const otherLinks: NavLink[] = [
  {
    label: "Tokenomics",
    href: "/tokenomics",
  },
  {
    label: "Partners",
    href: "/partners",
  },
];

export const Navbar: React.FC = () => {
  return (
    <div className="fixed z-50 flex w-full justify-between items-center border-b border-neutral-400/50 bg-white/50 p-4 backdrop-blur-xl dark:bg-black/50 md:px-16 md:py-4">
      <div className="flex-1 hidden md:block">
        <Link href="/" className="flex items-center justify-start">
          <Image
            src="/logo1.png"
            alt="Sizland Logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain mr-2"
          />
          {/* 
          @
          @@
          @@@
          @@@@ Replace Typography component with theme aware Image components  
          @@@
          @@
          @
          */}
          {/* <Image
            src={logoDark}
            alt="dark mode logo"
            className="block w-40 dark:hidden"
          />
          <Image
            src={logoLight}
            alt="light mode logo"
            className="hidden w-40 dark:block"
          /> */}
          <Typography variant="h3" className="font-bold">
            SIZLAND
          </Typography>
        </Link>
      </div>
      <Link href={"/"} className="flex items-center justify-start md:hidden">
        {/* 
          @
          @@
          @@@
          @@@@ Replace Typography component with theme aware Image component for mobile view  
          @@@
          @@
          @
          */}
        {/* <Image
          src={logo}
          alt="mobile logo icon"
          className="block md:hidden"
          width={30}
          height={30}
        /> */}
        <Image
            src="/logo1.png"
            alt="Sizland Logo"
            width={40}
            height={40}
            className="h-10 w-auto object-contain mr-2"
          />
        <Typography variant="h3" className="font-bold">
          SIZLAND
        </Typography>
      </Link>
      <div className="flex-1 justify-center hidden items-center gap-3 lg:flex">
        <NaviLinks />
      </div>

      <div className="flex-1  justify-end items-center gap-3 hidden  lg:flex">
        <ThemeToggler />
        <ConnectWalletButton />
      </div>

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
        <NavigationMenuItem>
          <NavigationMenuTrigger className="">Siz</NavigationMenuTrigger>
          <NavigationMenuContent className="flex">
            {productLinks.map((navLink, index) => (
              <ul
                key={index}
                className="flex flex-col w-[200px] gap-3 p-4 md:w-[250px] md:grid-cols-2 lg:w-[300px] "
              >
                <Typography className="" variant={"large"}>
                  {navLink.label}
                </Typography>
                {navLink.paths.map((path, index) => (
                  <React.Fragment key={path.label}>
                    <ListItem title={path.label} href={path.href} className="">
                      {path.description}
                    </ListItem>
                    {index !== navLink.paths.length - 1 && (
                      <Separator
                        orientation="horizontal"
                        className="dark:border-[#E8E8E8]/20 border-[1px] border-black/20"
                      />
                    )}
                  </React.Fragment>
                ))}
              </ul>
            ))}
          </NavigationMenuContent>
        </NavigationMenuItem>

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
        <div key={index} className="pt-4 w-full">
          <Typography variant="large" className="mb-2 text-center">
            {navLink.label}
          </Typography>
          <div className="flex flex-col items-center text-center space-y-2">
            {navLink.paths.map((path, index) => (
              <Link
                key={index}
                href={path.href}
                className="text-base text-black dark:text-white hover:text-green-800 transition-colors duration-200"
              >
                {path.label}
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Centered Connect Wallet button */}
      <div className="pt-6">
        <ConnectWalletButton />
      </div>
    </div>
  );
};


