'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { BuyDashboardLayout } from '@/components/buy/buy-dashboard-layout';
import {
  DEAL_PIPELINE,
  dealStatusLabel,
  landApi,
  type LandDeal,
} from '@/lib/buy/land-api';

function pipelineIndex(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 5;
    case 'REGISTRY_TRANSFER':
      return 4;
    case 'EXECUTION':
      return 3;
    case 'ESCROW_CREATED':
    case 'ESCROW_FUNDED':
      return 2;
    case 'DUE_DILIGENCE':
      return 1;
    default:
      return 0;
  }
}

export default function DashboardDealDetailPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const id = typeof router.query.id === 'string' ? router.query.id : '';

  const [deal, setDeal] = useState<LandDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settling, setSettling] = useState(false);

  const load = async (dealId: string) => {
    const data = await landApi<LandDeal>(`deals/${dealId}`);
    setDeal(data);
  };

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        await load(id);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load deal');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const step = useMemo(() => (deal ? pipelineIndex(deal.status) : 0), [deal]);
  const canPilotSettle =
    !!deal &&
    ['PLOT_SELECTED', 'DUE_DILIGENCE', 'ESCROW_CREATED'].includes(deal.status) &&
    !deal.escrowFundedAt;

  const card = isDark
    ? 'rounded-2xl border border-[#1f2f3f] bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)] p-5'
    : 'rounded-2xl border border-[#e5efe7] bg-white p-5';

  const onPilotSettle = async () => {
    if (!deal) return;
    setSettling(true);
    setError('');
    try {
      await landApi('escrow', {
        method: 'POST',
        body: JSON.stringify({
          requestId: deal.id,
          escrowId: `sizwallet-pilot-${deal.id}`,
          escrowAmount: deal.listing?.listPrice ?? undefined,
          funded: true,
        }),
      });
      await load(deal.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Settlement failed');
    } finally {
      setSettling(false);
    }
  };

  return (
    <BuyDashboardLayout title="Deal — buy.siz.land">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/dashboard/deals" className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
          ← My deals
        </Link>

        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {deal && (
          <>
            <div className={card}>
              <p className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {dealStatusLabel(deal.status)}
              </p>
              <h1 className={`mt-1 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {deal.listing?.title || 'Selected asset'}
              </h1>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {deal.listing?.fullAddress || deal.listing?.description || '—'}
              </p>
              {deal.listing?.listPrice != null && (
                <p className="mt-3 text-xl font-semibold text-emerald-500">
                  {deal.listing.currency || 'USD'} {Number(deal.listing.listPrice).toLocaleString()}
                </p>
              )}
            </div>

            {deal.status !== 'CANCELLED' && (
              <ol className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                {DEAL_PIPELINE.map((item, i) => (
                  <li
                    key={item.key}
                    className={`rounded-xl px-2 py-2 text-center text-[11px] font-semibold ${
                      i <= step
                        ? 'bg-emerald-500 text-white'
                        : isDark
                          ? 'bg-[#1c2a3a] text-gray-400'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {item.label}
                  </li>
                ))}
              </ol>
            )}

            <div className={card}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Due diligence</h2>
              <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Reports and agreements appear here after admin review.
              </p>
              {!deal.documents?.length ? (
                <p className={`mt-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No documents yet.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {deal.documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{doc.type}</span>
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-emerald-500 hover:underline">
                        Open
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={card}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settlement</h2>
              <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Live on-chain escrow is not in this pilot. Record a SizWallet settlement stub when diligence is underway.
              </p>
              {deal.escrowFundedAt ? (
                <p className="mt-4 text-sm font-medium text-emerald-500">
                  Settlement recorded {new Date(deal.escrowFundedAt).toLocaleString()}
                  {deal.escrowId ? ` · ${deal.escrowId}` : ''}
                </p>
              ) : canPilotSettle ? (
                <button
                  type="button"
                  onClick={onPilotSettle}
                  disabled={settling}
                  className="mt-4 w-full rounded-full bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                >
                  {settling ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Record pilot settlement'}
                </button>
              ) : (
                <p className={`mt-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Settlement opens after the asset is selected and diligence begins.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </BuyDashboardLayout>
  );
}
