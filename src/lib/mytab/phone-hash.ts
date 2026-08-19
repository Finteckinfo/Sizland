/**
 * Client-side phone hashing — raw phone number never leaves the browser.
 * The hash is what gets submitted on-chain to PhoneHashRegistry.
 */

const PHONE_SALT =
  process.env.NEXT_PUBLIC_MYTAB_PHONE_SALT || "mytab-dev-salt-replace-in-prod";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }
  if (digits.startsWith("254") && digits.length === 12) {
    return digits;
  }
  return digits;
}

export async function hashPhone(rawPhone: string): Promise<string> {
  const normalized = normalizePhone(rawPhone);
  const payload = `${PHONE_SALT}:${normalized}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return `0x${hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}

export function isValidKenyanPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) return true;
  if (digits.startsWith("254") && digits.length === 12) return true;
  if (digits.startsWith("+254") || (raw.startsWith("+254") && digits.length === 12))
    return true;
  return false;
}
