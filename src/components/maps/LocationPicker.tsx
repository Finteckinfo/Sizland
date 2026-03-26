'use client';

import React, { useMemo, useState } from 'react';
import type { OsmMapLibreProps } from './OsmMapLibre';

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export function LocationPicker({
  MapComponent,
  latitude,
  longitude,
  height,
  hideAttribution = false,
  interactive = true,
  onPick,
}: {
  MapComponent: React.ComponentType<OsmMapLibreProps>;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  height: number;
  hideAttribution?: boolean;
  interactive?: boolean;
  onPick: (lat: number, lng: number) => void;
}) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canSearch = useMemo(() => query.trim().length >= 2, [query]);

  const searchLocations = async () => {
    setError(null);
    setResults([]);
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    try {
      const resp = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}&limit=5`);
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.error || `Search failed (${resp.status})`);
      }
      const data = (await resp.json()) as { results?: NominatimResult[] };
      setResults(Array.isArray(data?.results) ? data.results : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to search locations');
    } finally {
      setLoading(false);
    }
  };

  const pickResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;
    onPick(lat, lng);
    // Keep the input text; clear list so UI doesn't stay cluttered.
    setResults([]);
  };

  const chooseMyLocation = () => {
    setError(null);
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        onPick(lat, lng);
        setLoading(false);
      },
      (geoErr) => {
        setLoading(false);
        setError(geoErr.message || 'Failed to get your location');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10_000,
      }
    );
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-background/40 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search location (e.g. Nairobi, IDP settlement...)"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  searchLocations();
                }
              }}
            />
            <button
              type="button"
              disabled={!canSearch || loading}
              onClick={searchLocations}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={chooseMyLocation}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            My location
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

        {results.length > 0 && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {results.map((r, idx) => (
              <button
                key={`${r.lat}-${r.lon}-${idx}`}
                type="button"
                onClick={() => pickResult(r)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-left text-sm font-medium text-foreground hover:border-primary/50 hover:bg-muted/40"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <MapComponent
        latitude={latitude ?? null}
        longitude={longitude ?? null}
        height={height}
        hideAttribution={hideAttribution}
        interactive={interactive}
        onLocationPick={(la, ln) => onPick(la, ln)}
      />
    </div>
  );
}

