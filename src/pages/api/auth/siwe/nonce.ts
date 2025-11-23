import type { NextApiRequest, NextApiResponse } from 'next';
import { generateNonce } from 'siwe';
import { nonceStore } from '@/lib/siwe-nonce-store';
import crypto from 'crypto';

/**
 * Generate a secure nonce for SIWE authentication
 * This prevents replay attacks by ensuring each signature is unique
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate a cryptographically secure random nonce
    const nonce = generateNonce();
    
    // Generate a cryptographically secure random key for this nonce
    // Don't use IP address as it can be spoofed
    const nonceKey = crypto.randomBytes(32).toString('hex');
    
    // Store nonce with 10-minute expiration
    nonceStore.set(nonceKey, nonce, 600);

    console.log('[SIWE] Generated nonce:', { 
      nonceKey: nonceKey.substring(0, 8) + '...', 
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    });

    // Return both nonce and key to client
    res.status(200).json({ nonce, nonceKey });
  } catch (error) {
    console.error('[SIWE] Nonce generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate nonce',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}
