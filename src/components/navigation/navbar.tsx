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

// Scroll to section function with offset
const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
  e.preventDefault();
  const section = document.querySelector(id) as HTMLElement;
  if (section) {
    window.scrollTo({
      top: section.offsetTop - 70, // Adjust for the fixed navbar height
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
          <Typography variant="h3" className="font-bold">
            SIZLAND
          </Typography>
        </Link>
      </div>
      <Link href={"/"} className="flex items-center justify-start md:hidden">
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
                    <ListItem
                      title={path.label}
                      href={path.href}
                      onClick={(e) => scrollToSection(e, path.href)} // Add onClick handler for smooth scroll
                    >
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
  const scrollToSection = (e: React.MouseEvent<HTMLButtonElement>, sectionId: string) => {
    e.preventDefault();
    const section = document.querySelector(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {otherLinks.map((navLink, index) => (
        <React.Fragment key={index}>
          <Button
            className="w-full"
            onClick={() => window.location.href = navLink.href}
          >
            {navLink.label}
          </Button>
        </React.Fragment>
      ))}
      {productLinks.map((navLink, index) => (
        <React.Fragment key={index}>
          <Typography variant={"large"}>{navLink.label}</Typography>
          {navLink.paths.map((path, index) => (
            <React.Fragment key={index}>
              <Button
                className="w-full"
                onClick={(e) => scrollToSection(e, path.href)}
              >
                {path.label}
              </Button>
            </React.Fragment>
          ))}
        </React.Fragment>
      ))}
    </>
  );
};


