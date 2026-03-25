'use client';

import { useEffect, useRef } from 'react';

export type OsmMapLibreProps = {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  height: number;
  className?: string;
  /** Hide attribution line (e.g. tiny card previews). */
  hideAttribution?: boolean;
  interactive?: boolean;
  onLocationPick?: (lat: number, lng: number) => void;
};

const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
};

/**
 * MapLibre + OSM raster tiles (MapLibre stack, OSM data). Client-only; lazy-loads maplibre-gl.
 */
export function OsmMapLibre({
  latitude,
  longitude,
  height,
  className = '',
  hideAttribution = false,
  interactive = false,
  onLocationPick,
}: OsmMapLibreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('maplibre-gl').Map | null>(null);
  const markerRef = useRef<import('maplibre-gl').Marker | null>(null);
  const pickRef = useRef(onLocationPick);
  pickRef.current = onLocationPick;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let destroyed = false;
    (async () => {
      const maplibre = await import('maplibre-gl');
      if (destroyed || !containerRef.current) return;

      const lat0 = latitude ?? null;
      const lng0 = longitude ?? null;
      const center: [number, number] = lat0 != null && lng0 != null ? [lng0, lat0] : [20, 0];
      const zoom = lat0 != null && lng0 != null ? 14 : 2;

      const map = new maplibre.default.Map({
        container: containerRef.current,
        style: OSM_STYLE,
        center,
        zoom,
      });
      mapRef.current = map;
      map.addControl(new maplibre.default.NavigationControl({ showCompass: false }), 'top-right');

      const placeMarker = (la: number, ln: number) => {
        markerRef.current?.remove();
        markerRef.current = new maplibre.default.Marker({ color: '#059669' }).setLngLat([ln, la]).addTo(map);
      };

      map.on('load', () => {
        if (lat0 != null && lng0 != null) placeMarker(lat0, lng0);
      });

      if (interactive) {
        map.on('click', (e) => {
          const { lng: ln, lat: la } = e.lngLat;
          pickRef.current?.(la, ln);
          placeMarker(la, ln);
        });
      }
    })();

    return () => {
      destroyed = true;
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const lat = latitude ?? null;
    const lng = longitude ?? null;
    if (lat == null || lng == null) return;

    const run = () => {
      map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 13), essential: true });
      import('maplibre-gl').then((ml) => {
        if (!mapRef.current || mapRef.current !== map) return;
        markerRef.current?.remove();
        markerRef.current = new ml.default.Marker({ color: '#059669' }).setLngLat([lng, lat]).addTo(map);
      });
    };

    if (map.isStyleLoaded()) run();
    else map.once('load', run);
  }, [latitude, longitude]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        style={{ height, width: '100%' }}
        className="overflow-hidden rounded-lg border border-border bg-muted/50 shadow-sm dark:bg-card/80"
        role="img"
        aria-label="OpenStreetMap location preview"
      />
      {!hideAttribution && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          © OpenStreetMap · MapLibre
        </p>
      )}
    </div>
  );
}
