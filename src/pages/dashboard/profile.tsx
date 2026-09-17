'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { BuyDashboardLayout } from '@/components/buy/buy-dashboard-layout';

const PURPOSE_OPTIONS = ['Farming', 'Speculation', 'Residential', 'Commercial', 'Investment', 'Other'];

const inputClass = (isDark: boolean) =>
  `w-full rounded-xl border px-4 py-3 ${
    isDark ? 'border-[#32465b] bg-[#1c2a3a] text-white' : 'border-gray-200 bg-white text-gray-900'
  }`;

export default function DashboardProfilePage() {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user?.name && !contactName) setContactName(session.user.name.split(' ')[0] || session.user.name);
    if (session?.user?.email && !contactEmail) setContactEmail(session.user.email);
  }, [session, contactName, contactEmail]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/land/progress', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const req = data.request;
        if (req?.contactName) setContactName(req.contactName);
        if (req?.contactEmail) setContactEmail(req.contactEmail);
        if (req?.purpose) setPurpose(req.purpose);
      } catch {
        // ignore
      }
    })();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/land/create-request', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          purpose: purpose || 'Other',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save profile');
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BuyDashboardLayout title="Profile — buy.siz.land">
      <div className="mx-auto max-w-xl">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile</h1>
        <p className={`mt-2 mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Contact details for follow-up. SizWallet login stays separate — we do not take addresses from OIDC.
        </p>
        <form
          onSubmit={onSubmit}
          className={`space-y-4 rounded-2xl border p-6 ${
            isDark ? 'border-[#1f2f3f] bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)]' : 'border-[#e5efe7] bg-white'
          }`}
        >
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input className={inputClass(isDark)} value={contactName} onChange={(e) => setContactName(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              className={inputClass(isDark)}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Purpose</label>
            <select className={inputClass(isDark)} value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              <option value="">Select purpose</option>
              {PURPOSE_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Signed in as {session?.user?.authType === 'sizwallet' ? 'SizWallet' : session?.user?.email || 'your account'}.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Save profile'}
          </button>
          {saved && <p className="text-center text-sm text-emerald-500">Saved.</p>}
        </form>
      </div>
    </BuyDashboardLayout>
  );
}
