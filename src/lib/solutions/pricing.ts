export const BASE_CURRENCY = "KES" as const;

/** Canonical package prices in Kenyan shillings. */
export const packages = [
  {
    id: "launchpad",
    icon: "Rocket" as const,
    name: "Sizland Launchpad",
    tag: "Entry",
    amountKes: 25000,
    structure: "3 high-conversion pages",
    featured: false,
    summary:
      "Designed for individual professionals and small service startups that need a strong, conversion-focused online presence.",
    highlights: [
      "Hero landing page built around your unique selling proposition",
      "Rate card or package section to filter serious leads",
      "FAQ with social proof to build trust from day one",
      "Lead capture via WhatsApp, email, or custom contact form CTAs",
    ],
    edge:
      "Mobile-first build with load speeds under two seconds for a smooth experience from the first click.",
  },
  {
    id: "authority",
    icon: "Shield" as const,
    name: "Sizland Authority",
    tag: "Standard",
    amountKes: 35000,
    structure: "5 strategic pages",
    featured: true,
    summary:
      "Ideal for established brands strengthening their online presence and showing up more consistently in search results.",
    highlights: [
      "Everything in Launchpad, plus an industry blog or insights section",
      "Dedicated About or Portfolio page for credibility and past work",
      "Three-month content strategy: keyword research and content pillars",
      "Advanced on-page SEO with schema markup and meta optimization",
    ],
    edge:
      "Advanced on-page SEO—including schema markup and meta optimization—to improve visibility when clients search for your services.",
  },
  {
    id: "ecosystem",
    icon: "Layers" as const,
    name: "Sizland Ecosystem",
    tag: "Pro / Exec",
    amountKes: 45000,
    structure: "Full technical infrastructure",
    featured: false,
    summary:
      "For business owners who want more than a website—automation, client management, and efficient scaling.",
    highlights: [
      "Everything in Authority, plus integrated M-Pesa, bank, and card payments",
      "Automated receipt generation and secure admin dashboard",
      "Built-in client database with full data ownership and export",
      "Customer service tools: live chat or ticketing system",
    ],
    edge:
      "A complete business-in-a-box setup designed for control, efficiency, and frictionless scaling.",
  },
] as const;

export type PackageId = (typeof packages)[number]["id"];
export type PackageTier = (typeof packages)[number];

export type AddOnPeriod = "month" | "year" | "once";

export const addOns: {
  id: string;
  service: string;
  amountKes: number | null;
  period: AddOnPeriod;
  window?: string;
  custom?: boolean;
  details: string;
}[] = [
  {
    id: "seo-maintenance",
    service: "SEO Maintenance",
    amountKes: 10000,
    period: "month",
    window: "Months 1–3",
    details: "Intensive ranking and content creation.",
  },
  {
    id: "seo-retainer",
    service: "SEO Retainer",
    amountKes: 5000,
    period: "month",
    window: "Month 4+",
    details: "Ongoing monitoring and minor updates.",
  },
  {
    id: "identity-branding",
    service: "Identity Branding",
    amountKes: 5000,
    period: "once",
    details: "Professional logo and brand color palette.",
  },
  {
    id: "growth-ads",
    service: "Growth Ads",
    amountKes: null,
    period: "once",
    custom: true,
    details: "Infographics, video ads, or PPC campaigns.",
  },
  {
    id: "sizland-care",
    service: "Sizland Care",
    amountKes: 0,
    period: "month",
    window: "6 months included",
    details: "Technical health, security, and hosting oversight.",
  },
];

/**
 * Pass-through infrastructure fees (KES). Not Sizland package price.
 * Railway Hobby annualized ≈ $5/mo; typical commercial .com domain.
 * Edit these numbers in one place before launch.
 */
export const passThroughFees = {
  railway: {
    id: "railway",
    label: "Railway database hosting",
    amountKes: 7800,
    period: "year" as const,
    note: "PostgreSQL and app hosting on Railway — billed annually as a pass-through.",
  },
  domain: {
    id: "domain",
    label: "Domain name hosting",
    amountKes: 2500,
    period: "year" as const,
    note: "Annual domain registration and DNS for your brand (e.g. .com or .co.ke).",
  },
} as const;

export const PACKAGE_INTEREST_OPTIONS = [
  { value: "launchpad", label: "Sizland Launchpad" },
  { value: "authority", label: "Sizland Authority" },
  { value: "ecosystem", label: "Sizland Ecosystem" },
  { value: "infrastructure", label: "Infrastructure consult" },
  { value: "unsure", label: "Not sure yet" },
] as const;
