'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { useWallet } from '@txnlab/use-wallet-react';
import { PageLayout } from '@/components/page-layout';
import { Loader2, Check, X, MapPin, Shield, Search, FileCheck, Wallet, FileText } from 'lucide-react';
import Image from 'next/image';
import AuroraText from '@/components/ui/aurora-text';

type Step = 'LOGIN' | 'CONNECT_WALLET' | 'CREATE_REQUEST' | 'CONFIRMATION';

const STEPS: { key: Step; label: string }[] = [
  { key: 'LOGIN', label: 'Login' },
  { key: 'CONNECT_WALLET', label: 'Connect Wallet' },
  { key: 'CREATE_REQUEST', label: 'Create Request' },
  { key: 'CONFIRMATION', label: 'Confirmation' },
];

const PURPOSE_OPTIONS = ['Farming', 'Speculation', 'Residential', 'Commercial', 'Investment', 'Other'];


export default function BuyLandPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resolvedTheme: theme } = useTheme();
  const { activeAccount } = useWallet();
  // Pilot mode should be enabled by default for showcases.
  // Only disable if explicitly set to "false".
  const isPilotEscrow = (process.env.NEXT_PUBLIC_PILOT_ESCROW ?? 'true') !== 'false';

  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('LOGIN');
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [budget, setBudget] = useState('');
  const [sizeCurve, setSizeCurve] = useState('');
  const [purpose, setPurpose] = useState('');
  const [plotReference, setPlotReference] = useState('N/A');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pilotEscrowSimulated, setPilotEscrowSimulated] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      setCurrentStep('CONNECT_WALLET');
      fetchProgress();
    }
  }, [status, router]);

  useEffect(() => {
    if (activeAccount?.address) {
      setWalletAddress(activeAccount.address);
    }
  }, [activeAccount]);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/land/progress', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const req = data.request;
        setRequest(req);
        const pilotIds = Array.isArray(req?.pilotEscrowPlotIds) ? req.pilotEscrowPlotIds : [];
        if (isPilotEscrow && (req?.escrowId || pilotIds.length > 0)) setPilotEscrowSimulated(true);
        if (req?.currentStep) {
          setCurrentStep(req.currentStep);
        }
        if (req) {
          setShowForm(true);
          if (req.walletAddress) setWalletAddress(req.walletAddress);
          if (req.budget != null) setBudget(String(req.budget));
          if (req.sizeCurve) setSizeCurve(req.sizeCurve);
          if (req.purpose) setPurpose(req.purpose);
          if (req.plotReference) setPlotReference(req.plotReference);
        }
      }
    } catch {
      // ignore
    }
  };

  const api = async (path: string, init?: RequestInit) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/land/${path}`, {
        ...init,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...init?.headers },
        body: init?.body ?? (init?.method !== 'GET' ? undefined : undefined),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    const addr = walletAddress.trim() || activeAccount?.address;
    if (!addr) {
      setError('Please connect your wallet or enter an address');
      return;
    }
    const data = await api('connect-wallet', {
      method: 'PATCH',
      body: JSON.stringify({ walletAddress: addr }),
    });
    setRequest(data.request);
    setCurrentStep('CREATE_REQUEST');
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('Please accept the Terms and Conditions');
      return;
    }
    const data = await api('create-request', {
      method: 'POST',
      body: JSON.stringify({
        walletAddress: request?.walletAddress || walletAddress.trim() || activeAccount?.address,
        budget: parseFloat(budget) || 0,
        sizeCurve: sizeCurve || '1 Acre',
        purpose: purpose || 'Farming',
        plotReference: plotReference || 'N/A',
      }),
    });
    setRequest(data.request);
    setCurrentStep('CONFIRMATION');
  };

  const handleSelectPlot = async () => {
    if (!selectedPlotId || !request?.id) return;

    // Pilot mode: simulate successful escrow funding without requiring wallet funds.
    if (isPilotEscrow) {
      setPilotEscrowSimulated(true);
      setRequest((prev: any) => {
        const prevIds = Array.isArray(prev?.pilotEscrowPlotIds) ? prev.pilotEscrowPlotIds : [];
        const nextIds = Array.from(new Set([...prevIds, selectedPlotId]));
        return {
          ...prev,
          pilotEscrowPlotIds: nextIds,
          // Keep old flag for compatibility with UI expecting a single escrowId.
          escrowId: prev?.escrowId || `PILOT_ESCROW_${nextIds.length}`,
        };
      });
      return;
    }

    await api('select-plot', {
      method: 'POST',
      body: JSON.stringify({ requestId: request.id, plotId: selectedPlotId }),
    });
    fetchProgress();
  };

  if (!mounted) return null;

  const pilotEscrowPlotIds: string[] = Array.isArray((request as any)?.pilotEscrowPlotIds)
    ? (request as any).pilotEscrowPlotIds
    : [];
  const escrowCreatedCount =
    pilotEscrowPlotIds.length > 0 ? pilotEscrowPlotIds.length : request?.escrowId ? 1 : 0;
  const isSelectedPlotFunded =
    !!selectedPlotId && pilotEscrowPlotIds.includes(selectedPlotId);
  const disableFundButton =
    !selectedPlotId ||
    loading ||
    (isPilotEscrow ? isSelectedPlotFunded : !!request?.escrowId);

  const cardClass = isDark
    ? 'bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)] border-[#1f2f3f]'
    : 'bg-[linear-gradient(180deg,#f3fff7_0%,#ffffff_100%)] border-[#e5efe7]';

  const renderFormContent = () => (
    <>
      <div className="mb-10">
        <h2 className={`text-4xl sm:text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Buy verified land in Africa{' '}
          <AuroraText className="inline">without being on the ground.</AuroraText>
        </h2>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Complete the steps below to start your land acquisition journey.
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 mb-12">
        {STEPS.map((s, i) => {
          const idx = STEPS.findIndex((x) => x.key === currentStep);
          const done = i < idx;
          const active = i === idx;
          return (
            <div key={s.key} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  done ? 'bg-emerald-500 border-emerald-500 text-white'
                    : active ? 'border-emerald-500 text-emerald-500'
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

      <div className={`p-8 rounded-2xl shadow-xl border ${cardClass}`}>
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {currentStep === 'CONNECT_WALLET' && (
          <div>
            <h2 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Connect Wallet</h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Connect your wallet seamlessly.</p>
            <div className="space-y-4">
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[#1c2a3a] border-[#32465b] text-white' : 'bg-white border-gray-200 text-gray-900'}`}
              />
              <button
                onClick={handleConnectWallet}
                disabled={loading || !walletAddress.trim()}
                className="w-full py-3.5 rounded-full font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Connect Wallet'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 'CREATE_REQUEST' && (
          <form onSubmit={handleCreateRequest}>
            <h2 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Request</h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tell us more about your land needs.</p>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Budget</label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="$100,000"
                  className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[#1c2a3a] border-[#32465b] text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Size</label>
                <input
                  type="text"
                  value={sizeCurve}
                  onChange={(e) => setSizeCurve(e.target.value)}
                  placeholder="1 Acre"
                  className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[#1c2a3a] border-[#32465b] text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[#1c2a3a] border-[#32465b] text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                >
                  <option value="">Select purpose</option>
                  {PURPOSE_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Plot Reference (optional)</label>
                <input
                  type="text"
                  value={plotReference}
                  onChange={(e) => setPlotReference(e.target.value)}
                  placeholder="N/A"
                  className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[#1c2a3a] border-[#32465b] text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="rounded border-gray-300 text-emerald-500" />
                <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>I agree to the Terms and Conditions.</span>
              </label>
              <button
                type="submit"
                disabled={loading || !purpose}
                className="w-full py-3.5 rounded-full font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit'}
              </button>
            </div>
          </form>
        )}

        {currentStep === 'CONFIRMATION' && request && (
          <div>
            <h2 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirmation</h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your request has been successfully created. We&apos;ll be in touch shortly.</p>
            <div className="space-y-6">
              {pilotEscrowSimulated && (
                <div className="mx-auto w-fit rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  Funded (Pilot) · Escrow created ({escrowCreatedCount})
                </div>
              )}
              <div>
                <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Request Summary</h3>
                <div className={`rounded-lg p-4 ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Wallet</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{request.walletAddress ? `${request.walletAddress.slice(0, 6)}...${request.walletAddress.slice(-4)}` : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Budget</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>${request.budget?.toLocaleString() ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Size</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{request.sizeCurve ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Purpose</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{request.purpose ?? '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Plot Ref</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{request.plotReference ?? 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Your Confirmation</h3>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: 'Request created', done: true },
                    { label: 'Plot found', done: request.status === 'PLOT_FOUND' || request.plots?.length > 0 },
                    {
                      label: escrowCreatedCount > 0 ? `Escrow created (${escrowCreatedCount})` : 'Escrow created',
                      done: escrowCreatedCount > 0,
                    },
                    {
                      label: 'Due diligence',
                      done:
                        request.status === 'DUE_DILIGENCE' ||
                        request.status === 'EXECUTION' ||
                        request.status === 'REGISTRY_TRANSFER' ||
                        request.status === 'COMPLETED' ||
                        (Array.isArray(request.documents) && request.documents.length > 0),
                    },
                    { label: 'Ownership transfer', done: request.status === 'REGISTRY_TRANSFER' || request.status === 'COMPLETED' },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center gap-2">
                      {item.done ? <Check className="w-5 h-5 text-emerald-500" /> : <X className="w-5 h-5 text-gray-400" />}
                      <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {Array.isArray(request.documents) && request.documents.length > 0 && (
                <div>
                  <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Due diligence evidence
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {request.documents.map((doc: any) => (
                      <li key={doc.id} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <div className="flex flex-col">
                          <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                            {doc.type || 'DOCUMENT'}
                          </span>
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={`text-xs ${isDark ? 'text-emerald-300' : 'text-emerald-700'} hover:underline`}
                            >
                              Open file
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {request.plots?.length > 0 ? (
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Choose Your Plot</h3>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Verified plots sourced by Sizland. Select one to proceed.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {request.plots.map((plot: any) => (
                      <button
                        key={plot.id}
                        type="button"
                        onClick={() => setSelectedPlotId(plot.id)}
                        className={`text-left rounded-xl border-2 p-4 transition-all ${selectedPlotId === plot.id ? 'border-emerald-500 ring-2 ring-emerald-500/30' : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-gray-800 relative">
                          {(plot as any).latitude != null && (plot as any).longitude != null && (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/90 text-white z-10">
                              Satellite-Verified
                            </span>
                          )}
                          {isPilotEscrow && pilotEscrowPlotIds.includes(plot.id) && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/90 text-white z-10">
                              Funded
                            </span>
                          )}
                          {((plot as any).images?.[0]?.url || (plot as any).satelliteVerification?.imageryUrl) ? (
                            <Image
                              src={((plot as any).images?.[0]?.url || (plot as any).satelliteVerification?.imageryUrl) as string}
                              alt={plot.name}
                              width={200}
                              height={120}
                              className="w-full h-full object-cover"
                              unoptimized={!!(plot as any).satelliteVerification?.imageryUrl}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500"><MapPin className="w-8 h-8" /></div>
                          )}
                        </div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{plot.name}</p>
                        <p className={`text-xs flex items-center gap-1 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}><MapPin className="w-3 h-3" />{plot.fullAddress}</p>
                        {plot.escrowAmount && <p className="text-sm font-medium text-emerald-500 mt-2">${plot.escrowAmount.toLocaleString()}</p>}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleSelectPlot}
                    disabled={disableFundButton}
                    className="w-full py-4 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : isPilotEscrow && isSelectedPlotFunded ? (
                      'Escrow created (Pilot)'
                    ) : (
                      `Fund Escrow for Selected Plot ${
                        selectedPlotId
                          ? `($${request.plots.find((p: any) => p.id === selectedPlotId)?.escrowAmount?.toLocaleString() || '5,000'})`
                          : ''
                      }`
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Choose Your Plot</h3>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Verified plots sourced by Sizland. Select one to proceed.</p>
                  <button
                    onClick={() => router.push('/lands')}
                    className="w-full py-3 rounded-xl font-semibold text-emerald-500 border-2 border-emerald-500 hover:bg-emerald-500/10"
                  >
                    View Available Lands →
                  </button>
                </div>
              )}
              <button
                onClick={() => router.push('/lobby')}
                className="w-full py-3 rounded-full font-semibold text-emerald-500 border-2 border-emerald-500 hover:bg-emerald-500/10"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const handleStartLandRequest = () => {
    if (status === 'unauthenticated') {
      const callback = typeof window !== 'undefined' && window.location.hostname === 'buy.siz.land'
        ? 'https://buy.siz.land'
        : 'https://siz.land/buy-land';
      router.push(`/auth-choice?callbackUrl=${encodeURIComponent(callback)}`);
      return;
    }
    setShowForm(true);
  };

  // Form view: show only the form when user clicks "Start a Land Request"
  if (showForm && status === 'authenticated') {
    return (
      <PageLayout
        title="Buy Land - Sizland | Invest in African Land From Anywhere"
        description="Satellite-verified land acquisition with blockchain escrow, legal due diligence, and EU Space data trust. Invest in African land from anywhere."
        requireAuth={false}
      >
        <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setShowForm(false)}
              className={`inline-flex items-center text-sm mb-6 ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              ← Back to landing
            </button>
            {renderFormContent()}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Buy Land - Sizland | Invest in African Land From Anywhere"
      description="Satellite-verified land acquisition with blockchain escrow, legal due diligence, and EU Space data trust. Invest in African land from anywhere."
      requireAuth={false}
    >
      <div className="w-full">
        {/* Hero Section - no bg (layout provides it) */}
        <section className="relative min-h-[70vh] flex items-center">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Invest in African Land From <AuroraText className="inline">Anywhere in Europe</AuroraText>
            </h1>
            <p className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>
              Satellite-verified land acquisition with blockchain escrow, legal due diligence, and EU Space data trust.
              Invest from anywhere with our Africa-based team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartLandRequest}
                className="px-8 py-4 rounded-lg font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
              >
                {request ? 'Continue your request' : 'Start a Land Request'}
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className={`px-8 py-4 rounded-lg font-bold border-2 transition-colors ${isDark ? 'text-white border-white/80 hover:bg-white/10' : 'text-gray-900 border-gray-800 hover:bg-gray-100'}`}
              >
                How it Works
              </button>
            </div>
            <p className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Link href="/browse-land" className="font-medium text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400">
                Browse published land listings (map previews)
              </Link>
            </p>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl p-8 bg-emerald-500 text-white">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-4">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-2">Legal Due Diligence</h3>
              <p className="text-emerald-50">
                Local experts conduct legal searches, site visits, and deliver comprehensive reports before you commit.
              </p>
            </div>
            <div className={`rounded-2xl p-8 border ${isDark ? 'bg-gray-800/80 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Escrow Protected</h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Your funds remain in escrow with a trusted legal custodian. Only $2,000 reserved for initial due diligence.
              </p>
            </div>
            <div className={`rounded-2xl p-8 border ${isDark ? 'bg-gray-800/80 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">EU Satellite-Verified</h3>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Copernicus and Galileo data verify land status. Trust-as-a-Service for remote investors.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className={`text-3xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>How It Works</h2>
            <p className={`text-center max-w-2xl mx-auto mb-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              From initial inquiry to complete ownership, each feature is designed to ensure a smooth, simple, fast, and powerful process.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Search, title: 'Define Your Requirements', desc: 'Tell us your budget, land size and intended use. Our local sources will find properties that match your criteria.', highlight: false },
                { icon: FileCheck, title: 'Review & Due Diligence', desc: 'Our experts review legal checks. A licensed surveyor conducts property searches and on-ground site visits.', highlight: true },
                { icon: Wallet, title: 'Secure the Purchase', desc: 'Once approved, funds are released from secure Sizland managed escrow. Payment, statutory fees, and document custody handled.', highlight: false },
                { icon: FileText, title: 'Registry Transfer & Delivery', desc: 'Track the title transfer at the national land registry. Once issued, the title is securely shipped to your address.', highlight: false },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className={`rounded-2xl p-6 ${item.highlight ? 'bg-emerald-500 text-white' : isDark ? 'bg-gray-800/80 border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${item.highlight ? 'bg-white/20' : 'bg-emerald-500/20'}`}>
                      <Icon className={`w-6 h-6 ${item.highlight ? 'text-white' : 'text-emerald-500'}`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className={item.highlight ? 'text-emerald-50' : isDark ? 'text-gray-300' : 'text-gray-600'}>{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* We Remove the Risk - image LEFT, text RIGHT */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 w-full order-2 lg:order-1 flex justify-center lg:justify-start">
              <div className="w-full max-w-md aspect-square relative rounded-2xl overflow-hidden">
                <Image
                  src="/pictureinaddedherosection.jpg"
                  alt="Sizland ERP - Land Investment"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex-1 order-1 lg:order-2">
              <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                We Remove the Risk from <AuroraText className="inline">Remote Land Buying</AuroraText>
              </h2>
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Buying land remotely feels risky when initial verification is weak. Sizland replaces uncertainty with a controlled legal process.
              </p>
              <ul className="space-y-4">
                {['Safe and easy off-site setup', 'Sizland acts as the single trusted counterparty', 'All documents are held in legal escrow', 'Every step is visible in your dashboard', 'The land acquisition done the institutional way.'].map((item) => (
                  <li key={item} className={`flex items-center gap-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    <Check className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
