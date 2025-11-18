import type { NextApiRequest, NextApiResponse } from 'next';
import algosdk from 'algosdk';
import { nonceStore } from './nonce';

// Minimum SIZ tokens required to access the system
const MINIMUM_SIZ_TOKENS = 20;

// Get SIZ token asset ID from environment
const getSizAssetId = () => {
  const assetId = process.env.NEXT_PUBLIC_SIZ_TOKEN_ASSET_ID || process.env.SIZ_TOKEN_ASSET_ID;
  if (!assetId) {
    throw new Error('SIZ_TOKEN_ASSET_ID not configured');
  }
  return parseInt(assetId);
};

// Get Algorand client
const getAlgorandClient = () => {
  const server = process.env.ALGORAND_NETWORK_URL || 'https://testnet-api.algonode.cloud';
  const token = process.env.ALGORAND_NETWORK_TOKEN || '';
  const port = '';
  
  return new algosdk.Algodv2(token, server, port);
};

// Check SIZ token balance
async function checkSizTokenBalance(address: string): Promise<{ hasMinimum: boolean; balance: number }> {
  try {
    const client = getAlgorandClient();
    const assetId = getSizAssetId();
    
    // Get account information
    const accountInfo = await client.accountInformation(address).do();
    
    // Find SIZ token in assets
    const sizAsset = accountInfo.assets?.find((asset: any) => asset['asset-id'] === assetId);
    
    if (!sizAsset) {
      console.log(`[Algorand Auth] Address ${address.substring(0, 10)}... does not hold SIZ tokens (not opted in)`);
      return { hasMinimum: false, balance: 0 };
    }
    
    // Get balance (convert from base units - assuming 6 decimals for SIZ)
    const balanceInBaseUnits = Number(sizAsset.amount);
    const decimals = 6; // SIZ token decimals
    const balance = balanceInBaseUnits / Math.pow(10, decimals);
    
    console.log(`[Algorand Auth] Address ${address.substring(0, 10)}... has ${balance} SIZ tokens`);
    
    return {
      hasMinimum: balance >= MINIMUM_SIZ_TOKENS,
      balance,
    };
  } catch (error) {
    console.error('[Algorand Auth] Error checking SIZ balance:', error);
    throw new Error('Failed to check SIZ token balance');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address, signature, message } = req.body;

  if (!address || !signature || !message) {
    return res.status(400).json({ error: 'Missing required fields: address, signature, message' });
  }

  try {
    // Step 1: Verify the message contains the stored nonce
    const storedData = nonceStore.get(address);
    
    if (!storedData) {
      return res.status(401).json({ error: 'Nonce not found or expired. Please request a new nonce.' });
    }

    // Check if nonce is in the message
    if (!message.includes(storedData.nonce)) {
      return res.status(401).json({ error: 'Invalid nonce in message' });
    }

    // Step 2: Verify the signature
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = new Uint8Array(Buffer.from(signature, 'base64'));
    
    const isValid = algosdk.verifyBytes(messageBytes, signatureBytes, address);
    
    if (!isValid) {
      console.log(`[Algorand Auth] Invalid signature for ${address.substring(0, 10)}...`);
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log(`[Algorand Auth] Signature verified for ${address.substring(0, 10)}...`);

    // Step 3: Check SIZ token balance (20 SIZ minimum)
    const { hasMinimum, balance } = await checkSizTokenBalance(address);
    
    if (!hasMinimum) {
      return res.status(403).json({
        error: 'Insufficient SIZ tokens',
        message: `You need at least ${MINIMUM_SIZ_TOKENS} SIZ tokens to access the system. You currently have ${balance.toFixed(2)} SIZ.`,
        required: MINIMUM_SIZ_TOKENS,
        current: balance,
      });
    }

    // Step 4: Clean up used nonce
    nonceStore.delete(address);

    // Success!
    console.log(`[Algorand Auth] ✅ Authentication successful for ${address.substring(0, 10)}... with ${balance} SIZ tokens`);
    
    return res.status(200).json({
      success: true,
      address,
      balance,
      message: `Authentication successful with ${balance.toFixed(2)} SIZ tokens`,
    });
  } catch (error: any) {
    console.error('[Algorand Auth] Verification error:', error);
    return res.status(500).json({
      error: 'Verification failed',
      message: error.message || 'An unexpected error occurred',
    });
  }
}
