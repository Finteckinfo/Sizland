# mytab.siz.land — Phase 1 Change Plan

**Priority brief:** Subdomain routing, dedicated layout/chrome, and dashboard UI scaffold ported from the `html.html` skeleton.

---

## 1. Phase 1 scope — what shipped

### 1.1 Subdomain routing (`mytab.siz.land`)

| Layer | File | Change |
|-------|------|--------|
| Edge middleware | `middleware.ts` | Added `MYTAB_ORIGIN`, `isMytabHost()`, `MYTAB_APP_PREFIXES`, allowlist guard, and root → `/mytab` rewrite |
| Next.js rewrites | `next.config.js` | `beforeFiles` rewrite: `mytab.siz.land /` → `/mytab` |
| Vercel config | `vercel.json` | Redirects `siz.land/mytab*` and `www.siz.land/mytab*` → `https://mytab.siz.land`; host-based rewrite for root |
| App constant | `src/lib/external-apps.ts` | `MYTAB_URL` (env-overridable via `NEXT_PUBLIC_MYTAB_URL`) |

### 1.2 Layout isolation

| Area | File(s) | Change |
|------|---------|--------|
| Global chrome gate | `src/pages/_app.tsx` | `Layout` component checks `router.pathname.startsWith("/mytab")` — skips Navbar, Footer, GlowBackground, AnimatedGrid on mytab routes |
| MyTab layout | `src/components/mytab/layout/mytab-layout.tsx` | Wraps children with ambient background, sidebar (desktop), top bar + bottom nav (mobile), Material Symbols font link |
| Ambient background | `src/components/mytab/layout/mytab-ambient-bg.tsx` | Three radial gradient blurs matching the `html.html` skeleton |
| Sidebar (desktop) | `src/components/mytab/layout/mytab-sidebar.tsx` | Profile card, "New Request" CTA, Ledger / Timeline / Wallet / Security nav, Settings / Support footer |
| Mobile chrome | `src/components/mytab/layout/mytab-mobile-nav.tsx` | Fixed top bar (title + QR / wallet buttons) and bottom tab bar (Ledger / Activity / Wallet / Profile) |

### 1.3 Dashboard components

| Component | File | Description |
|-----------|------|-------------|
| Balance pill | `src/components/mytab/dashboard/balance-pill.tsx` | Glass pill showing available balance (amount + currency) with "Send to Mobile Money" CTA |
| Request form | `src/components/mytab/dashboard/request-form.tsx` | REQUEST (Create) panel — target identifier, amount, due date, memo, "Generate Request" submit |
| Pledge queue | `src/components/mytab/dashboard/pledge-queue.tsx` | PLEDGES (Incoming) panel — list of pending pledges with approve / decline actions, urgent highlighting, and "Pay Through the App" footer |
| Dashboard page | `src/pages/mytab/index.tsx` | Composes BalancePill + two-column grid of RequestForm + PledgeQueue |

### 1.4 Design tokens

| Location | Change |
|----------|--------|
| `src/styles/globals.css` | `.mytab-app` scope with full Material 3 token set (`--mt-primary`, `--mt-surface-*`, `--mt-glass-border`, `--mt-liquid-mint`, etc.) |
| `tailwind.config.ts` | All `mt-*` utility colors wired to the CSS custom properties |

---

## 2. Architecture decisions

- **Token namespacing:** All MyTab colors are prefixed `mt-` to avoid collisions with the main Stitch design tokens. The tokens are scoped under `.mytab-app` in CSS so they only activate within the MyTab layout.
- **Layout branching:** Done at the `Layout` wrapper in `_app.tsx` using `router.pathname`, not with a separate `_app`. This keeps shared providers (SessionProvider, WagmiProvider, ThemeProvider) intact for cross-subdomain SSO.
- **Mock data:** Dashboard components currently use hardcoded mock data. On-chain integration (Phase 3) will replace these with live contract reads.

---

