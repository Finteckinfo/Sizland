'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { PageLayout } from '@/components/page-layout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useLandPageMapHeights } from '@/hooks/useResponsiveMapHeight';

const OsmMapLibre = dynamic(
  () => import('@/components/maps/OsmMapLibre').then((m) => ({ default: m.OsmMapLibre })),
  { ssr: false, loading: () => <div className="h-[132px] animate-pulse rounded-lg bg-muted" /> }
);

type LandListing = {
  id: string;
  title: string;
  description?: string | null;
  fullAddress: string;
  listPrice?: number | null;
  currency?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  updatedAt?: string;
};

export default function BrowseLandPage() {
  const [listings, setListings] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<LandListing | null>(null);
  const mapHeights = useLandPageMapHeights();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/land-public/catalog/listings');
        const data = await res.json().catch(() => []);
        if (!cancelled) {
          if (!res.ok) setErr(data?.error || 'Could not load listings');
          else setListings(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!cancelled) setErr('Could not load listings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageLayout
      title="Browse land — Sizland"
      description="Published land listings with map previews (OpenStreetMap)."
      requireAuth={false}
    >
      <div className="mx-auto w-full max-w-6xl px-3 py-8 sm:px-4 sm:py-10 md:px-6">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Looking for land</h1>
        <p className="mb-6 max-w-2xl text-sm text-muted-foreground sm:mb-8 sm:text-base">
          Explore published inventory. Locations are shown on OpenStreetMap (MapLibre). When you are ready, start a formal acquisition from Buy land.
        </p>

        {loading && <p className="text-muted-foreground">Loading…</p>}
        {err && <p className="text-destructive">{err}</p>}
        {!loading && !err && listings.length === 0 && (
          <p className="text-muted-foreground">No published listings yet. Check back soon.</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((L) => (
            <div
              key={L.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(L)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected(L);
                }
              }}
              className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:border-primary/35 hover:shadow-md"
            >
              <div className="w-full shrink-0 overflow-hidden bg-muted/30" style={{ height: mapHeights.cardPreview }}>
                <OsmMapLibre
                  latitude={L.latitude}
                  longitude={L.longitude}
                  height={mapHeights.cardPreview}
                  hideAttribution
                />
              </div>
              <div className="flex flex-1 flex-col p-4">
                <span className="font-semibold text-foreground">{L.title}</span>
                <p className="line-clamp-2 text-sm text-muted-foreground">{L.description || L.fullAddress}</p>
                <p className="mt-auto pt-2 text-sm font-medium text-primary">
                  {L.listPrice != null ? `${L.currency || 'USD'} ${Number(L.listPrice).toLocaleString()}` : 'Price on request'}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-h-[min(90dvh,900px)] w-[calc(100vw-1.25rem)] max-w-lg overflow-y-auto p-4 sm:max-w-xl sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-left text-foreground">{selected?.title}</DialogTitle>
              <DialogDescription className="text-left">{selected?.fullAddress}</DialogDescription>
            </DialogHeader>
            {selected && (
              <>
                {selected.latitude != null && selected.longitude != null && (
                  <OsmMapLibre latitude={selected.latitude} longitude={selected.longitude} height={mapHeights.modal} />
                )}
                <p className="text-sm text-muted-foreground">{selected.description || '—'}</p>
                <p className="text-xl font-semibold text-foreground">
                  {selected.listPrice != null
                    ? `${selected.currency || 'USD'} ${Number(selected.listPrice).toLocaleString()}`
                    : 'Price on request'}
                </p>
                <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/buy-land"
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Start acquisition
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/80"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
