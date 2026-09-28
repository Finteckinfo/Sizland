'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { BuyAdminLayout, adminCardClass } from '@/components/buy/buy-admin-layout';
import { landApi, type LandAuditEvent } from '@/lib/buy/land-api';

export default function AdminAuditPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [events, setEvents] = useState<LandAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await landApi<LandAuditEvent[]>('admin/audit');
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const card = adminCardClass(isDark);

  return (
    <BuyAdminLayout title="Audit — buy.siz.land admin">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Audit log</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Publishes, rejects, status moves, file uploads, satellite records, and diligence changes.
          </p>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {loading ? (
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading…</p>
        ) : events.length === 0 ? (
          <div className={card}>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No events yet</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {events.map((event) => (
              <li key={event.id} className={card}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{event.summary}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {event.action} · {event.entityType} · {event.entityId}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BuyAdminLayout>
  );
}
