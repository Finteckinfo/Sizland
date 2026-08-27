import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import * as jwt from 'jsonwebtoken';
import { resolveAuthRedirect } from '@/lib/auth-callback';
import type { WalletTrack } from '@/lib/mytab/constants';
import { sizwalletIssuer, sizwalletProvider } from '@/lib/sizwallet-oidc';

const sizwalletEnabled = Boolean(
  process.env.SIZWALLET_CLIENT_ID && process.env.SIZWALLET_CLIENT_SECRET
);

export const authOptions: NextAuthOptions = {
  providers: [
    // Primary: Sign in with SizWallet (OIDC). Pairwise sub only — no DID in tokens.
    ...(sizwalletEnabled ? [sizwalletProvider()] : []),

    // Legacy providers (kept for existing sessions / transition). Prefer SizWallet in UI.
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile',
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (res.ok && data) {
            return {
              id: data.id,
              email: data.email,
              name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              authType: 'web2',
            };
          }

          return null;
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),

    CredentialsProvider({
      id: 'wallet',
      name: 'Web3 Wallet',
      credentials: {
        walletAddress: { label: 'Wallet Address', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.walletAddress) {
          return null;
        }

        try {
          const walletAddress = credentials.walletAddress.toString().trim();
          return {
            id: walletAddress,
            email: `${walletAddress.substring(0, 8)}@wallet.local`,
            name: `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
            firstName: 'Wallet',
            lastName: 'User',
            walletAddress,
            authType: 'web3',
          };
        } catch (error) {
          console.error('[NextAuth Wallet] Authorization error:', error);
          return null;
        }
      },
    }),

    CredentialsProvider({
      id: 'siwe',
      name: 'MetaMask',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
        nonceKey: { label: 'Nonce Key', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature || !credentials?.nonceKey) {
          throw new Error('Missing SIWE credentials');
        }

        try {
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/siwe/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: credentials.message,
              signature: credentials.signature,
              nonceKey: credentials.nonceKey,
            }),
          });

          const data = await res.json();

          if (res.ok && data.success && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              walletAddress: data.user.walletAddress,
              authType: 'web3',
            };
          }

          throw new Error(data.error || 'SIWE verification failed');
        } catch (error) {
          console.error('SIWE authorization error:', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.siz.land' : undefined,
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.callback-url'
          : 'next-auth.callback-url',
      options: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.siz.land' : undefined,
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.csrf-token'
          : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.siz.land' : undefined,
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/auth-choice',
    signOut: '/logout',
    error: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return resolveAuthRedirect(url, baseUrl);
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (user) {
        const authType =
          account?.provider === 'sizwallet'
            ? 'sizwallet'
            : (user as { authType?: string }).authType || 'web2';

        token.id = user.id;
        token.email = (user.email as string) || '';
        token.name = (user.name as string) || '';
        token.walletAddress = (user as { walletAddress?: string }).walletAddress || '';
        token.authType = authType;

        if (account?.provider === 'sizwallet' && profile && typeof (profile as { sub?: string }).sub === 'string') {
          const claims = profile as { sub: string; iss?: string };
          token.id = claims.sub;
          token.sub = claims.sub;
          if (typeof claims.iss === 'string') {
            token.sizwalletIss = claims.iss;
          }
        }

        const secret = process.env.NEXTAUTH_SECRET;
        if (secret) {
          const payload = {
            id: token.id,
            email: token.email,
            name: token.name,
            walletAddress: token.walletAddress,
            authType: token.authType,
          };
          token.accessToken = jwt.sign(payload, secret, {
            expiresIn: '30d',
          });
        }
      }

      if (trigger === 'update' && session) {
        const update = session as {
          mytabAlias?: string;
          mytabAccountAddress?: string;
          walletTrack?: string;
          phoneVerified?: boolean;
        };

        if (update.mytabAlias !== undefined) {
          token.mytabAlias = update.mytabAlias;
        }
        if (update.mytabAccountAddress !== undefined) {
          token.mytabAccountAddress = update.mytabAccountAddress;
        }
        if (update.walletTrack !== undefined) {
          token.walletTrack = update.walletTrack;
        }
        if (update.phoneVerified !== undefined) {
          token.phoneVerified = update.phoneVerified;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || (token.sub as string) || '';
        session.user.email = (token.email as string) || '';
        session.user.name = (token.name as string) || '';
        session.user.walletAddress = (token.walletAddress as string) || '';
        session.user.authType = (token.authType as string) || 'web2';
        session.user.mytabAlias = (token.mytabAlias as string) || undefined;
        session.user.mytabAccountAddress =
          (token.mytabAccountAddress as string) || undefined;
        const track = token.walletTrack as string | undefined;
        session.user.walletTrack =
          track === 'external' || track === 'smart_account'
            ? (track as WalletTrack)
            : undefined;
        session.user.phoneVerified = Boolean(token.phoneVerified);

        if (token.accessToken) {
          session.accessToken = token.accessToken as string;
        }

        if (token.authType === 'sizwallet') {
          const sub = session.user.id;
          session.sizwallet = {
            sub,
            iss: (token.sizwalletIss as string) || sizwalletIssuer(),
            looksLikeDid: sub.includes('did:key'),
          };
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
