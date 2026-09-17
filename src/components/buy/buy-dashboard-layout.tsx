'use client';

import { ReactNode, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  Map,
  Upload,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
} from 'lucide-react';
import AuthWrapper from '@/components/auth-wrapper';
import GlowBackground from '@/components/ui/GlowBackground';
import AnimatedGrid from '@/components/ui/AnimatedGrid';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/catalog', label: 'Catalog', icon: Map },
  { href: '/dashboard/upload', label: 'Upload asset', icon: Upload },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BuyDashboardLayout({
  children,
  title = 'Dashboard — buy.siz.land',
  description = 'Browse land, upload assets, and manage your Sizland buy account.',
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { resolvedTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const isDark = resolvedTheme === 'dark';
  const label =
    session?.user?.name?.trim() ||
    session?.user?.email?.trim() ||
    'SizWallet';

  const navClass = (href: string) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
      isActive(router.pathname, href)
        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
        : isDark
          ? 'text-gray-300 hover:bg-white/5 hover:text-white'
          : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-800'
    }`;

  const shell = (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <div className="relative min-h-screen text-on-surface">
        <GlowBackground />
        <AnimatedGrid />
        {open && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform md:translate-x-0 ${
            open ? 'translate-x-0' : '-translate-x-full'
          } ${
            isDark
              ? 'border-[#1f2f3f] bg-[#0c1a22]/95 backdrop-blur-xl'
              : 'border-emerald-100 bg-white/95 backdrop-blur-xl'
          }`}
        >
          <div className="flex items-center gap-3 px-5 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Sizland Buy</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Client dashboard</p>
            </div>
            <button
              type="button"
              className="ml-auto rounded-lg p-1 md:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navClass(item.href)}
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={`border-t px-4 py-4 ${isDark ? 'border-[#1f2f3f]' : 'border-gray-100'}`}>
            <p className={`mb-3 truncate text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {label}
            </p>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/buy-land' })}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                isDark ? 'text-gray-400 hover:bg-white/5 hover:text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="relative z-10 md:pl-64">
          <header
            className={`sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3 md:hidden ${
              isDark ? 'border-[#1f2f3f] bg-[#0c1a22]/90 backdrop-blur-xl' : 'border-emerald-100 bg-white/90 backdrop-blur-xl'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg p-2"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Sizland Buy</span>
          </header>
          <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </>
  );

  return <AuthWrapper>{shell}</AuthWrapper>;
}
