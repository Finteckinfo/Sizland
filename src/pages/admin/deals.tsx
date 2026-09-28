'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { BuyAdminLayout, adminCardClass } from '@/components/buy/buy-admin-layout';
import {
  dealStatusLabel,
  filesToPayload,
  landApi,
  openLandFile,
  type LandDeal,
  type LandDiligenceItem,
} from '@/lib/buy/land-api';

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

const FILE_KINDS = ['TITLE', 'SURVEY', 'LEGAL', 'PHOTO', 'SATELLITE', 'OTHER'] as const;

type AdminDeal = LandDeal & {
  user?: { email?: string | null; id?: string };
  userId: string;
};

export default function AdminDealsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [deals, setDeals] = useState<AdminDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'deals' | 'leads'>('deals');
  const [openId, setOpenId] = useState<string | null>(null);
  const [registryRef, setRegistryRef] = useState('');
  const [courierTracking, setCourierTracking] = useState('');
  const [message, setMessage] = useState('');
  const [fileKind, setFileKind] = useState<(typeof FILE_KINDS)[number]>('LEGAL');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await landApi<AdminDeal[]>('admin/requests');
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

  const openDeal = (deal: AdminDeal) => {
    setOpenId(openId === deal.id ? null : deal.id);
    setRegistryRef(deal.registryRef || '');
    setCourierTracking(deal.courierTracking || '');
    setMessage('');
  };

  const updateStatus = async (id: string, status: string) => {
    setError('');
    try {
      await landApi(`admin/request/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status');
    }
  };

  const toggleDiligence = async (item: LandDiligenceItem) => {
    setError('');
    try {
      await landApi(`admin/diligence/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done: !item.done }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update checklist');
    }
  };

  const saveDelivery = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      await landApi(`admin/request/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ registryRef, courierTracking }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save delivery');
    } finally {
      setSaving(false);
    }
  };

  const uploadFiles = async (requestId: string, list: FileList | null) => {
    if (!list?.length) return;
    setError('');
    try {
      const files = await filesToPayload(list, fileKind);
      await landApi('files', {
        method: 'POST',
        body: JSON.stringify({ requestId, files }),
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  const sendMessage = async (e: FormEvent, requestId: string) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSaving(true);
    setError('');
    try {
      await landApi(`deals/${requestId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: message.trim() }),
      });
      setMessage('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send');
    } finally {
      setSaving(false);
    }
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
            Diligence, files, messages, and registry live here after a buyer selects a catalog asset.
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
                      {r.listing?.fullAddress || r.contactEmail || r.user?.email || r.userId}
                    </p>
                    <p className="mt-1 text-xs text-emerald-500">
                      {dealStatusLabel(r.status)}
                      {r.legalFullName ? ` · ${r.legalFullName}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openDeal(r)}
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
                      <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className={input}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    {tab === 'deals' && (
                      <>
                        <div>
                          <p className={`mb-2 text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Diligence checklist</p>
                          <ul className="space-y-1">
                            {(r.diligenceItems || []).map((item) => (
                              <li key={item.id}>
                                <label className="flex items-center gap-2 text-sm">
                                  <input type="checkbox" checked={item.done} onChange={() => toggleDiligence(item)} />
                                  <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{item.label}</span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className={`mb-2 text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Files</p>
                          {(r.files || []).concat(r.listing?.files || []).map((file) => (
                            <button
                              key={file.id}
                              type="button"
                              onClick={() => openLandFile(file.id).catch((err) => setError(err.message))}
                              className="mr-3 text-xs text-emerald-500 hover:underline"
                            >
                              {file.filename}
                            </button>
                          ))}
                          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                            <select
                              value={fileKind}
                              onChange={(e) => setFileKind(e.target.value as (typeof FILE_KINDS)[number])}
                              className={input}
                            >
                              {FILE_KINDS.map((k) => (
                                <option key={k} value={k}>
                                  {k}
                                </option>
                              ))}
                            </select>
                            <input
                              type="file"
                              multiple
                              onChange={(e) => uploadFiles(r.id, e.target.files)}
                              className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            />
                          </div>
                        </div>
                        <div>
                          <p className={`mb-2 text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Registry & courier</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input
                              className={input}
                              placeholder="Registry reference"
                              value={registryRef}
                              onChange={(e) => setRegistryRef(e.target.value)}
                            />
                            <input
                              className={input}
                              placeholder="Courier tracking"
                              value={courierTracking}
                              onChange={(e) => setCourierTracking(e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => saveDelivery(r.id)}
                            disabled={saving}
                            className="mt-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Save delivery
                          </button>
                        </div>
                        <div>
                          <p className={`mb-2 text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Message buyer</p>
                          <ul className="mb-2 max-h-40 space-y-1 overflow-y-auto">
                            {(r.messages || []).map((m) => (
                              <li key={m.id} className={`rounded-lg px-2 py-1 text-xs ${isDark ? 'bg-[#1c2a3a]' : 'bg-gray-50'}`}>
                                <span className="font-semibold text-emerald-500">{m.fromRole}: </span>
                                {m.body}
                              </li>
                            ))}
                          </ul>
                          <form onSubmit={(e) => sendMessage(e, r.id)} className="flex gap-2">
                            <input
                              className={`${input} flex-1`}
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Note to the buyer"
                            />
                            <button type="submit" className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white">
                              Send
                            </button>
                          </form>
                        </div>
                      </>
                    )}
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
