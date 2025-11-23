// src/pages/api/wallet.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axiosInstance from './axiosInstance';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axiosInstance.get('/wallet/generate_wallet');
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Proxy to generate_wallet failed:", error.message);
    res.status(500).json({ error: 'Wallet generation failed', detail: error.message });
  }
}
