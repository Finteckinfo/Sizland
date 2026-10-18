/** Public product map for SEO, Open Graph, sitemaps, and AI crawlers. */

export const MAIN_ORIGIN = "https://www.siz.land";
export const SITE_NAME = "Sizland";
export const TWITTER = "@sizlandofficial";
export const OG_IMAGE = `${MAIN_ORIGIN}/metaimage.png`;

export const siteConfig = {
  name: SITE_NAME,
  title: "Sizland — identity, land, and remote-work infrastructure",
  description:
    "Sizland is infrastructure for sovereign remote work. SizWallet at wallet.siz.land is a DID identity wallet on Base. buy.siz.land is the land and asset marketplace. Sizland is not a SIZ token sale and not an Algorand Pera/Stripe checkout.",
  disambiguation:
    "www.siz.land is the public Sizland site. wallet.siz.land is SizWallet (DID identity, keys on device). buy.siz.land is land and assets. solutions.siz.land is enterprise modules. None of these hosts is a SIZ token shop using Pera, Defly, Stripe, or Paystack.",
  url: MAIN_ORIGIN,
  ogImage: OG_IMAGE,
  locale: "en_US",
  twitterHandle: TWITTER,
  dateModified: "2026-10-18",
  sameAs: [
    "https://twitter.com/sizlandofficial",
    "https://wallet.siz.land",
    "https://buy.siz.land",
    "https://solutions.siz.land",
  ],
} as const;

export const products = [
  {
    host: "www.siz.land",
    url: "https://www.siz.land",
    name: "Sizland",
    description:
      "Public Sizland site: the ecosystem homepage for identity, land, and remote-work tools.",
  },
  {
    host: "wallet.siz.land",
    url: "https://wallet.siz.land",
    name: "SizWallet",
    description:
      "DID-first identity wallet on Base. Self-custody, passkeys, .siz profiles, Element Pay. Not a token sale.",
  },
  {
    host: "buy.siz.land",
    url: "https://buy.siz.land",
    name: "Buy Sizland",
    description:
      "Land and asset marketplace. Uses SizWallet as identity. Not a second wallet and not a SIZ token checkout.",
  },
  {
    host: "solutions.siz.land",
    url: "https://solutions.siz.land",
    name: "Sizland Solutions",
    description: "Enterprise modules and digital-economy infrastructure for organizations on Sizland.",
  },
  {
    host: "mytab.siz.land",
    url: "https://mytab.siz.land",
    name: "MyTab",
    description: "Peer ledger for tabs and settlements inside the Sizland stack.",
  },
  {
    host: "erp.siz.land",
    url: "https://erp.siz.land",
    name: "Sizland ERP",
    description: "Workspace and task ERP for remote teams. Identity via SizWallet.",
  },
  {
    host: "crm.siz.land",
    url: "https://crm.siz.land",
    name: "Sizland CRM",
    description: "Client and delivery CRM for Sizland organizations.",
  },
] as const;

export const siteKeywords = [
  "Sizland",
  "SizWallet",
  "wallet.siz.land",
  "buy.siz.land",
  "DID identity",
  "Base smart wallet",
  "land marketplace",
  "sovereign remote work",
  "decentralized identity",
] as const;

export const siteFaqs = [
  {
    question: "What is Sizland?",
    answer:
      "Sizland is infrastructure for sovereign remote work: public profiles, land and asset listings, and identity that stays on the user’s device. The public site is www.siz.land.",
  },
  {
    question: "What is wallet.siz.land?",
    answer:
      "SizWallet. It is a DID-first identity wallet on Base. You keep the recovery phrase on your device, sign in with a DID or passkey, and use a .siz public profile. It is not a SIZ token shop.",
  },
  {
    question: "What is buy.siz.land?",
    answer:
      "The land and asset marketplace. You sign in with Sizland identity (including SizWallet). It is not a second wallet and does not sell SIZ tokens through Pera, Stripe, or Paystack.",
  },
  {
    question: "Is Sizland an Algorand token-distribution platform?",
    answer:
      "No. That describes a legacy frontend. Current SizWallet is anchored on Base. Algorand appears only as one of several derived chain addresses, not as a token-sale checkout.",
  },
] as const;

export const siteKeywordsCsv = siteKeywords.join(", ");

/** Canonical origin for the current browser host. */
export function originForHost(hostname?: string | null): string {
  const h = (hostname ?? "").split(":")[0].toLowerCase();
  if (h === "buy.siz.land" || h.endsWith(".buy.siz.land")) return "https://buy.siz.land";
  if (h === "solutions.siz.land" || h.endsWith(".solutions.siz.land")) return "https://solutions.siz.land";
  if (h === "mytab.siz.land" || h.endsWith(".mytab.siz.land")) return "https://mytab.siz.land";
  if (h === "wallet.siz.land") return "https://wallet.siz.land";
  return MAIN_ORIGIN;
}
