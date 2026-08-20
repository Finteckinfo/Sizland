/** Alias validation rules */
export const ALIAS_MIN_LENGTH = 3;
export const ALIAS_MAX_LENGTH = 20;
export const ALIAS_REGEX = /^[a-zA-Z0-9_]+$/;

export function validateAlias(alias: string): string | null {
  if (alias.length < ALIAS_MIN_LENGTH)
    return `Username must be at least ${ALIAS_MIN_LENGTH} characters`;
  if (alias.length > ALIAS_MAX_LENGTH)
    return `Username must be at most ${ALIAS_MAX_LENGTH} characters`;
  if (!ALIAS_REGEX.test(alias))
    return "Only letters, numbers, and underscores allowed";
  return null;
}

/** OTP configuration */
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_SECONDS = 300; // 5 minutes

/** Wallet track labels */
export const WALLET_TRACKS = {
  EXTERNAL: "external",
  SMART_ACCOUNT: "smart_account",
} as const;

export type WalletTrack = (typeof WALLET_TRACKS)[keyof typeof WALLET_TRACKS];
