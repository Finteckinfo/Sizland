/** Canonical message for binding a MyTab @alias to a wallet address. */

export function buildAliasRegisterMessage(params: {
  alias: string;
  address: string;
  domain: string;
  issuedAt?: string;
}): string {
  const issuedAt = params.issuedAt ?? new Date().toISOString();
  return [
    "MyTab Alias Registration",
    "",
    `Register @${params.alias.toLowerCase()} to ${params.address}`,
    `Domain: ${params.domain}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}
