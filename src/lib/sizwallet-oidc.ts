/**
 * Sign in with SizWallet — OIDC provider config for NextAuth (server-only).
 * Identity is pairwise `sub` (pw:…) only. Never store DID / ownership_token.
 */

const DEFAULT_ISSUER = "https://wallet.siz.land";

export function sizwalletIssuer(): string {
  return (process.env.SIZWALLET_ISSUER || DEFAULT_ISSUER).replace(/\/$/, "");
}

/** openid-client default timeout is 3500ms — too tight for cold IdP. */
const httpOptions = { timeout: 15000 };

/**
 * NextAuth OAuth provider object (id: sizwallet).
 * Uses explicit endpoints so sign-in does not depend on discovery latency.
 */
export function sizwalletProvider() {
  const issuer = sizwalletIssuer();
  return {
    id: "sizwallet",
    name: "SizWallet",
    type: "oauth" as const,
    issuer,
    authorization: {
      url: `${issuer}/oauth/authorize`,
      params: { scope: "openid" },
    },
    token: `${issuer}/api/wallet/oauth/token`,
    userinfo: `${issuer}/api/wallet/oauth/userinfo`,
    jwks_endpoint: `${issuer}/api/wallet/oauth/jwks`,
    clientId: process.env.SIZWALLET_CLIENT_ID,
    clientSecret: process.env.SIZWALLET_CLIENT_SECRET,
    idToken: true,
    checks: ["pkce", "state", "nonce"] as ("pkce" | "state" | "nonce")[],
    client: { token_endpoint_auth_method: "client_secret_post" as const },
    httpOptions,
    profile(profile: Record<string, unknown>) {
      const sub = typeof profile.sub === "string" ? profile.sub : "";
      return {
        id: sub,
        name: null,
        email: "",
        image: null,
        authType: "sizwallet" as const,
        walletAddress: "",
      };
    },
  };
}
