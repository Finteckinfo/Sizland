export type AssetKind = 'LAND' | 'COMMODITY';

export type AssetSubmission = {
  id: string;
  title: string;
  kind: AssetKind;
  location: string;
  description: string;
  askingPrice: string;
  fileName: string;
  status: 'pending_vetting';
  createdAt: string;
};

function storageKey(userId: string) {
  return `buy_asset_submissions_${userId}`;
}

export function listAssetSubmissions(userId: string): AssetSubmission[] {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAssetSubmission(
  userId: string,
  input: Omit<AssetSubmission, 'id' | 'status' | 'createdAt'>
): AssetSubmission {
  const next: AssetSubmission = {
    ...input,
    id: `sub_${Date.now().toString(36)}`,
    status: 'pending_vetting',
    createdAt: new Date().toISOString(),
  };
  const all = [next, ...listAssetSubmissions(userId)];
  localStorage.setItem(storageKey(userId), JSON.stringify(all));
  return next;
}
