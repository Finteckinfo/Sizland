/**
 * Track 2 wallet — client-side EOA generation stored locally.
 * Full ERC-4337 deployment (ZeroDev/Pimlico) hooks in once bundler env is set.
 */

import type { Address, Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const SMART_ACCOUNT_KEY = "mytab_smart_account_private_key";
const SMART_ACCOUNT_ADDRESS_KEY = "mytab_smart_account_address";

export interface SmartAccountRecord {
  address: Address;
  /** Present only in memory during session — never log or transmit. */
  privateKey?: Hex;
}

export function createSmartAccount(): SmartAccountRecord {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  if (typeof window !== "undefined") {
    localStorage.setItem(SMART_ACCOUNT_KEY, privateKey);
    localStorage.setItem(SMART_ACCOUNT_ADDRESS_KEY, account.address);
  }

  return { address: account.address, privateKey };
}

export function loadSmartAccountAddress(): Address | null {
  if (typeof window === "undefined") return null;
  const addr = localStorage.getItem(SMART_ACCOUNT_ADDRESS_KEY);
  return addr ? (addr as Address) : null;
}

export function loadSmartAccountPrivateKey(): Hex | null {
  if (typeof window === "undefined") return null;
  const key = localStorage.getItem(SMART_ACCOUNT_KEY);
  return key ? (key as Hex) : null;
}

export function clearSmartAccount(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SMART_ACCOUNT_KEY);
  localStorage.removeItem(SMART_ACCOUNT_ADDRESS_KEY);
}

export function exportSmartAccountPrivateKey(): Hex | null {
  return loadSmartAccountPrivateKey();
}
