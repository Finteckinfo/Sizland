'use client';

import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { BuyDashboardLayout } from '@/components/buy/buy-dashboard-layout';
import { ThemeToggler } from '@/components/ui/theme-toggler';

export default function DashboardSettingsPage() {
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <BuyDashboardLayout title="Settings — buy.siz.land">
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1>

        <section
          className={`flex items-center justify-between rounded-2xl border p-5 ${
            isDark ? 'border-[#1f2f3f] bg-[#141f2d]' : 'border-[#e5efe7] bg-white'
          }`}
        >
          <div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Appearance</p>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Light, dark, or system</p>
          </div>
          <ThemeToggler />
        </section>

        <section
          className={`rounded-2xl border p-5 ${
            isDark ? 'border-[#1f2f3f] bg-[#141f2d]' : 'border-[#e5efe7] bg-white'
          }`}
        >
          <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Account</p>
          <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {session?.user?.authType === 'sizwallet' ? 'Signed in with SizWallet' : session?.user?.email || 'Signed in'}
          </p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/buy-land' })}
            className="mt-4 rounded-full border-2 border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-500 hover:bg-emerald-500/10"
          >
            Sign out
          </button>
        </section>

        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          {' · '}
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
        </p>
      </div>
    </BuyDashboardLayout>
  );
}
