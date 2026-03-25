# EU Space Ecosystem Engagement - To-Do

## What is currently supported (evidence in code)
- **Copernicus / Sentinel-2 EO integration (CDSE / Sentinel Hub)** is implemented and used to fetch Sentinel-2 imagery for land plot AOIs.
  - Backend service: `SIZBackend2.0/src/services/sentinel-hub.ts`
  - Satellite imagery endpoints: `SIZBackend2.0/src/routes/satellite.ts`
  - Land workflow surfaces “Satellite-Verified” plots: `Sizland/src/pages/buy-land.tsx`

## Planned items to deepen engagement (missing proof / not yet implemented in code)
- **Galileo High Accuracy Service (HAS) developer community engagement**
  - To-do: obtain membership/participation evidence (or adjust narrative to “planned / preparing” if no evidence exists).
  - To-do: implement Galileo HAS corrections (NTRIP/PPP) for future geotagging verification steps per the CASSINI roadmap.

- **EUSPA collaboration**
  - To-do: apply to **CASSINI matchmaking** and store confirmation artifacts (submission receipt, shortlist email, partner intro details).

- **EU accelerator integration**
  - To-do: seek admission into an EU accelerator (e.g., **ESA BIC**) and store acceptance/rejection/supporting communications.

- **Data partnership expansion**
  - To-do: establish direct pipelines with European commercial imagery providers to complement Copernicus with higher-resolution inputs.
  - To-do: define integration approach (adapter/API), testing plan, and MOUs/partnership agreements.

- **Regulatory / market alignment**
  - To-do: formalize the go-to-market roadmap alignment with **MiCA** and **EU-Africa Global Gateway** priorities, and document key assumptions and compliance checks.

## Step-by-step integration plan (free-first)

Goal: turn the above engagement items into (a) correct narratives for applications and (b) an evidence pack you can reuse in future submissions.

1. Freeze current “EO integration evidence” (done/verified)
   - Output to store: screenshots + API behavior summary for Sentinel-2 imagery retrieval and the “Satellite-Verified” user experience.
   - Intervention needed: none.

2. Galileo HAS community engagement (evidence-first)
   - Action: collect any real evidence you already have (emails, member portal screenshots, call invites).
   - If no evidence exists: rewrite the narrative to “preparing to engage” and focus on setup tasks.
   - Intervention needed: confirm whether you have receipts; if yes, point me to where they are stored.

3. Build an “EU engagement application pack” (one template, multiple submissions)
   - Action: create a 1-page overview (problem, MVP, demo, team, why EU support matters) that you can paste into EUSPA/accelerator applications.
   - Intervention needed: confirm your preferred wording for “Satellite-Verified audit” vs any other product name used in your materials.

4. Apply to EUSPA CASSINI matchmaking (application receipts)
   - Action: submit using the pack above; archive the submission receipt and any confirmation emails.
   - Intervention needed: decide when to submit (before/after MVP demo) and whether to prioritize EO-only (safe) vs EO+Galileo claims (only if HAS is truly implemented).

5. Apply to an EU accelerator track (free application; evidence archive)
   - Action: draft accelerator application materials; request demo day slots if available; store acceptance/rejection communications.
   - Intervention needed: select the accelerator program(s) you want to target first.

6. Data partnership expansion (free approach first)
   - Action: start with provider trial/free-tier access or technical evaluation requests; only sign MOUs when ready.
   - Output to store: adapter design doc + integration test plan (even before a paid contract).
   - Intervention needed: list candidate European providers you want to approach (or say “use you/your team suggestions”).

7. Regulatory alignment documentation (cheap/free research)
   - Action: create a compliance checklist document that maps your MVP to MiCA/Gateway principles at a high level.
   - Output to store: “compliance assumptions” + “what we do not yet do”.
   - Intervention needed: confirm whether you want this to focus on investor communication, product functionality, or both.

8. Reporting cadence (for trust + continuity)
   - Action: set a monthly report format: (a) what you built, (b) any KPIs, (c) next steps, (d) questions for EUSPA/partners.
   - Intervention needed: decide who will send the report and how you want KPIs measured for the pilot.

