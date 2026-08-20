/**
 * Indexer client for querying cached on-chain data.
 * Connects to the indexer service once deployed (Phase 3).
 */

export interface TimelineEntry {
  pledgeId: number;
  type: "created" | "cosigned" | "settled" | "disputed" | "offchain_claimed" | "auto_cleared";
  timestamp: number;
  lenderAlias: string;
  debtorAlias: string;
  amount: number;
  currency: string;
  color: "red" | "amber" | "green";
}

export async function fetchTimeline(
  _userAddress?: string,
  _limit: number = 20
): Promise<TimelineEntry[]> {
  // TODO: Replace with indexer API call
  return [];
}

export interface AggregatedBalance {
  expectedIn: number;
  goingOut: number;
  currency: string;
}

export async function fetchAggregatedBalance(
  _userAddress?: string
): Promise<AggregatedBalance> {
  // TODO: Replace with indexer API call
  return { expectedIn: 0, goingOut: 0, currency: "KES" };
}
