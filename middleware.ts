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

  // siz.land/solutions → redirect to solutions.siz.land (only subdomain has the page)
  if ((host === 'siz.land' || host.startsWith('siz.land:')) && (pathname === '/solutions' || pathname.startsWith('/solutions/'))) {
    const url = new URL(pathname, 'https://solutions.siz.land')
    return NextResponse.redirect(url.toString(), 308)
  }

  // solutions.siz.land → rewrite to /solutions page
  if (host === 'solutions.siz.land' || host.startsWith('solutions.siz.land:')) {
    const url = request.nextUrl.clone()
    url.pathname = '/solutions'
    return NextResponse.rewrite(url)
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
