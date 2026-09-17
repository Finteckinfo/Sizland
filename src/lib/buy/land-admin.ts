/** Land-admin probe used after login so operators land on /admin. */

export async function fetchLandAdminAccess(): Promise<boolean> {
  try {
    const res = await fetch('/api/land/admin/access', { credentials: 'include' });
    return res.ok;
  } catch {
    return false;
  }
}

export function clientDashboardHref() {
  return '/dashboard?view=client';
}

export function shouldStayOnClientDashboard(query: { view?: string | string[] }): boolean {
  const v = Array.isArray(query.view) ? query.view[0] : query.view;
  return v === 'client';
}
