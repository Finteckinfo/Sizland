# buy.siz.land — Design System & Explorer UI Spec

**Status:** Design contract for implementation  
**Related:** [FULL-WORKFLOW.md](./FULL-WORKFLOW.md) · [CHANGE-PLAN.md](./CHANGE-PLAN.md)  
**Inspiration (layout only):** TokenizLand-style explorer — left list + large map/media stage + detail on select  
**Brand rule:** Keep **Sizland** visual language (emerald, Aurora headlines, existing fonts/nav). Do **not** copy purple-AI chrome, TokenizLand naming, or crowdfunding token bars unless product explicitly adds them later.

Reference screenshots (layout study only) are stored in the Cursor workspace assets from the design discussion; implement **structure**, restyle with tokens below.

---

## 1. Design principles

1. **One composition per viewport** — Explorer is a working tool, not a card dump; landing remains brand-first.
2. **Emerald = trust & action** — primary CTAs, active filters, map markers, success states.
3. **EO map is a product feature** — satellite surface imagery is the hero of the land catalog, not a decorative inset.
4. **Same stage, two modes** — Map (land) and Media (commodity) share one large pane so the layout never “breaks” when kind changes.
5. **Dark/light parity** — respect `next-themes`; no one-off colors that only work in light mode.
6. **Continuity with site** — reuse navbar, `PageLayout`, AuroraText, rounded-2xl panels, emerald pills already on `buy-land.tsx`.

---

## 2. Brand tokens (maintain what we have)

### 2.1 Color

| Role | Light | Dark | Tailwind / notes |
|------|-------|------|------------------|
| Page background | `#ffffff` / soft green wash on buy panels | `#000000` true black | `--background` in `globals.css` |
| Buy panel gradient | `#f3fff7 → #ffffff`, border `#e5efe7` | `#0f2d29 → #141f2d`, border `#1f2f3f` | Match existing `buy-land` / `lands` cards |
| Primary action | Emerald 500 / 600 | Emerald 500 / 400 text | `bg-emerald-500`, `hover:bg-emerald-600`, markers `#059669` |
| Text primary | `gray-900` | `white` | |
| Text secondary | `gray-600` | `gray-400` | |
| Active filter chip | Emerald fill + white label | Same | |
| Inactive chip | White/translucent + border | Dark surface + border | |
| Success / verified | Emerald | Emerald | |
| Warning / needs clearance | Amber-600 family | Amber-400 | Use sparingly |
| Destructive | Existing `--destructive` | Same | |
| Focus ring | Emerald / `--ring` | Same | |

**Avoid introducing:** purple “AI committee” panels, orange selection pins as default (use emerald; optional amber only for “needs attention”), multi-layer neon glows beyond existing nav emerald glow.

### 2.2 Typography

| Use | Spec |
|-----|------|
| Brand wordmark | `font-pj` — `"PIXymbols Very Loose W01 Reg"` (existing SIZLAND logo button) |
| UI / body | `font-inter` / default sans already on site |
| Landing H1 | Bold 4xl→6xl; accent phrase via `AuroraText` (existing pattern) |
| Explorer section titles | Semibold / bold `text-lg`–`text-xl` |
| Meta / tags | `text-xs`–`text-sm`, muted foreground |
| Prices | Semibold; currency code small caps or uppercase tracking-wide |

Do **not** switch the explorer to Inter-only marketing kits or newspaper serif; stay consistent with buy-land.

### 2.3 Shape & elevation

- Radius: `rounded-full` for chips & primary pill CTAs; `rounded-xl` / `rounded-2xl` for cards and stage.
- Borders: thin `border-emerald-500/30` on nav; softer gray/emerald borders on cards.
- Shadows: light `shadow-sm` / emerald CTA `shadow-emerald-500/30` — no heavy multi-layer stacks.
- Map markers: teardrop or MapLibre default marker in **`#059669`**; selected = slightly larger + ring.

### 2.4 Motion (2–3 intentional)

1. Stage crossfade Map ↔ Media (150–250ms).
2. Pin select: flyTo + list scrollIntoView.
3. Detail panel slide-in from right (desktop) / bottom sheet (mobile).

---

## 3. Surfaces on buy.siz.land

### 3.1 Landing (`/` · `/buy-land`)

Keep current structure; polish only:

- Hero: brand-forward headline + one supporting line + CTA group + How it Works.
- Feature trio: Legal DD · Escrow · EU Satellite-Verified (existing emerald card language).
- Header: theme toggle vertically centered with Sign In / hamburger ([CHANGE-PLAN.md](./CHANGE-PLAN.md)).
- CTA “Start a Land Request” → auth then return; secondary “Explore catalog”.

