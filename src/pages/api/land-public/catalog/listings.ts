import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';

/**
 * Public catalog — no session. Proxies to backend GET /api/land-acquisition/catalog/listings
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!BACKEND_URL) {
    return res.status(500).json({ error: 'Backend URL not configured' });
  }

  const url = `${BACKEND_URL.replace(/\/$/, '')}/api/land-acquisition/catalog/listings`;
  try {
    const response = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json(data || { error: 'Backend request failed' });
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('[land-public catalog]', err);
    return res.status(500).json({ error: 'Failed to load listings' });
  }
}
