import type { NextApiRequest, NextApiResponse } from 'next';

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
};

/**
 * Proxies geocoding to OpenStreetMap Nominatim (free; respect their usage policy).
 * Pages Router API route — must use default export.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const qRaw = req.query.q;
  const q = typeof qRaw === 'string' ? qRaw : Array.isArray(qRaw) ? qRaw[0] ?? '' : '';
  const limitRaw = req.query.limit;
  const limitStr = typeof limitRaw === 'string' ? limitRaw : Array.isArray(limitRaw) ? limitRaw[0] : '5';
  const limit = Math.min(10, Math.max(1, parseInt(limitStr, 10) || 5));

  if (q.trim().length < 2) {
    return res.status(400).json({ results: [], error: 'Query too short' });
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('q', q);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('addressdetails', '1');

    const resp = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'siz.land/1.0 (support@siz.land)',
      },
    });

    if (!resp.ok) {
      return res.status(502).json({ error: `Geocode provider error (${resp.status})` });
    }

    const data = (await resp.json()) as NominatimResult[];
    return res.status(200).json({ results: Array.isArray(data) ? data : [] });
  } catch (e: unknown) {
    return res.status(500).json({
      error: e instanceof Error ? e.message : 'Geocode search failed',
    });
  }
}
