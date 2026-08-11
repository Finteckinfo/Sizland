# buy.siz.land — Required Changes (vs June Specs)

**Priority brief:** Landing page UI cleanups, auth redirect logic, and the **"Sourcing in Progress"** state.

| Source | Local path |
|--------|------------|
| Land Page Scope & Flow | `_The Sizland Land Acquisition Workflow (Internalized Logic).pdf` |
| Land Page UI & Form Spec | `Technical Specifications_ buy.siz.land UX Optimization & Workflow Refinement_.pdf` |

This doc maps those specs to **what we must change in the codebase**, split into **this week (explicit sprint)** vs **full acquisition workflow (roadmap from the internalized logic PDF)**.

---

## 1. This week — Sprint objectives (must ship)

From the UX Optimization PDF + the manager message:

1. Fix header icon alignment (theme toggle vs Sign In / hamburger).
2. Direct primary CTAs through Auth, then return to the land flow (not ERP/lobby).
3. Capture **Name** and **Email** on Create Request; gate Submit on those + Terms.
4. Replace empty gallery with the **48-hour expert sourcing** placeholder.
5. **Pending (details not yet shared):** MOOC modules + property mapping widget — track only; do not invent requirements.

---

## 2. Gap analysis (current code → desired)

### 2.1 Landing page UI & header cleanup

| Spec | Current | Change |
|------|---------|--------|
| Theme toggle vertically centered with Sign In + hamburger | `ThemeToggler` sits in header (`navbar.tsx` / `header-sheet.tsx`) and is reported misaligned (sits higher than Sign In / menu) | Align theme control on the same vertical center line as adjacent header actions; fix mobile + desktop |
| "Start a Land Request" → Auth for signed-out users | Partially done: `handleStartLandRequest` sends unauthenticated users to `/auth-choice?callbackUrl=…` | Confirm **all** primary land CTAs use the same rule (hero CTA, secondary CTAs, browse-land “Start acquisition”, etc.) — no form/wizard without auth |

**Primary files**

- `src/components/navigation/navbar.tsx`
- `src/components/navigation/header-sheet.tsx`
- `src/components/ui/theme-toggler.tsx`
- `src/pages/buy-land.tsx` (CTA handlers)
- `src/pages/browse-land.tsx` (CTAs into acquisition)

---

### 2.2 Authentication redirect logic (critical)

| Spec | Current | Change |
|------|---------|--------|
| After login/signup started from `buy.siz.land`, return to buy acquisition flow | NextAuth `redirect` callback **always** forces `${baseUrl}/lobby` (`src/pages/api/auth/[...nextauth].ts`) — this overrides `callbackUrl` and creates “dashboard friction” | Honor `callbackUrl` / `state` when auth was initiated from buy; default back to `https://buy.siz.land` (or `/buy-land` on non-prod) instead of `/lobby` |
| Prefer `redirect_uri` / `state` so user lands where they left off | CTA builds a callback, but server callback ignores it | Pass + persist callback across `/auth-choice` → `/login` / `/signup` / Google `signIn`; stop hardcoding Google `callbackUrl: '/lobby'` on login |

**Primary files**

- `src/pages/api/auth/[...nextauth].ts` — rewrite `callbacks.redirect` to respect allowed return URLs (buy host + relative `/buy-land`, `/lands`, etc.)
- `src/pages/login.tsx` — propagate `callbackUrl` (query) into credentials + OAuth `signIn`
- `src/pages/signup.tsx` — same after register → auto sign-in
- `src/pages/auth-choice.tsx` / `wallet-auth` / `sso-callback` — preserve callback through the chain
- `src/pages/buy-land.tsx` — keep buy-host-aware `callbackUrl` when sending users to auth

**Acceptance**

- Sign in from `buy.siz.land` → land back on buy landing or open request form, **not** the general lobby/ERP.
- Sign in from main `siz.land` can keep existing lobby behavior if product still wants that.

---

### 2.3 Create Request form (Step 3) — Name + Email

| Spec | Current | Change |
|------|---------|--------|
| Fields **before Purpose**: Name (`e.g., Jay`), Email (`name@example.com`) | Form only has Budget, Size, Purpose, Plot Reference, Terms | Add Name + Email UI; note that Name is for communication (legal name later) |
| Email format validation | N/A | Require valid email before enable Submit |
| Submit disabled until Name, Email, Terms (and required fields) filled | Submit only requires `purpose` (+ terms checked at submit with error) | Disable Submit until Name, Email (valid), Terms checked, and existing required fields |

**API / backend**

- Extend create-request payload (`POST` via `/api/land/create-request` → backend land-acquisition) to accept and store `name` + `email`.
- Flag captured email for **manual follow-up / sourcing notification** (spec: backend must support ops outreach within ~48h).

**Primary files**

- `src/pages/buy-land.tsx` (and any mirrored form on `/lands` if criteria edit overlaps later)
- Next.js land API proxy routes under `src/pages/api/land/`
- `SIZBackend2.0` land-acquisition create/update request handlers + DB schema/columns as needed

---

### 2.4 Post-submission & “Sourcing in Progress” state

| Spec | Current | Change |
|------|---------|--------|
| Replace empty “No lands at the moment” with sourcing screen | `lands.tsx` empty state uses MapPin + “No lands at the moment” | New centered state: spinner / pulsing “Sourcing” icon |
| Heading | — | **Request Received & Expert Sourcing Initiated** |
| Body | Generic “plots will appear…” | Exact copy: experts received criteria; manually vetting plots matching budget/purpose; update with curated options in **less than 48 hours** |
| Hide/disable “Update your criteria & filters” on this empty/results sourcing page | Button is always available on `/lands` | Hide or disable while there are no plots (sourcing phase) |
| Rename “Back to Buy Land” → “Return to Dashboard” or “Close” | Label is “Back to Buy Land” → `/buy-land` | Relabel; decide target (buy confirmation / buy home vs lobby — prefer **stay in buy context**) |
| Confirmation / gallery empty path on buy-land | Confirmation with 0 plots pushes “View Available Lands →” | Align copy/UX with sourcing narrative (request received; options incoming &lt;48h), not an empty marketplace feel |
| Workflow Story 1 success copy | Confirmation text is weaker / generic | Prefer: “Our Notary and Sourcing team are now identifying verified titles in [Location].” when location is known, else generic sourcing message |

