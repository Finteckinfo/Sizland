# CASSINI Implementation Plan: Sizland Trust-as-a-Service

**Document Version:** 1.0  
**Date:** March 2026  
**Scope:** buy.siz.land subdomain and linked pages  
**Target:** CASSINI Challenges 2026 — MVP with TRL ≥ 5, CRL ≥ 4

---

## Backend, Database & Multi-Platform Constraints

### Critical: SIZBackend2.0 Is Shared Infrastructure

**SIZBackend2.0** is hosted on Railway and serves **multiple platforms** (Sizland/buy.siz.land, siz-erp-frontend, and others). It must remain intact for all consumers.

| Resource | Purpose | Used By |
|----------|---------|---------|
| **PostgreSQL** | Primary data store | Auth, projects, tasks, land acquisition, users, escrow, analytics, etc. |
| **Redis** | Session storage, chat, payment queue, caching | Multiple platforms |

### Rules for CASSINI Implementation

1. **Additive-only changes**
   - Add new Prisma models (e.g. `SatelliteVerification`).
   - Add new columns to existing models only as **nullable** (e.g. `LandPlot.latitude`, `LandPlot.longitude`).
   - Add new API routes (e.g. `/api/satellite/*`) — do **not** modify or remove existing routes.

2. **Use the existing database**
   - All CASSINI data goes into the **same PostgreSQL** database via SIZBackend2.0’s Prisma schema (`SIZBackend2.0/prisma/schema.prisma`).
   - Apply changes via Prisma migrations; run migrations in the SIZBackend2.0 deployment.

3. **Use the existing Redis (optional, for caching)**
   - If CASSINI needs caching (e.g. satellite imagery tiles), use the shared Redis with **namespaced keys** (e.g. `sizland:satellite:imagery:{plotId}`) to avoid collisions with chat, sessions, or payment queues.

4. **Do not break existing behaviour**
   - Do not change existing `LandAcquisitionRequest`, `LandPlot`, or other models in ways that affect current APIs.
   - Do not alter routes used by other platforms (projects, tasks, chat, auth, etc.).

5. **Environment variables**
   - Add CASSINI-specific vars (Copernicus, Galileo, etc.) to Railway for SIZBackend2.0 — do not overwrite `DATABASE_URL`, `REDIS_URL`, or other shared config.

---

## 1. Executive Summary

Sizland will **lead with Trust-as-a-Service** (Satellite-Verified Audit) rather than tokenized assets. The blockchain remains the backend for payments, but the **product we sell is the Satellite-Verified Audit**. We build the **API Bridge** that connects European satellite data (Copernicus, Galileo) to our blockchain payment system. This makes Sizland a Trust-as-a-Service company, not just another property app.

### 1.1 Strategic Pivot

| Before | After |
|--------|-------|
| Tokenized asset (high regulatory friction) | Satellite-Verified Audit (high commercial demand) |
| Property app | Trust-as-a-Service |
| Manual due diligence | EU Space data–driven verification |

---

## 2. Current State: buy.siz.land and Related Pages

### 2.1 What Exists Today

**buy.siz.land subdomain** (`Sizland/src/pages/buy-land.tsx`):

- **Host:** `buy.siz.land` — root `/` and `/buy-land` both serve the buy-land page.
- **Flow:** 4-step wizard  
  1. **Login** — Auth (NextAuth, Clerk SSO, wallet-based)  
  2. **Connect Wallet** — Algorand wallet address capture  
  3. **Create Request** — Budget, size, purpose, plot reference  
  4. **Confirmation** — Request summary, plot selection, escrow funding

**Linked pages:**

- **Lands page** (`/lands`) — Browse plots, filters (search, budget, size, purpose), select plot, fund escrow.  
  - On buy.siz.land, `/lands` redirects to `siz.land/lands` via middleware.

**Backend (SIZBackend2.0):**

- `GET /api/land-acquisition/progress` — User’s latest land request and plots
- `PATCH /api/land-acquisition/connect-wallet`
- `POST /api/land-acquisition/create-request`
- `POST /api/land-acquisition/select-plot`
- Admin: `POST /admin/plots`, `PATCH /admin/request/:id/status`, `POST /admin/documents`

**Data model (LandPlot):**

- `id`, `requestId`, `name`, `fullAddress`, `description`, `escrowAmount`, `images`  
- **Missing:** `latitude`, `longitude`, `boundaryGeoJSON` (required for satellite AOI)

**Blockchain:**

- Algorand wallet integration (`@txnlab/use-wallet-react`)
- Escrow concepts in backend; payment flow via Stripe/Paystack/webhooks

### 2.2 What Is Missing for CASSINI

