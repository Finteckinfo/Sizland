'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { PageLayout } from '@/components/page-layout';
import { MapPin, Loader2, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';

const PURPOSE_OPTIONS = ['Farming', 'Speculation', 'Residential', 'Commercial', 'Investment', 'Other'];

type Plot = {
  id: string;
  name: string;
  fullAddress: string;
  description?: string | null;
  escrowAmount?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  images?: { url: string; order?: number }[];
  satelliteVerification?: {
    imageryUrl?: string | null;
    hasVerified?: boolean;
  } | null;
};

export default function LandsPage() {
  const router = useRouter();
  const { status } = useSession();
  const { resolvedTheme: theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [request, setRequest] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [sizeCurve, setSizeCurve] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchProgress = (search?: string, maxEscrow?: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (maxEscrow != null && !isNaN(maxEscrow)) params.set('maxEscrow', String(maxEscrow));
    return fetch(`/api/land/progress${params.toString() ? `?${params}` : ''}`, { credentials: 'include' });
  };

  const loadProgress = async (search?: string, maxEscrow?: number) => {
    try {
      const res = await fetchProgress(search, maxEscrow);
      if (res.ok) {
        const data = await res.json();
        setRequest(data.request);
        setPlots(data.request?.plots ?? []);
        if (!budget && data.request?.budget != null) setBudget(String(data.request.budget));
        if (!sizeCurve && data.request?.sizeCurve) setSizeCurve(data.request.sizeCurve);
        if (!purpose && data.request?.purpose) setPurpose(data.request.purpose);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      setLoading(true);
      loadProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once when auth becomes ready; filters call loadProgress explicitly
  }, [status]);

  const handleApplyFilters = async () => {
    const search = searchQuery.trim();
    const maxEscrow = budget ? parseFloat(budget) : NaN;
    setSaveLoading(true);
    try {
      if (request?.id && (budget || sizeCurve || purpose)) {
        const res = await fetch('/api/land/update-criteria', {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            budget: budget ? parseFloat(budget) || undefined : undefined,
            sizeCurve: sizeCurve || undefined,
            purpose: purpose || undefined,
          }),
        });
        if (!res.ok) throw new Error('Failed to update');
      }
      setLoading(true);
      await loadProgress(search, isNaN(maxEscrow) ? undefined : maxEscrow);
      setShowFilters(false);
    } catch {
      setLoading(false);
    } finally {
      setSaveLoading(false);
    }
  };

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
      if (res.ok) await loadProgress(searchQuery, budget ? parseFloat(budget) : undefined);
    } finally {
      setActionLoading(false);
    }
  };

  if (!mounted) return null;

  if (status === 'unauthenticated') {
    const callback = typeof window !== 'undefined' && window.location.hostname === 'buy.siz.land'
      ? 'https://buy.siz.land/lands'
      : `${typeof window !== 'undefined' ? window.location.origin : ''}/lands`;
    router.replace(`/auth-choice?callbackUrl=${encodeURIComponent(callback)}`);
    return null;
  }

  return (
    <PageLayout
      title="Choose Your Plot - Sizland | Verified Land in Africa"
      description="Browse verified land plots sourced by Sizland. Select a plot to proceed with escrow."
      requireAuth={false}
    >
      <div className="w-full min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Title & Subtitle */}
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Choose Your Plot
          </h1>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Verified plots sourced by Sizland. Select one to proceed.
          </p>

          {/* Filters — hidden during sourcing (no plots) */}
          {plots.length > 0 && (
          <div className={`rounded-xl border p-4 mb-8 ${isDark ? 'bg-[#0f2d29]/50 border-[#1f2f3f]' : 'bg-gray-50 border-gray-200'}`}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              {showFilters ? 'Hide filters' : 'Update your criteria & filters'}
            </button>
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Location search</label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter location"
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-[#1c2a3a] border-[#32465b] text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Max budget ($)</label>
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 100000"
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-[#1c2a3a] border-[#32465b] text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Size</label>
                  <input
                    type="text"
                    value={sizeCurve}
                    onChange={(e) => setSizeCurve(e.target.value)}
                    placeholder="e.g. 1 Acre"
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-[#1c2a3a] border-[#32465b] text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Purpose</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-[#1c2a3a] border-[#32465b] text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                  >
                    <option value="">Select purpose</option>
                    {PURPOSE_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-4">
                  <button
                    onClick={handleApplyFilters}
                    disabled={saveLoading || loading}
                    className="px-6 py-2.5 rounded-lg font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {saveLoading || loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply filters'}
                  </button>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
          ) : plots.length === 0 ? (
            <div
              className={`py-20 rounded-2xl border text-center px-6 ${
                isDark
                  ? 'bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)] border-[#1f2f3f]'
                  : 'bg-[linear-gradient(180deg,#f3fff7_0%,#ffffff_100%)] border-[#e5efe7]'
              }`}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
              <p className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Request Received & Expert Sourcing Initiated
              </p>
              <p className={`mt-3 max-w-lg mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Our property experts have received your criteria. We are currently manually vetting viable plots that
                match your budget and purpose. You will receive an update with curated options in less than 48 hours.
              </p>
              <button
                onClick={() => router.push('/buy-land')}
                className="mt-6 px-6 py-3 rounded-full font-semibold text-emerald-500 border-2 border-emerald-500 hover:bg-emerald-500/10"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {plots.map((plot) => (
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
                      {(plot.latitude != null && plot.longitude != null) && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/90 text-white z-10">
                          Satellite-Verified
                        </span>
                      )}
                      {(plot.images?.[0]?.url || (plot as any).satelliteVerification?.imageryUrl) ? (
                        <Image
                          src={(plot.images?.[0]?.url as string) || ((plot as any).satelliteVerification?.imageryUrl as string)}
                          alt={plot.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized={!!(plot as any).satelliteVerification?.imageryUrl}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plot.name}</p>
                      <p className={`text-sm flex items-center gap-1 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
