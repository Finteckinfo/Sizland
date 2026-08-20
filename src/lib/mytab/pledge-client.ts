/**
 * Client-side helpers for interacting with PledgeLedger.
 * Uses wagmi/viem for on-chain reads/writes once contracts are deployed.
 */

import type { PledgeStatus, PledgeTrack } from "./contracts";

export interface PledgeView {
  id: number;
  lender: string;
  lenderAlias: string;
  debtor: string;
  debtorAlias: string;
  amount: number;
  currency: string;
  dueDate: string;
  track: PledgeTrack;
  status: PledgeStatus;
  memo: string;
  isUrgent: boolean;
}

export async function fetchIncomingPledges(
  _userAddress?: string
): Promise<PledgeView[]> {
  // TODO: Replace with indexer query / contract multicall
  return [];
}

export async function fetchOutgoingPledges(
  _userAddress?: string
): Promise<PledgeView[]> {
  // TODO: Replace with indexer query
  return [];
}

export async function fetchBalance(_userAddress?: string): Promise<{
  amount: number;
  currency: string;
}> {
  // TODO: Replace with stablecoin balance read
  return { amount: 0, currency: "KES" };
}

export function formatPledgeAmount(amount: number, currency: string): string {
  if (amount >= 1000) {
    const k = amount / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k ${currency}`;
  }
  return `${amount.toLocaleString()} ${currency}`;
}
