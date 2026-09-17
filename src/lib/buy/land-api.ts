export async function landApi<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/land/${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export type LandListing = {
  id: string;
  title: string;
  description?: string | null;
  fullAddress: string;
  listPrice?: number | null;
  currency?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  kind?: 'LAND' | 'COMMODITY';
  region?: string | null;
  badges?: string[];
  media?: unknown;
  status: string;
  rejectionReason?: string | null;
  submittedByUserId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LandDocument = {
  id: string;
  type: string;
  fileUrl: string;
  fileHash?: string | null;
  createdAt: string;
};

export type LandDeal = {
  id: string;
  status: string;
  currentStep: string;
  listingId?: string | null;
  listing?: LandListing | null;
  documents?: LandDocument[];
  escrowId?: string | null;
  escrowAmount?: number | null;
  escrowFundedAt?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  purpose?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type LandNotification = {
  id: string;
  title: string;
  body: string;
  href?: string | null;
  read: boolean;
  createdAt: string;
};

export function dealStatusLabel(status: string) {
  const map: Record<string, string> = {
    REQUEST_CREATED: 'Contact only',
    PLOT_FOUND: 'Options ready',
    PLOT_SELECTED: 'Asset selected',
    ESCROW_CREATED: 'Settlement opened',
    ESCROW_FUNDED: 'Settlement recorded',
    DUE_DILIGENCE: 'Due diligence',
    EXECUTION: 'Execution',
    REGISTRY_TRANSFER: 'Registry transfer',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return map[status] || status.replace(/_/g, ' ');
}

export function listingStatusLabel(status: string) {
  const map: Record<string, string> = {
    DRAFT: 'Draft',
    PENDING_VETTING: 'Pending vetting',
    REJECTED: 'Rejected',
    PUBLISHED: 'Published',
    RESERVED: 'Reserved',
    SOLD: 'Sold',
  };
  return map[status] || status.replace(/_/g, ' ');
}

export const DEAL_PIPELINE = [
  { key: 'PLOT_SELECTED', label: 'Selected' },
  { key: 'DUE_DILIGENCE', label: 'Diligence' },
  { key: 'ESCROW_FUNDED', label: 'Settlement' },
  { key: 'EXECUTION', label: 'Execution' },
  { key: 'REGISTRY_TRANSFER', label: 'Registry' },
  { key: 'COMPLETED', label: 'Done' },
] as const;
