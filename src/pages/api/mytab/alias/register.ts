import type { NextApiRequest, NextApiResponse } from "next";
import { verifyMessage, type Address } from "viem";
import { validateAlias } from "@/lib/mytab/constants";
import {
  isAliasTakenServer,
  registerAlias,
  resolveAliasServer,
} from "@/lib/mytab/server-store";

/**
 * POST /api/mytab/alias/register
 * Body: { alias, address, signature, message }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { alias, address, signature, message } = req.body;

  if (!alias || !address || !signature || !message) {
    return res.status(400).json({
      error: "alias, address, signature, and message are required",
    });
  }

  const normalizedAlias = String(alias).toLowerCase().trim();
  const validationError = validateAlias(normalizedAlias);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  if (isAliasTakenServer(normalizedAlias)) {
    const existing = resolveAliasServer(normalizedAlias);
    if (existing?.toLowerCase() !== String(address).toLowerCase()) {
      return res.status(409).json({ error: "Alias already taken" });
    }
  }

  try {
    const valid = await verifyMessage({
      address: address as Address,
      message: String(message),
      signature: signature as `0x${string}`,
    });

    if (!valid) {
      return res.status(401).json({ error: "Signature verification failed" });
    }

    const msg = String(message);
    if (
      !msg.includes("MyTab Alias Registration") ||
      !msg.includes(`@${normalizedAlias}`) ||
      !msg.toLowerCase().includes(String(address).toLowerCase())
    ) {
      return res.status(400).json({ error: "Invalid registration message" });
    }
  } catch {
    return res.status(401).json({ error: "Signature verification failed" });
  }

  registerAlias(normalizedAlias, String(address));

  // TODO Phase 3: submit AliasRegistry.registerAlias on-chain

  return res.status(200).json({
    success: true,
    alias: normalizedAlias,
    address,
  });
}
