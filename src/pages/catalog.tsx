'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';
import { PageLayout } from '@/components/page-layout';
import { CatalogExplorer } from '@/components/buy/catalog-explorer';

export default function CatalogPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;
    const q = router.asPath.includes('?') ? router.asPath.slice(router.asPath.indexOf('?')) : '';
    router.replace(`/dashboard/catalog${q}`);
  }, [status, router]);

  if (status === 'authenticated' || status === 'loading') {
    return (
      <PageLayout title="Catalog — buy.siz.land" requireAuth={false}>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Catalog — buy.siz.land"
      description="Explore satellite-mapped land and Sizland commodities."
      requireAuth={false}
    >
      <CatalogExplorer />
    </PageLayout>
  );
}