| Component | Status | Gap |
|-----------|--------|-----|
| EU Space data integration | ❌ | No Copernicus, Galileo, OSNMA |
| Geospatial data on plots | ❌ | No coordinates / AOI |
| Satellite imagery in UI | ❌ | No Sentinel-2 / WMS display |
| Galileo HAS verification | ❌ | No NTRIP, PPP, boundary authentication |
| OSNMA anti-spoofing | ❌ | No signal authentication |
| Trust-as-a-Service narrative | ❌ | No “Satellite-Verified Audit” product |
| Geospatial certificate on-chain | ❌ | No minted verification proof |

---

## 3. CASSINI Requirements Recap

### 3.1 MVP Requirements

- **TRL ≥ 5:** Technology validated in a relevant environment.
- **CRL ≥ 4:** Early market validation and foundational commercial infrastructure.
- **EU Space leverage:** Galileo, Copernicus, SST, SSA, or GOVSATCOM.

### 3.2 How to Describe Our Integration (for Assessors)

1. **Data Ingestion Layer:** CDSE OData API (or Sentinel Hub) fetches Sentinel-2 imagery for every property in our ERP.
2. **Verification Engine:** Galileo HAS corrections via internet (NTRIP) authenticate land boundaries registered in our ERP.
3. **Automated Trust Loop:** Backend compares satellite-derived “physical truth” with user-reported “project status.” When they match, the smart contract triggers payment.

### 3.3 OSNMA Value Proposition

- **Anti-fraud:** OSNMA verifies that coordinates used for check-in or minting are cryptographically authentic.
- **Trusted audits:** Ensures field workers or inspectors are physically present at the claimed coordinates.
- **Sizland’s role:** OSNMA proves signal authenticity at the moment; Sizland records that proof on-chain for a permanent, tamper-proof audit trail.

---

## 4. API Bridge Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Sizland Trust-as-a-Service                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  buy.siz.land (Frontend)                                                     │
│  ├── Plot cards with satellite imagery overlay                               │
│  ├── "Satellite-Verified" badge                                              │
│  └── Audit report view (per plot)                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  API Bridge (New routes in SIZBackend2.0 — additive, does not affect others) │
│  ├── Copernicus Adapter   → Sentinel Hub / CDSE OData / openEO               │
│  ├── Galileo HAS Adapter  → NTRIP client, PPP algorithm                      │
│  ├── OSNMA Adapter        → galileo-osnma library, GSC public key            │
│  └── Verification Engine  → Compare satellite truth vs user status           │
├─────────────────────────────────────────────────────────────────────────────┤
│  SIZBackend2.0 (Railway) — PostgreSQL + Redis, multi-platform                │
│  ├── Land acquisition API (progress, create-request, select-plot, escrow)    │
│  ├── Plot CRUD (admin), projects, tasks, chat, auth, escrow, etc.            │
├─────────────────────────────────────────────────────────────────────────────┤
│  Blockchain (Algorand / Sui / Base)                                          │
│  └── Geospatial Certificate (HAS-verified coords + OSNMA proof)              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 EU Space Data Sources (from API Integration PDF)

| Source | Purpose | Access |
|--------|---------|--------|
| **Copernicus CDSE** | Sentinel-1 (radar), Sentinel-2 (optical) | Free registration at Copernicus Data Space Ecosystem |
| **Sentinel Hub API** | REST: request imagery by AOI (GPS coords) | Part of CDSE / Sentinel Hub |
| **WMS / WMTS** | Show satellite map in dashboard | URL into Leaflet/Mapbox |
| **openEO** | Change detection (e.g. green → brown → “Land Cleared”) | Standardized API |
| **Galileo HAS** | Centimeter-level boundary verification | Free via Internet (IDD) using NTRIP |
| **Galileo OSNMA** | Anti-spoofing, signal authentication | GSC registration, OSNMA-ready receivers |

---

## 5. Implementation Phases

### Phase 1: Data Model & Admin UX (Weeks 1–2)

**Goal:** Store geospatial data for plots and allow admin to set coordinates.

**Tasks:**

1. **Schema changes (SIZBackend2.0 Prisma — additive only)**
   - Add to `LandPlot`: `latitude`, `longitude` (Float?, nullable), `boundaryGeoJSON` (Json?, nullable)
   - Add `SatelliteVerification` model: `plotId`, `lastImageryDate`, `changeDetectionStatus`, `hasVerified`, `osnmaProofHash`
   - Run Prisma migration in SIZBackend2.0; deploy to Railway
2. **Admin API**
   - Extend `POST /admin/plots` to accept `latitude`, `longitude`, `boundaryGeoJSON`
   - Optional: geocode `fullAddress` to auto-fill coords
3. **Frontend**
   - Admin plot form: coordinate input or map picker

**Deliverable:** Plots can have coordinates; admin can manage them.

---

### Phase 2: Copernicus Integration (Weeks 3–5)

**Goal:** Fetch Sentinel-2 imagery for plot AOI and display on buy.siz.land.

