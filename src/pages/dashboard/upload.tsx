'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { BuyDashboardLayout } from '@/components/buy/buy-dashboard-layout';
import { filesToPayload, landApi, listingStatusLabel, openLandFile, type LandListing } from '@/lib/buy/land-api';

const inputClass = (isDark: boolean) =>
  `w-full rounded-xl border px-4 py-3 ${
    isDark ? 'border-[#32465b] bg-[#1c2a3a] text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;

export default function DashboardUploadPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<'LAND' | 'COMMODITY'>('LAND');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<LandListing[]>([]);

  const load = async () => {
    const data = await landApi<LandListing[]>('submissions');
    setItems(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load().catch(() => setItems([]));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;
    setSaving(true);
    setError('');
    try {
      const payloadFiles = files.length ? await filesToPayload(files, kind === 'LAND' ? 'TITLE' : 'OTHER') : [];
      await landApi('submissions', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          kind,
          location: location.trim(),
          description: description.trim(),
          askingPrice: askingPrice.trim(),
          latitude: lat.trim() || undefined,
          longitude: lng.trim() || undefined,
          files: payloadFiles,
        }),
      });
      await load();
      setTitle('');
      setLocation('');
      setDescription('');
      setAskingPrice('');
      setLat('');
      setLng('');
      setFiles([]);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BuyDashboardLayout title="Upload asset — buy.siz.land">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section
          className={`rounded-2xl border p-6 ${
            isDark ? 'border-[#1f2f3f] bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)]' : 'border-[#e5efe7] bg-white'
          }`}
        >
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Onboard an asset</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Files are stored in the database and go to the vetting queue. Nothing is public until an operator publishes it.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input className={inputClass(isDark)} value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select className={inputClass(isDark)} value={kind} onChange={(e) => setKind(e.target.value as 'LAND' | 'COMMODITY')}>
                <option value="LAND">Land</option>
                <option value="COMMODITY">Commodity</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Location / address</label>
              <input className={inputClass(isDark)} value={location} onChange={(e) => setLocation(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Latitude (optional)</label>
                <input className={inputClass(isDark)} value={lat} onChange={(e) => setLat(e.target.value)} placeholder="-1.29" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Longitude (optional)</label>
                <input className={inputClass(isDark)} value={lng} onChange={(e) => setLng(e.target.value)} placeholder="36.82" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                className={`${inputClass(isDark)} min-h-[100px]`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Asking price (optional)</label>
              <input className={inputClass(isDark)} value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} placeholder="USD 50,000" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Supporting files (up to 5, 5MB each)</label>
              <input
                type="file"
                multiple
                className={`w-full text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
              {files.length > 0 && (
                <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {files.map((f) => f.name).join(', ')}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={saving || !title.trim() || !location.trim()}
              className="w-full rounded-full bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {saving ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Submit for vetting'}
            </button>
            {saved && <p className="text-center text-sm text-emerald-500">Submitted. Admin will review it.</p>}
          </form>
        </section>

        <section>
          <h2 className={`mb-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Your submissions</h2>
          {items.length === 0 ? (
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Nothing in the queue yet.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={`rounded-xl border p-4 ${isDark ? 'border-[#32465b] bg-[#1c2a3a]/60' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</p>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                      {listingStatusLabel(item.status)}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.fullAddress}</p>
                  <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {item.kind || 'LAND'} · {new Date(item.createdAt).toLocaleString()}
                    {item.files?.length ? ` · ${item.files.length} file${item.files.length === 1 ? '' : 's'}` : ''}
                  </p>
                  {item.files?.length ? (
                    <ul className="mt-2 space-y-1">
                      {item.files.map((file) => (
                        <li key={file.id}>
                          <button
                            type="button"
                            onClick={() => openLandFile(file.id).catch((err) => setError(err.message))}
                            className="text-xs text-emerald-500 hover:underline"
                          >
                            {file.filename}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {item.status === 'REJECTED' && item.rejectionReason && (
                    <p className="mt-2 text-xs text-red-500">{item.rejectionReason}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </BuyDashboardLayout>
  );
}
