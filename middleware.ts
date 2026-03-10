import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || request.nextUrl.hostname
  const hostname = request.nextUrl.hostname

  // siz.land or www.siz.land /solutions → redirect to solutions.siz.land (only subdomain has the page)
  const isMainDomain = host === 'siz.land' || host === 'www.siz.land' || host?.startsWith('siz.land:') || host?.startsWith('www.siz.land:');
  if (isMainDomain && (pathname === '/solutions' || pathname.startsWith('/solutions/'))) {
    const url = new URL(pathname, 'https://solutions.siz.land')
    return NextResponse.redirect(url.toString(), 308)
  }

  // solutions.siz.land: ONLY root / shows solutions; all other paths redirect to main domain
  if (host === 'solutions.siz.land' || host?.startsWith('solutions.siz.land:')) {
    if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
      return NextResponse.next()
    }
    if (pathname === '/' || pathname === '/solutions') {
      const url = request.nextUrl.clone()
      url.pathname = '/solutions'
      return NextResponse.rewrite(url)
    }
    // Any other path on subdomain → redirect to main domain (e.g. /whitepaper → siz.land/whitepaper)
    const mainUrl = new URL(pathname + request.nextUrl.search, 'https://siz.land')
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
