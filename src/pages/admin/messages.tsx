'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { BuyAdminLayout, adminCardClass } from '@/components/buy/buy-admin-layout';
import { landApi, type LandDeal, type LandMessage } from '@/lib/buy/land-api';

type InboxRow = LandMessage & {
  request?: { id: string; contactName?: string | null; contactEmail?: string | null; listing?: { title?: string | null } | null };
};

export default function AdminMessagesPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [rows, setRows] = useState<InboxRow[]>([]);
  const [deals, setDeals] = useState<LandDeal[]>([]);
  const [dealId, setDealId] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inbox, requests] = await Promise.all([
        landApi<InboxRow[]>('admin/inbox'),
        landApi<LandDeal[]>('admin/requests'),
      ]);
      setRows(Array.isArray(inbox) ? inbox : []);
      const bound = Array.isArray(requests) ? requests.filter((d) => d.listingId) : [];
      setDeals(bound);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!dealId && deals[0]?.id) setDealId(deals[0].id);
  }, [dealId, deals]);

  const thread = useMemo(() => rows.filter((r) => r.request?.id === dealId).reverse(), [rows, dealId]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!dealId || !body.trim()) return;
    setSending(true);
    setError('');
    try {
      await landApi(`deals/${dealId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: body.trim() }),
      });
      setBody('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send');
    } finally {
      setSending(false);
    }
  };

  const card = adminCardClass(isDark);
  const input = isDark
    ? 'w-full rounded-xl border border-[#32465b] bg-[#1c2a3a] px-3 py-2 text-sm text-white'
    : 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900';

  return (
    <BuyAdminLayout title="Messages — buy.siz.land admin">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Buyer messages</h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Threads are per deal. Use the contact they typed on profile, not the pairwise SizWallet subject.
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {loading ? (
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading…</p>
          ) : rows.length === 0 ? (
            <div className={card}>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No messages yet</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {rows.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setDealId(row.request?.id || '')}
                    className={`${card} w-full text-left ${dealId === row.request?.id ? 'ring-1 ring-emerald-500' : ''}`}
                  >
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {row.request?.listing?.title || 'Deal'} · {row.request?.contactName || 'Buyer'}
                    </p>
                    <p className={`mt-1 line-clamp-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{row.body}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={card}>
          <select className={input} value={dealId} onChange={(e) => setDealId(e.target.value)}>
            <option value="">Select a deal</option>
            {deals.map((d) => (
              <option key={d.id} value={d.id}>
                {d.listing?.title || d.id} · {d.contactName || d.contactEmail || 'buyer'}
              </option>
            ))}
          </select>
          <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
            {thread.map((m) => (
              <li key={m.id} className={`rounded-xl px-3 py-2 text-sm ${isDark ? 'bg-[#1c2a3a]' : 'bg-gray-50'}`}>
                <p className="text-[10px] uppercase tracking-wide text-emerald-500">{m.fromRole}</p>
                <p>{m.body}</p>
              </li>
            ))}
          </ul>
          <form onSubmit={send} className="mt-4 space-y-2">
            <textarea className={input} rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write to this buyer…" />
            <button
              type="submit"
              disabled={sending || !dealId || !body.trim()}
              className="w-full rounded-full bg-emerald-500 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </BuyAdminLayout>
  );
}
