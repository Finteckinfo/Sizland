'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { ArrowRight, ClipboardCheck, Handshake, Map, Wallet } from 'lucide-react';
import { BuyAdminLayout, adminCardClass } from '@/components/buy/buy-admin-layout';
import { dealStatusLabel, listingStatusLabel } from '@/lib/buy/land-api';

type Deal = {
  id: string;
  status: string;
  listingId?: string | null;
  listing?: { title?: string } | null;
  createdAt: string;
};

type Listing = {
  id: string;
  title: string;
  status: string;
  submittedByUserId?: string | null;
};

export default function AdminOverviewPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [deals, setDeals] = useState<Deal[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [submissions, setSubmissions] = useState<Listing[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [r, l, s] = await Promise.all([
        fetch('/api/land/admin/requests', { credentials: 'include' }).then((res) => res.json()).catch(() => []),
        fetch('/api/land/admin/catalog/listings', { credentials: 'include' }).then((res) => res.json()).catch(() => []),
        fetch('/api/land/admin/submissions', { credentials: 'include' }).then((res) => res.json()).catch(() => []),
      ]);
      if (cancelled) return;
      setDeals(Array.isArray(r) ? r : []);
      setListings(Array.isArray(l) ? l : []);
      setSubmissions(Array.isArray(s) ? s : []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const card = adminCardClass(isDark);
  const pendingVetting = submissions.filter((x) => x.status === 'PENDING_VETTING');
  const activeDeals = deals.filter((d) => d.listingId && d.status !== 'COMPLETED' && d.status !== 'CANCELLED');
  const published = listings.filter((x) => x.status === 'PUBLISHED');
  const reserved = listings.filter((x) => x.status === 'RESERVED');

  return (
    <BuyAdminLayout title="Admin overview — buy.siz.land">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Overview</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Confirm listings, run diligence on selected assets, then settle. Intake without a listing is a contact, not a deal.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/vetting" className={card}>
            <ClipboardCheck className="mb-3 h-6 w-6 text-emerald-500" />
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{pendingVetting.length}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Awaiting vetting</p>
          </Link>
          <Link href="/admin/deals" className={card}>
            <Handshake className="mb-3 h-6 w-6 text-emerald-500" />
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeDeals.length}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active deals</p>
          </Link>
          <Link href="/admin/catalog" className={card}>
            <Map className="mb-3 h-6 w-6 text-emerald-500" />
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{published.length}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Published listings</p>
          </Link>
          <Link href="/admin/settlement" className={card}>
            <Wallet className="mb-3 h-6 w-6 text-emerald-500" />
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{reserved.length}</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Reserved (in deal)</p>
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className={card}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Queue</h2>
              <Link href="/admin/vetting" className="inline-flex items-center gap-1 text-sm text-emerald-500">
                Vetting <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {pendingVetting.length === 0 ? (
              <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No client uploads waiting.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {pendingVetting.slice(0, 5).map((item) => (
                  <li key={item.id} className="flex justify-between gap-2 text-sm">
                    <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{item.title}</span>
                    <span className="text-xs text-amber-500">{listingStatusLabel(item.status)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className={card}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent deals</h2>
              <Link href="/admin/deals" className="inline-flex items-center gap-1 text-sm text-emerald-500">
                Deals <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {activeDeals.length === 0 ? (
              <p className={`mt-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No deals until a buyer selects a listing.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {activeDeals.slice(0, 5).map((deal) => (
                  <li key={deal.id} className="flex justify-between gap-2 text-sm">
                    <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{deal.listing?.title || 'Deal'}</span>
                    <span className="text-xs text-emerald-500">{dealStatusLabel(deal.status)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </BuyAdminLayout>
  );
}
