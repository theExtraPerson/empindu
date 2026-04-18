import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import { loginWithPassword, refreshAuthToken } from '@/lib/auth-api';

const TOKEN_REFRESH_SKEW_MS = 30_000;

async function refreshJwtToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }

  try {
    const refreshed = await refreshAuthToken(String(token.refreshToken));

    return {
      ...token,
      sub: refreshed.user.id,
      userId: refreshed.user.id,
      email: refreshed.user.email,
      name: refreshed.user.full_name,
      role: refreshed.user.role,
      profile: refreshed.user,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
      accessTokenExpires: new Date(refreshed.access_expires_at).getTime(),
      refreshTokenExpires: new Date(refreshed.refresh_expires_at).getTime(),
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth',
  },
  providers: [
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required.');
        }

        const auth = await loginWithPassword(credentials.email, credentials.password);

        return {
          id: auth.user.id,
          email: auth.user.email,
          name: auth.user.full_name,
          role: auth.user.role,
          profile: auth.user,
          accessToken: auth.access_token,
          refreshToken: auth.refresh_token,
          accessTokenExpires: new Date(auth.access_expires_at).getTime(),
          refreshTokenExpires: new Date(auth.refresh_expires_at).getTime(),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        return {
          ...token,
          sub: user.id,
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profile: user.profile,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires,
          refreshTokenExpires: user.refreshTokenExpires,
          error: undefined,
        };
      }

      if (trigger === 'update' && session?.user) {
        return {
          ...token,
          name: session.user.name ?? token.name,
          role: session.user.role ?? token.role,
          profile: session.user.profile ?? token.profile,
        };
      }

      if (token.accessToken && token.accessTokenExpires && Date.now() < Number(token.accessTokenExpires) - TOKEN_REFRESH_SKEW_MS) {
        return token;
      }

      return refreshJwtToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? token.sub ?? '');
        session.user.email = typeof token.email === 'string' ? token.email : null;
        session.user.name = typeof token.name === 'string' ? token.name : null;
        session.user.role = token.role;
        session.user.profile = token.profile;
      }

      session.accessToken = typeof token.accessToken === 'string' ? token.accessToken : undefined;
      session.error = typeof token.error === 'string' ? token.error : undefined;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
