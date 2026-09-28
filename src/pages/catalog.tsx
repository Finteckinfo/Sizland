'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { PageLayout } from '@/components/page-layout';
import { Loader2, MapPin, X } from 'lucide-react';
import { defaultBuyCallbackUrl } from '@/lib/auth-callback';

const EoMapLibre = dynamic(
  () => import('@/components/maps/EoMapLibre').then((m) => ({ default: m.EoMapLibre })),
  { ssr: false, loading: () => <div className="h-full min-h-[280px] animate-pulse rounded-2xl bg-muted" /> }
);

type ListingKind = 'LAND' | 'COMMODITY';

type CatalogItem = {
  id: string;
  kind: ListingKind;
  title: string;
  description?: string | null;
  fullAddress?: string | null;
  listPrice?: number | null;
  currency?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  region?: string | null;
  badges?: string[];
  tags?: string[];
  media?: { url: string }[];
  score?: number | null;
};

type KindFilter = 'ALL' | 'LAND' | 'COMMODITY';
type SortKey = 'match' | 'price-asc' | 'price-desc';

const KIND_CHIPS: { id: KindFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'LAND', label: 'Land' },
  { id: 'COMMODITY', label: 'Commodities' },
];

const REGION_CHIPS = ['Africa', 'Europe', 'Americas', 'Gulf', 'Asia-Pacific'];

function formatPrice(item: CatalogItem) {
  if (item.listPrice == null) return 'Price on request';
  return `${item.currency || 'USD'} ${Number(item.listPrice).toLocaleString()}`;
}

