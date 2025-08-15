import Image from "next/image";
// import logoBlack from "@/../assets/logo-black.svg";
// import logoWhite from "@/../assets/logo-white.svg";
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
import { ConnectWalletButton } from "../ui/connect-button";
import { Typography } from "../ui/typography";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface NavLink {
  label: string;
  href: string;
}

export const HeaderSheet: React.FC<{ otherLinks: NavLink[] }> = ({ otherLinks }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  return (
    <Sheet
      open={isNavbarOpen}
      onOpenChange={() => setIsNavbarOpen(!isNavbarOpen)}
    >
      <SheetTrigger asChild className="z-[500]">
        <MenuIcon className="rotate-90" />
      </SheetTrigger>
      <SheetContent className="border-neutral-600 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
        <VisuallyHidden>
          <SheetTitle>Mobile Menu</SheetTitle>
          <SheetDescription>
            Navigate through the application using the mobile menu options.
          </SheetDescription>
        </VisuallyHidden>

        {/* Enhanced Header with PillNav-like styling */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg">
            <Typography variant="h3" className="font-bold text-white">
              SIZLAND
            </Typography>
          </div>
        </div>

        {/* Enhanced Navigation Items with PillNav Effect */}
        <div className="flex flex-col items-center gap-4 px-6">
          {/* Connect Wallet Button with enhanced styling */}
          <div className="w-full">
            <ConnectWalletButton />
          </div>
          
          {/* Navigation Links with PillNav-like styling */}
          <div className="w-full">
            <MobileNavLinks otherLinks={otherLinks} />
          </div>
        </div>

        {/* Theme Toggler positioned at bottom */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-2 shadow-lg">
            <ThemeToggler />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
