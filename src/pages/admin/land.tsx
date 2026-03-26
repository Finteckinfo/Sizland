import React, { useCallback, useEffect, useId, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useLandPageMapHeights } from '@/hooks/useResponsiveMapHeight';
import { LocationPicker } from '@/components/maps/LocationPicker';
import type { OsmMapLibreProps } from '@/components/maps/OsmMapLibre';

const OsmMapLibre = dynamic(
  () => import('@/components/maps/OsmMapLibre').then((m) => ({ default: m.OsmMapLibre })),
  { ssr: false, loading: () => <div className="h-[140px] animate-pulse rounded-lg bg-muted" /> }
);

const inputClass =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

type Plot = {
  id: string;
  name: string;
  fullAddress: string;
  description?: string | null;
  escrowAmount?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  satelliteVerification?: { imageryUrl?: string | null } | null;
};

type LandRequest = {
  id: string;
  userId: string;
  walletAddress?: string | null;
  budget?: number | null;
  sizeCurve?: string | null;
  purpose?: string | null;
  status: string;
  currentStep: string;
  user?: { id: string; email?: string; firstName?: string; lastName?: string };
  plots: Plot[];
  createdAt: string;
};

type LandListing = {
  id: string;
  title: string;
  description?: string | null;
  fullAddress: string;
  listPrice?: number | null;
  currency?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const DOC_TYPES = ['REPORT', 'SURVEY', 'AGREEMENT', 'OTHER'] as const;
type DocType = (typeof DOC_TYPES)[number];

/** European ISO 4217 codes commonly used in listings, plus KES. */
const INVENTORY_CURRENCIES = [
  { code: 'EUR', label: 'EUR' },
  { code: 'GBP', label: 'GBP' },
  { code: 'CHF', label: 'CHF' },
  { code: 'SEK', label: 'SEK' },
  { code: 'NOK', label: 'NOK' },
  { code: 'DKK', label: 'DKK' },
  { code: 'PLN', label: 'PLN' },
  { code: 'CZK', label: 'CZK' },
  { code: 'HUF', label: 'HUF' },
  { code: 'RON', label: 'RON' },
  { code: 'BGN', label: 'BGN' },
  { code: 'ISK', label: 'ISK' },
  { code: 'TRY', label: 'TRY' },
  { code: 'ALL', label: 'ALL' },
  { code: 'MKD', label: 'MKD' },
  { code: 'RSD', label: 'RSD' },
  { code: 'UAH', label: 'UAH' },
  { code: 'KES', label: 'KES' },
] as const;

function resolveInventoryCurrency(raw: string): string {
  const upper = raw.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
  if (!upper) return 'KES';
  const exact = INVENTORY_CURRENCIES.find((c) => c.code === upper);
  if (exact) return exact.code;
  const prefix = INVENTORY_CURRENCIES.find((c) => c.code.startsWith(upper));
  if (prefix) return prefix.code;
  return 'KES';
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

type AdminLandViewMode = 'dashboard' | 'satisfy_request' | 'inventory_listing';

function isRequestSatisfied(status: string) {
  const s = String(status || '').toUpperCase();
  return s === 'COMPLETED' || s === 'CANCELLED';
}

const AdminLandPage: React.FC = () => {
  const inventoryCurrencyListId = useId();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<LandRequest[]>([]);
  const [listings, setListings] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [listingModal, setListingModal] = useState<LandListing | null>(null);

  type DocDraft = {
    id: string;
    type: DocType;
    fileUrl: string;
    fileHash: string;
    submitting: boolean;
    error: string | null;
    uploaded: boolean;
  };
  const [docDrafts, setDocDrafts] = useState<DocDraft[]>(() => [
    {
      id: 'doc-0',
      type: 'REPORT',
      fileUrl: '',
      fileHash: '',
      submitting: false,
      error: null,
      uploaded: false,
    },
  ]);
  const [uploadedDocTypes, setUploadedDocTypes] = useState<Set<DocType>>(() => new Set());

  const [formRequestId, setFormRequestId] = useState('');
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formEscrow, setFormEscrow] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [invTitle, setInvTitle] = useState('');
  const [invDesc, setInvDesc] = useState('');
  const [invAddress, setInvAddress] = useState('');
  const [invPrice, setInvPrice] = useState('');
  const [invCurrency, setInvCurrency] = useState<string>('KES');
  const [invLat, setInvLat] = useState('');
  const [invLng, setInvLng] = useState('');
  const [invStatus, setInvStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [invSubmitting, setInvSubmitting] = useState(false);
  const [invError, setInvError] = useState<string | null>(null);

  const satisfyParam = typeof router.query.satisfy === 'string' ? router.query.satisfy : '';

  const [viewMode, setViewMode] = useState<AdminLandViewMode>('dashboard');
  const [requestsPage, setRequestsPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
  const REQUESTS_PER_PAGE = 10;
  const INVENTORY_PER_PAGE = 9;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/land/admin/requests', { credentials: 'include' });
      if (!resp.ok) {
        if (resp.status === 403) {
          setRequests([]);
          router.replace('/lobby?error=land_admin_required');
          return;
        }
        const body = await resp.json().catch(() => ({}));
        const extra =
          typeof body?.hint === 'string'
            ? ` ${body.hint}`
            : resp.status === 503 || resp.status === 500
              ? ' Check Vercel NEXT_PUBLIC_BACKEND_URL, Railway, and `npx prisma migrate deploy` on the API.'
              : '';
        throw new Error((body?.error || `${resp.status} ${resp.statusText}`) + extra);
      }
      const data = await resp.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchListings = useCallback(async () => {
    setListingsLoading(true);
    try {
      const resp = await fetch('/api/land/admin/catalog/listings', { credentials: 'include' });
      if (!resp.ok) return;
      const data = await resp.json();
      setListings(Array.isArray(data) ? data : []);
    } catch {
      /* ignore */
    } finally {
      setListingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRequests();
      fetchListings();
    }
  }, [status, fetchListings, fetchRequests]);

  useEffect(() => {
    if (satisfyParam && requests.some((r) => r.id === satisfyParam)) {
      setFormRequestId(satisfyParam);
      setViewMode('satisfy_request');
    }
  }, [satisfyParam, requests]);

  useEffect(() => {
    // Reset drafts when switching expanded request.
    setDocDrafts([
      {
        id: 'doc-0',
        type: 'REPORT',
        fileUrl: '',
        fileHash: '',
        submitting: false,
        error: null,
        uploaded: false,
      },
    ]);
    setUploadedDocTypes(new Set());
  }, [expandedRequestId]);

  const onSatisfyRequest = (id: string) => {
    setFormRequestId(id);
    setViewMode('satisfy_request');
    router.replace({ pathname: '/admin/land', query: { satisfy: id } }, undefined, { shallow: true });
  };

  const exitSatisfyMode = () => {
    setViewMode('dashboard');
    setFormError(null);
    router.replace({ pathname: '/admin/land', query: {} }, undefined, { shallow: true });
  };

  const enterInventoryMode = () => {
    setViewMode('inventory_listing');
    setInvError(null);
  };

  const exitInventoryMode = () => {
    setViewMode('dashboard');
    setInvError(null);
  };

  const addPlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const lat = formLat.trim() ? parseFloat(formLat) : undefined;
    const lng = formLng.trim() ? parseFloat(formLng) : undefined;
    if (lat != null && (isNaN(lat) || lat < -90 || lat > 90)) {
      setFormError('Latitude must be between -90 and 90');
      return;
    }
    if (lng != null && (isNaN(lng) || lng < -180 || lng > 180)) {
      setFormError('Longitude must be between -180 and 180');
      return;
    }
    if (!formRequestId || !formName.trim() || !formAddress.trim()) {
      setFormError('Request, name, and address are required');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch('/api/land/admin/plots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          requestId: formRequestId,
          name: formName.trim(),
          fullAddress: formAddress.trim(),
          description: formDesc.trim() || undefined,
          escrowAmount: formEscrow.trim() ? parseFloat(formEscrow) : undefined,
          latitude: lat,
          longitude: lng,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Failed to add plot');
      setFormName('');
      setFormAddress('');
      setFormDesc('');
      setFormEscrow('');
      setFormLat('');
      setFormLng('');
      fetchRequests();
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Failed to add plot');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (requestId: string, next: string) => {
    try {
      const resp = await fetch(`/api/land/admin/request/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: next }),
      });
      if (!resp.ok) {
        const d = await resp.json().catch(() => ({}));
        throw new Error(d?.error || 'Failed to update');
      }
      fetchRequests();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to update status');
    }
  };

  const availableDocTypesForRow = (rowId: string): DocType[] => {
    const used = new Set<DocType>();
    for (const d of docDrafts) {
      if (d.id !== rowId) used.add(d.type);
    }
    for (const t of uploadedDocTypes) used.add(t);
    const current = docDrafts.find((d) => d.id === rowId)?.type;
    return DOC_TYPES.filter((t) => !used.has(t) || t === current);
  };

  const addDocRow = () => {
    const used = new Set<DocType>();
    for (const d of docDrafts) used.add(d.type);
    for (const t of uploadedDocTypes) used.add(t);
    const nextType = DOC_TYPES.find((t) => !used.has(t));
    if (!nextType) return;
    setDocDrafts((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: nextType,
        fileUrl: '',
        fileHash: '',
        submitting: false,
        error: null,
        uploaded: false,
      },
    ]);
  };

  const removeDocRow = (rowId: string) => {
    setDocDrafts((prev) => (prev.length <= 1 ? prev : prev.filter((d) => d.id !== rowId)));
  };

  const setDocRow = (rowId: string, patch: Partial<DocDraft>) => {
    setDocDrafts((prev) => prev.map((d) => (d.id === rowId ? { ...d, ...patch } : d)));
  };

  const uploadDocRow = async (requestId: string, rowId: string) => {
    const row = docDrafts.find((d) => d.id === rowId);
    if (!row) return;

    setDocRow(rowId, { error: null });
    if (!row.fileUrl.trim()) {
      setDocRow(rowId, { error: 'Document file URL is required' });
      return;
    }

    setDocRow(rowId, { submitting: true });
    try {
      const resp = await fetch('/api/land/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          requestId,
          type: row.type,
          fileUrl: row.fileUrl.trim(),
          fileHash: row.fileHash.trim() ? row.fileHash.trim() : undefined,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Failed to upload document');

      setUploadedDocTypes((prev) => new Set(prev).add(row.type));
      setDocRow(rowId, { uploaded: true, submitting: false });
      fetchRequests();
    } catch (e: unknown) {
      setDocRow(rowId, { error: e instanceof Error ? e.message : 'Failed to upload document', submitting: false });
    }
  };

  const submitInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvError(null);
    if (!invTitle.trim() || !invAddress.trim()) {
      setInvError('Title and address are required');
      return;
    }
    const lat = invLat.trim() ? parseFloat(invLat) : undefined;
    const lng = invLng.trim() ? parseFloat(invLng) : undefined;
    setInvSubmitting(true);
    try {
      const resp = await fetch('/api/land/admin/catalog/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: invTitle.trim(),
          description: invDesc.trim() || undefined,
          fullAddress: invAddress.trim(),
          listPrice: invPrice.trim() ? parseFloat(invPrice) : undefined,
          currency: resolveInventoryCurrency(invCurrency),
          latitude: lat,
          longitude: lng,
          status: invStatus,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Failed to create listing');
      setInvTitle('');
      setInvDesc('');
      setInvAddress('');
      setInvPrice('');
      setInvCurrency('KES');
      setInvLat('');
      setInvLng('');
      setInvStatus('DRAFT');
      fetchListings();
      setViewMode('dashboard');
    } catch (e: unknown) {
      setInvError(e instanceof Error ? e.message : 'Failed to create listing');
    } finally {
      setInvSubmitting(false);
    }
  };

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this catalog listing?')) return;
    try {
      const resp = await fetch(`/api/land/admin/catalog/listings/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!resp.ok) throw new Error('Delete failed');
      setListingModal(null);
      fetchListings();
    } catch {
      setError('Failed to delete listing');
    }
  };

  const plotPickerLat = formLat.trim() ? parseFloat(formLat) : null;
  const plotPickerLng = formLng.trim() ? parseFloat(formLng) : null;
  const invPickerLat = invLat.trim() ? parseFloat(invLat) : null;
  const invPickerLng = invLng.trim() ? parseFloat(invLng) : null;

  const mapHeights = useLandPageMapHeights();

  const activeSatisfyRequestId = (formRequestId || satisfyParam).toString();
  const activeSatisfyRequest = requests.find((r) => r.id === activeSatisfyRequestId);

  const sortedRequests = [...requests].sort((a, b) => {
    const aSat = isRequestSatisfied(a.status);
    const bSat = isRequestSatisfied(b.status);
    if (aSat !== bSat) return aSat ? 1 : -1; // unsatisfied first
    const at = new Date(a.createdAt).getTime();
    const bt = new Date(b.createdAt).getTime();
    return at - bt; // oldest first
  });
  const requestsTotalPages = Math.max(1, Math.ceil(sortedRequests.length / REQUESTS_PER_PAGE));
  const clampedRequestsPage = Math.min(Math.max(1, requestsPage), requestsTotalPages);
  const requestsPageItems = sortedRequests.slice(
    (clampedRequestsPage - 1) * REQUESTS_PER_PAGE,
    clampedRequestsPage * REQUESTS_PER_PAGE
  );

  const sortedListings = [...listings].sort((a, b) => {
    const at = new Date(a.createdAt).getTime();
    const bt = new Date(b.createdAt).getTime();
    return bt - at; // latest first
  });
  const inventoryTotalPages = Math.max(1, Math.ceil(sortedListings.length / INVENTORY_PER_PAGE));
  const clampedInventoryPage = Math.min(Math.max(1, inventoryPage), inventoryTotalPages);
  const inventoryPageItems = sortedListings.slice(
    (clampedInventoryPage - 1) * INVENTORY_PER_PAGE,
    clampedInventoryPage * INVENTORY_PER_PAGE
  );

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-4 sm:py-8 md:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Admin — Land</h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/browse-land" className="text-sm font-medium text-primary hover:underline">
            View public catalog
          </Link>
          <Link href="/admin/users" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            ← Users
          </Link>
        </div>
      </div>

      {status === 'loading' && <p className="text-muted-foreground">Loading session…</p>}

      {status === 'unauthenticated' && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="mb-4 text-card-foreground">You must be logged in.</p>
          <button
            type="button"
            onClick={() => signIn()}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Sign in
          </button>
        </div>
      )}

      {status === 'authenticated' && (
        <>
          <p className="mb-4 text-sm text-muted-foreground">Signed in as {session?.user?.email}</p>
          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/20">
              {error}
            </div>
          )}

          {viewMode === 'dashboard' && (
            <>
              {/* —— Requests table —— */}
              <section className="mb-8 sm:mb-10">
                <h2 className="mb-3 text-base font-semibold text-foreground sm:text-lg">Land acquisition requests</h2>
                {loading ? (
                  <p className="text-muted-foreground">Loading…</p>
                ) : sortedRequests.length === 0 ? (
                  <p className="text-muted-foreground">No requests yet. Buyers start from Buy land.</p>
                ) : (
                  <>
                    <div className="-mx-3 overflow-x-auto rounded-lg border border-border sm:mx-0">
                      <table className="min-w-[720px] w-full divide-y divide-border text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-2 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-3">ID</th>
                            <th className="px-2 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-3">User</th>
                            <th className="px-2 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-3">Status</th>
                            <th className="hidden px-2 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell sm:px-3">Step</th>
                            <th className="hidden px-2 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell lg:px-3">Budget</th>
                            <th className="hidden px-2 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground lg:table-cell lg:px-3">Created</th>
                            <th className="px-2 py-2.5 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground sm:px-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-card">
                          {requestsPageItems.map((r) => (
                            <React.Fragment key={r.id}>
                              <tr className="transition-colors hover:bg-muted/40">
                                <td className="px-2 py-2.5 font-mono text-xs text-foreground sm:px-3">{r.id.slice(0, 10)}…</td>
                                <td className="max-w-[140px] truncate px-2 py-2.5 text-foreground sm:max-w-[220px] sm:px-3">
                                  {r.user?.email || r.userId}
                                </td>
                                <td className="whitespace-nowrap px-2 py-2.5 text-xs text-foreground sm:px-3 sm:text-sm">{r.status}</td>
                                <td className="hidden whitespace-nowrap px-2 py-2.5 text-muted-foreground sm:table-cell sm:px-3">{r.currentStep}</td>
                                <td className="hidden px-2 py-2.5 text-foreground lg:table-cell lg:px-3">{r.budget ?? '—'}</td>
                                <td className="hidden whitespace-nowrap px-2 py-2.5 text-muted-foreground lg:table-cell lg:px-3">{formatDate(r.createdAt)}</td>
                                <td className="px-2 py-2.5 text-right sm:px-3">
                                  <div className="flex flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
                                    <button
                                      type="button"
                                      onClick={() => onSatisfyRequest(r.id)}
                                      className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                                    >
                                      Satisfy request
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setExpandedRequestId(expandedRequestId === r.id ? null : r.id)}
                                      className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                                    >
                                      {expandedRequestId === r.id ? 'Hide' : 'Details'}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {expandedRequestId === r.id && (
                                <tr>
                                  <td colSpan={7} className="bg-muted/30 px-3 py-4 sm:px-4">
                                    <p className="mb-2 text-sm text-foreground">
                                      Size: {r.sizeCurve ?? '—'} | Purpose: {r.purpose ?? '—'} | Wallet: {r.walletAddress ?? '—'}
                                    </p>
                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                      <label className="text-xs text-muted-foreground">Status</label>
                                      <select
                                        value={r.status}
                                        onChange={(e) => updateStatus(r.id, e.target.value)}
                                        className={`${inputClass} w-auto min-w-[12rem]`}
                                      >
                                        {[
                                          'REQUEST_CREATED',
                                          'PLOT_FOUND',
                                          'PLOT_SELECTED',
                                          'ESCROW_CREATED',
                                          'ESCROW_FUNDED',
                                          'DUE_DILIGENCE',
                                          'EXECUTION',
                                          'REGISTRY_TRANSFER',
                                          'COMPLETED',
                                          'CANCELLED',
                                        ].map((s) => (
                                          <option key={s} value={s}>
                                            {s}
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="mb-4 border-t border-border pt-3">
                                      <h4 className="mb-2 text-sm font-semibold text-foreground">Due diligence documents</h4>
                                      <div className="space-y-3">
                                        {docDrafts.map((d, idx) => {
                                          const options = availableDocTypesForRow(d.id);
                                          return (
                                            <div key={d.id} className="rounded-lg border border-border bg-background/40 p-3">
                                              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-xs font-medium text-muted-foreground">Doc {idx + 1}</span>
                                                  {d.uploaded && (
                                                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                                      Uploaded
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="flex gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={() => removeDocRow(d.id)}
                                                    disabled={docDrafts.length <= 1 || d.submitting}
                                                    className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground disabled:opacity-50"
                                                  >
                                                    Remove
                                                  </button>
                                                  <button
                                                    type="button"
                                                    disabled={d.submitting || d.uploaded}
                                                    onClick={() => uploadDocRow(r.id, d.id)}
                                                    className="rounded-md bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
                                                  >
                                                    {d.submitting ? 'Uploading…' : d.uploaded ? 'Uploaded' : 'Upload'}
                                                  </button>
                                                </div>
                                              </div>

                                              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                                <select
                                                  value={d.type}
                                                  disabled={d.submitting || d.uploaded}
                                                  onChange={(e) => setDocRow(d.id, { type: e.target.value as DocType })}
                                                  className={`${inputClass} w-full sm:w-auto sm:min-w-[8rem]`}
                                                >
                                                  {options.map((t) => (
                                                    <option key={t} value={t}>
                                                      {t}
                                                    </option>
                                                  ))}
                                                </select>
                                                <input
                                                  value={d.fileUrl}
                                                  disabled={d.submitting || d.uploaded}
                                                  onChange={(e) => setDocRow(d.id, { fileUrl: e.target.value })}
                                                  placeholder="File URL"
                                                  className={`${inputClass} min-w-0 flex-1`}
                                                />
                                                <input
                                                  value={d.fileHash}
                                                  disabled={d.submitting || d.uploaded}
                                                  onChange={(e) => setDocRow(d.id, { fileHash: e.target.value })}
                                                  placeholder="SHA-256 (optional)"
                                                  className={`${inputClass} w-full sm:w-52`}
                                                />
                                              </div>

                                              {d.error && <p className="mt-2 text-xs text-destructive">{d.error}</p>}
                                            </div>
                                          );
                                        })}

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                          <p className="text-xs text-muted-foreground">
                                            Add documents progressively (Report, Survey, Agreement, etc.). Types already selected/uploaded won’t appear again.
                                          </p>
                                          <button
                                            type="button"
                                            onClick={addDocRow}
                                            disabled={uploadedDocTypes.size + docDrafts.length >= DOC_TYPES.length}
                                            className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                                          >
                                            Add document
                                          </button>
                                        </div>

                                        {uploadedDocTypes.size > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => updateStatus(r.id, 'DUE_DILIGENCE')}
                                            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                                          >
                                            Mark DUE_DILIGENCE
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    <h4 className="text-sm font-semibold text-foreground">Plots</h4>
                                    <ul className="list-inside list-disc text-sm text-muted-foreground">
                                      {r.plots?.length ? (
                                        r.plots.map((p) => (
                                          <li key={p.id}>
                                            {p.name} — {p.fullAddress}
                                          </li>
                                        ))
                                      ) : (
                                        <li>None yet — use Satisfy request above.</li>
                                      )}
                                    </ul>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {sortedRequests.length > REQUESTS_PER_PAGE && (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                          Page {clampedRequestsPage} of {requestsTotalPages} · {sortedRequests.length} total
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={clampedRequestsPage <= 1}
                            onClick={() => setRequestsPage((p) => Math.max(1, p - 1))}
                            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-50"
                          >
                            Prev
                          </button>
                          <button
                            type="button"
                            disabled={clampedRequestsPage >= requestsTotalPages}
                            onClick={() => setRequestsPage((p) => Math.min(requestsTotalPages, p + 1))}
                            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* —— Inventory catalog cards (like “Choose Your Plot”) —— */}
              <section className="mb-10 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-foreground sm:text-lg">Inventory listing (not tied to a buyer yet)</h2>
                  <button
                    type="button"
                    onClick={enterInventoryMode}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Inventory listing
                  </button>
                </div>

                {listingsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading listings…</p>
                ) : sortedListings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
                    <p className="text-lg font-semibold text-foreground">No lands at the moment</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Plots matching your criteria will appear here once our team sources them.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {inventoryPageItems.map((L) => (
                        <div
                          key={L.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setListingModal(L)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setListingModal(L);
                            }
                          }}
                          className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"
                        >
                          <div className="w-full shrink-0 overflow-hidden bg-muted/30" style={{ height: mapHeights.cardPreview }}>
                            <OsmMapLibre latitude={L.latitude} longitude={L.longitude} height={mapHeights.cardPreview} hideAttribution />
                          </div>
                          <div className="flex flex-1 flex-col p-3 sm:p-4">
                            <span className="text-xs font-medium uppercase text-primary">{L.status}</span>
                            <span className="font-semibold text-foreground">{L.title}</span>
                            <p className="line-clamp-2 text-sm text-muted-foreground">{L.description || L.fullAddress}</p>
                            <p className="mt-auto pt-2 text-sm font-medium text-foreground">
                              {L.listPrice != null ? `${L.currency || 'KES'} ${L.listPrice.toLocaleString()}` : 'Price on request'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {sortedListings.length > INVENTORY_PER_PAGE && (
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                          Page {clampedInventoryPage} of {inventoryTotalPages} · {sortedListings.length} total
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={clampedInventoryPage <= 1}
                            onClick={() => setInventoryPage((p) => Math.max(1, p - 1))}
                            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-50"
                          >
                            Prev
                          </button>
                          <button
                            type="button"
                            disabled={clampedInventoryPage >= inventoryTotalPages}
                            onClick={() => setInventoryPage((p) => Math.min(inventoryTotalPages, p + 1))}
                            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>
            </>
          )}

          {viewMode === 'satisfy_request' && (
            <section className="mb-10 rounded-xl border border-border bg-card/60 p-4 shadow-sm backdrop-blur-sm sm:p-6 dark:bg-card/40">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-foreground sm:text-lg">Add plot for a request</h2>
                <button
                  type="button"
                  onClick={exitSatisfyMode}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  ← Back to requests
                </button>
              </div>
              <form onSubmit={addPlot} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Request (fallback)</label>
                  <select
                    value={formRequestId}
                    onChange={(e) => setFormRequestId(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {requests.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.id.slice(0, 8)}… {r.user?.email || r.userId}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">Use Satisfy request in the table to pre-fill this field.</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Plot name</label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className={inputClass}
                    placeholder="Plot name"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Full address</label>
                <input
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className={inputClass}
                  placeholder="Full address"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
                  <input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Escrow (optional)</label>
                  <input
                    type="number"
                    value={formEscrow}
                    onChange={(e) => setFormEscrow(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Latitude</label>
                  <input
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    className={`${inputClass} font-mono text-xs sm:text-sm`}
                    placeholder="-1.29"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Longitude</label>
                  <input
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    className={`${inputClass} font-mono text-xs sm:text-sm`}
                    placeholder="36.82"
                  />
                </div>
              </div>
              <LocationPicker
                MapComponent={OsmMapLibre as unknown as React.ComponentType<OsmMapLibreProps>}
                latitude={plotPickerLat != null && !isNaN(plotPickerLat) ? plotPickerLat : null}
                longitude={plotPickerLng != null && !isNaN(plotPickerLng) ? plotPickerLng : null}
                height={mapHeights.form}
                onPick={(la, ln) => {
                  setFormLat(String(la.toFixed(6)));
                  setFormLng(String(ln.toFixed(6)));
                }}
              />
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <button
                type="submit"
                disabled={submitting || loading}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 sm:w-auto"
              >
                {submitting ? 'Adding…' : 'Add plot'}
              </button>
              </form>

              <div className="mt-6 rounded-xl border border-border bg-background/40 p-4">
                <h3 className="mb-2 text-sm font-semibold text-foreground">Plots added for this request</h3>
                {activeSatisfyRequest?.plots?.length ? (
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {activeSatisfyRequest.plots.map((p) => (
                      <li key={p.id}>
                        <span className="font-medium text-foreground">{p.name}</span> — {p.fullAddress}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No plots added yet. Add one or more plots using the form above.</p>
                )}
              </div>
            </section>
          )}

          {viewMode === 'inventory_listing' && (
            <section className="mb-10 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-foreground sm:text-lg">Inventory listing</h2>
                <button
                  type="button"
                  onClick={exitInventoryMode}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  ← Back to dashboard
                </button>
              </div>

              <form onSubmit={submitInventory} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Title *</label>
                  <input value={invTitle} onChange={(e) => setInvTitle(e.target.value)} className={inputClass} required />
                </div>
                <div className="min-w-0 sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-foreground">List price</label>
                  <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={invPrice}
                      onChange={(e) => setInvPrice(e.target.value)}
                      className={`${inputClass} min-h-11 min-w-0 flex-1 py-2.5 text-base sm:min-w-0`}
                      placeholder="Amount"
                    />
                    <>
                      <input
                        type="text"
                        list={inventoryCurrencyListId}
                        value={invCurrency}
                        onChange={(e) => setInvCurrency(e.target.value.toUpperCase())}
                        onBlur={() => setInvCurrency(resolveInventoryCurrency(invCurrency))}
                        maxLength={3}
                        autoComplete="off"
                        spellCheck={false}
                        aria-label="Currency"
                        placeholder="e.g. KES"
                        className={`${inputClass} h-11 w-full shrink-0 px-2 py-2 font-mono text-xs uppercase sm:w-[6.5rem] sm:max-w-[7rem] sm:px-1.5 sm:text-[11px]`}
                      />
                      <datalist id={inventoryCurrencyListId}>
                        {INVENTORY_CURRENCIES.map((c) => (
                          <option key={c.code} value={c.code} label={c.label} />
                        ))}
                      </datalist>
                    </>
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Full address *</label>
                <input value={invAddress} onChange={(e) => setInvAddress(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={invDesc}
                  onChange={(e) => setInvDesc(e.target.value)}
                  rows={3}
                  className={`${inputClass} resize-y`}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Latitude</label>
                  <input value={invLat} onChange={(e) => setInvLat(e.target.value)} className={`${inputClass} font-mono text-xs sm:text-sm`} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Longitude</label>
                  <input value={invLng} onChange={(e) => setInvLng(e.target.value)} className={`${inputClass} font-mono text-xs sm:text-sm`} />
                </div>
              </div>
              <LocationPicker
                MapComponent={OsmMapLibre as unknown as React.ComponentType<OsmMapLibreProps>}
                latitude={invPickerLat != null && !isNaN(invPickerLat) ? invPickerLat : null}
                longitude={invPickerLng != null && !isNaN(invPickerLng) ? invPickerLng : null}
                height={mapHeights.form}
                onPick={(la, ln) => {
                  setInvLat(String(la.toFixed(6)));
                  setInvLng(String(ln.toFixed(6)));
                }}
              />
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <label className="flex flex-wrap items-center gap-2 text-sm text-foreground">
                  <span className="text-muted-foreground">Visibility</span>
                  <select
                    value={invStatus}
                    onChange={(e) => setInvStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                    className={`${inputClass} w-auto`}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </label>
                {invError && <span className="text-sm text-destructive">{invError}</span>}
                <button
                  type="submit"
                  disabled={invSubmitting}
                  className="rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 sm:ml-auto"
                >
                  {invSubmitting ? 'Saving…' : 'Save listing'}
                </button>
              </div>
              </form>
            </section>
          )}

          <Dialog open={!!listingModal} onOpenChange={(o) => !o && setListingModal(null)}>
            <DialogContent className="max-h-[min(90dvh,900px)] w-[calc(100vw-1.25rem)] max-w-lg overflow-y-auto p-4 sm:max-w-xl sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-left text-foreground">{listingModal?.title}</DialogTitle>
                <DialogDescription className="text-left">{listingModal?.fullAddress}</DialogDescription>
              </DialogHeader>
              {listingModal && (
                <>
                  {listingModal.latitude != null && listingModal.longitude != null && (
                    <OsmMapLibre
                      latitude={listingModal.latitude}
                      longitude={listingModal.longitude}
                      height={mapHeights.modal}
                    />
                  )}
                  <p className="text-sm text-muted-foreground">{listingModal.description || '—'}</p>
                  <p className="text-lg font-semibold text-foreground">
                    {listingModal.listPrice != null
                      ? `${listingModal.currency || 'KES'} ${listingModal.listPrice.toLocaleString()}`
                      : 'Price on request'}
                  </p>
                  <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => listingModal && deleteListing(listingModal.id)}
                      className="rounded-lg border border-destructive/40 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
                    >
                      Delete listing
                    </button>
                    <button
                      type="button"
                      onClick={() => setListingModal(null)}
                      className="rounded-lg border border-border bg-muted px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted/80"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default AdminLandPage;