export default function CatalogPage() {
  const router = useRouter();
  const { status } = useSession();
  const { resolvedTheme: theme } = useTheme();
  const isDark = theme === 'dark';

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<KindFilter>('ALL');
  const [region, setRegion] = useState<string | null>(null);
  const [satelliteOnly, setSatelliteOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('match');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/land-public/catalog/listings');
        const data = await res.json().catch(() => []);
        if (cancelled) return;
        if (!res.ok) {
          setErr(data?.error || 'Could not load catalog');
          setItems([]);
        } else {
          const landItems: CatalogItem[] = (Array.isArray(data) ? data : []).map((L: any) => ({
            id: L.id,
            kind: 'LAND' as const,
            title: L.title,
            description: L.description,
            fullAddress: L.fullAddress,
            listPrice: L.listPrice,
            currency: L.currency,
            latitude: L.latitude,
            longitude: L.longitude,
            region: L.region || 'Africa',
            badges: [
              ...(L.latitude != null && L.longitude != null ? ['Satellite-Verified'] : []),
              ...(L.status === 'PUBLISHED' ? ['Listed'] : []),
            ],
            tags: [],
            media: [],
            score: null,
          }));
          setItems(landItems);
        }
      } catch {
        if (!cancelled) setErr('Could not load catalog');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const q = router.query.id;
    const id = Array.isArray(q) ? q[0] : q;
    if (id && typeof id === 'string') setSelectedId(id);
  }, [router.query.id]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (kindFilter !== 'ALL') list = list.filter((i) => i.kind === kindFilter);
    if (region) list = list.filter((i) => (i.region || '').toLowerCase() === region.toLowerCase());
    if (satelliteOnly) {
      list = list.filter((i) => i.kind === 'LAND' && i.latitude != null && i.longitude != null);
    }
    if (sort === 'price-asc') {
      list.sort((a, b) => (a.listPrice ?? Number.POSITIVE_INFINITY) - (b.listPrice ?? Number.POSITIVE_INFINITY));
    } else if (sort === 'price-desc') {
      list.sort((a, b) => (b.listPrice ?? -1) - (a.listPrice ?? -1));
    }
    return list;
  }, [items, kindFilter, region, satelliteOnly, sort]);

  const selected = filtered.find((i) => i.id === selectedId) || items.find((i) => i.id === selectedId) || null;

  const landMarkers = useMemo(
    () =>
      filtered
        .filter((i) => i.kind === 'LAND' && i.latitude != null && i.longitude != null)
        .map((i) => ({
          id: i.id,
          latitude: i.latitude as number,
          longitude: i.longitude as number,
          label: i.title,
        })),
    [filtered]
  );

  const stageMode: 'MAP' | 'MEDIA' =
    kindFilter === 'COMMODITY' || selected?.kind === 'COMMODITY' ? 'MEDIA' : 'MAP';

  const startAcquisition = (item: CatalogItem) => {
    const callback = defaultBuyCallbackUrl();
    const withListing = `${callback}${callback.includes('?') ? '&' : '?'}listingId=${encodeURIComponent(item.id)}`;
    if (status !== 'authenticated') {
      router.push(`/auth-choice?callbackUrl=${encodeURIComponent(withListing)}`);
      return;
    }
    router.push(`/buy-land?listingId=${encodeURIComponent(item.id)}`);
  };

  const panelClass = isDark
    ? 'bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)] border-[#1f2f3f]'
    : 'bg-[linear-gradient(180deg,#f3fff7_0%,#ffffff_100%)] border-[#e5efe7]';

  return (
    <PageLayout
      title="Catalog — buy.siz.land"
      description="Explore satellite-mapped land and Sizland commodities."
      requireAuth={false}
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-3 pb-8 pt-4 sm:px-4 lg:px-6">
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {KIND_CHIPS.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={kindFilter === c.id}
              onClick={() => {
                setKindFilter(c.id);
                if (c.id === 'COMMODITY') setSelectedId(null);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                kindFilter === c.id
                  ? 'bg-emerald-500 text-white'
                  : isDark
                    ? 'border border-[#32465b] bg-[#1c2a3a] text-gray-200'
                    : 'border border-gray-200 bg-white text-gray-800'
              }`}
            >
              {c.label}
            </button>
          ))}
          <span className="mx-1 w-px shrink-0 bg-border" />
          {REGION_CHIPS.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={region === r}
              onClick={() => setRegion(region === r ? null : r)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                region === r
                  ? 'bg-emerald-500 text-white'
                  : isDark
                    ? 'border border-[#32465b] bg-[#1c2a3a]/80 text-gray-300'
                    : 'border border-gray-200 bg-white/80 text-gray-700'
              }`}
            >
              {r}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={satelliteOnly}
            onClick={() => setSatelliteOnly(!satelliteOnly)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              satelliteOnly
                ? 'bg-emerald-500 text-white'
                : isDark
                  ? 'border border-[#32465b] bg-[#1c2a3a]/80 text-gray-300'
                  : 'border border-gray-200 bg-white/80 text-gray-700'
            }`}
          >
            Satellite verified
          </button>
        </div>

        <div className="flex min-h-[70vh] flex-col gap-3 lg:flex-row lg:items-stretch">
          {/* List */}
          <aside className={`flex w-full flex-col rounded-2xl border lg:w-[32%] ${panelClass}`}>
            <div className="border-b border-border/60 px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Available</h1>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filtered.length} listing{filtered.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(
                  [
                    ['match', 'Best match'],
                    ['price-asc', 'Price ↑'],
                    ['price-desc', 'Price ↓'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSort(key)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      sort === key
                        ? 'bg-emerald-500 text-white'
                        : isDark
                          ? 'bg-black/20 text-gray-300'
                          : 'bg-white text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-3" style={{ maxHeight: 'calc(70vh - 4rem)' }}>
              {loading && (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              )}
              {err && <p className="p-4 text-sm text-destructive">{err}</p>}
              {!loading && !err && filtered.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <MapPin className={`mx-auto mb-3 h-10 w-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {kindFilter === 'COMMODITY' ? 'Commodities coming soon' : 'No listings match these filters'}
                  </p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {kindFilter === 'COMMODITY'
                      ? 'Switch to Land to explore satellite-mapped parcels.'
                      : 'Try clearing filters or check back after sourcing.'}
                  </p>
                  {kindFilter === 'COMMODITY' && (
                    <button
                      type="button"
                      onClick={() => setKindFilter('LAND')}
                      className="mt-4 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Show land
                    </button>
                  )}
                </div>
              )}
              {filtered.map((item) => {
                const active = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full rounded-xl border-2 p-3 text-left transition ${
                      active
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : isDark
                          ? 'border-[#32465b] hover:border-gray-500'
                          : 'border-gray-200 hover:border-gray-300 bg-white/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</p>
                      <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        {item.kind}
                      </span>
                    </div>
                    <p className={`mt-1 line-clamp-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.fullAddress || item.description || '—'}
                    </p>
                    {item.badges && item.badges.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.badges.map((b) => (
                          <span
                            key={b}
                            className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatPrice(item)}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Stage */}
          <section className={`relative min-h-[320px] flex-1 overflow-hidden rounded-2xl border ${panelClass}`}>
            {stageMode === 'MAP' ? (
              <div className="relative h-[min(70vh,640px)] p-2 lg:h-full lg:min-h-[560px]">
                <EoMapLibre
                  markers={landMarkers}
                  selectedId={selected?.kind === 'LAND' ? selected.id : null}
                  height="100%"
                  className="h-full [&>div:last-of-type]:!h-full [&>div:first-of-type+div]:h-full"
                  hideAttribution={false}
                  onMarkerSelect={(id) => setSelectedId(id)}
                  showLayerToggle
                />
                {landMarkers.length === 0 && !loading && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
                    <div className={`max-w-md rounded-2xl border px-6 py-8 text-center shadow-lg ${panelClass}`}>
                      <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-emerald-500" />
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Map ready — awaiting published land pins
                      </p>
                      <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        When inventory is published with coordinates, every plot appears here on satellite imagery.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center p-6">
                {selected?.kind === 'COMMODITY' && selected.media?.[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selected.media[0].url}
                    alt={selected.title}
                    className="max-h-[70vh] w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="max-w-md text-center">
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Commodity media stage
                    </p>
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Non-spatial offerings use this space for photo/video galleries instead of the map.
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Detail */}
          {selected && (
            <aside
              className={`fixed inset-x-0 bottom-0 z-40 max-h-[75vh] overflow-y-auto rounded-t-2xl border shadow-2xl lg:static lg:z-0 lg:max-h-none lg:w-[28%] lg:rounded-2xl lg:shadow-none ${panelClass}`}
            >
              <div className="sticky top-0 flex items-center justify-between border-b border-border/50 bg-inherit px-4 py-3">
                <p className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selected.id.slice(0, 12)}…
                </p>
                <button
                  type="button"
                  aria-label="Close detail"
                  onClick={() => setSelectedId(null)}
                  className="rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 p-4">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selected.title}</h2>
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selected.fullAddress || selected.description || '—'}
                  </p>
                </div>
                {selected.badges && selected.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.badges.map((b) => (
                      <span
                        key={b}
                        className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(selected)}</p>
                {selected.description && (
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selected.description}</p>
                )}
                <button
                  type="button"
                  onClick={() => startAcquisition(selected)}
                  className="w-full rounded-full bg-emerald-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
                >
                  Start acquisition
                </button>
                <Link
                  href="/buy-land"
                  className={`block text-center text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  Or open buy landing
                </Link>
              </div>
            </aside>
          )}
        </div>

        <footer className={`flex flex-wrap gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/buy-land" className="hover:underline">
            Buy land
          </Link>
        </footer>
      </div>
    </PageLayout>
  );
}
