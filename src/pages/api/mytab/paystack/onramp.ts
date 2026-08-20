import type { NextApiRequest, NextApiResponse } from "next";

/**
 * POST /api/mytab/paystack/onramp
 * Body: { pledgeId: number, amount: number, currency: string, email: string }
 *
 * Creates a Paystack checkout session for pledge settlement.
 * On webhook success: credit smart account stablecoin balance → auto-settle pledge.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { pledgeId, amount, currency, email } = req.body;

  if (!pledgeId || !amount || !currency || !email) {
    return res
      .status(400)
      .json({ error: "pledgeId, amount, currency, and email are required" });
  }

  // TODO: Phase 5 production implementation:
  // 1. Validate pledge exists and is Active
  // 2. Create Paystack transaction with metadata: { pledgeId, userAddress }
  // 3. On Paystack webhook "charge.success":
  //    a. Credit stablecoin to user's smart account
  //    b. Call PledgeLedger.settlePledge(pledgeId)
  // 4. Return Paystack authorization URL

  return res.status(200).json({
    success: true,
    authorizationUrl: `https://checkout.paystack.com/placeholder_${pledgeId}`,
    reference: `mt_onramp_${pledgeId}_${Date.now()}`,
  });
}