**Tasks:**

1. **CDSE / Sentinel Hub registration**
   - Create Copernicus Data Space Ecosystem account
   - Obtain API credentials
2. **Backend: Copernicus adapter (new route in SIZBackend2.0)**
   - Add `GET /api/satellite/imagery?plotId=xxx` or `?lat=&lng=&bbox=`
   - Use Sentinel Hub REST or CDSE OData for AOI
   - Optional: cache tile URLs in Redis with key prefix `sizland:satellite:imagery:` (TTL e.g. 24h)
   - Return image URL or tile URL for WMS
3. **Frontend**
   - Plot cards on buy-land / lands: show satellite thumbnail or WMS overlay
   - Add “Satellite-Verified” / “Imagery available” badge
4. **Optional: openEO**
   - Basic change detection script (e.g. NDVI) for “Land Cleared” status

**Deliverable:** Plots show satellite imagery; visual “proof of work” for land status.

---

### Phase 3: Galileo HAS & Boundary Verification (Weeks 5–7)

**Goal:** Centimeter-level boundary verification using Galileo HAS.

**Tasks:**

1. **GSC registration**
   - Register at European GNSS Service Centre
   - Access Galileo HAS via NTRIP (Internet Data Distribution)
2. **NTRIP client**
   - Backend or field-agent mobile app as NTRIP client
   - Receive correction data for PPP
3. **PPP integration**
   - Use corrections to improve standard GPS (5–10 m) to ~20 cm
4. **Geospatial Certificate**
   - On HAS-verified coordinates: sign and mint to blockchain (Geospatial Certificate)
   - Link certificate to `LandPlot` and `LandAcquisitionRequest`

**Deliverable:** Boundary verification stored on-chain as Geospatial Certificate.

---

### Phase 4: Galileo OSNMA (Weeks 7–9)

**Goal:** Anti-spoofing for field check-ins and boundary minting.

**Tasks:**

1. **OSNMA-ready tools**
   - OSNMA-capable GNSS receivers / mobile chips
   - `galileo-osnma` Rust library (or equivalent) for signature verification
2. **GSC public key**
   - Download official Galileo public key from GSC
   - Backend verifies location data before on-chain recording
3. **Integration**
   - Field check-in / “mint boundary” flow: verify OSNMA before writing to blockchain
   - Store `osnmaProofHash` or equivalent in DB / on-chain

**Deliverable:** Tamper-proof, spoof-resistant verification for critical operations.

---

### Phase 5: Automated Trust Loop & Trust-as-a-Service Product (Weeks 9–11)

**Goal:** Compare satellite truth with user status; drive payment triggers.

**Tasks:**

1. **Verification Engine**
   - Compare:
     - Satellite-derived status (e.g. change detection, imagery date)
     - User-reported status (e.g. “Land Cleared”, “Construction Started”)
   - If match → mark “verified” and allow next step (e.g. escrow release)
2. **Trust-as-a-Service product**
   - Define “Satellite-Verified Audit” as a purchasable product
   - Price: e.g. per-plot or per-request audit fee
   - Product page or section on buy.siz.land
3. **Dashboard**
   - Audit report view per plot: imagery, verification status, OSNMA proof, blockchain link

**Deliverable:** Trust-as-a-Service sold on buy.siz.land; automated verification drives workflows.

---

### Phase 6: TRL 5 & CRL 4 Readiness (Weeks 11–12)

**Goal:** Meet CASSINI MVP requirements.

**Tasks:**

1. **TRL 5**
   - Demo in a “relevant environment”: e.g. real Kenya plot with real Sentinel-2 imagery, simulated HAS/OSNMA if needed
   - Documentation: architecture, API flows, integration points
2. **CRL 4**
   - Early customers / pilots: at least one paying customer or LOI
   - Commercial infrastructure: pricing, terms, payment flow
3. **Application materials**
   - Narrative: Data Ingestion Layer, Verification Engine, Automated Trust Loop
   - OSNMA value proposition and how Sizland complements it
   - Screenshots, demo video, architecture diagram

**Deliverable:** CASSINI-ready application; TRL 5 + CRL 4 evidence.

---

## 6. buy.siz.land UX Enhancements

### 6.1 Landing & Flow

- **Hero:** “Satellite-Verified Land Investment” — emphasize Trust-as-a-Service.
- **Feature cards:** Add “EU Satellite-Verified Audit” (Copernicus + Galileo) and “Anti-Spoofing (OSNMA)”.
- **How it works:** Add step “Satellite verification” (e.g. after due diligence, before escrow release).

### 6.2 Plot Cards (buy-land confirmation, lands page)

- Satellite thumbnail or WMS overlay for each plot.
- Badge: “Satellite-Verified” or “Imagery available.”
- Link to audit report (when available).

