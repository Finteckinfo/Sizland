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
]

// API routes that are public
const publicApiRoutes = [
  '/api/stripe-webhook',
  '/api/test-webhook',
  '/api/auth/siwe/nonce',
  '/api/auth/siwe/verify',
  '/api/auth/algorand/nonce',
  '/api/auth/algorand/verify',
  '/api/auth/',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
