import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import { loginWithPassword, loginWithSocial, refreshAuthToken, type AuthResponse } from '@/lib/auth-api';

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

function authToUser(auth: AuthResponse) {
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
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth',
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      id: 'credentials',
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

        return authToUser(auth);
      },
    }),
    CredentialsProvider({
      id: 'telegram',
      name: 'Telegram',
      credentials: {
        telegram: { label: 'Telegram payload', type: 'text' },
        role: { label: 'Role', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.telegram) {
          throw new Error('Telegram sign-in payload is missing.');
        }

        const telegram = JSON.parse(credentials.telegram) as Record<string, string | number | undefined>;
        const firstName = String(telegram.first_name || '').trim();
        const lastName = String(telegram.last_name || '').trim();
        const username = String(telegram.username || '').trim();
        const id = String(telegram.id || '').trim();

        if (!id) {
          throw new Error('Telegram user id is missing.');
        }

        const auth = await loginWithSocial({
          provider: 'telegram',
          provider_user_id: id,
          email: username ? `${username}@telegram.empindu.local` : undefined,
          full_name: [firstName, lastName].filter(Boolean).join(' ') || username || `Telegram ${id}`,
          avatar_url: typeof telegram.photo_url === 'string' ? telegram.photo_url : undefined,
          role: credentials.role === 'artisan' ? 'artisan' : 'buyer',
          auth_data: telegram,
        });

        return authToUser(auth);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        if (account?.provider === 'google' && !user.accessToken) {
          const auth = await loginWithSocial({
            provider: 'google',
            provider_user_id: account.providerAccountId,
            email: user.email,
            full_name: user.name,
            avatar_url: user.image,
            role: 'artisan',
          });
          const backendUser = authToUser(auth);

          return {
            ...token,
            sub: backendUser.id,
            userId: backendUser.id,
            email: backendUser.email,
            name: backendUser.name,
            role: backendUser.role,
            profile: backendUser.profile,
            accessToken: backendUser.accessToken,
            refreshToken: backendUser.refreshToken,
            accessTokenExpires: backendUser.accessTokenExpires,
            refreshTokenExpires: backendUser.refreshTokenExpires,
            error: undefined,
          };
        }

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
  secret: process.env.NEXTAUTH_SECRET || process.env.SECRET_KEY,
  debug: process.env.NODE_ENV === 'development',
};
