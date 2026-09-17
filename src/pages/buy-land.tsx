'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import { PageLayout } from '@/components/page-layout';
import { Loader2, Check, MapPin, Shield, Search, FileCheck, Wallet, FileText } from 'lucide-react';
import Image from 'next/image';
import AuroraText from '@/components/ui/aurora-text';
import { fetchLandAdminAccess } from '@/lib/buy/land-admin';

type Step = 'LOGIN' | 'CREATE_REQUEST';

const STEPS: { key: Step; label: string }[] = [
  { key: 'LOGIN', label: 'Sign in' },
  { key: 'CREATE_REQUEST', label: 'Your details' },
];

const OPEN_FORM_KEY = 'sizland_buy_open_form';

function hasCompletedIntake(req: { contactName?: string | null; contactEmail?: string | null; purpose?: string | null } | null | undefined) {
  return !!(req?.contactName && req?.contactEmail && req?.purpose);
}

const PURPOSE_OPTIONS = ['Farming', 'Speculation', 'Residential', 'Commercial', 'Investment', 'Other'];


export default function BuyLandPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resolvedTheme: theme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('LOGIN');
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [plotReference, setPlotReference] = useState('N/A');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || showForm || intakeComplete) return;
    let cancelled = false;
    (async () => {
      const admin = await fetchLandAdminAccess();
      if (!cancelled) router.replace(admin ? '/admin' : '/dashboard');
    })();
    return () => {
      cancelled = true;
    };
  }, [status, showForm, intakeComplete, router]);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/land/progress', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const req = data.request;
        setRequest(req);
        setCurrentStep('CREATE_REQUEST');
        if (req) {
          if (req.contactName) setContactName(req.contactName);
          if (req.contactEmail) setContactEmail(req.contactEmail);
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

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('Please accept the Terms and Conditions');
      return;
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim());
    if (!contactName.trim() || !emailOk) {
      setError('Please provide a valid name and email');
      return;
    }
    try {
      const data = await api('create-request', {
        method: 'POST',
        body: JSON.stringify({
          contactName: contactName.trim(),
          contactEmail: contactEmail.trim(),
          purpose: purpose || 'Farming',
          plotReference: plotReference || 'N/A',
        }),
      });
      setRequest(data.request);
      setIntakeComplete(true);
    } catch {
      // Error already shown in the form
    }
  };

  useEffect(() => {
    if (!intakeComplete) return;
    const t = window.setTimeout(() => {
      router.push('/dashboard');
    }, 1600);
    return () => window.clearTimeout(t);
  }, [intakeComplete, router]);

  const canSubmitRequest =
    !!contactName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim()) &&
    !!purpose &&
    termsAccepted &&
    !loading;

  if (!mounted) return null;

  if (status === 'authenticated' && !showForm && !intakeComplete) {
    return (
      <PageLayout title="Dashboard - Sizland" requireAuth={false}>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </PageLayout>
    );
  }

  const cardClass = isDark
    ? 'bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)] border-[#1f2f3f]'
    : 'bg-[linear-gradient(180deg,#f3fff7_0%,#ffffff_100%)] border-[#e5efe7]';
  const wizardStep: Step = 'CREATE_REQUEST';

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
          const idx = STEPS.findIndex((x) => x.key === wizardStep);
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

        {intakeComplete ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
              <Check className="h-7 w-7 text-emerald-500" />
            </div>
            <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>You’re in</h2>
            <p className={`text-sm max-w-md mx-auto mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Your details are saved. Browse available land in the catalog. You’ll confirm a request when you select an asset.
            </p>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full py-3.5 rounded-full font-semibold text-white bg-emerald-500 hover:bg-emerald-600"
            >
              Go to dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateRequest}>
            <h2 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your details</h2>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Tell us your intended use and how we can reach you. Budget and size can be filtered later while browsing.</p>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g., Jay"
                  className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-[#1c2a3a] border-[#32465b] text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                />
                <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  For communication only — legal names are collected during later processing.
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@example.com"
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
                disabled={!canSubmitRequest}
                className="w-full py-3.5 rounded-full font-semibold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Continue to catalog'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );

  const handleStartLandRequest = () => {
    if (status === 'unauthenticated') {
      try {
        sessionStorage.setItem(OPEN_FORM_KEY, '1');
      } catch {
        // ignore
      }
      const callback =
        typeof window !== 'undefined'
          ? `${window.location.origin}/dashboard`
          : 'https://buy.siz.land/dashboard';
      router.push(`/auth-choice?callbackUrl=${encodeURIComponent(callback)}`);
      return;
    }
    void fetchLandAdminAccess().then((admin) => {
      router.push(admin ? '/admin' : '/dashboard');
    });
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
        <section className="relative flex items-start">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-10 md:pt-4 md:pb-14 text-center">
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
                {status === 'authenticated' ? 'Go to dashboard' : 'Start a Land Request'}
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className={`px-8 py-4 rounded-lg font-bold border-2 transition-colors ${isDark ? 'text-white border-white/80 hover:bg-white/10' : 'text-gray-900 border-gray-800 hover:bg-gray-100'}`}
              >
                How it Works
              </button>
              <button
                onClick={() => router.push(status === 'authenticated' ? '/dashboard/catalog' : '/catalog')}
                className={`px-8 py-4 rounded-lg font-bold border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 transition-colors ${isDark ? 'dark:text-emerald-400' : ''}`}
              >
                Explore catalog
              </button>
            </div>
            <p className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Link href="/catalog" className="font-medium text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400">
                Browse published listings (satellite map)
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
                { icon: Search, title: 'Share your details', desc: 'Tell us your intended use and how we can reach you. Then browse the catalog and select an asset when you’re ready.', highlight: false },
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
