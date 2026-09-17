'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { BuyDashboardLayout } from '@/components/buy/buy-dashboard-layout';
import {
  listAssetSubmissions,
  saveAssetSubmission,
  type AssetKind,
  type AssetSubmission,
} from '@/lib/buy/asset-submissions';

const inputClass = (isDark: boolean) =>
  `w-full rounded-xl border px-4 py-3 ${
    isDark ? 'border-[#32465b] bg-[#1c2a3a] text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;

export default function DashboardUploadPage() {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const userId = session?.user?.id || '';

  const [title, setTitle] = useState('');
  const [kind, setKind] = useState<AssetKind>('LAND');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [askingPrice, setAskingPrice] = useState('');
  const [fileName, setFileName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [items, setItems] = useState<AssetSubmission[]>([]);

  useEffect(() => {
    if (userId) setItems(listAssetSubmissions(userId));
  }, [userId]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!userId || !title.trim() || !location.trim()) return;
    setSaving(true);
    const next = saveAssetSubmission(userId, {
      title: title.trim(),
      kind,
      location: location.trim(),
      description: description.trim(),
      askingPrice: askingPrice.trim(),
      fileName: fileName.trim(),
    });
    setItems(listAssetSubmissions(userId));
    setTitle('');
    setLocation('');
    setDescription('');
    setAskingPrice('');
    setFileName('');
    setSaved(true);
    setSaving(false);
    window.setTimeout(() => setSaved(false), 2500);
    void next;
  };

  return (
    <BuyDashboardLayout title="Upload asset — buy.siz.land">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section
          className={`rounded-2xl border p-6 ${
            isDark ? 'border-[#1f2f3f] bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)]' : 'border-[#e5efe7] bg-white'
          }`}
        >
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Upload an asset</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Submit land or a related offering. It will sit in <strong>pending vetting</strong> until review is enabled.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input className={inputClass(isDark)} value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select className={inputClass(isDark)} value={kind} onChange={(e) => setKind(e.target.value as AssetKind)}>
                <option value="LAND">Land</option>
                <option value="COMMODITY">Commodity</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Location / address</label>
              <input className={inputClass(isDark)} value={location} onChange={(e) => setLocation(e.target.value)} required />
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
              <label className="mb-1 block text-sm font-medium">Supporting file (optional)</label>
              <input
                type="file"
                className={`w-full text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
              />
              <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Files are recorded by name for now. Full document custody comes with vetting.
              </p>
            </div>
            <button
              type="submit"
              disabled={saving || !title.trim() || !location.trim()}
              className="w-full rounded-full bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {saving ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Submit for vetting'}
            </button>
            {saved && <p className="text-center text-sm text-emerald-500">Submitted. Pending vetting.</p>}
          </form>
        </section>

        <section>
          <h2 className={`mb-4 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pending vetting</h2>
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
                      Pending vetting
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.location}</p>
                  <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {item.kind} · {new Date(item.createdAt).toLocaleString()}
                    {item.fileName ? ` · ${item.fileName}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </BuyDashboardLayout>
  );
}
