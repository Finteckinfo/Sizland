/**
 * Buy-scoped auth return URLs — keep users in the land acquisition context.
 */

const BUY_HOSTS = new Set(['buy.siz.land', 'www.buy.siz.land']);

const ALLOWED_RELATIVE_PREFIXES = [
  '/buy-land',
  '/lands',
  '/browse-land',
  '/catalog',
  '/lobby',
  '/admin/land',
  '/admin/users',
  '/solutions',
  '/ratecard',
  '/wallet-auth',
  '/auth-choice',
  '/login',
  '/signup',
];

export function isBuyHostname(hostname: string | null | undefined): boolean {
  if (!hostname) return false;
  const h = hostname.split(':')[0].toLowerCase();
  return BUY_HOSTS.has(h) || h.endsWith('.buy.siz.land');
}

export function defaultBuyCallbackUrl(): string {
  if (typeof window !== 'undefined' && isBuyHostname(window.location.hostname)) {
    return `${window.location.origin}/buy-land`;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/buy-land`;
  }
  return 'https://buy.siz.land/buy-land';
}

/** Read callbackUrl from Next router query (string | string[]). */
export function callbackFromQuery(query: Record<string, string | string[] | undefined>): string | null {
  const raw = query.callbackUrl ?? query.callback_url ?? query.redirect;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && typeof value === 'string' ? value : null;
}

export function appendCallbackParam(path: string, callbackUrl: string | null | undefined): string {
  if (!callbackUrl) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

function isAllowedRelativePath(pathname: string): boolean {
  if (pathname === '/') return true;
  return ALLOWED_RELATIVE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Safe post-auth destination. Honors buy/catalog callbacks; defaults to /lobby
 * when no valid callback is provided (main-site behaviour).
 */
export function resolveAuthRedirect(url: string, baseUrl: string): string {
  const lobby = `${baseUrl}/lobby`;

  try {
    if (url.startsWith('/') && !url.startsWith('//')) {
      const pathOnly = url.split('?')[0];
      if (!isAllowedRelativePath(pathOnly)) return lobby;
      return `${baseUrl}${url}`;
    }

    const parsed = new URL(url);
    const base = new URL(baseUrl);

    const host = parsed.hostname.toLowerCase();
    const isSizland =
      host === 'siz.land' ||
      host.endsWith('.siz.land') ||
      host === base.hostname ||
      host === 'localhost' ||
      host === '127.0.0.1';

    if (!isSizland) return lobby;

    if (!isAllowedRelativePath(parsed.pathname)) {
      // Absolute buy origin root is fine
      if (isBuyHostname(host) && (parsed.pathname === '/' || parsed.pathname === '')) {
        return parsed.toString();
      }
      return lobby;
    }

    return parsed.toString();
  } catch {
    return lobby;
  }
}

/** Client helper after credentials sign-in (redirect: false). */
export function clientPostAuthPath(callbackUrl: string | null | undefined): string {
  if (!callbackUrl) return '/lobby';
  try {
    if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) {
      return isAllowedRelativePath(callbackUrl.split('?')[0]) ? callbackUrl : '/lobby';
    }
    const u = new URL(callbackUrl);
    if (isBuyHostname(u.hostname) || u.hostname.endsWith('.siz.land') || u.hostname === 'siz.land') {
      return callbackUrl;
    }
  } catch {
    /* ignore */
  }
  return '/lobby';
}
