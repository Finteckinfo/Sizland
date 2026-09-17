'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { BuyAdminLayout, adminCardClass } from '@/components/buy/buy-admin-layout';
import { listingStatusLabel } from '@/lib/buy/land-api';

type Submission = {
  id: string;
  title: string;
  description?: string | null;
  fullAddress: string;
  listPrice?: number | null;
  currency?: string | null;
  kind?: string;
  status: string;
  rejectionReason?: string | null;
  submittedByUserId?: string | null;
  submittedBy?: { email?: string | null } | null;
  createdAt: string;
};

export default function AdminVettingPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [items, setItems] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'PENDING_VETTING' | 'ALL'>('PENDING_VETTING');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/land/admin/submissions', { credentials: 'include' });
      const data = await resp.json().catch(() => []);
      if (!resp.ok) throw new Error(data?.error || 'Failed to load submissions');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const review = async (id: string, action: 'approve' | 'reject') => {
    let reason = '';
    if (action === 'reject') {
      reason = window.prompt('Rejection reason (visible to the submitter)') || '';
      if (!reason.trim()) return;
    }
    setError('');
    try {
      const resp = await fetch(`/api/land/admin/submissions/${id}/review`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: reason.trim() }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Review failed');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Review failed');
    }
  };

  const shown = filter === 'ALL' ? items : items.filter((i) => i.status === 'PENDING_VETTING');
  const card = adminCardClass(isDark);

  return (
    <BuyAdminLayout title="Vetting — buy.siz.land">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Vetting inbox</h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Client uploads stay off the public catalog until you publish them.
            </p>
          </div>
          <div className="flex gap-2">
            {(['PENDING_VETTING', 'ALL'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  filter === key ? 'bg-emerald-500 text-white' : isDark ? 'bg-[#1c2a3a] text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {key === 'ALL' ? 'All submissions' : 'Pending'}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {loading ? (
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading…</p>
        ) : shown.length === 0 ? (
          <div className={card}>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Inbox clear</p>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Nothing in this filter.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {shown.map((s) => (
              <li key={s.id} className={card}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.title}</p>
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                        {listingStatusLabel(s.status)}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{s.fullAddress}</p>
                    <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      {s.kind || 'LAND'} · {s.submittedBy?.email || s.submittedByUserId || 'client'}
                      {s.listPrice != null ? ` · ${s.currency || 'USD'} ${s.listPrice.toLocaleString()}` : ''}
                    </p>
                    {s.description && <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{s.description}</p>}
                    {s.rejectionReason && <p className="mt-2 text-xs text-red-500">{s.rejectionReason}</p>}
                  </div>
                  {s.status === 'PENDING_VETTING' && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => review(s.id, 'approve')}
                        className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                      >
                        Publish
                      </button>
                      <button
                        type="button"
                        onClick={() => review(s.id, 'reject')}
                        className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                          isDark ? 'border-[#32465b] text-gray-200' : 'border-gray-200 text-gray-800'
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BuyAdminLayout>
  );
}
