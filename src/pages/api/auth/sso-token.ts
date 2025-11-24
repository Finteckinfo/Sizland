import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';
import jwt from 'jsonwebtoken';

/**
 * Generate a short-lived SSO token for cross-subdomain authentication
 * This token can be used to authenticate users on erp.siz.land
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Generate a short-lived SSO token (valid for 5 minutes)
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('NEXTAUTH_SECRET is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const ssoToken = jwt.sign(
      {
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        type: 'sso-token'
      },
      secret,
      {
        expiresIn: '5m', // Token expires in 5 minutes
        issuer: 'siz.land',
        audience: 'erp.siz.land'
      }
    );

    console.log('[SSO Token] Generated token for user:', session.user.email);

    return res.status(200).json({ 
      ssoToken,
      expiresIn: 300 // 5 minutes in seconds
    });
  } catch (error) {
    console.error('[SSO Token] Error generating token:', error);
    return res.status(500).json({ error: 'Failed to generate SSO token' });
  }
}
