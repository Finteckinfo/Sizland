import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!BACKEND_URL) {
    return res.status(500).json({ error: 'Backend URL not configured' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const path = (req.query.path as string[])?.join('/') || '';
  const query = new URLSearchParams();
  Object.entries(req.query).forEach(([k, v]) => {
    if (k !== 'path' && v != null && v !== '') {
      query.set(k, Array.isArray(v) ? v[0] : String(v));
    }
  });
  const qs = query.toString();
  const url = `${BACKEND_URL.replace(/\/$/, '')}/api/satellite/${path}${qs ? `?${qs}` : ''}`;

  const token =
    (session as any)?.accessToken ||
    req.cookies['next-auth.session-token'] ||
    req.cookies['__Secure-next-auth.session-token'];

  if (!token) {
    return res.status(401).json({ error: 'No session token available' });
  }

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    // Stream binary for image endpoint
    const isImageEndpoint = path.endsWith('/image');
    if (isImageEndpoint) {
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', response.headers.get('cache-control') || 'public, max-age=86400');
      const buffer = Buffer.from(await response.arrayBuffer());
      if (!response.ok) {
        return res.status(response.status).send(response.status === 404 ? 'Not found' : 'Error');
      }
      return res.status(200).send(buffer);
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json(data || { error: 'Request failed' });
    }
    return res.status(200).json(data);
  } catch (err: unknown) {
    console.error('[Satellite API Proxy]', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
