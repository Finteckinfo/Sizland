import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!BACKEND_URL) {
    return res.status(500).json({ error: 'Backend URL not configured' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  const token = (session as any)?.accessToken || req.cookies['next-auth.session-token'] || req.cookies['__Secure-next-auth.session-token'];
  if (!token) {
    return res.status(401).json({ error: 'No session token available' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const response = await fetch(`${BACKEND_URL.replace(/\/$/, '')}/api/admin/users/${userId}/land-admin`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isLandAdmin: body.isLandAdmin }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json(data || { error: 'Backend request failed' });
    }
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('[Admin Land Admin Proxy]', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error?.message || 'Unknown error',
    });
  }
}