## 3. Roadmap — subsequent phases

### Phase 2 — Onboarding & identity

- Username alias registration (on-chain `AliasRegistry`)
- Dual wallet track: external wallet connect (Track 1) + ERC-4337 smart account creation (Track 2)
- Phone hash registration: client-side SHA-256 of phone number, SMS OTP verification, on-chain `PhoneHashRegistry` write

### Phase 3 — Smart contracts & pledge lifecycle

- Deploy Base contracts: `AliasRegistry`, `PhoneHashRegistry`, `PledgeLedger`, `ReputationEngine`, `Paymaster`
- Wire REQUEST panel → `PledgeLedger.createPledge()` (on-chain)
- Wire PLEDGES panel → co-sign approve/decline with live contract events
- Gas sponsorship via `Paymaster` for new users

### Phase 4 — Reputation & enforcement

- Grey-scale reputation overlays on pledge cards
- Blacklist enforcement (block interactions with flagged addresses)
- Maturity timeline + notification system (email/push for due dates)

### Phase 5 — Fiat bridge

- Extend Paystack integration for onramp settlement
- Mobile money offramp modal ("Send to Mobile Money" → real M-Pesa disbursement)

### Phase 6 — Hardening

- Mainnet deployment (Base)
- Security audit of smart contracts
- E2E test suite for pledge lifecycle
- Environment variable documentation

---

## 4. File inventory (all phases)

| Area | Paths |
|------|-------|
| Routing / host | `middleware.ts`, `next.config.js`, `vercel.json` |
| App constants | `src/lib/external-apps.ts` |
| Global layout gate | `src/pages/_app.tsx` |
| Document (CSP + fonts) | `src/pages/_document.tsx`, `src/utils/security.ts` |
| MyTab layout | `src/components/mytab/layout/*` |
| Dashboard | `src/components/mytab/dashboard/*` |
| Timeline | `src/components/mytab/timeline/*` |
| Onboarding | `src/components/mytab/onboarding/*` |
| Fiat bridge | `src/components/mytab/fiat/*` |
| Pages | `src/pages/mytab/index.tsx`, `onboarding.tsx`, `settings.tsx` |
| API routes | `src/pages/api/mytab/alias/*`, `phone/*`, `paystack/*` |
| Lib utilities | `src/lib/mytab/phone-hash.ts`, `contracts.ts`, `constants.ts`, `pledge-client.ts`, `indexer-client.ts` |
| Smart contracts | `contracts/mytab/*.sol` |
| Design tokens | `src/styles/globals.css`, `tailwind.config.ts` |
| Env template | `.env.mytab.example` |
| Docs | `docs/MyTab/CHANGE-PLAN.md` |

---

## 5. Accounts & prerequisites (future phases)

| Service | Purpose | When needed |
|---------|---------|-------------|
| Alchemy / Infura | Base RPC + Bundler (ERC-4337) | Phase 2 |
| Africa's Talking / Twilio | SMS OTP for phone verification | Phase 2 |
| Paystack | Fiat onramp/offramp (M-Pesa) | Phase 5 |
| Base Sepolia faucet | Testnet ETH for contract deployment | Phase 3 |
| Basescan | Contract verification | Phase 3 |

---

## 6. Definition of done — Phase 1

- [x] `mytab.siz.land` routed via middleware, next.config, and vercel.json
- [x] `siz.land/mytab*` redirects to `mytab.siz.land`
- [x] `MYTAB_URL` exported from `external-apps.ts`
- [x] Global Navbar/Footer/GlowBackground/AnimatedGrid hidden on `/mytab` routes
- [x] MyTab layout renders: sidebar (desktop), top bar + bottom nav (mobile), ambient background
- [x] Dashboard page with balance pill, request form, and pledge queue
- [x] `mt-*` design tokens scoped under `.mytab-app`
- [x] No regressions on existing subdomains (`siz.land`, `buy.siz.land`, `solutions.siz.land`)
