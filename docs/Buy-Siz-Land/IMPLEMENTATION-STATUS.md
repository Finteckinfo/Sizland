# buy.siz.land — Implementation status

**Date:** 2026-08-12  
**Based on:** CHANGE-PLAN · FULL-WORKFLOW · DESIGN-SYSTEM

## Shipped

| Area | What |
|------|------|
| Auth redirect | NextAuth `redirect` honors safe `callbackUrl`; login/signup/auth-choice/wallet-auth propagate buy return URLs |
| Create Request | Name + Email fields, validation, Submit gate; backend stores `contactName` / `contactEmail` |
| Sourcing UI | `/lands` + buy confirmation empty states use 48h expert sourcing copy; filters hidden when no plots |
| Header | Theme toggle sized/aligned with Sign In (desktop + mobile) |
| Catalog Explorer | New `/catalog` — filters, list, EO map (satellite default + reference toggle), detail panel, commodity media stage |
| Routing | `/catalog` on buy host; `/browse-land` → `/catalog` |
| Landing | Explore catalog CTA + auth callback to `/buy-land` |

## Pending / next

- CDSE / Sentinel Hub live tiles (replace Esri World Imagery when credentials exist)
- Full escrow / DD / registry phases (Internalized Logic Phases 2–4)
- Commodity SKUs in backend
- MOOC modules + property mapping widget (awaiting briefs)
- Apply DB migration on Railway: `SIZBackend2.0/prisma/migrations/20260812_land_contact_fields`

## Key files

- `src/lib/auth-callback.ts`
- `src/pages/catalog.tsx`
- `src/components/maps/EoMapLibre.tsx`
- `src/pages/buy-land.tsx`, `lands.tsx`
- `src/pages/api/auth/[...nextauth].ts`
- `SIZBackend2.0/src/routes/land-acquisition.ts`
- `SIZBackend2.0/prisma/schema.prisma`
