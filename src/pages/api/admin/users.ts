import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { page = '1', limit = '50', search, hasWallet, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy: String(sortBy),
      sortOrder: String(sortOrder),
    });

    if (search) params.set('search', String(search));
    if (hasWallet) params.set('hasWallet', String(hasWallet));

    const response = await fetch(`${BACKEND_URL}/api/admin/users?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken || ''}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return res.status(response.status).json(errorBody || { error: 'Backend request failed' });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error: any) {
    console.error('[Admin Users Proxy]', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error?.message || 'Unknown error'
    });
  }
}
