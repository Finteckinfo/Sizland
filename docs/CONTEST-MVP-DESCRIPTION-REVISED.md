# Revised MVP Description (Paste-Ready)

The MVP is a satellite-verified management and escrow platform designed to support secure cross-border land transactions across Africa. It bridges the trust gap between European investors and land assets in emerging markets by combining (1) independent Earth Observation evidence and (2) auditable due-diligence documentation.

User journey: A user starts a land request on `buy.siz.land`, provides budget and plot requirements, and selects a candidate plot offered by Sizland. Our initial pilot geography is Kenya, but the workflow is designed to expand to other African markets as we onboard local partners and datasets. For each plot, the platform retrieves Copernicus Sentinel-2 imagery (Earth Observation) and stores the latest imagery/verification evidence, displayed as “Satellite-Verified”. The user funds the escrow step and the request proceeds to due diligence. In the MVP-minimum “P2N” step, Land Admin uploads docs-only due-diligence evidence (reports/surveys/agreements) and marks the request as `DUE_DILIGENCE`, which updates the user’s progress UI.

Future releases will expand beyond docs-only evidence into broader physical verification, add cryptographic integrity proofs, and further automate settlement and evidence anchoring as required.

