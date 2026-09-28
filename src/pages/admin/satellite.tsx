'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { BuyAdminLayout, adminCardClass } from '@/components/buy/buy-admin-layout';
import { landApi, listingStatusLabel, type LandListing } from '@/lib/buy/land-api';

const STATUSES = ['UNVERIFIED', 'STABLE', 'LAND_CLEARED', 'CONSTRUCTION'] as const;

export default function AdminSatellitePage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [items, setItems] = useState<LandListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('STABLE');
  const [notes, setNotes] = useState('');
  const [sceneDate, setSceneDate] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await landApi<LandListing[]>('admin/catalog/listings');
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

  const record = async (e: FormEvent, id: string) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await landApi(`admin/catalog/listings/${id}/satellite`, {
        method: 'POST',
        body: JSON.stringify({
          satelliteStatus: status,
          notes,
          satelliteSceneDate: sceneDate || undefined,
        }),
      });
      setNotes('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const card = adminCardClass(isDark);
  const input = isDark
    ? 'w-full rounded-xl border border-[#32465b] bg-[#1c2a3a] px-3 py-2 text-sm text-white'
    : 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900';

  return (
    <BuyAdminLayout title="Satellite — buy.siz.land admin">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Satellite & EO</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Record a scene check against catalog coordinates. Sentinel Hub still powers plot imagery when configured; this page stores the operator result buyers can see on the deal.
          </p>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {loading ? (
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading…</p>
        ) : items.length === 0 ? (
          <div className={card}>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No listings yet</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className={card}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.fullAddress}</p>
                    <p className="mt-1 text-xs text-emerald-500">
                      {listingStatusLabel(item.status)}
                      {item.latitude != null && item.longitude != null
                        ? ` · ${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`
                        : ' · no coordinates'}
                      {item.satelliteStatus ? ` · ${item.satelliteStatus}` : ''}
                    </p>
                    {item.satelliteNotes && (
                      <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.satelliteNotes}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(openId === item.id ? null : item.id);
                      setStatus((item.satelliteStatus as (typeof STATUSES)[number]) || 'STABLE');
                      setNotes(item.satelliteNotes || '');
                      setSceneDate(item.satelliteSceneDate ? item.satelliteSceneDate.slice(0, 10) : '');
                    }}
                    className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                  >
                    {openId === item.id ? 'Hide' : 'Record check'}
                  </button>
                </div>
                {openId === item.id && (
                  <form onSubmit={(e) => record(e, item.id)} className="mt-4 grid gap-2 sm:grid-cols-2">
                    <select className={input} value={status} onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                    <input type="date" className={input} value={sceneDate} onChange={(e) => setSceneDate(e.target.value)} />
                    <textarea
                      className={`${input} sm:col-span-2`}
                      placeholder="Notes the buyer can see"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 sm:col-span-2"
                    >
                      {saving ? 'Saving…' : 'Save satellite record'}
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </BuyAdminLayout>
  );
}
