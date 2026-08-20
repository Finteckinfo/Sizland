import type { NextApiRequest, NextApiResponse } from "next";
import { validateAlias } from "@/lib/mytab/constants";
import {
  isAliasTakenServer,
  resolveAliasServer,
} from "@/lib/mytab/server-store";

/**
 * GET /api/mytab/alias/check?alias=username
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const alias = (req.query.alias as string)?.toLowerCase().trim();

  if (!alias) {
    return res.status(400).json({ error: "alias query parameter required" });
  }

  const validationError = validateAlias(alias);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const taken = isAliasTakenServer(alias);

  return res.status(200).json({
    alias,
    available: !taken,
    address: taken ? resolveAliasServer(alias) : null,
  });
}
