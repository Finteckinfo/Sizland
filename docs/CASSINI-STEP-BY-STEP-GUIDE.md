# CASSINI Step-by-Step Implementation Guide (Optimized)

**Companion to:** [CASSINI-IMPLEMENTATION-PLAN.md](./CASSINI-IMPLEMENTATION-PLAN.md)  
**Scope:** Sizland (buy.siz.land) + SIZBackend2.0 (Railway)  
**Rule:** Additive-only. Do not break existing functionality.

---

## Optimization Overview

| Area | Optimization |
|------|--------------|
| **API calls** | Progress API returns `latitude`, `longitude`, `satelliteVerification` — badge shown without extra requests |
| **Imagery** | Batch endpoint `GET /imagery/batch?plotIds=id1,id2` — 1 request instead of N |
| **Redis** | Cache success (24h) and "no imagery" (5min) to reduce DB/external API load |
| **Validation** | plotId CUID validation, lat/lng range checks on admin |
| **Rate limiting** | Satellite routes rate-limited (external API protection) |
| **Lazy load** | Fetch imagery only when plots are visible or user expands a card |

---

## Phase 1: Database Schema & Geospatial Plot Data

### Step 1.1 — Add columns to LandPlot and create SatelliteVerification model

**File:** `SIZBackend2.0/prisma/schema.prisma`

1. Add fields to `LandPlot` (after `escrowAmount`):

```prisma
  latitude       Float?   // For satellite AOI (nullable - additive)
  longitude      Float?   // For satellite AOI (nullable - additive)
  boundaryGeoJSON Json?   // Optional polygon for exact boundaries
  satelliteVerification SatelliteVerification?
```

2. Add `SatelliteVerification` model **after** `LandPlotImage`:

```prisma
model SatelliteVerification {
  id                   String   @id @default(cuid())
  plot                 LandPlot @relation(fields: [plotId], references: [id], onDelete: Cascade)
  plotId               String   @unique
  lastImageryDate      DateTime?
  changeDetectionStatus String?  // STABLE, LAND_CLEARED, CONSTRUCTION_STARTED
  hasVerified          Boolean  @default(false)
  osnmaProofHash       String?
  imageryUrl           String?  // Cached Sentinel-2 thumbnail or WMS URL
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@index([plotId])
}
```

### Step 1.2 — Run migration (generate runs automatically)

```bash
cd SIZBackend2.0
npx prisma migrate dev --name add_cassini_geospatial
```

### Step 1.3 — Extend POST /admin/plots with validation

**File:** `SIZBackend2.0/src/routes/land-acquisition.ts`

Update `router.post('/admin/plots', ...)`:

```typescript
const { requestId, name, fullAddress, description, escrowAmount, images, latitude, longitude, boundaryGeoJSON } = req.body;

// Validate lat/lng if provided
let latNum: number | null = null;
let lngNum: number | null = null;
if (latitude != null) {
  latNum = Number(latitude);
  if (isNaN(latNum) || latNum < -90 || latNum > 90) {
    return res.status(400).json({ error: 'latitude must be between -90 and 90' });
  }
}
if (longitude != null) {
  lngNum = Number(longitude);
  if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
    return res.status(400).json({ error: 'longitude must be between -180 and 180' });
  }
}

const plot = await prisma.landPlot.create({
  data: {
    requestId,
    name: String(name).trim(),
    fullAddress: String(fullAddress).trim(),
    description: description ? String(description).trim() : null,
    escrowAmount: escrowAmount != null ? Number(escrowAmount) : null,
    latitude: latNum,
    longitude: lngNum,
    boundaryGeoJSON: boundaryGeoJSON ?? undefined,
    images: images?.length
      ? {
          create: images.map((img: { url: string; order?: number }, i: number) => ({
            url: String(img.url),
            order: img.order ?? i,
          })),
        }
      : undefined,
  },
  include: { images: true, satelliteVerification: true },
});
```

### Step 1.4 — Include satellite data in progress response

**File:** `SIZBackend2.0/src/routes/land-acquisition.ts`

