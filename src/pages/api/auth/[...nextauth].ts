import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';

export const authOptions: NextAuthOptions = {
  providers: [
    // Web2 Authentication: Traditional Email/Password
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
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
              password: credentials.password
            })
          });

          const data = await res.json();

          if (res.ok && data) {
            return {
              id: data.id,
              email: data.email,
              name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              authType: 'web2'
            };
          }

          return null;
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    }),
    
    // Web3 Authentication: Wallet Address (Algorand, etc.)
    CredentialsProvider({
      id: 'wallet',
      name: 'Web3 Wallet',
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.walletAddress) {
          return null;
        }

        try {
          // Call backend wallet-login endpoint
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/wallet-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              walletAddress: credentials.walletAddress,
              chainId: 'algorand',
              domain: process.env.NEXTAUTH_URL
            })
          });

          const data = await res.json();

          if (res.ok && data) {
            return {
              id: data.id,
              email: data.email,
              name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              walletAddress: data.walletAddress,
              authType: 'web3'
            };
          }

          return null;
        } catch (error) {
          console.error('Wallet authorization error:', error);
          return null;
        }
      }
    }),
    
    // Web3 Authentication: MetaMask/SIWE
    CredentialsProvider({
      id: 'siwe',
      name: 'MetaMask',
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
        nonceKey: { label: "Nonce Key", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.message || !credentials?.signature || !credentials?.nonceKey) {
          throw new Error('Missing SIWE credentials');
        }

        try {
          // Verify the signature with our SIWE endpoint
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/siwe/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: credentials.message,
              signature: credentials.signature,
              nonceKey: credentials.nonceKey
            })
          });

          const data = await res.json();

          if (res.ok && data.success && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              walletAddress: data.user.walletAddress,
              authType: 'web3'
            };
          }

          throw new Error(data.error || 'SIWE verification failed');
        } catch (error) {
          console.error('SIWE authorization error:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-domain in production
        path: '/',
        // Critical for SSO: Set domain to .siz.land in production to share cookies across subdomains
        domain: process.env.NODE_ENV === 'production' ? '.siz.land' : undefined,
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.siz.land' : undefined,
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'strict', // CSRF tokens should always be strict
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // After successful sign in, always redirect to /lobby
      // This matches the original Clerk behavior from the backup
      if (url.startsWith('/') && !url.startsWith('//')) {
        return `${baseUrl}/lobby`;
      }
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/lobby`;
      }
      // For external URLs, return to lobby for safety
      return `${baseUrl}/lobby`;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.email = (user as any).email;
        token.name = (user as any).name;

        const secret = process.env.NEXTAUTH_SECRET;
        if (secret) {
          const payload = {
            id: token.id,
            email: token.email,
            name: token.name,
          };
          token.accessToken = jwt.sign(payload, secret, {
            expiresIn: '30d',
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || '';
        session.user.email = (token.email as string) || '';
        session.user.name = (token.name as string) || '';

        if (token.accessToken) {
          (session as any).accessToken = token.accessToken as string;
        }
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
