# Contest Due-Diligence Evidence Template

Use this checklist to describe what “physical due diligence” evidence exists in your MVP P2N-minimum workflow (docs-only).

## 1) Evidence items you can submit
Document types (use one or more):
- `REPORT` (licensed survey / legal due diligence report)
- `SURVEY` (site/survey report or map extract)
- `AGREEMENT` (broker/noC/Purchase agreement draft)
- `OTHER` (any supporting document)

For each uploaded document record:
- `requestId`: the land acquisition request identifier in the platform
- `type`: one of `REPORT | SURVEY | AGREEMENT | OTHER`
- `fileUrl`: a persistent link to the document (cloud storage / document host)
- `fileHash` (optional): SHA-256 hash of the document for integrity
- `uploadedBy`: reviewer identity (Land Admin / due diligence provider)
- `uploadedAt`: timestamp
- `statusAtReview`: the request workflow status at the time the document was reviewed

## 2) Linking evidence to the user journey
Describe the step transition:
- When evidence is uploaded and reviewed, the Land Admin sets the request workflow status to `DUE_DILIGENCE`.
- In the user journey (`buy.siz.land`), the “Due diligence” step is marked complete when `request.status === 'DUE_DILIGENCE'`.

## 3) What to screenshot for the application
Capture:
- One expanded request showing the due-diligence document upload form
- One screenshot showing the request status changed to `DUE_DILIGENCE`
- (Optional but recommended) One plot screenshot showing the satellite-verified badge

