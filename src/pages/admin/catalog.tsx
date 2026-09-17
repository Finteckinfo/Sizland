'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { BuyAdminLayout, adminCardClass } from '@/components/buy/buy-admin-layout';
import { listingStatusLabel } from '@/lib/buy/land-api';

type Listing = {
  id: string;
  title: string;
  description?: string | null;
  fullAddress: string;
  listPrice?: number | null;
  currency?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  kind?: string;
  region?: string | null;
  status: string;
};

const inputClass = (isDark: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm ${
    isDark ? 'border-[#32465b] bg-[#1c2a3a] text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;

export default function AdminCatalogPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('KES');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [region, setRegion] = useState('Africa');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/land/admin/catalog/listings', { credentials: 'include' });
      const data = await resp.json().catch(() => []);
      if (!resp.ok) throw new Error(data?.error || 'Failed to load catalog');
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

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const resp = await fetch('/api/land/admin/catalog/listings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          fullAddress: address.trim(),
          description: description.trim() || undefined,
          listPrice: price.trim() ? Number(price) : undefined,
          currency,
          latitude: lat.trim() ? Number(lat) : undefined,
          longitude: lng.trim() ? Number(lng) : undefined,
          region,
          status,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Failed to create listing');
      setTitle('');
      setAddress('');
      setDescription('');
      setPrice('');
      setLat('');
      setLng('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    const resp = await fetch(`/api/land/admin/catalog/listings/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!resp.ok) {
      setError('Delete failed');
      return;
    }
    await load();
  };

  const card = adminCardClass(isDark);

  return (
    <BuyAdminLayout title="Catalog — buy.siz.land admin">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Catalog inventory</h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Listings here are what buyers can select. Client uploads appear only after vetting.
            </p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {loading ? (
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading…</p>
          ) : items.length === 0 ? (
            <div className={card}>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No inventory yet</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((L) => (
                <li key={L.id} className={card}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{L.title}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{L.fullAddress}</p>
                      <p className="mt-1 text-xs text-emerald-500">
                        {listingStatusLabel(L.status)}
                        {L.listPrice != null ? ` · ${L.currency || 'USD'} ${L.listPrice.toLocaleString()}` : ''}
                        {L.region ? ` · ${L.region}` : ''}
                      </p>
                    </div>
                    <button type="button" onClick={() => remove(L.id)} className="text-xs text-red-500 hover:underline">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={onCreate} className={card}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add listing</h2>
          <div className="mt-4 space-y-3">
            <input className={inputClass(isDark)} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input className={inputClass(isDark)} placeholder="Full address" value={address} onChange={(e) => setAddress(e.target.value)} required />
            <textarea className={inputClass(isDark)} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input className={inputClass(isDark)} placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
              <input className={inputClass(isDark)} placeholder="Currency" value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputClass(isDark)} placeholder="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
              <input className={inputClass(isDark)} placeholder="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
            <select className={inputClass(isDark)} value={region} onChange={(e) => setRegion(e.target.value)}>
              {['Africa', 'Europe', 'Americas', 'Gulf', 'Asia-Pacific'].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select className={inputClass(isDark)} value={status} onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save listing'}
            </button>
          </div>
        </form>
      </div>
    </BuyAdminLayout>
  );
}
