'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { PageLayout } from '@/components/page-layout';
import { Check, MapPin, Loader2 } from 'lucide-react';
import Image from 'next/image';

type Step = 'LOGIN' | 'CONNECT_WALLET' | 'CREATE_REQUEST' | 'CONFIRMATION';

const STEPS: { key: Step; label: string }[] = [
  { key: 'LOGIN', label: 'Login' },
  { key: 'CONNECT_WALLET', label: 'Connect Wallet' },
  { key: 'CREATE_REQUEST', label: 'Create Request' },
  { key: 'CONFIRMATION', label: 'Confirmation' },
];

type Plot = {
  id: string;
  name: string;
  fullAddress: string;
  description?: string | null;
  escrowAmount?: number | null;
  images?: { url: string; order?: number }[];
};

export default function LandsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resolvedTheme: theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [request, setRequest] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<Step>('CONFIRMATION');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProgress();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/land/progress', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRequest(data.request);
        setPlots(data.request?.plots ?? []);
        if (data.request?.currentStep) {
          setCurrentStep(data.request.currentStep);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filteredPlots = plots.filter(
    (p) =>
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fullAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPlot = plots.find((p) => p.id === selectedPlotId);
  const escrowAmount = selectedPlot?.escrowAmount ?? 5000;

  const handleFundEscrow = async () => {
    if (!selectedPlotId || !request?.id) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/land/select-plot', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: request.id, plotId: selectedPlotId }),
      });
      if (res.ok) {
        await fetchProgress();
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (!mounted) return null;

  // Unauthenticated: redirect to auth
  if (status === 'unauthenticated') {
    const callback = typeof window !== 'undefined' && window.location.hostname === 'buy.siz.land'
      ? 'https://buy.siz.land/lands'
      : `${typeof window !== 'undefined' ? window.location.origin : ''}/lands`;
    router.replace(`/auth-choice?callbackUrl=${encodeURIComponent(callback)}`);
    return null;
  }

  return (
    <PageLayout
      title="Choose Your Plot - Sizland | Verified Land in Kenya"
      description="Browse verified land plots sourced by Sizland. Select a plot to proceed with escrow."
      requireAuth={false}
    >
      <div className="w-full min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Stepper */}
          <div className="flex items-center justify-between gap-2 mb-12">
            {STEPS.map((s, i) => {
              const idx = STEPS.findIndex((x) => x.key === currentStep);
              const done = i < idx;
              const active = i === idx;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      done
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : active
                          ? 'border-emerald-500 text-emerald-500'
                          : 'border-gray-400 text-gray-400'
                    }`}
                  >
                    {done ? <Check className="w-5 h-5" /> : i + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm font-medium hidden sm:inline ${
                      active ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${i < idx ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Title & Subtitle */}
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Choose Your Plot
          </h1>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Verified plots sourced by Sizland. Select one to proceed.
          </p>

          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Location"
            className={`w-full max-w-md px-4 py-3 rounded-xl border mb-10 ${
              isDark
                ? 'bg-[#1c2a3a] border-[#32465b] text-white placeholder-gray-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
          />

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
          ) : plots.length === 0 ? (
            <div
              className={`py-20 rounded-2xl border text-center ${
                isDark
                  ? 'bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)] border-[#1f2f3f]'
                  : 'bg-[linear-gradient(180deg,#f3fff7_0%,#ffffff_100%)] border-[#e5efe7]'
              }`}
            >
              <MapPin className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-xl font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No lands at the moment
              </p>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Plots matching your criteria will appear here once our team sources them.
              </p>
              <button
                onClick={() => router.push('/buy-land')}
                className="mt-6 px-6 py-3 rounded-full font-semibold text-emerald-500 border-2 border-emerald-500 hover:bg-emerald-500/10"
              >
                Back to Buy Land
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {filteredPlots.map((plot) => (
                  <button
                    key={plot.id}
                    type="button"
                    onClick={() => setSelectedPlotId(plot.id)}
                    className={`text-left rounded-xl overflow-hidden border-2 transition-all ${
                      selectedPlotId === plot.id
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : isDark
                          ? 'border-gray-600 hover:border-gray-500 bg-[#0f2d29]/50'
                          : 'border-gray-200 hover:border-gray-300 bg-white shadow-sm'
                    }`}
                  >
                    <div className="aspect-video relative bg-gray-800">
                      {plot.images?.[0]?.url ? (
                        <Image
                          src={plot.images[0].url}
                          alt={plot.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {plot.name}
                      </p>
                      <p
                        className={`text-sm flex items-center gap-1 mt-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        <MapPin className="w-4 h-4 shrink-0 text-emerald-500" />
                        {plot.fullAddress}
                      </p>
                      {plot.escrowAmount != null && (
                        <p className="text-sm font-medium text-emerald-500 mt-2">
                          ${plot.escrowAmount.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleFundEscrow}
                disabled={!selectedPlotId || actionLoading}
                className="w-full py-4 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
              >
                {actionLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  `Fund Escrow for Selected Plot ($${escrowAmount.toLocaleString()})`
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
