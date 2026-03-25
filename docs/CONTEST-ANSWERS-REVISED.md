# Contest Answers (Revised, Paste-Ready)

These answers are aligned with what is currently implemented: Copernicus/Sentinel-2 EO verification, a land acquisition workflow with escrow tracking, and a docs-only due diligence evidence step handled by Land Admins. They also state: **pilot in Kenya, rollout across Africa**.

---

## 1) Describe your MVP and the overall solution (≤200 words)

The MVP is a satellite-verified land acquisition workflow designed to enable secure cross‑border land transactions across Africa. It bridges the trust gap for remote investors by combining independent Earth Observation evidence with an auditable due‑diligence process and escrow‑tracked milestones.

User journey: a user starts a land request on `buy.siz.land`, submits budget and land requirements, and reviews candidate plots sourced by our team. For plots with geospatial coordinates, the platform retrieves Copernicus Sentinel‑2 imagery and stores the latest imagery/verification evidence, shown to the user as “Satellite‑Verified”. The user selects a plot and proceeds through escrow milestones and due diligence. In the MVP‑minimum due‑diligence step, Land Admins upload docs‑only evidence (e.g., reports/surveys/agreements) and mark the request as `DUE_DILIGENCE`, which updates the user’s progress UI.

The initial pilot geography is Kenya, but the same workflow is designed to scale to additional African markets as we onboard local partners and standardized evidence requirements. Future releases will expand the physical verification network, add stronger integrity proofs for evidence, and further automate settlement steps where required.

---

## 2) MVP maturity (TRL/CRL)

TRL: 5  
CRL: 4

---

## 3) Primary evidence for TRL/CRL (≤100 words)

TRL ≥ 5 is supported because the MVP integrates EU space EO data (Copernicus Sentinel‑2 imagery) into a working land‑acquisition workflow: plots can be satellite‑verified, the verification evidence is persisted, and users see it during plot selection. CRL ≥ 4 is supported because the MVP implements a real customer journey for remote buying: land requests, plot selection, escrow milestones, and a due‑diligence stage where evidence documents are uploaded and tracked with clear status transitions visible to the user. This demonstrates early market validation and foundational commercial infrastructure.

---

## 4) Innovation/distinctiveness and defensibility (≤100 words)

We turn remote land buying into a verification‑driven workflow rather than a listing marketplace. The core differentiator is a “trust layer” that combines Copernicus EO evidence with an auditable due‑diligence evidence trail and escrow‑tracked milestones in a single end‑to‑end journey. This reduces reliance on purely manual claims and creates a repeatable, standardized process for cross‑border transactions. It is difficult to replicate because it requires integrating EU space data into operational decision points (not just a map view), persisting evidence, and orchestrating verification + due diligence + escrow progression without breaking multi‑platform infrastructure.

---

## 5) Integration into customers’ systems / dependencies (≤150 words)

The MVP can be used as a plug‑in trust and workflow layer for real‑estate operators and advisory firms across Africa. It can integrate into existing processes by providing an API‑driven workflow for: creating land requests, attaching plot evidence (including EO verification), tracking due diligence document evidence, and exposing escrow/due‑diligence milestones for investor reporting. Customers can connect their CRM/ERP (leads, listings, case files) to Sizland’s workflow via API and use our dashboard as the verification and evidence repository.

Dependencies: (1) reliable access to Copernicus Data Space / Sentinel Hub services for EO imagery retrieval and updates; (2) consistent capture of plot AOI coordinates; (3) organizational onboarding of local due‑diligence providers and standardized document checklists per market; (4) regulatory/legal process alignment per country, especially around escrow custody and registry transfer evidence.

---

## 6) Scalability (≤100 words)

The MVP is designed to scale across Africa because Copernicus Sentinel‑2 provides broad coverage and the verification workflow is location‑agnostic: once plots have coordinates and standardized evidence requirements, the same EO retrieval, evidence persistence, and milestone tracking can be reused market‑by‑market. We start with a Kenya pilot to validate operational playbooks, then expand to additional African jurisdictions by onboarding local due‑diligence partners, codifying country‑specific document checklists, and reusing the same cloud‑native backend and caching/rate‑limit protections for EO services. Scaling users and requests primarily increases data volume and partner operations, not core platform redesign.

---

## 7) Risks/challenges and mitigations (≤100 words)

Key risks are: (1) integration risk—breaking shared backend functionality used by multiple platforms; mitigated by additive‑only changes (new nullable fields/models and new routes). (2) EO service reliability and rate limits; mitigated via caching and rate limiting. (3) data quality (missing coordinates, cloud cover); mitigated by enforcing coordinate capture, periodic re‑fetching, and clear “evidence freshness” timestamps. (4) operational consistency of due diligence across countries; mitigated by standardized document checklists, partner onboarding, and audit trails. (5) regulatory/legal variance; mitigated by country‑specific workflows and verified custody/document handling.

---

## 8) Which EU space technologies are leveraged and how integrated (≤150 words)

The MVP leverages Earth Observation (EO) from the EU Space Programme through Copernicus Sentinel‑2 imagery. EO is integrated as a verification layer within the land‑acquisition workflow: each plot is defined by an Area of Interest (AOI) using geospatial coordinates, and the platform retrieves Sentinel‑2 imagery via Copernicus Data Space / Sentinel Hub APIs. The imagery and metadata (e.g., last retrieval time and verification indicators) are persisted as evidence linked to the plot, so users can see “Satellite‑Verified” plots during selection without repeatedly calling the external service. EO endpoints are protected with rate limiting and caching to stay reliable under growth and to respect upstream service constraints. This makes EO evidence a functional decision input in the workflow, not a standalone visualization.

---

## 9) EU space ecosystem engagement (≤150 words)

Our current EU space ecosystem engagement is primarily technical: we integrate Copernicus EO into our core workflow by using Copernicus Data Space / Sentinel Hub APIs to retrieve and persist Sentinel‑2 imagery evidence for land verification. We plan to deepen engagement by applying to EUSPA CASSINI matchmaking to connect with European partners and investors interested in verification‑driven cross‑border investment workflows. We will also pursue EU‑based acceleration and mentorship (e.g., ESA BIC or similar programmes) to strengthen our verification roadmap and operational scaling across African markets. On the data side, we plan to complement Copernicus with additional European commercial imagery sources where higher‑resolution inputs are required, while keeping Copernicus as the baseline reference. We will document engagement through formal application receipts, pilot KPIs, and periodic reporting during pilots.

