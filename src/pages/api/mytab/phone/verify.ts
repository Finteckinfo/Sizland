import type { NextApiRequest, NextApiResponse } from "next";
import {
  issueVerificationToken,
  normalizePhone,
  setOtp,
  verifyOtp,
} from "@/lib/mytab/server-store";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/mytab/phone/verify
 * Body: { phone, action: "send" | "verify", code?: string }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, action, code } = req.body;

  if (!phone || !action) {
    return res.status(400).json({ error: "phone and action are required" });
  }

  const normalizedPhone = normalizePhone(String(phone));

  if (action === "send") {
    const otp = generateOtp();
    setOtp(normalizedPhone, otp, 5 * 60 * 1000);

    // TODO: Africa's Talking / Twilio in production
    if (process.env.NODE_ENV === "development") {
      console.log(`[MyTab OTP] ${normalizedPhone}: ${otp}`);
    }

    return res.status(200).json({ sent: true });
  }

  if (action === "verify") {
    if (!code) {
      return res.status(400).json({ error: "code is required for verification" });
    }

    if (!verifyOtp(normalizedPhone, String(code))) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    const verificationToken = issueVerificationToken(normalizedPhone);

    return res.status(200).json({
      verified: true,
      verificationToken,
    });
  }

  return res.status(400).json({ error: 'action must be "send" or "verify"' });
}
