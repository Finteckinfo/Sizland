import type { NextApiRequest, NextApiResponse } from 'next';
import { paymentDB } from '@/lib/database/payments';

/**
 * Wallet Login Endpoint (Frontend/Local)
 * 
 * This endpoint handles wallet-based authentication requests from NextAuth.
 * It serves as a standalone handler or a fallback when the external backend is unavailable.
 * 
 * Flow:
 * 1. Validates wallet address
 * 2. (Optional) Checks for existing balance in local DB
 * 3. Returns a user session object compatible with NextAuth
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Allow CORS if needed (though usually called internally)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { walletAddress, chainId, domain } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Missing walletAddress' });
    }

    // Normalize address
    const normalizedAddress = walletAddress.toString().trim();
    
    console.log('🔐 [API] Wallet Login Request:', { 
      address: normalizedAddress, 
      chainId: chainId || 'algorand' 
    });

    // Attempt to fetch balance info (non-blocking)
    let balanceInfo = null;
    try {
      // Only attempt if DB is configured
      if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('your_database_url')) {
        balanceInfo = await paymentDB.getUserWalletBalance(normalizedAddress);
      }
    } catch (dbError) {
      // Log but don't fail login
      console.warn('⚠️ [API] Failed to fetch wallet balance (non-fatal):', dbError);
    }

    // Construct user object
    const user = {
      id: normalizedAddress,
      email: `${normalizedAddress.substring(0, 8)}@wallet.local`,
      name: `${normalizedAddress.substring(0, 6)}...${normalizedAddress.substring(normalizedAddress.length - 4)}`,
      firstName: 'Wallet',
      lastName: 'User',
      walletAddress: normalizedAddress,
      chainId: chainId || 'algorand',
      authType: 'web3',
      balance: balanceInfo?.balance || 0,
      createdAt: new Date().toISOString()
    };

    console.log('✅ [API] Wallet Login Successful:', user.id);

    return res.status(200).json(user);

  } catch (error) {
    console.error('❌ [API] Wallet login error:', error);
    return res.status(500).json({ 
      error: 'Internal server error during wallet login',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}
