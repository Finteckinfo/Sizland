import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const MAIN_ORIGIN = 'https://siz.land'
const BUY_ORIGIN = 'https://buy.siz.land'
const SOLUTIONS_ORIGIN = 'https://solutions.siz.land'
const MYTAB_ORIGIN = 'https://mytab.siz.land'

function hostBase(host: string | null): string {
  if (!host) return ''
  return host.split(':')[0].toLowerCase()
}

function isMainDomainHost(h: string): boolean {
  return h === 'siz.land' || h === 'www.siz.land'
}

function isBuyHost(h: string): boolean {
  return h === 'buy.siz.land' || h === 'www.buy.siz.land' || h.endsWith('.buy.siz.land')
}

function isSolutionsHost(h: string): boolean {
  return (
    h === 'solutions.siz.land' ||
    h === 'www.solutions.siz.land' ||
    h.endsWith('.solutions.siz.land')
  )
}

function isMytabHost(h: string): boolean {
  return (
    h === 'mytab.siz.land' ||
    h === 'www.mytab.siz.land' ||
    h.endsWith('.mytab.siz.land')
  )
}

/** Only apply strict subdomain routing on real siz.land hosts (not localhost / preview apps). */
function shouldApplySubdomainRouting(h: string): boolean {
  if (!h) return false
  if (h === 'localhost' || h === '127.0.0.1') return false
  return h === 'siz.land' || h.endsWith('.siz.land')
}

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

/** Paths that belong to the buy app; allowed on buy.* and redirected from main www. */
const BUY_APP_PREFIXES = [
  '/buy-land',
  '/lands',
  '/browse-land',
  '/catalog',
  '/admin/land',
  '/admin/users',
]

/** Paths that belong to the MyTab app. */
const MYTAB_APP_PREFIXES = ['/mytab']

/** Shared auth and post-auth entry used from buy (and main). */
const SHARED_AUTH_PREFIXES = [
  '/login',
  '/signup',
  '/wallet-auth',
  '/auth-choice',
  '/sso-callback',
  '/lobby',
]

function isAllowedOnBuyHost(pathname: string): boolean {
  if (pathname === '/') return true
  for (const p of BUY_APP_PREFIXES) {
    if (pathMatchesPrefix(pathname, p)) return true
  }
  for (const p of SHARED_AUTH_PREFIXES) {
    if (pathMatchesPrefix(pathname, p)) return true
  }
  return false
}

function isBuyOnlyPath(pathname: string): boolean {
  return BUY_APP_PREFIXES.some((p) => pathMatchesPrefix(pathname, p))
}

function isMytabOnlyPath(pathname: string): boolean {
  return MYTAB_APP_PREFIXES.some((p) => pathMatchesPrefix(pathname, p))
}

function isAllowedOnMytabHost(pathname: string): boolean {
  if (pathname === '/') return true
  for (const p of MYTAB_APP_PREFIXES) {
    if (pathMatchesPrefix(pathname, p)) return true
  }
  for (const p of SHARED_AUTH_PREFIXES) {
    if (pathMatchesPrefix(pathname, p)) return true
  }
  return false
}

function isAllowedOnSolutionsHost(pathname: string): boolean {
  if (pathname === '/') return true
  if (pathMatchesPrefix(pathname, '/solutions')) return true
  if (pathMatchesPrefix(pathname, '/ratecard')) return true
  for (const p of SHARED_AUTH_PREFIXES) {
    if (pathMatchesPrefix(pathname, p)) return true
  }
  return false
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/wallet-auth',
  '/auth-choice',
  '/sso-callback',
  '/404',
  '/terms',
  '/privacy',
  '/blog',
  '/whitepaper',
  '/solutions',
  '/ratecard',
  '/mytab',
  '/mytab/onboarding',
  '/mytab/settings',
]

// API routes that are public
const publicApiRoutes = [
  '/api/stripe-webhook',
  '/api/test-webhook',
  '/api/auth/siwe/nonce',
  '/api/auth/siwe/verify',
  '/api/auth/algorand/nonce',
  '/api/auth/algorand/verify',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/providers',
  '/api/mytab/alias/check',
  '/api/mytab/alias/register',
  '/api/mytab/phone/verify',
  '/api/mytab/phone/register-hash',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || request.nextUrl.hostname
  const h = hostBase(host)

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/trpc')
  ) {
    return NextResponse.next()
  }

  const isMainDomain = isMainDomainHost(h)
  const applySplit = shouldApplySubdomainRouting(h)

  // siz.land or www.siz.land /solutions → redirect to solutions.siz.land
  if (applySplit && isMainDomain && pathMatchesPrefix(pathname, '/solutions')) {
    const url = new URL(pathname + request.nextUrl.search, SOLUTIONS_ORIGIN)
    return NextResponse.redirect(url.toString(), 308)
  }

  // Main domain: buy-only app routes → buy.siz.land
  if (applySplit && isMainDomain && isBuyOnlyPath(pathname)) {
    const url = new URL(pathname + request.nextUrl.search, BUY_ORIGIN)
    return NextResponse.redirect(url.toString(), 308)
  }

  // Main domain: mytab app routes → mytab.siz.land
  if (applySplit && isMainDomain && isMytabOnlyPath(pathname)) {
    const url = new URL(pathname + request.nextUrl.search, MYTAB_ORIGIN)
    return NextResponse.redirect(url.toString(), 308)
  }

  // buy.siz.land: home + buy app + auth; anything else → same path on main (marketing site)
  if (applySplit && isBuyHost(h)) {
    if (isAllowedOnBuyHost(pathname)) {
      if (pathname === '/' || pathname === '/buy-land') {
        const url = request.nextUrl.clone()
        url.pathname = '/buy-land'
        return NextResponse.rewrite(url)
      }
      return NextResponse.next()
    }
    const mainUrl = new URL(pathname + request.nextUrl.search, MAIN_ORIGIN)
    return NextResponse.redirect(mainUrl.toString(), 302)
  }

  // solutions.siz.land: solutions + auth; anything else → main
  if (applySplit && isSolutionsHost(h)) {
    if (isAllowedOnSolutionsHost(pathname)) {
      if (pathname === '/' || pathname === '/solutions') {
        const url = request.nextUrl.clone()
        url.pathname = '/solutions'
        return NextResponse.rewrite(url)
      }
      return NextResponse.next()
    }
    const mainUrl = new URL(pathname + request.nextUrl.search, MAIN_ORIGIN)
    return NextResponse.redirect(mainUrl.toString(), 302)
  }

  // mytab.siz.land: mytab app + auth; anything else → main
  if (applySplit && isMytabHost(h)) {
    if (isAllowedOnMytabHost(pathname)) {
      if (pathname === '/' || pathname === '/mytab') {
        const url = request.nextUrl.clone()
        url.pathname = '/mytab'
        return NextResponse.rewrite(url)
      }
      return NextResponse.next()
    }
    const mainUrl = new URL(pathname + request.nextUrl.search, MAIN_ORIGIN)
    return NextResponse.redirect(mainUrl.toString(), 302)
  }

  // Allow all public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Allow all public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // For now, allow all other routes (NextAuth handles auth on pages)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
