import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

/**
 * Validate SSO token from ERP and return user information
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { ssoToken } = req.body;

    if (!ssoToken) {
      return res.status(400).json({ error: 'SSO token required' });
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('[SSO Validate] NEXTAUTH_SECRET is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify and decode the token
    const decoded = jwt.verify(ssoToken, secret, {
      issuer: 'siz.land',
      audience: 'erp.siz.land'
    }) as {
      userId: string;
      email: string;
      name: string;
      type: string;
    };

    // Check token type
    if (decoded.type !== 'sso-token') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    console.log('[SSO Validate] Token validated for user:', decoded.email);

    // Return user information
    return res.status(200).json({
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name
      },
      sessionToken: ssoToken,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('[SSO Validate] Token expired');
      return res.status(401).json({ error: 'Token expired' });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('[SSO Validate] Invalid token:', error.message);
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.error('[SSO Validate] Validation error:', error);
    return res.status(500).json({ error: 'Token validation failed' });
  }
}
