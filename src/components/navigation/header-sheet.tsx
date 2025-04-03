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

export const HeaderSheet: React.FC = () => {
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

        <div className="mb-6">
          <Typography variant="h3" className="font-bold">
            SIZLAND
          </Typography>
        </div>
        <div className="flex flex-col items-stretch gap-2">
          <ConnectWalletButton />
          <MobileNavLinks />
        </div>
        <div className="absolute bottom-4 left-4">
          <ThemeToggler />
        </div>
      </SheetContent>
    </Sheet>
  );
};