### 6.3 New Page: Audit Report

- Per-plot view: latest imagery, change detection summary, verification status, blockchain certificate link.
- Optional: comparison slider (before/after imagery).

### 6.4 Subdomain Routing (Optional)

- Allow `/lands` on buy.siz.land for a focused buying experience.
- Today: `/lands` on buy.siz.land redirects to siz.land/lands. Keeping this is fine if main app is the primary UX.

---

## 7. Technical Stack Additions

| Component | Technology |
|-----------|------------|
| Map / imagery | Leaflet or Mapbox GL JS |
| WMS / WMTS | Leaflet tile layers |
| Sentinel Hub | REST API, Process API |
| NTRIP client | Node.js library (e.g. `ntrip-client`) or mobile SDK |
| OSNMA | `galileo-osnma` (Rust) or equivalent; call from Node via FFI or separate service |
| Geospatial Certificate | Algorand ARC (e.g. custom ASA or standard metadata) |

---

## 8. Environment Variables

Add these to **Railway → SIZBackend2.0 → Variables**. Do **not** overwrite `DATABASE_URL`, `REDIS_URL`, or other shared config used by multiple platforms.

```env
# Copernicus / Sentinel Hub (CASSINI only)
COPERNICUS_USERNAME=
COPERNICUS_PASSWORD=
SENTINEL_HUB_INSTANCE_ID=

# Galileo
GALILEO_GSC_API_KEY=
NTRIP_CASTER_URL=
OSNMA_PUBLIC_KEY_URL=

# Optional: openEO
OPENEO_URL=
OPENEO_USER=
OPENEO_PASSWORD=
```

---

## 9. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking other platforms using SIZBackend2.0 | Additive-only: new models, nullable columns, new routes; never modify/remove existing APIs |
| CDSE / Sentinel Hub rate limits | Cache imagery in Redis (namespaced keys); use WMS for display when possible |
| NTRIP / HAS latency | Use for critical operations; fallback to standard GPS with disclaimer |
| OSNMA library maturity | Start with simulated OSNMA; move to real when receivers are ready |
| Kenya coverage | Sentinel-2 covers Kenya; verify cloud cover and revisit frequency |

---

## 10. Success Criteria

- [ ] At least one plot with real Sentinel-2 imagery displayed on buy.siz.land
- [ ] Admin can create plots with coordinates
- [ ] “Satellite-Verified” badge visible on verified plots
- [ ] Documentation ready for CASSINI: Data Ingestion Layer, Verification Engine, Automated Trust Loop
- [ ] TRL 5 demonstrated in relevant environment
- [ ] CRL 4 demonstrated (pilot customer or LOI)

---

## 11. References

- [CASSINI Challenges 2026](https://www.euspa.europa.eu/cassinichallenges)
- [API Integration PDF](../../../Downloads/API%20integration%20.pdf) — Copernicus, Galileo HAS, OSNMA
- [EUSPA CASSINI Rules of Contest](https://www.euspa.europa.eu/sites/default/files/documents/EUSPA-PRIZE-01-2026%20-%20Cassini%20Challenges%202026%20-%20Rules%20of%20Contest.pdf)
- [Copernicus Data Space Ecosystem](https://dataspace.copernicus.eu/)
- [European GNSS Service Centre (GSC)](https://www.gsc-europa.eu/)
- [ Galileo OSNMA Receiver Guidelines](https://www.gsc-europa.eu/) (EUSPA)

---

## Appendix A: File Inventory (buy.siz.land Scope)

| File | Purpose |
|------|---------|
| `Sizland/src/pages/buy-land.tsx` | Main buy-land page (landing + 4-step flow) |
| `Sizland/src/pages/lands.tsx` | Plot browser (on siz.land; linked from buy-land) |
| `Sizland/src/pages/api/land/[...path].ts` | Proxy to SIZBackend land-acquisition API |
| `Sizland/middleware.ts` | Subdomain routing (buy.siz.land → buy-land) |
| `Sizland/next.config.js` | Rewrites for buy.siz.land root → buy-land |
| `Sizland/vercel.json` | Redirects buy-land → buy.siz.land |
| `SIZBackend2.0/src/routes/land-acquisition.ts` | Backend land API |
| `SIZBackend2.0/prisma/schema.prisma` | LandPlot, LandAcquisitionRequest, + CASSINI models (additive) |
| SIZBackend2.0 (Railway) | PostgreSQL + Redis; multi-platform — CASSINI changes additive only |

---

## Appendix B: TRL & CRL Quick Reference

**TRL 5:** Technology validated in relevant environment (e.g. lab-like setup with real data).  
**TRL 6:** Technology demonstrated in relevant environment.  
**TRL 7:** System prototype in operational environment.

**CRL 4:** Early market validation; foundational commercial infrastructure (pricing, terms, first pilots).
