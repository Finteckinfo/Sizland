import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

/** Old bookmark: land admin now lives in the admin dashboard. */
export default function AdminLandRedirect() {
  const router = useRouter();
  const ready = router.isReady;
  const satisfy = typeof router.query.satisfy === 'string' ? router.query.satisfy : '';

  useEffect(() => {
    if (!ready) return;
    void router.replace(satisfy ? `/admin/deals?satisfy=${encodeURIComponent(satisfy)}` : '/admin');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot redirect
  }, [ready, satisfy]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  );
}
