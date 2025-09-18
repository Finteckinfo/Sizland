import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that can be accessed without authentication
  publicRoutes: [
    "/",
    "/login", 
    "/signup", 
    "/sso-callback", 
    "/404", 
    "/terms", 
    "/privacy",
    "/blog",
    "/whitepaper",
    "/api/stripe-webhook",
    "/api/test-webhook"
  ],
  // Routes that require authentication
  protectedRoutes: [
    "/wallet",
    "/new-wallet",
    "/lobby",
    "/dex",
    "/api/user/wallet"
  ],
  // Redirect to signup instead of signin for better UX
  signInUrl: "/login",
  signUpUrl: "/signup",
  // Allow API routes to be accessed without auth checks
  ignoredRoutes: [
    "/api/stripe-webhook",
    "/api/test-webhook",
    "/_next",
    "/favicon.ico"
  ]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