Update the `findFirst` in `/progress`:

```typescript
include: {
  selectedPlot: { include: { images: true, satelliteVerification: true } },
  plots: { include: { images: true, satelliteVerification: true } },
},
```

Plots are passed through as-is, so `latitude`, `longitude`, `satelliteVerification` will be in the response.

### Step 1.5 — Deploy to Railway

Ensure `npx prisma migrate deploy` runs in your Railway build/start script. Push and deploy.

---

## Phase 2: Satellite Imagery API (Optimized)

### Step 2.1 — Create satellite router

**New file:** `SIZBackend2.0/src/routes/satellite.ts`

```typescript
import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/performance.js';
import { prisma } from '../utils/prisma.js';
import { getRedisClient } from '../services/redis.js';

const router = Router();
router.use(authenticateToken);
router.use(rateLimiter(60, 60000)); // 60 req/min per user for external API protection

const REDIS_PREFIX = 'sizland:satellite:imagery:';
const CACHE_TTL_SUCCESS = 86400;   // 24h for imagery URLs
const CACHE_TTL_NO_IMAGERY = 300;  // 5min for "no coords" / "no imagery"
function isValidPlotId(id: string): boolean {
  return typeof id === 'string' && id.length >= 20 && id.length <= 30 && /^[a-z0-9_-]+$/.test(id);
}

/**
 * GET /api/satellite/imagery/batch?plotIds=id1,id2,id3
 * Batch imagery — 1 request instead of N. Max 20 plots. Define before /imagery.
 */
router.get('/imagery/batch', async (req: Request, res: Response) => {
  try {
    const raw = typeof req.query.plotIds === 'string' ? req.query.plotIds : '';
    const plotIds = raw.split(',').map((s) => s.trim()).filter(isValidPlotId).slice(0, 20);
    if (plotIds.length === 0) {
      return res.status(400).json({ error: 'At least one valid plotId required (max 20)' });
    }

    const redis = getRedisClient();
    const result: Record<string, object> = {};
    const toFetch: string[] = [];

    if (redis?.isOpen) {
      for (const id of plotIds) {
        const cached = await redis.get(`${REDIS_PREFIX}${id}`);
        result[id] = cached ? JSON.parse(cached) : null;
        if (!cached) toFetch.push(id);
      }
    } else {
      toFetch.push(...plotIds);
    }

    if (toFetch.length > 0) {
      const plots = await prisma.landPlot.findMany({
        where: { id: { in: toFetch } },
        include: { satelliteVerification: true },
      });
      const plotMap = new Map(plots.map((p) => [p.id, p]));
      for (const id of toFetch) {
        const plot = plotMap.get(id);
        const item = !plot
          ? { error: 'Plot not found' }
          : plot.latitude == null || plot.longitude == null
            ? { hasImagery: false, plotId: id, message: 'No coordinates' }
            : {
                hasImagery: true,
                plotId: id,
                latitude: plot.latitude,
                longitude: plot.longitude,
                imageryUrl: plot.satelliteVerification?.imageryUrl ?? null,
                lastImageryDate: plot.satelliteVerification?.lastImageryDate ?? null,
              };
        result[id] = item;
        if (redis?.isOpen && !('error' in item)) {
          const ttl = (item as any).imageryUrl ? CACHE_TTL_SUCCESS : CACHE_TTL_NO_IMAGERY;
          await redis.setEx(`${REDIS_PREFIX}${id}`, ttl, JSON.stringify(item));
        }
      }
    }

    return res.json(result);
  } catch (err) {
    console.error('[Satellite] GET imagery/batch error:', err);
    return res.status(500).json({ error: 'Failed to fetch satellite imagery' });
  }
});

/**
 * GET /api/satellite/imagery?plotId=xxx
 * Single-plot imagery. Caches in Redis.
 */
router.get('/imagery', async (req: Request, res: Response) => {
  try {
    const plotId = typeof req.query.plotId === 'string' ? req.query.plotId.trim() : null;
    if (!plotId || !isValidPlotId(plotId)) {
      return res.status(400).json({ error: 'Valid plotId is required' });
    }

    const redis = getRedisClient();
    if (redis?.isOpen) {
      const cached = await redis.get(`${REDIS_PREFIX}${plotId}`);
      if (cached) return res.json(JSON.parse(cached));
    }

    const plot = await prisma.landPlot.findUnique({
      where: { id: plotId },
      include: { satelliteVerification: true },
    });

    if (!plot) return res.status(404).json({ error: 'Plot not found' });

    if (plot.latitude == null || plot.longitude == null) {
      const result = {
        hasImagery: false,
        plotId,
        message: 'Plot has no coordinates. Add latitude/longitude for satellite imagery.',
      };
      if (redis?.isOpen) {
        await redis.setEx(`${REDIS_PREFIX}${plotId}`, CACHE_TTL_NO_IMAGERY, JSON.stringify(result));
      }
      return res.json(result);
    }

    const result = {
      hasImagery: true,
      plotId,
      latitude: plot.latitude,
      longitude: plot.longitude,
      imageryUrl: plot.satelliteVerification?.imageryUrl ?? null,
      lastImageryDate: plot.satelliteVerification?.lastImageryDate ?? null,
      wmsUrl: process.env.SENTINEL_WMS_URL
        ? `${process.env.SENTINEL_WMS_URL}&bbox=${plot.longitude - 0.01},${plot.latitude - 0.01},${plot.longitude + 0.01},${plot.latitude + 0.01}`
        : null,
    };

    if (redis?.isOpen) {
      const ttl = result.imageryUrl ? CACHE_TTL_SUCCESS : CACHE_TTL_NO_IMAGERY;
      await redis.setEx(`${REDIS_PREFIX}${plotId}`, ttl, JSON.stringify(result));
    }

    return res.json(result);
  } catch (err) {
    console.error('[Satellite] GET imagery error:', err);
    return res.status(500).json({ error: 'Failed to fetch satellite imagery' });
  }
});

export default router;
```

