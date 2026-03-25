# Admin land UX & inventory — implementation to-do

Status: **MVP implemented** (March 2026). Remaining items are polish / optional.

---

## 1. Requests: table + “Satisfy request” (replace dropdown-first UX)

- [x] **Table view** listing **all** land acquisition requests with key columns (id, user email, status, step, budget, created).
- [x] **Last column action**: **“Satisfy request”** per row → scrolls to plot form and sets `?satisfy=<requestId>` (shallow routing).
- [x] **Flow**: plot form uses pre-selected request; **Request** dropdown kept as fallback.
- [x] **Empty / error states**: loading, no requests, API errors with hints.

---

## 2. Inventory: “land not yet bought” (catalog for client interest)

- [x] **Data model**: **`LandListing`** + **`LandListingStatus`** (`DRAFT` | `PUBLISHED`) in Prisma; migration `20260325183000_land_listing_catalog`.
- [x] **Admin UI**: **“Inventory listing”** section — title, description, address, price, currency, lat/lng, map picker, draft/published.
- [x] **Backend**: `GET/POST /api/land-acquisition/admin/catalog/listings`, `PATCH/DELETE .../:id`; public `GET /api/land-acquisition/catalog/listings` (published only).
- [x] **Permissions**: admin routes behind existing land-admin gate; public read for published only.

---

## 3. Admin catalog grid: 3 columns (large screens)

- [x] **Grid** `lg:grid-cols-3` with title, description snippet, price, **mini OSM map** (MapLibre raster tiles).
- [x] **Click card** → **Dialog** with full copy, larger map, **Delete** (no inline edit yet).

---

## 4. Plot / listing location in forms (MapLibre + OSM)

- [x] **`OsmMapLibre`** component (`maplibre-gl` + OSM tiles): preview + **click-to-pick** on plot form and inventory form.
- [x] **Persist** lat/lng via existing plot API and new listing API.
- [x] **CSP**: `connect-src` + `img-src` for `tile.openstreetmap.org`, `worker-src blob:`.

---

## 5. Client-facing “looking for land”

- [x] **`/browse-land`**: public page, cards + dialog; CTA **Start acquisition** → `/buy-land`.
- [x] **API**: `GET /api/land-public/catalog/listings` (server proxy, no session).
- [ ] **Optional**: funnel “interest” into a specific listing id on `LandAcquisitionRequest` (not implemented).

---

## 6. Cross-cutting

- [x] **Tailwind** tables/cards/dialogs; light/dark via existing tokens where used.
- [ ] **Performance**: lazy `dynamic(..., { ssr: false })` for maps; consider **in-view** mount if many cards.
- [x] **A11y**: card `role="button"`, keyboard Enter/Space; address text always visible.
- [x] **Claims**: catalog maps are **OSM / MapLibre**, not Copernicus (see `MVP-CLAIMS-TO-DO.md`).

---

## Code references

| Piece | Location |
|-------|----------|
| Prisma `LandListing` | `SIZBackend2.0/prisma/schema.prisma` |
| Public + admin catalog API | `SIZBackend2.0/src/routes/land-acquisition.ts` |
| Map component | `Sizland/src/components/maps/OsmMapLibre.tsx` |
| Admin UI | `Sizland/src/pages/admin/land.tsx` |
| Public browse | `Sizland/src/pages/browse-land.tsx` |
| Public proxy | `Sizland/src/pages/api/land-public/catalog/listings.ts` |

*Design reference: [mapcn](https://mapcn.vercel.app/?ref=dailydev) — we use the same MapLibre + OSM stack, not the mapcn package directly.*
