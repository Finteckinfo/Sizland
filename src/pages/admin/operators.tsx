'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { BuyAdminLayout, adminCardClass } from '@/components/buy/buy-admin-layout';

type User = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isLandAdmin?: boolean;
  createdAt?: string;
};

export default function AdminOperatorsPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [siteAdmin, setSiteAdmin] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = async (p = 1, search = query) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(p), limit: '50' });
      if (search.trim()) params.set('search', search.trim());
      const resp = await fetch(`/api/admin/users?${params}`, { credentials: 'include' });
      const data = await resp.json().catch(() => ({}));
      if (resp.status === 403) {
        setSiteAdmin(false);
        setUsers([]);
        return;
      }
      if (!resp.ok) throw new Error(data?.error || 'Failed to load operators');
      setSiteAdmin(true);
      setUsers(data.users || []);
      setTotal(data.pagination?.total ?? null);
      setPage(data.pagination?.page ?? p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    void fetchUsers(1);
  };

  const setLandAdmin = async (userId: string, isLandAdmin: boolean) => {
    setTogglingId(userId);
    try {
      const resp = await fetch(`/api/admin/users/${userId}/land-admin`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLandAdmin }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Failed to update');
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isLandAdmin } : u)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setTogglingId(null);
    }
  };

  const card = adminCardClass(isDark);

  return (
    <BuyAdminLayout title="Operators — buy.siz.land">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Operators</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Land admin is a directory flag on the Sizland user, not a wallet privilege. SizWallet users show as pairwise ids.
          </p>
        </div>

        {!siteAdmin ? (
          <div className={card}>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Site-admin API required</p>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              You can operate vetting and deals with <code className="text-emerald-500">isLandAdmin</code>. Granting other
              operators still uses the site-admin users API (<code>ADMIN_EMAILS</code>). Until that is keyed by SizWallet id,
              toggle <code>User.isLandAdmin</code> in Postgres after the person has signed in once.
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={onSearch} className="flex gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or email"
                className={`flex-1 rounded-xl border px-4 py-2 text-sm ${
                  isDark ? 'border-[#32465b] bg-[#1c2a3a] text-white' : 'border-gray-200 bg-white text-gray-900'
                }`}
              />
              <button type="submit" className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white">
                Search
              </button>
            </form>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className={`overflow-x-auto ${card} p-0`}>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    <th className="px-4 py-3 text-left font-medium">ID</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Land admin</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className={isDark ? 'border-t border-[#1f2f3f]' : 'border-t border-gray-100'}>
                      <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs">{u.id}</td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">{`${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={togglingId === u.id}
                          onClick={() => setLandAdmin(u.id, !u.isLandAdmin)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            u.isLandAdmin ? 'bg-emerald-500 text-white' : isDark ? 'bg-[#1c2a3a] text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {togglingId === u.id ? '…' : u.isLandAdmin ? 'Yes' : 'No'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-gray-500">
                        {loading ? 'Loading…' : 'No users'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1 || loading} onClick={() => fetchUsers(page - 1)} className="text-sm text-emerald-500">
                Prev
              </button>
              <button
                type="button"
                disabled={loading || (total !== null && page * 50 >= total)}
                onClick={() => fetchUsers(page + 1)}
                className="text-sm text-emerald-500"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </BuyAdminLayout>
  );
}
