import React, { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

type Plot = {
  id: string;
  name: string;
  fullAddress: string;
  description?: string | null;
  escrowAmount?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  satelliteVerification?: { imageryUrl?: string | null } | null;
};

type LandRequest = {
  id: string;
  userId: string;
  walletAddress?: string | null;
  budget?: number | null;
  sizeCurve?: string | null;
  purpose?: string | null;
  status: string;
  currentStep: string;
  user?: { id: string; email?: string; firstName?: string; lastName?: string };
  plots: Plot[];
  createdAt: string;
};

const AdminLandPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<LandRequest[]>([]);
  const [adminChecked, setAdminChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Add plot form
  const [submitting, setSubmitting] = useState(false);
  const [formRequestId, setFormRequestId] = useState('');
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formEscrow, setFormEscrow] = useState('');
  const [formLat, setFormLat] = useState('');
  const [formLng, setFormLng] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/land/admin/requests', { credentials: 'include' });
      if (!resp.ok) {
        if (resp.status === 403) {
          setAdminChecked(true);
          setRequests([]);
          router.replace('/lobby?error=land_admin_required');
          return;
        }
        const body = await resp.json().catch(() => ({}));
        throw new Error(body?.error || `${resp.status} ${resp.statusText}`);
      }
      const data = await resp.json();
      const list = Array.isArray(data) ? data : [];
      setRequests(list);
      setAdminChecked(true);
    } catch (e: any) {
      setAdminChecked(true);
      setError(e.message || 'Failed to fetch requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') fetchRequests();
  }, [status]);

  useEffect(() => {
    if (requests.length > 0 && !formRequestId) setFormRequestId(requests[0].id);
  }, [requests, formRequestId]);

  const addPlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const lat = formLat.trim() ? parseFloat(formLat) : undefined;
    const lng = formLng.trim() ? parseFloat(formLng) : undefined;
    if (lat != null && (isNaN(lat) || lat < -90 || lat > 90)) {
      setFormError('Latitude must be between -90 and 90');
      return;
    }
    if (lng != null && (isNaN(lng) || lng < -180 || lng > 180)) {
      setFormError('Longitude must be between -180 and 180');
      return;
    }
    if (!formRequestId || !formName.trim() || !formAddress.trim()) {
      setFormError('Request, name, and address are required');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch('/api/land/admin/plots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          requestId: formRequestId,
          name: formName.trim(),
          fullAddress: formAddress.trim(),
          description: formDesc.trim() || undefined,
          escrowAmount: formEscrow.trim() ? parseFloat(formEscrow) : undefined,
          latitude: lat,
          longitude: lng,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Failed to add plot');
      setFormName('');
      setFormAddress('');
      setFormDesc('');
      setFormEscrow('');
      setFormLat('');
      setFormLng('');
      fetchRequests();
    } catch (e: any) {
      setFormError(e.message || 'Failed to add plot');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (requestId: string, status: string) => {
    try {
      const resp = await fetch(`/api/land/admin/request/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!resp.ok) {
        const d = await resp.json().catch(() => ({}));
        throw new Error(d?.error || 'Failed to update');
      }
      fetchRequests();
    } catch (e: any) {
      setError(e.message || 'Failed to update status');
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Admin – Land Acquisition</h1>
        <Link href="/admin/users" style={{ color: '#2563eb', textDecoration: 'none' }}>← Users</Link>
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
          <p style={{ marginBottom: 16 }}>Logged in as: {session?.user?.email}</p>

          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

          {/* Add plot form */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 24, background: '#f9fafb' }}>
            <h3 style={{ marginTop: 0 }}>Add plot</h3>
            <form onSubmit={addPlot}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Request</label>
                  <select
                    value={formRequestId}
                    onChange={(e) => setFormRequestId(e.target.value)}
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d1d5db' }}
                  >
                    <option value="">Select request</option>
                    {requests.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.id.slice(0, 8)}… {r.user?.email || r.userId}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Name</label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Plot name"
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Full address</label>
                <input
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Full address"
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d1d5db' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Description (optional)</label>
                  <input
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Description"
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d1d5db' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Escrow amount (optional)</label>
                  <input
                    type="number"
                    value={formEscrow}
                    onChange={(e) => setFormEscrow(e.target.value)}
                    placeholder="e.g. 5000"
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Latitude (-90 to 90, optional)</label>
                  <input
                    type="text"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    placeholder="e.g. 51.5"
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d1d5db' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Longitude (-180 to 180, optional)</label>
                  <input
                    type="text"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    placeholder="e.g. -0.12"
                    style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #d1d5db' }}
                  />
                </div>
              </div>
              {formError && <div style={{ color: 'red', marginBottom: 8, fontSize: 14 }}>{formError}</div>}
              <button type="submit" disabled={submitting || loading} style={{ padding: '8px 16px', cursor: submitting ? 'wait' : 'pointer' }}>
                {submitting ? 'Adding…' : 'Add plot'}
              </button>
            </form>
          </div>

          {/* Requests list */}
          <h3>Requests</h3>
          {loading ? (
            <p>Loading…</p>
          ) : requests.length === 0 ? (
            <p>No requests. Create one from the buy-land flow.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {requests.map((r) => (
                <div key={r.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                  <div
                    style={{
                      padding: 12,
                      background: '#f3f4f6',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  >
                    <span>
                      <strong>{r.id.slice(0, 12)}…</strong> {r.user?.email || r.userId} — {r.status}
                    </span>
                    <span style={{ fontSize: 14 }}>{expandedId === r.id ? '▼' : '▶'}</span>
                  </div>
                  {expandedId === r.id && (
                    <div style={{ padding: 16 }}>
                      <p>Budget: {r.budget ?? '—'} | Size: {r.sizeCurve ?? '—'} | Purpose: {r.purpose ?? '—'}</p>
                      <p>Status: {r.status}</p>
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        style={{ marginBottom: 12, padding: 6 }}
                      >
                        <option value="REQUEST_CREATED">REQUEST_CREATED</option>
                        <option value="PLOT_FOUND">PLOT_FOUND</option>
                        <option value="PLOT_SELECTED">PLOT_SELECTED</option>
                        <option value="ESCROW_CREATED">ESCROW_CREATED</option>
                        <option value="ESCROW_FUNDED">ESCROW_FUNDED</option>
                        <option value="DUE_DILIGENCE">DUE_DILIGENCE</option>
                        <option value="EXECUTION">EXECUTION</option>
                        <option value="REGISTRY_TRANSFER">REGISTRY_TRANSFER</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                      <h4 style={{ marginTop: 16 }}>Plots</h4>
                      {r.plots?.length === 0 ? (
                        <p>No plots yet.</p>
                      ) : (
                        <ul style={{ paddingLeft: 20 }}>
                          {r.plots?.map((p) => (
                            <li key={p.id} style={{ marginBottom: 8 }}>
                              <strong>{p.name}</strong> — {p.fullAddress}
                              {p.latitude != null && p.longitude != null && (
                                <span style={{ color: '#059669', marginLeft: 8 }}>📍 {p.latitude}, {p.longitude}</span>
                              )}
                              {p.satelliteVerification?.imageryUrl && (
                                <span style={{ color: '#2563eb', marginLeft: 8 }}>🛰️ Satellite</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminLandPage;
