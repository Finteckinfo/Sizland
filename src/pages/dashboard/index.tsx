'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { Map, Upload, Handshake, Bell, ArrowRight, Loader2 } from 'lucide-react';
import { BuyDashboardLayout } from '@/components/buy/buy-dashboard-layout';
import {
  dealStatusLabel,
  landApi,
  listingStatusLabel,
  type LandDeal,
  type LandListing,
  type LandNotification,
} from '@/lib/buy/land-api';
import { fetchLandAdminAccess, shouldStayOnClientDashboard } from '@/lib/buy/land-admin';

export default function BuyDashboardHome() {
  const router = useRouter();
  const { isReady, query, replace } = router;
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [deals, setDeals] = useState<LandDeal[]>([]);
  const [submissions, setSubmissions] = useState<LandListing[]>([]);
  const [notes, setNotes] = useState<LandNotification[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    let cancelled = false;
    (async () => {
      if (!shouldStayOnClientDashboard(query) && (await fetchLandAdminAccess())) {
        if (!cancelled) await replace('/admin');
        return;
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isReady, query, replace]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      try {
        const [d, s, n] = await Promise.all([
          landApi<LandDeal[]>('deals').catch(() => []),
          landApi<LandListing[]>('submissions').catch(() => []),
          landApi<LandNotification[]>('notifications').catch(() => []),
        ]);
        if (cancelled) return;
        setDeals(Array.isArray(d) ? d : []);
        setSubmissions(Array.isArray(s) ? s : []);
        setNotes(Array.isArray(n) ? n : []);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const card = isDark
    ? 'rounded-2xl border border-[#1f2f3f] bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)] p-5'
    : 'rounded-2xl border border-[#e5efe7] bg-white p-5';

  const unread = notes.filter((n) => !n.read).length;
  const pendingUploads = submissions.filter((s) => s.status === 'PENDING_VETTING').length;
  const activeDeals = deals.filter((d) => d.status !== 'CANCELLED' && d.status !== 'COMPLETED');

  const markRead = async (note: LandNotification) => {
    if (!note.read) {
      await landApi('notifications/read', { method: 'PATCH', body: JSON.stringify({ ids: [note.id] }) }).catch(() => null);
      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, read: true } : n)));
    }
  };

  if (!ready) {
    return (
      <BuyDashboardLayout title="Overview — buy.siz.land">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </BuyDashboardLayout>
    );
  }

  return (
    <BuyDashboardLayout title="Overview — buy.siz.land">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Overview</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Select a catalog asset to start a deal. Uploads go to admin vetting before they publish.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/dashboard/deals" className={card}>
            <Handshake className="mb-3 h-6 w-6 text-emerald-500" />
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>My deals</p>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {activeDeals.length === 0 ? 'No active deals.' : `${activeDeals.length} active deal${activeDeals.length === 1 ? '' : 's'}.`}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-500">
              Open <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link href="/dashboard/catalog" className={card}>
            <Map className="mb-3 h-6 w-6 text-emerald-500" />
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Catalog</p>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Browse published land and start a deal.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-500">
              Browse <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link href="/dashboard/upload" className={card}>
            <Upload className="mb-3 h-6 w-6 text-emerald-500" />
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Upload asset</p>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {pendingUploads === 0 ? 'Nothing in the vetting queue.' : `${pendingUploads} awaiting vetting.`}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-500">
              Submit <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className={card}>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent deals</h2>
            {deals.length === 0 ? (
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Confirmation starts only after you select an asset.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {deals.slice(0, 4).map((deal) => (
                  <li key={deal.id}>
                    <Link href={`/dashboard/deals/${deal.id}`} className="flex items-center justify-between gap-2 text-sm">
                      <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{deal.listing?.title || 'Deal'}</span>
                      <span className="text-xs text-emerald-500">{dealStatusLabel(deal.status)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={card}>
            <div className="flex items-center justify-between gap-2">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Updates</h2>
              <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                <Bell className="h-3.5 w-3.5" />
                {unread} unread
              </span>
            </div>
            {notes.length === 0 ? (
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No notifications yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {notes.slice(0, 5).map((note) => (
                  <li key={note.id}>
                    {note.href ? (
                      <Link href={note.href} onClick={() => markRead(note)} className="block">
                        <p className={`text-sm font-medium ${note.read ? (isDark ? 'text-gray-400' : 'text-gray-600') : isDark ? 'text-white' : 'text-gray-900'}`}>
                          {note.title}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{note.body}</p>
                      </Link>
                    ) : (
                      <button type="button" onClick={() => markRead(note)} className="block text-left">
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{note.title}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{note.body}</p>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={card}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Your uploads</h2>
          {submissions.length === 0 ? (
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No assets submitted for vetting yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {submissions.slice(0, 5).map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{item.title}</span>
                  <span className="text-xs text-emerald-500">{listingStatusLabel(item.status)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/dashboard/upload" className="mt-4 inline-block text-sm font-medium text-emerald-500 hover:underline">
            Go to uploads
          </Link>
        </div>
      </div>
    </BuyDashboardLayout>
  );
}
