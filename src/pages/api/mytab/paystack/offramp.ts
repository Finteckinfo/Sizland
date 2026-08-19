import type { NextApiRequest, NextApiResponse } from "next";

/**
 * POST /api/mytab/paystack/offramp
 * Body: { amount: number, phone: string, currency: string }
 *
 * Initiates a mobile money transfer via Paystack Transfer API.
 * Placeholder — requires Paystack Transfer API credentials and
 * transfer recipient setup in production.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, phone, currency } = req.body;

  if (!amount || !phone || !currency) {
    return res
      .status(400)
      .json({ error: "amount, phone, and currency are required" });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: "amount must be positive" });
  }

  // TODO: Phase 5 production implementation:
  // 1. Verify user's on-chain balance >= amount
  // 2. Burn/transfer stablecoins from user's smart account
  // 3. Create Paystack transfer recipient for the phone number
  // 4. Initiate Paystack transfer
  // 5. Return transfer reference for tracking

  const transferRef = `mt_offramp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return res.status(200).json({
    success: true,
    transferRef,
    amount,
    phone,
    currency,
    status: "pending",
    message: "Transfer initiated — settlement may take up to 5 minutes",
  });
}
