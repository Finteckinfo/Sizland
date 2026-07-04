import Image from "next/image";
import Link from "next/link";
import {
  GitHubIcon,
  TelegramIcon,
  DiscordIcon,
  XIcon,
} from "@/assets/icons/social";

const footerLinks = [
  { label: "Privacy", href: "/privacy-policy" },
  { label: "Security", href: "/legal" },
  { label: "Documentation", href: "/whitepaper" },
  { label: "Whitepaper", href: "/whitepaper" },
  { label: "Contact", href: "/contact" },
  { label: "Terms", href: "/terms" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/Finteckinfo", icon: GitHubIcon },
  { label: "Telegram", href: "https://t.me/sizlandofficial", icon: TelegramIcon },
  { label: "Discord", href: "https://discord.com/invite/sizland", icon: DiscordIcon },
  { label: "Twitter/X", href: "https://twitter.com/sizlandofficial", icon: XIcon },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-white/10 text-[#bbcabf]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter px-4 sm:px-6 md:px-margin-desktop py-10 md:py-12 max-w-container-max mx-auto">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo1.png"
              alt="Sizland Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain opacity-80"
            />
            <span className="font-headline text-lg text-terminal-green tracking-headline">Sizland</span>
          </div>
          <p className="font-body text-sm text-[#9ca8a2]">
            Confidential — Sizland 2026 — Proprietary Technology
          </p>
          <p className="font-label text-xs text-[#9ca8a2]">
            Engineering Total Sovereignty.
          </p>
          <div className="flex gap-4 pt-2">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="font-body text-[#9ca8a2] hover:text-terminal-green transition-colors"
              >
                <social.icon />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:items-end justify-start mt-8 md:mt-0 space-y-3 text-sm">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-body text-[#9ca8a2] hover:text-terminal-green transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};
