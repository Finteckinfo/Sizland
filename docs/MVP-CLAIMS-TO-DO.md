# MVP Claims Verification - To-Do

This document lists items that appear in the application draft text, but are not yet supported by the current implementation/evidence in the repository. Items are written as actionable to-dos so the narrative can be corrected and/or the missing functionality can be built.

## 1) MVP description: what is implemented vs. missing

### Not yet supported (should be marked as future releases until implemented or until evidence exists)
- `Andygroup AS` user journey mention
  - To-do: add proof of integration/partnership (contract/LOI/email) OR remove/replace the name in the narrative.
- "Peer-to-Notary (P2N) workflow" / physical due diligence step
  - Implemented (MVP-minimum): Land Admin can upload due-diligence documents for a request and set the request workflow status to `DUE_DILIGENCE`.
  - Still future: a full “local notary network” / P2N reviewer onboarding workflow beyond docs-only evidence, plus any cryptographic proof/on-chain anchoring.
- "Cryptographic Proof of Physical Existence"
  - Current evidence: no explicit cryptographic scheme is implemented/found in the code/docs.
  - To-do: define and implement the cryptographic mechanism (and storage of proof) OR reword to what exists today (satellite-verified evidence + document evidence).
- "Funds are locked in a multichain escrow" and "transaction settles on-chain"
  - Current evidence: land-acquisition workflow records escrow identifiers/status, but there is no on-chain escrow release/settlement flow for land acquisition.
  - To-do: connect land escrow to an actual on-chain escrow contract (and/or implement the release logic) and confirm which chain(s) are used.
- "Due diligence is paid/reserved" within the MVP
  - Current evidence: UI text mentions "$2,000 reserved", but there is no clear due-diligence payment/reservation flow tied to backend/payment state.
  - To-do: implement due diligence fee/reservation payment + backend tracking (and link it to `DUE_DILIGENCE` -> next steps).

### Implemented (can be safely stated)
- EO land verification using Sentinel-2 imagery (Copernicus Data Space Ecosystem / Sentinel Hub Process API)
  - Evidence: backend satellite imagery fetch + persistence and UI "Satellite-Verified" presentation.

## 2) Galileo / HAS and OSNMA claims
- Galileo HAS corrections (centimeter-level geotagging), OSNMA anti-spoofing, and "geospatial certificate" minting are described as phases in the CASSINI roadmap, but are not yet present in the current backend implementation.
  - To-do: either implement Galileo HAS + OSNMA integration, or remove/mark these as planned in all application answers where they are currently presented as live MVP capabilities.

## 3) Specific integration questions that reference future capabilities
- "How are they integrated into your solution?" text currently mentions Copernicus + Galileo.
  - To-do: verify the exact capabilities that are live today (Sentinel-2 / Copernicus) and adjust the narrative accordingly; keep Galileo language under "future releases" unless HAS is implemented.

## 4) Global scalability narrative
- Any scalability statement that relies on Galileo coverage/behavior should be aligned with the actual live capability.
  - To-do: rephrase scalability around Copernicus/Sentinel-2 if Galileo HAS is not yet deployed.

## 5) EU space ecosystem engagement narrative
See also: `Sizland/docs/EU-SPACE-ECOSYSTEM-ENGAGEMENT-TO-DO.md`
- To-do: only claim active memberships, accepted accelerator tracks, and applied matchmaking items when you have receipts/confirmation artifacts.

## Step-by-step integration plan (free-first)

Goal: ensure every statement in the application matches evidence you can prove, and build only what we can demonstrate safely inside the MVP timeframe.

1. Create a “claims vs evidence” mapping
   - For each claim in your draft text, mark it as: (A) implemented, (B) partially implemented, (C) not implemented yet.
   - Intervention needed: you confirm which draft paragraphs are allowed to be edited now vs preserved.

2. Fix the MVP description so it matches the current capability
   - Implemented today: satellite-verified land evidence (Sentinel-2 via CDSE/Sentinel Hub) + plot selection + escrow tracking steps.
   - Future only: Galileo HAS / OSNMA / on-chain settlement / P2N workflow / “proof of physical existence” cryptography.
   - Intervention needed: decide whether you want to (a) remove or (b) clearly reword future items as planned releases.

3. Replace “cryptographic proof of physical existence” with a free, implementable alternative
   - Option (free): hash uploaded due-diligence documents (SHA-256) and store the hash as tamper-evident evidence in the database.
   - Option (extra, may cost gas): anchor the hash on a blockchain testnet.
   - Intervention needed: choose Option 1 (DB hash only) or Option 2 (testnet anchoring).

4. Implement a minimal P2N workflow (free-first)
   - Implemented: Land Admin uploads docs-only due-diligence evidence and marks the request as `DUE_DILIGENCE` to unlock the next step in the user journey.
   - Remaining future: extend beyond docs-only evidence into a full P2N reviewer network and, if required, cryptographic/on-chain proof layers.
   - Intervention needed: confirm who acts as the initial reviewer and how you will document that identity in your contest evidence pack.

5. Align escrow narrative with what’s implemented
   - Implemented: escrow identifiers/status tracking and escrow funding inputs in the land acquisition workflow.
   - Not yet demonstrated: full “on-chain escrow release/settlement for land purchase”.
   - Intervention needed: decide whether to (a) reword to “escrow protected & settlement pending” for MVP, or (b) implement testnet on-chain escrow release for a demo.

6. Add a “due diligence reservation” step (free-first using sandbox)
   - Action: implement a paid reservation flow using Stripe/Paystack in sandbox/test mode and persist reservation status so it maps to `DUE_DILIGENCE`.
   - Intervention needed: provide or confirm you have sandbox keys for the payment provider you will use.

7. Keep Galileo HAS & OSNMA in “future releases” until implemented
   - Do not present them as already integrated into the MVP unless you implement NTRIP/PPP and OSNMA flows.
   - Output: updated roadmap + proof plan for later submissions.
   - Intervention needed: confirm whether you want to implement HAS/OSNMA next after this contest, and with what chain/evidence target.

8. Build the TRL/CRL evidence pack
   - Action: export screenshots + recorded workflow steps showing the implemented EO verification and escrow/diligence milestones, plus your inventory of prototype/pilot cases.
   - Intervention needed: provide any sample request statuses or anonymized user journey screenshots you are allowed to attach.

