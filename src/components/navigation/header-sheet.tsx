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
import { ConnectWalletButton } from "../ui/connect-button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface NavLink {
  label: string;
  href: string;
}

export const HeaderSheet: React.FC<{
  marketingLinks: NavLink[];
  otherLinks: NavLink[];
}> = ({ marketingLinks, otherLinks }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);

  return (
    <Sheet open={isNavbarOpen} onOpenChange={() => setIsNavbarOpen(!isNavbarOpen)}>
      <SheetTrigger asChild className="z-[500]">
        <MenuIcon className="text-terminal-green h-6 w-6" />
      </SheetTrigger>
      <SheetContent className="border-border-subtle bg-surface-base/95 backdrop-blur-xl flex flex-col">
        <VisuallyHidden>
          <SheetTitle>Mobile Menu</SheetTitle>
          <SheetDescription>Navigation menu</SheetDescription>
        </VisuallyHidden>

        <div className="mb-8 flex items-center gap-3">
          <Image src="/logo1.png" alt="Sizland" width={32} height={32} />
          <span className="font-headline text-terminal-green tracking-headline">Sizland</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-4 px-2 pb-20">
            <ConnectWalletButton />
            <MobileNavLinks marketingLinks={marketingLinks} otherLinks={otherLinks} />
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <ThemeToggler />
        </div>
      </SheetContent>
    </Sheet>
  );
};
