'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Map, Upload, User, ArrowRight } from 'lucide-react';
import { BuyDashboardLayout } from '@/components/buy/buy-dashboard-layout';
import { listAssetSubmissions } from '@/lib/buy/asset-submissions';

export default function BuyDashboardHome() {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [pending, setPending] = useState(0);
  const name = session?.user?.name?.trim() || session?.user?.email?.trim() || 'there';

  useEffect(() => {
    const id = session?.user?.id;
    if (id) setPending(listAssetSubmissions(id).length);
  }, [session?.user?.id]);

  const card = isDark
    ? 'rounded-2xl border border-[#1f2f3f] bg-[linear-gradient(180deg,#0f2d29_0%,#141f2d_100%)] p-5'
    : 'rounded-2xl border border-[#e5efe7] bg-white p-5';

  return (
    <BuyDashboardLayout title="Overview — buy.siz.land">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className={`text-2xl font-bold sm:text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {name}
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Browse published land, upload an asset for vetting, or update your profile.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/dashboard/catalog" className={card}>
            <Map className="mb-3 h-6 w-6 text-emerald-500" />
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Catalog</p>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Explore satellite-mapped listings.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-500">
              Open <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link href="/dashboard/upload" className={card}>
            <Upload className="mb-3 h-6 w-6 text-emerald-500" />
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Upload asset</p>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Submit land for review. Vetting comes later.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-500">
              Submit <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
          <Link href="/dashboard/profile" className={card}>
            <User className="mb-3 h-6 w-6 text-emerald-500" />
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile</p>
            <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              How we reach you and your intended use.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-500">
              Edit <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        <div className={card}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Your uploads</h2>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {pending === 0
              ? 'No assets waiting for vetting yet.'
              : `${pending} asset${pending === 1 ? '' : 's'} pending vetting.`}
          </p>
          <Link href="/dashboard/upload" className="mt-4 inline-block text-sm font-medium text-emerald-500 hover:underline">
            Go to uploads
          </Link>
        </div>
      </div>
    </BuyDashboardLayout>
  );
}
