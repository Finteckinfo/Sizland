'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Handshake, Loader2 } from 'lucide-react';
import { BuyDashboardLayout } from '@/components/buy/buy-dashboard-layout';
import { dealStatusLabel, landApi, type LandDeal } from '@/lib/buy/land-api';

export default function DashboardDealsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [deals, setDeals] = useState<LandDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await landApi<LandDeal[]>('deals');
        if (!cancelled) setDeals(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load deals');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const card = isDark
    ? 'rounded-2xl border border-[#1f2f3f] bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)] p-5'
    : 'rounded-2xl border border-[#e5efe7] bg-white p-5';

  return (
    <BuyDashboardLayout title="My deals — buy.siz.land">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My deals</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            A deal starts when you select a catalog asset. Intake without a listing is contact only.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && deals.length === 0 && (
          <div className={card}>
            <Handshake className="mb-3 h-8 w-8 text-emerald-500" />
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No deals yet</p>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Browse the catalog and select an asset to confirm a deal.
            </p>
            <Link href="/dashboard/catalog" className="mt-4 inline-block text-sm font-medium text-emerald-500 hover:underline">
              Open catalog
            </Link>
          </div>
        )}
        <ul className="space-y-3">
          {deals.map((deal) => (
            <li key={deal.id}>
              <Link href={`/dashboard/deals/${deal.id}`} className={`block ${card} transition hover:border-emerald-500/50`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {deal.listing?.title || 'Selected asset'}
                    </p>
                    <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {deal.listing?.fullAddress || '—'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                    {dealStatusLabel(deal.status)}
                  </span>
                </div>
                <p className={`mt-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {deal.documents?.length || 0} diligence file{(deal.documents?.length || 0) === 1 ? '' : 's'}
                  {deal.listing?.listPrice != null
                    ? ` · ${deal.listing.currency || 'USD'} ${Number(deal.listing.listPrice).toLocaleString()}`
                    : ''}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </BuyDashboardLayout>
  );
}