### Step 2.2 — Register router in app.ts

**File:** `SIZBackend2.0/src/app.ts`

```typescript
import satelliteRouter from './routes/satellite.js';
// ...
app.use('/api/land-acquisition', landAcquisitionRouter);
app.use('/api/satellite', satelliteRouter);
```

### Step 2.3 — Sizland API proxy

**New file:** `Sizland/src/pages/api/satellite/[...path].ts`

(Same as before — proxy to backend with auth. Reuse the pattern from `api/land/[...path].ts`.)

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!BACKEND_URL) return res.status(500).json({ error: 'Backend URL not configured' });
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });

  const path = (req.query.path as string[])?.join('/') || '';
  const query = new URLSearchParams();
  Object.entries(req.query).forEach(([k, v]) => {
    if (k !== 'path' && v != null && v !== '') query.set(k, Array.isArray(v) ? v[0] : String(v));
  });
  const qs = query.toString();
  const url = `${BACKEND_URL.replace(/\/$/, '')}/api/satellite/${path}${qs ? `?${qs}` : ''}`;
  const token = (session as any)?.accessToken || req.cookies['next-auth.session-token'] || req.cookies['__Secure-next-auth.session-token'];
  if (!token) return res.status(401).json({ error: 'No session token available' });

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const data = await response.json().catch(() => ({}));
    return res.status(response.ok ? 200 : response.status).json(data || { error: 'Request failed' });
  } catch (err) {
    console.error('[Satellite API Proxy]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Step 2.4 — Frontend: use progress data for badge (zero extra API calls)

**File:** `Sizland/src/pages/lands.tsx`

1. Extend Plot type:

```typescript
type Plot = {
  id: string;
  name: string;
  fullAddress: string;
  description?: string | null;
  escrowAmount?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  images?: { url: string; order?: number }[];
  satelliteVerification?: {
    imageryUrl?: string | null;
    hasVerified?: boolean;
  } | null;
};
```

2. Show badge using progress data only (no imagery API call):

```tsx
{/* Inside plot card, in the aspect-video div */}
{(plot.latitude != null && plot.longitude != null) && (
  <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/90 text-white z-10">
    Satellite-Verified
  </span>
)}
```

3. Optional — lazy-load imagery batch (only if you want satellite thumbnails on cards):

```typescript
const [imageryByPlot, setImageryByPlot] = useState<Record<string, { imageryUrl?: string | null }>>({});

useEffect(() => {
  const withCoords = plots.filter((p) => p.latitude != null && p.longitude != null);
  if (withCoords.length === 0) return;
  const ids = withCoords.map((p) => p.id).join(',');
  fetch(`/api/satellite/imagery/batch?plotIds=${encodeURIComponent(ids)}`, { credentials: 'include' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => data && typeof data === 'object' && setImageryByPlot(data))
    .catch(() => {});
}, [plots]);
```

URL: `/api/satellite/imagery/batch?plotIds=id1,id2` → proxy forwards to backend.

### Step 2.5 — Environment variables (Railway)

```
SENTINEL_HUB_INSTANCE_ID=
COPERNICUS_USERNAME=
COPERNICUS_PASSWORD=
SENTINEL_WMS_URL=
```

---

## Phase 3: Trust-as-a-Service Messaging (buy-land)

### Step 3.1 — Hero and feature cards

**File:** `Sizland/src/pages/buy-land.tsx`

- Hero subtext: "Satellite-verified land acquisition with blockchain escrow, legal due diligence, and EU Space data trust."
- Add feature card: "EU Satellite-Verified" — Copernicus and Galileo data verify land status.

---

## Phase 4: Sentinel Hub Integration — Implemented

- `SIZBackend2.0/src/services/sentinel-hub.ts` — OAuth + Process API
- `GET /api/satellite/imagery/:plotId/image` — raw JPEG for img src
- SatelliteVerification upserted when imagery fetched; imageryUrl stored

**Env vars (Railway):** `SENTINEL_HUB_CLIENT_ID`, `SENTINEL_HUB_CLIENT_SECRET`  
Register at https://dataspace.copernicus.eu/ and create OAuth client.

---

## Phase 5: Admin UI (optional) — Implemented

- **User model:** `isLandAdmin Boolean @default(false)` — flag for land acquisition admin access.
- **Auth:** Land admin = `user.isLandAdmin === true` OR email in `ADMIN_EMAILS` (bootstrap).
- **APIs:**
  - `GET /api/admin/users` — includes `isLandAdmin`
  - `PATCH /api/admin/users/:userId/land-admin` — body `{ isLandAdmin: boolean }` (site admins only)
- **Admin Users page** (`/admin/users`) — Land Admin toggle per user.
- **Land Admin page** (`/admin/land`) — list requests, add plots with lat/lng (-90..90, -180..180), update status.
- Lat/lng validated on both client and backend.

---

## Verification Checklist

- [ ] `LandPlot` has `latitude`, `longitude`, `boundaryGeoJSON`
- [ ] `SatelliteVerification` table exists
- [ ] Progress returns `satelliteVerification` for plots
- [ ] Badge shows when `latitude && longitude` (no extra API call)
- [ ] `GET /api/satellite/imagery?plotId=xxx` works
- [ ] `GET /api/satellite/imagery/batch?plotIds=id1,id2` works
- [ ] Redis caches responses
- [ ] Admin validates lat/lng ranges

---

## Performance Tips

| Tip | Why |
|-----|-----|
| Use progress data for badge | Zero extra API calls — `latitude`/`longitude` already in response |
| Prefer batch over N single calls | 1 request vs N for lands page with multiple plots |
| Cache "no imagery" (5min TTL) | Reduces DB load for plots without coords |
| Rate limit satellite routes | Protects Sentinel Hub from burst traffic |
| Validate plotId (CUID) | Prevents invalid queries, small DoS mitigation |
| Lazy-load batch only when needed | Skip batch fetch if user has no plots with coords |
