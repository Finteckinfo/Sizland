"use client";

import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { MobileNavLinks } from "./navbar";
import { ThemeToggler } from "../ui/theme-toggler";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface NavLink {
  label: string;
  href: string;
}

export const HeaderSheet: React.FC<{
  marketingLinks: NavLink[];
  otherLinks: NavLink[];
  signInHref?: string;
}> = ({ marketingLinks, otherLinks, signInHref = "/auth-choice" }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  const closeMenu = () => setIsNavbarOpen(false);

  return (
    <Sheet open={isNavbarOpen} onOpenChange={setIsNavbarOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-elevated/80 text-terminal-green hover:border-terminal-green hover:bg-surface-elevated transition-colors"
        >
          <MenuIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent className="w-[min(100vw,20rem)] max-w-[100vw] bg-surface-base border-l border-border-subtle flex flex-col text-on-surface p-0">
        <VisuallyHidden>
          <SheetTitle>Mobile Menu</SheetTitle>
          <SheetDescription>Navigation menu</SheetDescription>
        </VisuallyHidden>

        <div className="flex items-center gap-3 px-5 pt-6 pb-4 border-b border-border-subtle">
          <Image src="/logo1.png" alt="Sizland" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="font-headline text-terminal-green tracking-headline">Sizland</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <MobileNavLinks
            marketingLinks={marketingLinks}
            otherLinks={otherLinks}
            onNavigate={closeMenu}
            signInHref={signInHref}
          />
        </div>

        <div className="px-4 pb-6 pt-3 border-t border-border-subtle flex items-center justify-end">
          <ThemeToggler />
        </div>
      </SheetContent>
    </Sheet>
  );
};
