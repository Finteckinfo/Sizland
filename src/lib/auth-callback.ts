/**
 * Post-auth return URLs for siz.land and all product subdomains.
 * After sign-in, send the user back to the page they came from — never to
 * /auth-choice, /login, or /signup.
 */

const BUY_HOSTS = new Set(['buy.siz.land', 'www.buy.siz.land']);

const AUTH_PATHS = [
  '/auth-choice',
  '/login',
  '/signup',
  '/logout',
  '/sso-callback',
];

const CALLBACK_STORAGE_KEY = 'auth_callback_url';

export function isBuyHostname(hostname: string | null | undefined): boolean {
  if (!hostname) return false;
  const h = hostname.split(':')[0].toLowerCase();
  return BUY_HOSTS.has(h) || h.endsWith('.buy.siz.land');
}

export function defaultBuyCallbackUrl(): string {
  if (typeof window !== 'undefined' && isBuyHostname(window.location.hostname)) {
    return `${window.location.origin}/dashboard`;
  }
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/dashboard`;
  }
  return 'https://buy.siz.land/dashboard';
}

function isAuthPath(pathname: string): boolean {
  const p = (pathname.split('?')[0] || '/').replace(/\/+$/, '') || '/';
  return AUTH_PATHS.some((a) => p === a);
}

function isSizlandHost(hostname: string): boolean {
  const h = hostname.split(':')[0].toLowerCase();
  return (
    h === 'siz.land' ||
    h.endsWith('.siz.land') ||
    h === 'localhost' ||
    h === '127.0.0.1'
  );
}

/** Fallback when we do not know the previous page. */
export function defaultPostAuthPath(): string {
  if (typeof window === 'undefined') return '/lobby';
  const h = window.location.hostname.toLowerCase();
  const origin = window.location.origin;
  if (h.includes('buy.siz.land')) return `${origin}/dashboard`;
  if (h.includes('mytab.siz.land')) return `${origin}/`;
  if (h.includes('solutions.siz.land')) return `${origin}/solutions`;
  return '/lobby';
}

/**
 * Accept relative app paths and absolute siz.land URLs.
 * Reject auth pages, APIs, and off-site hosts (open-redirect guard).
 */
export function sanitizeReturnUrl(
  url: string | null | undefined,
  baseUrl = 'https://siz.land'
): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) return null;

  try {
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      const pathOnly = trimmed.split('?')[0] || '/';
      if (pathOnly.startsWith('/api')) return null;
      if (isAuthPath(pathOnly)) return null;
      return trimmed;
    }

    const parsed = new URL(trimmed);
    const baseHost = new URL(baseUrl).hostname;
    if (!isSizlandHost(parsed.hostname) && parsed.hostname !== baseHost) return null;
    if (parsed.pathname.startsWith('/api')) return null;
    if (isAuthPath(parsed.pathname)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/** Read callbackUrl from Next router query (string | string[]). */
export function callbackFromQuery(
  query: Record<string, string | string[] | undefined>
): string | null {
  const raw = query.callbackUrl ?? query.callback_url ?? query.redirect;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value && typeof value === 'string' ? value : null;
}

export function appendCallbackParam(path: string, callbackUrl: string | null | undefined): string {
  const safe = sanitizeReturnUrl(callbackUrl);
  if (!safe) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}callbackUrl=${encodeURIComponent(safe)}`;
}

export function persistReturnUrl(url: string | null | undefined) {
  if (typeof window === 'undefined') return;
  const safe = sanitizeReturnUrl(url);
  if (!safe) return;
  try {
    localStorage.setItem(CALLBACK_STORAGE_KEY, safe);
  } catch {
    /* ignore quota / private mode */
  }
}

function storedReturnUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return sanitizeReturnUrl(localStorage.getItem(CALLBACK_STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * Page to resume after auth: current URL, unless we are already on an auth
 * screen — then query, stored callback, or document.referrer.
 */
export function currentReturnUrl(): string {
  if (typeof window === 'undefined') return '/lobby';
  const { origin, pathname, search, hash } = window.location;
  if (!isAuthPath(pathname)) {
    return `${origin}${pathname}${search}${hash}`;
  }

  const fromQuery = new URLSearchParams(search).get('callbackUrl');
  const fromQuerySafe = sanitizeReturnUrl(fromQuery);
  if (fromQuerySafe) return fromQuerySafe;

  const stored = storedReturnUrl();
  if (stored) return stored;

  if (document.referrer) {
    const fromRef = sanitizeReturnUrl(document.referrer);
    if (fromRef) return fromRef;
  }

  return defaultPostAuthPath();
}

/** Sign-in entry with the previous page attached. */
export function authChoiceHref(returnUrl?: string | null): string {
  const dest = sanitizeReturnUrl(returnUrl) || (typeof window !== 'undefined' ? currentReturnUrl() : null);
  const safe = dest ? sanitizeReturnUrl(dest) : null;
  if (!safe) return '/auth-choice';
  return `/auth-choice?callbackUrl=${encodeURIComponent(safe)}`;
}

/**
 * Safe post-auth destination. Never returns an auth screen.
 */
export function resolveAuthRedirect(url: string, baseUrl: string): string {
  const lobby = `${baseUrl.replace(/\/$/, '')}/lobby`;
  const sanitized = sanitizeReturnUrl(url, baseUrl);
  if (!sanitized) return lobby;
  if (sanitized.startsWith('/')) return `${baseUrl.replace(/\/$/, '')}${sanitized}`;
  return sanitized;
}

/** Client helper after credentials sign-in (redirect: false). */
export function clientPostAuthPath(callbackUrl: string | null | undefined): string {
  return sanitizeReturnUrl(callbackUrl) || defaultPostAuthPath();
}
