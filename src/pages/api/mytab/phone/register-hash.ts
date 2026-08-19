import type { NextApiRequest, NextApiResponse } from "next";
import {
  consumeVerificationToken,
  registerPhoneHash,
} from "@/lib/mytab/server-store";

/**
 * POST /api/mytab/phone/register-hash
 * Body: { verificationToken, phoneHash, accountAddress }
 *
 * Client submits SHA-256 hash after OTP verification.
 * Raw phone never sent — only hash is stored server-side until on-chain write.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { verificationToken, phoneHash, accountAddress } = req.body;

  if (!verificationToken || !phoneHash || !accountAddress) {
    return res.status(400).json({
      error: "verificationToken, phoneHash, and accountAddress are required",
    });
  }

  const phone = consumeVerificationToken(String(verificationToken));
  if (!phone) {
    return res.status(401).json({
      error: "Invalid or expired verification token",
    });
  }

  if (!/^0x[0-9a-fA-F]{64}$/.test(String(phoneHash))) {
    return res.status(400).json({ error: "Invalid phone hash format" });
  }

  registerPhoneHash(String(phoneHash), String(accountAddress));

  // TODO Phase 3: verifier wallet submits PhoneHashRegistry.registerHash on-chain

  return res.status(200).json({
    success: true,
    phoneHash,
    accountAddress,
  });
}
