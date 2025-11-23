import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export const generateWallet = async () => {
  try {
    const res = await axios.get('/api/wallet');
    return res.data;
  } catch (error) {
    console.error('Wallet creation failed:', error);
    throw error;
  }
};

// API route handler (required for files in pages/api/)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const data = await generateWallet();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Generate wallet API error:', error);
    return res.status(500).json({ error: 'Failed to generate wallet', message: error?.message });
  }
}
