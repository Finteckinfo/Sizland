import type { NextApiRequest, NextApiResponse } from 'next';
import { SiweMessage } from 'siwe';
import { nonceStore } from '@/lib/siwe-nonce-store';

/**
 * Verify SIWE signature and authenticate user
 * This is the core authentication endpoint for Web3 login
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, signature, nonceKey } = req.body;

    if (!message || !signature || !nonceKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: message, signature, and nonceKey are required' 
      });
    }

    // Retrieve and validate nonce
    const storedNonce = nonceStore.get(nonceKey);
    
    if (!storedNonce) {
      return res.status(401).json({ 
        error: 'Invalid or expired nonce',
        message: 'Please request a new nonce and try again'
      });
    }

    // Parse and validate the SIWE message
    const siweMessage = new SiweMessage(message);

    // Verify the signature
    const fields = await siweMessage.verify({ 
      signature,
      nonce: storedNonce
    });

    if (!fields.success) {
      return res.status(401).json({ 
        error: 'Signature verification failed',
        message: 'The signature could not be verified'
      });
    }

    // Delete used nonce to prevent replay attacks
    nonceStore.delete(nonceKey);

    // Validate message hasn't expired
    if (siweMessage.expirationTime && new Date(siweMessage.expirationTime) < new Date()) {
      return res.status(401).json({ 
        error: 'Message has expired',
        message: 'Please sign a new message'
      });
    }

    // Extract wallet address (verified signer)
    const walletAddress = fields.data.address;

    console.log('✅ SIWE verification successful:', {
      address: walletAddress,
      domain: siweMessage.domain,
      chainId: siweMessage.chainId
    });

    // Sync user with backend (create or update)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
      
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const backendRes = await fetch(`${backendUrl}/api/auth/wallet-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          chainId: siweMessage.chainId,
          domain: siweMessage.domain
        })
      });

      if (!backendRes.ok) {
        const errorData = await backendRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Backend authentication failed');
      }

      const userData = await backendRes.json();

      // Return user data for NextAuth
      return res.status(200).json({
        success: true,
        user: {
          id: userData.id || walletAddress,
          email: userData.email || `${walletAddress.substring(0, 8)}@wallet.local`,
          name: userData.name || `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`,
          walletAddress,
          authType: 'web3'
        }
      });

    } catch (backendError) {
      console.error('Backend sync error:', backendError);
      
      // Fallback: Return user data even if backend sync fails
      // This ensures users can still log in
      return res.status(200).json({
        success: true,
        user: {
          id: walletAddress,
          email: `${walletAddress.substring(0, 8)}@wallet.local`,
          name: `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`,
          walletAddress,
          authType: 'web3'
        },
        warning: 'Logged in with wallet, but backend sync failed'
      });
    }

  } catch (error) {
    console.error('SIWE verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}