**Primary files**

- `src/pages/lands.tsx` (main empty-state swap)
- `src/pages/buy-land.tsx` (confirmation with zero plots)

---

## 3. Suggested implementation order

1. **Auth redirect** — unblocks every CTA path; highest product risk.
2. **Name/Email + Submit gate + API persistence** — enables sourcing follow-up.
3. **Sourcing in Progress UI** on `/lands` (+ buy confirmation empty path).
4. **Header theme-toggle alignment** — pure UI polish.
5. **CTA audit** — browse-land / secondary buttons all force auth → return to buy.

---

## 4. Full workflow vision (from Internalized Logic PDF)

These are the **product phases** the June setup describes. Much of this is **beyond the explicit weekly sprint**, but it is the destination UX/admin model — use it so we don’t paint ourselves into a corner with the sourcing placeholder.

### Phase 1 — Intake & Discovery

- Client: budget, size, purpose → request.
- Admin: sources options; uploads **Digital Gallery** (geo-pins, photos, videos).
- Client: reviews gallery → selects plot.

**UI stories:** Initial order confirmation; then digital gallery + Fund Escrow.

### Phase 2 — Due Diligence “Safety Gate”

- Fund escrow (full budget or initial **$200** DD tranche).
- **$200** unlock to Sizland Notary for registry search / site visit.
- Notary uploads **Comprehensive DD Report**.
- Gates: **Proceed** / **Pivot** (first 2 site visits covered; 3rd needs top-up) / **Cancel** (refund remainder).

### Phase 3 — Execution & Fiat Bridge

- Client “Initiate Purchase” → release purchase funds to Notary wallet.
- UI disclaimer: authorize crypto → KES for seller + statutory costs.
- Notary pays seller offline; custody of original title / transfers / LCB consents.
- UI: “Funds Disbursed. Sizland has secured all original documents in our legal vault.”
- Logic gate: do **not** advance to “Transfer Initiated” until Notary uploads **seller payment receipt**.

### Phase 4 — Registry & Finalization

- Lodgement receipt upload; progress bar + estimated completion (e.g. Day X of 21).
- Final title scan; facilitation fee release; courier tracking for physical deed.
- Logic gate: “Complete Transaction” tied to valid tracking number.

### Notary / Admin panel needs (Cheru / admin workstream)

- Log fiat (KES) payments against crypto released.
- Timeline / expected title date.
- Document hub: Search Certificate, Sale Agreement, Lodgement Receipt, Final Title.

**Implication for this week:** empty gallery is intentional until ops uploads plots — the **Sourcing in Progress** state is the correct interim client UX, not a broken empty list.

---

## 5. Pending — not in this week’s build yet

| Item | Status | Notes |
|------|--------|--------|
| MOOC modules | **Awaiting details** | Do not scope UI/routes until brief lands |
| Property mapping widget | **Awaiting details** | May overlap future Digital Gallery / geo-pins; wait for share-out |

When those arrive, add a short addendum under this folder rather than expanding inventively.

---

## 6. File inventory (buy sprint touch list)

| Area | Likely paths |
|------|----------------|
| Routing / host | `middleware.ts`, `next.config.js`, `vercel.json` |
| Landing + wizard | `src/pages/buy-land.tsx` |
| Empty / plot list | `src/pages/lands.tsx` |
| Public browse CTAs | `src/pages/browse-land.tsx` |
| Header polish | `src/components/navigation/navbar.tsx`, `header-sheet.tsx`, `theme-toggler.tsx` |
| Auth redirect | `src/pages/api/auth/[...nextauth].ts`, `login.tsx`, `signup.tsx`, `auth-choice.tsx` |
| Land APIs | `src/pages/api/land/*` + `SIZBackend2.0` land-acquisition |
| Admin (later phases) | `src/pages/admin/land.tsx`, backend admin plot/document/status APIs |

---

## 7. Definition of done (this week)

- [ ] Theme toggle optically aligned with Sign In / hamburger (desktop + mobile).
- [ ] Unauthenticated “Start a Land Request” (and equivalent CTAs) → auth → **return to buy flow**, never stuck on `/lobby`.
- [ ] Create Request collects Name + Email (validated); Submit disabled until Name, Email, Terms (+ required land fields).
- [ ] Email (and name) persisted and usable for manual &lt;48h follow-up.
- [ ] Zero-plot experience shows **Sourcing in Progress** copy (heading + 48h body), not “No lands at the moment”.
- [ ] Criteria/filters control hidden or disabled in that sourcing state; exit CTA labeled **Return to Dashboard** or **Close** within buy context.
- [ ] MOOC + mapping explicitly left pending until follow-up brief.

---

## 8. Out of scope for the immediate sprint (unless unblocked)

- Full Digital Gallery (map pins, video carousel) beyond empty/sourcing state.
- Live $200 escrow unlock / on-chain fiat bridge / receipt locks.
- Registry tracker, live notary chat, courier API.
- Full Notary Admin fiat logging suite (track under admin roadmap).

These remain valid product requirements from the Internalized Logic PDF and should be sequenced after the sprint UI/auth/sourcing work.
)
