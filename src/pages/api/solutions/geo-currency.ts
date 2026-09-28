import type { NextApiRequest, NextApiResponse } from "next";
import { resolveGeoCurrency } from "@/lib/solutions/geo-currency";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = await resolveGeoCurrency(req);
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=21600");
    return res.status(200).json(payload);
  } catch (error) {
    console.error("geo-currency failed:", error);
    return res.status(200).json({
      country: "KE",
      currency: "KES",
      rates: { KES: 1 },
      source: "fallback",
    });
  }
}
