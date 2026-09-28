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

export const MAX_LAND_FILE_BYTES = 5 * 1024 * 1024;

export async function filesToPayload(list: FileList | File[], kind = 'OTHER') {
  const files = Array.from(list).slice(0, 5);
  return Promise.all(
    files.map(async (file) => {
      if (file.size > MAX_LAND_FILE_BYTES) {
        throw new Error(`${file.name} exceeds 5MB`);
      }
      const dataBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          resolve(result.includes(',') ? result.split(',')[1] : result);
        };
        reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
        reader.readAsDataURL(file);
      });
      return {
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        kind,
        dataBase64,
      };
    })
  );
}

export async function openLandFile(id: string) {
  const file = await landApi<{ filename: string; mimeType: string; dataBase64: string }>(`files/${id}`);
  const binary = atob(file.dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: file.mimeType || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export type LandFileMeta = {
  id: string;
  filename: string;
  mimeType: string;
  byteSize: number;
  kind: string;
  listingId?: string | null;
  requestId?: string | null;
  createdAt: string;
};

export type LandDiligenceItem = {
  id: string;
  key: string;
  label: string;
  done: boolean;
  notes?: string | null;
  updatedAt?: string;
};

export type LandMessage = {
  id: string;
  fromUserId: string;
  fromRole: string;
  body: string;
  createdAt: string;
};

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
  satelliteSceneDate?: string | null;
  satelliteStatus?: string | null;
  satelliteNotes?: string | null;
  satelliteVerifiedAt?: string | null;
  status: string;
  rejectionReason?: string | null;
  submittedByUserId?: string | null;
  files?: LandFileMeta[];
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
  files?: LandFileMeta[];
  diligenceItems?: LandDiligenceItem[];
  messages?: LandMessage[];
  escrowId?: string | null;
  escrowAmount?: number | null;
  escrowFundedAt?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  purpose?: string | null;
  legalFullName?: string | null;
  legalIdType?: string | null;
  legalIdNumber?: string | null;
  nationality?: string | null;
  registryRef?: string | null;
  courierTracking?: string | null;
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

export type LandAuditEvent = {
  id: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
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