Landing is **not** the TokenizLand dashboard. Explorer is.

### 3.2 Catalog Explorer (new primary product UI)

**Desktop (≥ lg)** — three zones:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Header (existing Sizland nav)                                           │
├──────────────────────────────────────────────────────────────────────────┤
│  Filter chip row (horizontal scroll if needed)                           │
├────────────────────┬─────────────────────────────────┬───────────────────┤
│  LEFT ~32%         │  STAGE ~68% (or ~45% if detail)  │  DETAIL ~0–28%    │
│  Available /       │  MAP (all land pins)             │  Closed by default│
│  results list      │  OR MEDIA (commodity gallery)    │  Opens on select  │
│  sort + count      │                                 │                   │
└────────────────────┴─────────────────────────────────┴───────────────────┘
│  Footer links (Pricing · Terms · Privacy · Contact) — compact            │
└──────────────────────────────────────────────────────────────────────────┘
```

**When detail opens:** stage can shrink; list stays. Do not cover the whole map with a modal on desktop (modal OK on mobile).

**Mobile**

1. Filters as horizontal chips.  
2. Stage (map/media) on top (~40vh).  
3. List below.  
4. Select → full-screen detail sheet with CTA.

### 3.3 Stage behavior (map vs media)

| Condition | Stage content |
|-----------|----------------|
| Results include land & kind filter ≠ commodity-only | **MapLibre + Copernicus/Sentinel tiles**; pins for every land in the **current filtered set** |
| Commodity-only filter OR selected item is commodity | **Media stage**: large image/video carousel; no empty map |
| Selected land | Map focuses pin; optional EO “latest clear scene” date chip on stage corner |
| Sourcing (buyer request, zero plots yet) | Centered sourcing panel **in stage** (spinner + 48h copy) — not a dead “No lands” card |

Map chrome (top-right of stage): Favorites (optional later) · Grid/list toggle · Recenter / my-target. Zoom bottom-right. Attribution: Copernicus / Sentinel Hub (+ reference layer if any).

### 3.4 Left list

- Header: “Available” / “Matching results” + count (`26 plots` pattern → `N listings` or `N lands`).
- Sort pills: Best match · Price ↑ · Price ↓ · Area (hide Area for commodity-only).
- **Card anatomy (land):**
  - Title
  - Badges row (Recommended, Title Ready, Tier, Satellite-Verified)
  - Metric grid: Distance (if known) · Area · Dimensions · Terrain
  - Price (currency)
  - Tag chips (Verified, Access road, …)
  - Optional score disc (emerald) — only if backend provides score
- **Card anatomy (commodity):**
  - Title + kind badge
  - Thumbnail strip or single thumb
  - Price / unit · availability
  - Spec tags
- Selected card: `border-emerald-500 ring-2 ring-emerald-500/30` (already used on buy-land).

**Do not** ship tokenization progress bars (“1512 / 4200 tokens”) unless product adds fractional sales; replace that slot with escrow amount or “From $X” / “DD from $Y” if needed.

### 3.5 Detail panel (on select) — image 2 structure, Sizland skin

1. Breadcrumb / ref id  
2. Title + primary badges  
3. Gallery (LAND: photos + optional Sentinel still; COMMODITY: product media)  
4. Key facts grid  
5. Trust block: Satellite-Verified scene date / Survey verified / docs available  
6. Primary CTA: Start acquisition / Continue request  
7. Secondary: Share · Save (optional)

Omit purple “AI committee” unless we have a real multi-agent product; if a score exists, show a simple emerald gauge + short plain-language line.

---

## 4. Filter chip taxonomy

Mirror the reference IA, mapped to Sizland:

**Kind / inventory**

- All · Land · Commodities (names refine when catalog expands)

**Land status**

- Recommended · Title in progress · Needs clearance · Title ready · Entry-price · Flat terrain

**Region**

- Africa · Europe · Americas · Gulf · Asia-Pacific (show only regions with inventory)

**Trust**

- Satellite verified · Survey verified · Crypto-legal (escrow-ready)

Active chip = emerald fill. Icons optional; prefer Lucide over emoji for consistency with the app (emoji regions OK if design wants friendlier chips — keep one system).

---

## 5. Component inventory (build / reuse)

| Component | Notes |
|-----------|--------|
| `CatalogExplorer` | Page shell: filters + list + stage |
| `CatalogFilters` | Chip row |
| `CatalogList` / `CatalogCard` | Kind-aware cards |
| `CatalogStage` | Switches `MapStage` \| `MediaStage` \| `SourcingStage` |
| `EoMapLibre` | Evolve `OsmMapLibre` — EO tiles + markers collection + select callback |
| `CatalogDetailPanel` | Desktop side / mobile sheet |
| Existing | `PageLayout`, `ThemeToggler`, navbar, AuroraText, Dialog |

---

## 6. Map visual design

- Default zoom: world or Africa-first for pilot; fly to cluster when filter = Africa.
- Unselected pins: emerald. Selected: darker emerald / white stroke.
- Optional price callouts on pins at mid zoom (`$175k`) — declutter with MapLibre clustering at low zoom.
- Layer control: **Satellite** (default) · **Reference** (labels) · **Hybrid**.
- Loading EO tiles: soft emerald pulse skeleton in stage, not a blank white hole.
- Admin picker: same EO style so ops “see what buyers see.”

---

## 7. Media stage design (commodities)

- Full-bleed (within stage) image with rounded-2xl clip.
- Carousel arrows + dots (match existing dialog patterns).
- If no selection: autoplay/featured carousel of top commodities + caption.
- Video: muted preview; tap to unmute in detail.
- Empty commodity catalog: calm empty state (“Commodities coming soon”) + CTA to Land filter — never a broken map.

---

## 8. Wizard & sourcing (visual continuity)

- Keep 4-step stepper (Login → Wallet → Request → Confirmation) with emerald checks.
- Form fields: rounded-xl inputs, dark `#1c2a3a` / light white (existing).
- Sourcing state copy and spinner per CHANGE-PLAN; place in **stage** when inside Explorer, or full card when inside wizard confirmation.
- Exit CTA: “Close” / “Return to catalog” (buy context) — not ERP lobby.

