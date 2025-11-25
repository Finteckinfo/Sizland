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
  // Set CORS headers (in case needed for cross-origin requests)
  res.setHeader('Access-Control-Allow-Origin', 'https://erp.siz.land');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the current session
    const session = await getServerSession(req, res, authOptions);

    console.log('[SSO Token] Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    });

    if (!session || !session.user) {
      console.error('[SSO Token] No session or user found');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Generate a short-lived SSO token (valid for 5 minutes)
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('[SSO Token] NEXTAUTH_SECRET is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Extract user info, handling both regular and wallet authentication
    const userId = session.user.id || session.user.email || 'unknown';
    const userEmail = session.user.email || `${userId}@wallet.local`;
    const userName = session.user.name || userId;
    const walletAddress = (session.user as any).walletAddress || '';

    const ssoToken = jwt.sign(
      {
        userId,
        email: userEmail,
        name: userName,
        type: 'sso-token',
        authMethod: (session.user as any).authType || 'standard',
        walletAddress: walletAddress
      },
      secret,
      {
        expiresIn: '5m', // Token expires in 5 minutes
        issuer: 'siz.land',
        audience: 'erp.siz.land'
      }
    );

    console.log('[SSO Token] Generated token for user:', userEmail);

    // Set SSO token as HTTP-only cookie on .siz.land domain
    // This allows both www.siz.land and erp.siz.land to access it
    res.setHeader('Set-Cookie', [
      `siz_sso_token=${ssoToken}; Domain=.siz.land; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=300`
    ]);

    console.log('[SSO Token] Cookie set on .siz.land domain');

    return res.status(200).json({
      ssoToken,
      expiresIn: 300 // 5 minutes in seconds
    });
  } catch (error) {
    console.error('[SSO Token] Error generating token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SSO Token] Error details:', errorMessage);
    return res.status(500).json({
      error: 'Failed to generate SSO token',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
