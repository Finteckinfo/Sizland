/** Lightweight client-side profile cache synced with NextAuth session. */

import type { WalletTrack } from "./constants";

const ALIAS_KEY = "mytab_alias";
const TRACK_KEY = "mytab_wallet_track";
const PHONE_VERIFIED_KEY = "mytab_phone_verified";
const ACCOUNT_ADDRESS_KEY = "mytab_account_address";
const PHONE_HASH_KEY = "mytab_phone_hash";

export interface MytabProfile {
  alias: string | null;
  walletTrack: WalletTrack | null;
  accountAddress: string | null;
  phoneVerified: boolean;
  phoneHash: string | null;
}

export function getStoredProfile(): MytabProfile {
  if (typeof window === "undefined") {
    return {
      alias: null,
      walletTrack: null,
      accountAddress: null,
      phoneVerified: false,
      phoneHash: null,
    };
  }

  const track = localStorage.getItem(TRACK_KEY);
  return {
    alias: localStorage.getItem(ALIAS_KEY),
    walletTrack:
      track === "external" || track === "smart_account" ? track : null,
    accountAddress: localStorage.getItem(ACCOUNT_ADDRESS_KEY),
    phoneVerified: localStorage.getItem(PHONE_VERIFIED_KEY) === "true",
    phoneHash: localStorage.getItem(PHONE_HASH_KEY),
  };
}

export function setStoredProfile(partial: Partial<MytabProfile>): void {
  if (typeof window === "undefined") return;

  if (partial.alias !== undefined) {
    if (partial.alias) localStorage.setItem(ALIAS_KEY, partial.alias);
    else localStorage.removeItem(ALIAS_KEY);
  }
  if (partial.walletTrack !== undefined) {
    if (partial.walletTrack)
      localStorage.setItem(TRACK_KEY, partial.walletTrack);
    else localStorage.removeItem(TRACK_KEY);
  }
  if (partial.accountAddress !== undefined) {
    if (partial.accountAddress)
      localStorage.setItem(ACCOUNT_ADDRESS_KEY, partial.accountAddress);
    else localStorage.removeItem(ACCOUNT_ADDRESS_KEY);
  }
  if (partial.phoneVerified !== undefined) {
    localStorage.setItem(
      PHONE_VERIFIED_KEY,
      partial.phoneVerified ? "true" : "false"
    );
  }
  if (partial.phoneHash !== undefined) {
    if (partial.phoneHash)
      localStorage.setItem(PHONE_HASH_KEY, partial.phoneHash);
    else localStorage.removeItem(PHONE_HASH_KEY);
  }
}

export function getStoredAlias(): string | null {
  return getStoredProfile().alias;
}

export function setStoredAlias(alias: string): void {
  setStoredProfile({ alias });
}

export function getStoredWalletTrack(): WalletTrack | null {
  return getStoredProfile().walletTrack;
}

export function setStoredWalletTrack(track: WalletTrack): void {
  setStoredProfile({ walletTrack: track });
}

export function getStoredAccountAddress(): string | null {
  return getStoredProfile().accountAddress;
}

export function setStoredAccountAddress(address: string): void {
  setStoredProfile({ accountAddress: address });
}

export function isPhoneVerified(): boolean {
  return getStoredProfile().phoneVerified;
}

export function setPhoneVerified(verified: boolean): void {
  setStoredProfile({ phoneVerified: verified });
}

export function getStoredPhoneHash(): string | null {
  return getStoredProfile().phoneHash;
}

export function setStoredPhoneHash(hash: string): void {
  setStoredProfile({ phoneHash: hash, phoneVerified: true });
}

export function isProfileComplete(): boolean {
  const p = getStoredProfile();
  return Boolean(p.alias && p.walletTrack && p.accountAddress);
}
