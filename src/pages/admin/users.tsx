import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2 } from 'lucide-react';

export default function AdminUsersRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/operators');
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
    </div>
  );
}
