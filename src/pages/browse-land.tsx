'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { PageLayout } from '@/components/page-layout';
import { Loader2 } from 'lucide-react';

/** Legacy route — catalog Explorer is the unified map/list experience. */
export default function BrowseLandRedirect() {
  const router = useRouter();

  useEffect(() => {
    const id = router.query.id;
    const qs = id ? `?id=${encodeURIComponent(String(Array.isArray(id) ? id[0] : id))}` : '';
    router.replace(`/catalog${qs}`);
  }, [router]);

  return (
    <PageLayout title="Browse land — Sizland" requireAuth={false}>
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    </PageLayout>
  );
}
