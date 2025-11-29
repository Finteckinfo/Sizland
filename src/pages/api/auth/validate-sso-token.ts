import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

/**
 * Validate SSO token from ERP and return user information
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers to allow requests from all siz.land domains
  const allowedOrigins = [
    'https://siz.land',
    'https://www.siz.land',
    'https://erp.siz.land',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin || '';
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
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
    const { ssoToken } = req.body;

    console.log('[SSO Validate] Received validation request');
    console.log('[SSO Validate] Has token:', !!ssoToken);

    if (!ssoToken) {
      console.error('[SSO Validate] No SSO token provided');
      return res.status(400).json({ error: 'SSO token required' });
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('[SSO Validate] NEXTAUTH_SECRET is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    console.log('[SSO Validate] Verifying token...');

    // Verify and decode the token
    const decoded = jwt.verify(ssoToken, secret, {
      issuer: 'siz.land',
      audience: 'erp.siz.land'
    }) as {
      userId: string;
      email: string;
      name: string;
      type: string;
      authMethod?: string;
      walletAddress?: string;
    };

    console.log('[SSO Validate] Token decoded:', {
      userId: decoded.userId,
      email: decoded.email,
      type: decoded.type
    });

    // Check token type
    if (decoded.type !== 'sso-token') {
      console.error('[SSO Validate] Invalid token type:', decoded.type);
      return res.status(400).json({ error: 'Invalid token type' });
    }

    console.log('[SSO Validate] Token validated successfully for user:', decoded.email);

    // Return user information
    return res.status(200).json({
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        authMethod: decoded.authMethod || 'standard',
        walletAddress: decoded.walletAddress || ''
      },
      sessionToken: ssoToken,
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('[SSO Validate] Token expired');
      return res.status(401).json({ error: 'Token expired', details: 'SSO token has expired. Please log in again.' });
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('[SSO Validate] Invalid token:', error.message);
      return res.status(401).json({ error: 'Invalid token', details: error.message });
    }

    console.error('[SSO Validate] Validation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ 
      error: 'Token validation failed',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}
