Admin Page and Database Access Guide

Overview

The system now provides a secure admin interface to retrieve users from the database. The architecture includes:

1. Database: PostgreSQL with Prisma ORM
2. Backend: Express.js with NextAuth JWT verification and admin-only middleware
3. Frontend: Next.js page at `/admin/users` with automatic NextAuth session handling

Setup Instructions

Backend Configuration

1. Ensure `DATABASE_URL` is set in `SIZERPBACKEND2-0/.env`:
   DATABASE_URL=postgresql://user:password@host:port/database

2. Ensure `NEXTAUTH_SECRET` is set in `SIZERPBACKEND2-0/.env`:
   NEXTAUTH_SECRET=your-secret-here

3. Optional: Set admin emails in `SIZERPBACKEND2-0/.env` (comma-separated):
   ADMIN_EMAILS=admin@example.com,manager@example.com

   If not set, the backend will fall back to checking if the user has a PROJECT_OWNER role in the database.

Frontend Configuration

1. Set backend API URL in `web3-landing/.env`:
   NEXT_PUBLIC_API_URL=http://localhost:3000
   or in production:
   NEXT_PUBLIC_API_URL=https://api.example.com

2. Ensure NextAuth is configured in `web3-landing/.env` with the same NEXTAUTH_SECRET:
   NEXTAUTH_SECRET=your-secret-here

3. SessionProvider must wrap the application (already configured in `_app.tsx`).

Accessing the Admin Page

1. Navigate to `/admin/users` in the frontend.
2. You will be prompted to log in if not already authenticated.
3. The page will automatically use your NextAuth session token.
4. The frontend Next.js API proxy (`/api/admin/users`) will forward requests to the backend with the token.
5. The backend middleware will verify the token and check admin permissions.

How It Works

Frontend Flow:
  1. User logs in via NextAuth
  2. Session is stored in secure httpOnly cookie
  3. User navigates to `/admin/users`
  4. Page calls `/api/admin/users` (frontend API proxy)
  5. Frontend proxy extracts session and calls backend

Backend Flow:
  1. Frontend proxy sends request to `/api/admin/users` with Authorization header
  2. Backend middleware verifies JWT using NEXTAUTH_SECRET
  3. Admin middleware checks ADMIN_EMAILS or PROJECT_OWNER role
  4. If authorized, returns paginated user list
  5. If unauthorized, returns 403 Forbidden

Security Notes

- No manual token paste required (unlike previous version)
- Session token is never exposed to client-side JavaScript (stored in httpOnly cookie)
- Admin access is validated on both frontend and backend
- Database queries use Prisma parameterized queries (SQL injection safe)
- All endpoints require authentication and admin privileges

Backend Routes

GET /api/admin/users
  Requires: Valid NextAuth JWT in Authorization header, admin email or PROJECT_OWNER role
  Query params: page, limit, search, hasWallet, sortBy, sortOrder
  Response: { users: [...], pagination: { page, limit, total, totalPages } }

Example Backend Call (using curl with valid JWT):

  curl -H "Authorization: Bearer <NEXTAUTH_JWT>" \
    "http://localhost:3000/api/admin/users?page=1&limit=50&search=john"

Troubleshooting

If you see "Admin access required":
  - Check that ADMIN_EMAILS is set correctly (case-insensitive)
  - Or ensure the user has a PROJECT_OWNER role in the database
  - Verify NEXTAUTH_SECRET matches between frontend and backend

If you see "Invalid or expired token":
  - Verify the session is still valid
  - Refresh the page or log in again

If the frontend cannot reach the backend:
  - Check that NEXT_PUBLIC_API_URL is set correctly
  - Verify CORS is enabled on the backend (already configured in security.ts)
  - Ensure both services are running
