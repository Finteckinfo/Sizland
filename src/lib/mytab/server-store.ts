/** Server-side OTP + phone verification token store (in-memory; replace with Redis in prod). */

interface OtpEntry {
  code: string;
  expires: number;
}

interface VerificationTokenEntry {
  normalizedPhone: string;
  expires: number;
}

const otpStore = new Map<string, OtpEntry>();
const verificationTokenStore = new Map<string, VerificationTokenEntry>();

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }
  return digits;
}

export function setOtp(normalizedPhone: string, code: string, ttlMs: number) {
  otpStore.set(normalizedPhone, { code, expires: Date.now() + ttlMs });
}

export function verifyOtp(normalizedPhone: string, code: string): boolean {
  const entry = otpStore.get(normalizedPhone);
  if (!entry) return false;
  if (Date.now() > entry.expires) {
    otpStore.delete(normalizedPhone);
    return false;
  }
  if (entry.code !== code) return false;
  otpStore.delete(normalizedPhone);
  return true;
}

export function issueVerificationToken(normalizedPhone: string): string {
  const token = `pv_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  verificationTokenStore.set(token, {
    normalizedPhone,
    expires: Date.now() + 10 * 60 * 1000,
  });
  return token;
}

export function consumeVerificationToken(token: string): string | null {
  const entry = verificationTokenStore.get(token);
  if (!entry) return null;
  verificationTokenStore.delete(token);
  if (Date.now() > entry.expires) return null;
  return entry.normalizedPhone;
}

/** Maps phone hash → account address after successful registration (until on-chain). */
const phoneHashRegistry = new Map<string, string>();

export function registerPhoneHash(
  phoneHash: string,
  accountAddress: string
): void {
  phoneHashRegistry.set(phoneHash.toLowerCase(), accountAddress.toLowerCase());
}

export function resolvePhoneHash(phoneHash: string): string | null {
  return phoneHashRegistry.get(phoneHash.toLowerCase()) ?? null;
}

/** Reserved aliases blocked server-side. */
export const RESERVED_ALIASES = [
  "admin",
  "sizland",
  "mytab",
  "support",
  "system",
];

const registeredAliases = new Map<string, string>();

export function registerAlias(alias: string, address: string): void {
  registeredAliases.set(alias.toLowerCase(), address.toLowerCase());
}

export function isAliasTakenServer(alias: string): boolean {
  const key = alias.toLowerCase();
  return RESERVED_ALIASES.includes(key) || registeredAliases.has(key);
}

export function resolveAliasServer(alias: string): string | null {
  return registeredAliases.get(alias.toLowerCase()) ?? null;
}
