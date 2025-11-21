import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// In-memory nonce store (for production, use Redis or database)
const nonceStore = new Map<string, { nonce: string; timestamp: number }>();

// Clean up old nonces (older than 10 minutes)
setInterval(() => {
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;
  
  for (const [address, data] of nonceStore.entries()) {
    if (now - data.timestamp > tenMinutes) {
      nonceStore.delete(address);
    }
  }
}, 60000); // Run cleanup every minute

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Algorand wallet address is required' });
  }

  // Validate Algorand address format (58 characters, base32)
  if (address.length !== 58 || !/^[A-Z2-7]+$/.test(address)) {
    return res.status(400).json({ error: 'Invalid Algorand wallet address format' });
  }

  // Generate a random nonce
  const nonce = crypto.randomBytes(32).toString('hex');

  // Store nonce with timestamp
  nonceStore.set(address, {
    nonce,
    timestamp: Date.now(),
  });

  console.log(`[Algorand Auth] Generated nonce for ${address.substring(0, 10)}...`);

  return res.status(200).json({ nonce });
}

// Export the nonce store for verification
export { nonceStore };
