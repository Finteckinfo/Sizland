export const infrastructureModules = [
  {
    icon: "Coins" as const,
    id: "economy",
    title: "Economy Infrastructure",
    description:
      "Token-based access, staking, and seamless interoperability between fiat and digital assets across the Sizland ecosystem.",
    features: ["Atomic swaps", "Token-gated modules", "Multi-currency support"],
    span: "featured" as const,
  },
  {
    icon: "TrendingUp" as const,
    id: "growth",
    title: "Growth Architecture",
    description:
      "Scalable SDK framework for integrating third-party apps and extending functionality without compromising security.",
    features: ["Modular SDK", "Third-party APIs", "Plugin ecosystem"],
    span: "medium" as const,
  },
  {
    icon: "Shield" as const,
    id: "treasury",
    title: "Treasury & Reputation",
    description:
      "Multi-signature vaults and on-chain reputation for transparent governance and secure fund management.",
    features: ["Multi-signature vaults", "On-chain reputation", "DAO governance"],
    span: "medium" as const,
  },
  {
    icon: "Settings" as const,
    id: "automation",
    title: "System Automation",
    description:
      "Automated workflows and yield optimization bots to reduce manual operations and maximize efficiency.",
    features: ["Yield bots", "Workflow automation", "Smart triggers"],
    span: "compact" as const,
  },
];

export const auditBlocks = [
  {
    icon: "Database" as const,
    id: "sovereignty",
    title: "Data Sovereignty",
    description:
      "Your data remains under your control. End-to-end encryption and user-controlled permissions ensure full sovereignty over business and financial records.",
  },
  {
    icon: "Globe" as const,
    id: "mesh",
    title: "Global Mesh",
    description:
      "A distributed infrastructure spanning multiple regions. Resilient to systemic shocks with redundant nodes and instant failover.",
  },
];

export const howToSteps = [
  {
    id: "problem",
    label: "The gap",
    title: "Why this stack exists",
    body: "Most African SMEs still run outdated ERPs with six-figure implementation costs and no native digital-asset support. Sizland ships a modular stack: activate only what you need, access it through token staking instead of annual licenses, and keep operations and finance on the same ledger.",
    points: [
      "Opaque records lock SMEs out of credit — a $331B financing gap.",
      "Remote teams lose 15–20% productivity across disconnected tools.",
      "No major ERP natively settles crypto and fiat in one workflow.",
    ],
  },
  {
    id: "architecture",
    label: "Architecture",
    title: "How the infrastructure works",
    body: "The platform sits on Algorand: four-second finality, micro-fees, ISO 20022 alignment, and TEAL contracts that encode business logic. Companies stake SIZ per active user to unlock modules and can mix USSD for low-connectivity regions with a full web console.",
    points: [
      "4-second transaction finality for live reporting.",
      "Average fees near $0.00001 — viable for micro-operations.",
      "Token access replaces large annual software licenses.",
    ],
  },
  {
    id: "activate",
    label: "Activate",
    title: "How a company uses the stack",
    body: "Start with a conversion site (Launchpad → Authority → Ecosystem), then turn on ERP modules as the business grows. Each pillar — economy, growth SDK, treasury, automation — is independently deployable. Payments, receipts, and client data stay under the merchant’s control.",
    points: [
      "Phase 1: remote work essentials — tasks, time, multi-currency payroll.",
      "Phase 2: SME suite — accounting, CRM, lending hooks.",
      "Phase 3–4: industrial IoT, tokenized procurement, QR goods receipt.",
    ],
  },
  {
    id: "trust",
    label: "Trust",
    title: "Compliance and rollout",
    body: "Data handling is GDPR-oriented with user-controlled permissions. Financial services work toward Kenya CMA digital-asset authorization. Enterprise posture includes SOC 2 Type II in progress and recurring contract audits.",
    points: [
      "Implementation in weeks via modular activation, not 6–12 month deployments.",
      "Native SIZ, stablecoin, and fiat rails in one wallet.",
      "Roadmap: SME Africa first, then Latin America expansion.",
    ],
  },
] as const;

export const startKitItems = [
  {
    id: "logo",
    kind: "asset" as const,
    title: "Official company logo",
    summary: "We apply your mark across the site, receipts, and QR surfaces.",
    detail:
      "Send a vector (SVG or AI) plus a high-resolution PNG with a transparent background. Include both full-color and single-color versions if you have them.",
  },
  {
    id: "palette",
    kind: "asset" as const,
    title: "Brand color palette",
    summary: "Hex values we lock into the build so the product matches your identity.",
    detail:
      "Share primary, secondary, accent, and background hex codes (or a brand PDF). If you do not have a palette yet, Identity Branding is available as a rate-card add-on.",
  },
  {
    id: "railway",
    kind: "fee" as const,
    feeKey: "railway" as const,
    title: "Railway database hosting",
    summary: "Pass-through fee for the database and app runtime that powers your build.",
    detail:
      "Sizland provisions PostgreSQL and hosting on Railway. You cover the provider cost — shown in your local currency. This is not part of the package price.",
  },
  {
    id: "domain",
    kind: "fee" as const,
    feeKey: "domain" as const,
    title: "Domain name hosting",
    summary: "Annual registration and DNS for the domain customers will type.",
    detail:
      "Provide an existing domain, or we register one in your name. The hosting/registration fee is a pass-through, converted to your local currency.",
  },
] as const;
