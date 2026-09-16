/** Client-safe helpers for Sign in with SizWallet (no secrets). */

/** Apex host that holds NEXTAUTH_URL / OAuth callback registration. */
export const SIZLAND_AUTH_ORIGIN =
  process.env.NEXT_PUBLIC_SIZLAND_AUTH_ORIGIN || "https://siz.land";

/**
 * On buy/solutions/mytab hosts, bounce to apex first so redirect_uri stays
 * https://siz.land/api/auth/callback/sizwallet.
 */
export function shouldBounceToApexForOAuth(hostname: string | null | undefined): boolean {
  if (!hostname) return false;
  const h = hostname.split(":")[0].toLowerCase();
  if (h === "siz.land" || h === "www.siz.land") return false;
  if (h === "localhost" || h === "127.0.0.1") return false;
  return h.endsWith(".siz.land");
}
