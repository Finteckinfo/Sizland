import React, { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';

type User = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  walletAddress?: string | null;
  isLandAdmin?: boolean;
  createdAt?: string;
};

const AdminUsersPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const setLandAdmin = async (userId: string, isLandAdmin: boolean) => {
    setTogglingId(userId);
    try {
      const resp = await fetch(`/api/admin/users/${userId}/land-admin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLandAdmin }),
      });
      if (!resp.ok) {
        const d = await resp.json().catch(() => ({}));
        throw new Error(d?.error || 'Failed to update');
      }
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isLandAdmin } : u)));
    } catch (e: any) {
      setError(e.message || 'Failed to update land admin');
    } finally {
      setTogglingId(null);
    }
  };

  const fetchUsers = async (p = page) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(p),
        limit: String(limit),
      });
      if (query) params.set('search', query);

      const resp = await fetch(`/api/admin/users?${params.toString()}`);

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.error || `${resp.status} ${resp.statusText}`);
      }

      const data = await resp.json();
      setUsers(data.users || []);
      setTotal(data.pagination?.total ?? null);
      setPage(data.pagination?.page ?? p);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch users');
      setUsers([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      setError('You must be logged in to access this page');
    }
  }, [status]);

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Admin - Users</h1>
        <Link href="/admin/land" style={{ color: '#2563eb', textDecoration: 'none' }}>Land Admin →</Link>
      </div>

      {status === 'loading' && <p>Loading session...</p>}

      {status === 'unauthenticated' && (
        <div>
          <p>You must be logged in to view this page.</p>
          <button onClick={() => signIn()}>Sign In</button>
        </div>
      )}

      {status === 'authenticated' && (
        <>
          <p>
            Logged in as: {session?.user?.email}
          </p>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6 }}>Search users (name or email)</label>
            <input
              style={{ width: '70%', padding: 8, marginRight: 8 }}
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={() => fetchUsers(1)} disabled={loading} style={{ padding: '8px 12px' }}>
              {loading ? 'Loading...' : 'Fetch'}
            </button>
          </div>

          {error && (
            <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
          )}

          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>ID</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Email</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Name</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Wallet</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Land Admin</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{u.id}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{u.email}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{`${u.firstName || ''} ${u.lastName || ''}`.trim() || '-'}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{u.walletAddress || '-'}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                      <button
                        onClick={() => setLandAdmin(u.id, !u.isLandAdmin)}
                        disabled={togglingId === u.id}
                        style={{
                          padding: '4px 8px',
                          fontSize: 12,
                          background: u.isLandAdmin ? '#22c55e' : '#e5e7eb',
                          color: u.isLandAdmin ? 'white' : '#374151',
                          border: 'none',
                          borderRadius: 4,
                          cursor: togglingId === u.id ? 'wait' : 'pointer',
                        }}
                      >
                        {togglingId === u.id ? '...' : u.isLandAdmin ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 8 }}>
                      {loading ? 'Loading...' : 'No users to display. Click Fetch to load results.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                if (page > 1) fetchUsers(page - 1);
              }}
              disabled={page <= 1 || loading}
            >
              Prev
            </button>
            <button
              onClick={() => {
                fetchUsers(page + 1);
              }}
              disabled={total !== null && page * limit >= (total || 0) || loading}
            >
              Next
            </button>

            <div style={{ marginLeft: 'auto' }}>
              {total !== null && <span>Page {page} — {total} users total</span>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsersPage;
