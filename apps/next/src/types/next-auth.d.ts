import 'next-auth';
import 'next-auth/jwt';

import type { DefaultSession } from 'next-auth';

import type { AppRole, AuthProfile } from '@/lib/auth-api';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      role?: AppRole;
      profile?: AuthProfile;
    } & DefaultSession['user'];
  }

  interface User {
    role: AppRole;
    profile: AuthProfile;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    refreshTokenExpires: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    role?: AppRole;
    profile?: AuthProfile;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    refreshTokenExpires?: number;
    error?: string;
  }
}