---

## 9. Accessibility & responsive rules

- Filter chips keyboard-focusable; `aria-pressed` for active.
- Map: provide list equivalent for all pins (list is the a11y path).
- Detail panel: focus trap on mobile sheet; Escape closes.
- Contrast: emerald on white / white on emerald for CTAs; avoid gray-on-gray badges.
- Reduced motion: disable flyTo animation; instant pan.

---

## 10. What we deliberately do **not** copy from the reference

| Reference element | Sizland decision |
|-------------------|------------------|
| TokenizLand branding / footer disclaimer about simulated tokens | Use Sizland legal footer; real escrow messaging |
| Purple AI committee card | Skip or replace with Satellite-Verified trust block |
| Fractional funding progress bar | Out unless product adds tokenization sales |
| Leaflet OSM-only look | Replace visual tiles with Copernicus/Sentinel via MapLibre |
| Dense white SaaS chrome only | Support dark mode with existing buy gradients |

---

## 11. Implementation phases (design rollout)

1. **Shell** — Explorer layout with OSM still acceptable briefly; list + detail wiring.  
2. **EO basemap** — swap tile source; attribution; layer toggle.  
3. **Commodity media stage** — stage switcher + sample SKU.  
4. **Polish** — clustering, price labels, sourcing-in-stage, motion.  
5. **Landing CTA** — Explore catalog + auth redirect alignment.

---

## 12. Design QA checklist

- [ ] Theme toggle aligned with Sign In on buy header.  
- [ ] Emerald markers and CTAs match `#059669` / `emerald-500` family.  
- [ ] Dark mode explorer readable; panels use buy gradients.  
- [ ] All published lands visible as pins under Land/All filters.  
- [ ] Selecting commodity swaps stage to media without layout jump.  
- [ ] Selecting land restores map focus.  
- [ ] Detail panel matches Sizland type ramp; no foreign purple kit.  
- [ ] Mobile: map/media + list + sheet works without horizontal page scroll.  
- [ ] Copernicus attribution visible when EO tiles shown.  
- [ ] Aurora / font-pj preserved on landing; explorer uses Inter for density.

---

## 13. File touchpoints (frontend)

- `src/pages/buy-land.tsx` — landing entry  
- `src/pages/browse-land.tsx` / `lands.tsx` → migrate into `catalog` explorer  
- `src/components/maps/OsmMapLibre.tsx` → extend to `EoMapLibre` (EO sources)  
- `src/components/navigation/navbar.tsx` — alignment + buy-aware links  
- New: `src/components/catalog/*`

This design keeps **Sizland’s emerald, typography, and buy-page language** while adopting the **proven explorer layout** (list + map/detail) and making room for **non-map commodities** without a second product shell.
