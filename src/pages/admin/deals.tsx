'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { BuyAdminLayout, adminCardClass } from '@/components/buy/buy-admin-layout';
import { dealStatusLabel } from '@/lib/buy/land-api';

const STATUSES = [
  'REQUEST_CREATED',
  'PLOT_SELECTED',
  'ESCROW_CREATED',
  'ESCROW_FUNDED',
  'DUE_DILIGENCE',
  'EXECUTION',
  'REGISTRY_TRANSFER',
  'COMPLETED',
  'CANCELLED',
];

const DOC_TYPES = ['REPORT', 'SURVEY', 'AGREEMENT', 'OTHER'] as const;

type Deal = {
  id: string;
  status: string;
  listingId?: string | null;
  listing?: { title?: string; fullAddress?: string } | null;
  user?: { email?: string; id?: string };
  userId: string;
  purpose?: string | null;
  documents?: { id: string; type: string; fileUrl: string }[];
  createdAt: string;
};

export default function AdminDealsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'deals' | 'leads'>('deals');
  const [openId, setOpenId] = useState<string | null>(null);
  const [docType, setDocType] = useState<(typeof DOC_TYPES)[number]>('REPORT');
  const [docUrl, setDocUrl] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/land/admin/requests', { credentials: 'include' });
      const data = await resp.json().catch(() => []);
      if (!resp.ok) throw new Error(data?.error || 'Failed to load deals');
      setDeals(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setError('');
    const resp = await fetch(`/api/land/admin/request/${id}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      setError(data?.error || 'Failed to update status');
      return;
    }
    await load();
  };

  const uploadDoc = async (requestId: string) => {
    if (!docUrl.trim()) return;
    setError('');
    const resp = await fetch('/api/land/admin/documents', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, type: docType, fileUrl: docUrl.trim() }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      setError(data?.error || 'Failed to add document');
      return;
    }
    setDocUrl('');
    await load();
  };

  const bound = deals.filter((d) => d.listingId);
  const leads = deals.filter((d) => !d.listingId);
  const rows = tab === 'deals' ? bound : leads;
  const card = adminCardClass(isDark);
  const input = isDark
    ? 'rounded-xl border border-[#32465b] bg-[#1c2a3a] px-3 py-2 text-sm text-white'
    : 'rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900';

  return (
    <BuyAdminLayout title="Deals — buy.siz.land">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Deals</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Diligence and status live here after a buyer selects a catalog asset. Contacts without an asset are not deals.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('deals')}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === 'deals' ? 'bg-emerald-500 text-white' : isDark ? 'bg-[#1c2a3a] text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            Deals ({bound.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('leads')}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === 'leads' ? 'bg-emerald-500 text-white' : isDark ? 'bg-[#1c2a3a] text-gray-300' : 'bg-gray-100 text-gray-700'}`}
          >
            Contacts ({leads.length})
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {loading ? (
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading…</p>
        ) : rows.length === 0 ? (
          <div className={card}>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {tab === 'deals' ? 'No deals yet' : 'No contact leads'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id} className={card}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {r.listing?.title || 'Contact only'}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {r.listing?.fullAddress || r.user?.email || r.userId}
                    </p>
                    <p className="mt-1 text-xs text-emerald-500">{dealStatusLabel(r.status)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === r.id ? null : r.id)}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                  >
                    {openId === r.id ? 'Hide' : 'Work deal'}
                  </button>
                </div>
                {openId === r.id && (
                  <div className={`mt-4 space-y-4 border-t pt-4 ${isDark ? 'border-[#32465b]' : 'border-gray-100'}`}>
                    {tab === 'leads' && (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        This person has not selected a listing. Do not invent plots for them.
                      </p>
                    )}
                    <div>
                      <label className="mb-1 block text-xs text-gray-500">Status</label>
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className={input}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className={`mb-2 text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Diligence files</p>
                      {!r.documents?.length ? (
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>None yet.</p>
                      ) : (
                        <ul className="mb-3 space-y-1 text-sm">
                          {r.documents.map((d) => (
                            <li key={d.id}>
                              {d.type}{' '}
                              <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline">
                                open
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                      {tab === 'deals' && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <select value={docType} onChange={(e) => setDocType(e.target.value as (typeof DOC_TYPES)[number])} className={input}>
                            {DOC_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <input
                            className={`${input} flex-1`}
                            placeholder="File URL"
                            value={docUrl}
                            onChange={(e) => setDocUrl(e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => uploadDoc(r.id)}
                            className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </BuyAdminLayout>
  );
}
