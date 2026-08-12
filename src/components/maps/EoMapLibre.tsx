'use client';

import { useEffect, useRef, useState } from 'react';

export type EoMapMarker = {
  id: string;
  latitude: number;
  longitude: number;
  label?: string | null;
};

export type EoMapLibreProps = {
  latitude?: number | null;
  longitude?: number | null;
  markers?: EoMapMarker[];
  selectedId?: string | null;
  height: number | string;
  className?: string;
  hideAttribution?: boolean;
  interactive?: boolean;
  onLocationPick?: (lat: number, lng: number) => void;
  onMarkerSelect?: (id: string) => void;
  /** satellite = EO surface (default); reference = OSM streets */
  initialLayer?: 'satellite' | 'reference';
  showLayerToggle?: boolean;
};

const MARKER_COLOR = '#059669';
const MARKER_SELECTED = '#047857';

/** Esri World Imagery — public satellite basemap until CDSE/Sentinel Hub tiles are wired via /api/satellite. */
const SATELLITE_STYLE = {
  version: 8 as const,
  sources: {
    eo: {
      type: 'raster' as const,
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: 'Tiles © Esri — Earth imagery (Sentinel Hub / Copernicus via CDSE planned)',
    },
  },
  layers: [{ id: 'eo', type: 'raster' as const, source: 'eo' }],
};

const REFERENCE_STYLE = {
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
 * MapLibre explorer map: EO surface imagery by default + multi-pin support.
 * CDSE/Sentinel Hub can replace the `eo` raster source when credentials are configured.
 */
export function EoMapLibre({
  latitude,
  longitude,
  markers = [],
  selectedId = null,
  height,
  className = '',
  hideAttribution = false,
  interactive = false,
  onLocationPick,
  onMarkerSelect,
  initialLayer = 'satellite',
  showLayerToggle = true,
}: EoMapLibreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('maplibre-gl').Map | null>(null);
  const markersRef = useRef<import('maplibre-gl').Marker[]>([]);
  const pickRef = useRef(onLocationPick);
  const selectRef = useRef(onMarkerSelect);
  pickRef.current = onLocationPick;
  selectRef.current = onMarkerSelect;
  const [layer, setLayer] = useState<'satellite' | 'reference'>(initialLayer);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let destroyed = false;
    (async () => {
      const maplibre = await import('maplibre-gl');
      if (destroyed || !containerRef.current) return;

      const lat0 = latitude ?? markers[0]?.latitude ?? null;
      const lng0 = longitude ?? markers[0]?.longitude ?? null;
      const center: [number, number] = lat0 != null && lng0 != null ? [lng0, lat0] : [20, 0];
      const zoom = lat0 != null && lng0 != null ? (markers.length > 1 ? 3 : 14) : 2;

      const map = new maplibre.default.Map({
        container: containerRef.current,
        style: layer === 'satellite' ? SATELLITE_STYLE : REFERENCE_STYLE,
        center,
        zoom,
      });
      mapRef.current = map;
      map.addControl(new maplibre.default.NavigationControl({ showCompass: false }), 'bottom-right');

      if (interactive) {
        map.on('click', (e) => {
          const { lng: ln, lat: la } = e.lngLat;
          pickRef.current?.(la, ln);
        });
      }
    })();

    return () => {
      destroyed = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Remount when basemap layer changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, layer]);

  // Sync markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const run = async () => {
      const maplibre = await import('maplibre-gl');
      if (!mapRef.current || mapRef.current !== map) return;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const list =
        markers.length > 0
          ? markers
          : latitude != null && longitude != null
            ? [{ id: 'single', latitude, longitude }]
            : [];

      list.forEach((m) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.setAttribute('aria-label', m.label || 'Plot marker');
        const selected = selectedId === m.id;
        el.style.cssText = `
          width:${selected ? 22 : 16}px;height:${selected ? 22 : 16}px;
          border-radius:9999px;border:2px solid white;cursor:pointer;
          background:${selected ? MARKER_SELECTED : MARKER_COLOR};
          box-shadow:0 0 0 ${selected ? 4 : 0}px rgba(5,150,105,0.35);
        `;
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          selectRef.current?.(m.id);
        });
        const marker = new maplibre.default.Marker({ element: el })
          .setLngLat([m.longitude, m.latitude])
          .addTo(map);
        markersRef.current.push(marker);
      });

      if (selectedId) {
        const sel = list.find((x) => x.id === selectedId);
        if (sel) {
          map.flyTo({ center: [sel.longitude, sel.latitude], zoom: Math.max(map.getZoom(), 12), essential: true });
        }
      } else if (list.length > 1) {
        const bounds = new maplibre.default.LngLatBounds();
        list.forEach((m) => bounds.extend([m.longitude, m.latitude]));
        map.fitBounds(bounds, { padding: 48, maxZoom: 12, duration: 600 });
      } else if (list.length === 1) {
        map.flyTo({ center: [list[0].longitude, list[0].latitude], zoom: Math.max(map.getZoom(), 13), essential: true });
      }
    };

    if (map.isStyleLoaded()) run();
    else map.once('load', run);
  }, [markers, selectedId, latitude, longitude, layer]);

  return (
    <div className={`relative ${className}`}>
      {showLayerToggle && (
        <div className="absolute left-3 top-3 z-10 flex gap-1 rounded-full border border-emerald-500/30 bg-white/90 p-1 shadow-sm backdrop-blur dark:bg-black/75">
          <button
            type="button"
            onClick={() => setLayer('satellite')}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              layer === 'satellite' ? 'bg-emerald-500 text-white' : 'text-foreground'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setLayer('reference')}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              layer === 'reference' ? 'bg-emerald-500 text-white' : 'text-foreground'
            }`}
          >
            Reference
          </button>
        </div>
      )}
      <div
        ref={containerRef}
        style={{ height: typeof height === 'number' ? height : height, minHeight: typeof height === 'string' ? 280 : undefined, width: '100%' }}
        className="overflow-hidden rounded-2xl border border-border bg-muted/50 shadow-sm dark:bg-card/80"
        role="img"
        aria-label="Satellite map of land listings"
      />
      {!hideAttribution && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {layer === 'satellite'
            ? 'Earth imagery · MapLibre — Copernicus / Sentinel Hub integration via CDSE when credentials are set'
            : '© OpenStreetMap · MapLibre'}
        </p>
      )}
    </div>
  );
}
