'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { Session } from 'next-auth';
import { SessionProvider, signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';

import { registerUser, updateMyProfile, type AppRole, type AuthProfile, type UpdateProfileInput } from '@/lib/auth-api';

type AuthUser = {
  id?: string;
  email?: string;
} | null;

type SignUpDetails = {
  location?: string;
  craft_specialty?: string;
};

interface AuthContextType {
  user: AuthUser;
  session: Session | null;
  profile: AuthProfile | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: Extract<AppRole, 'buyer' | 'artisan'>, details?: SignUpDetails) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: UpdateProfileInput) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error('Something went wrong. Please try again.');
}

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();

  const user = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? undefined,
      }
    : null;

  const profile = session?.user?.profile ?? null;
  const role = session?.user?.role ?? null;
  const loading = status === 'loading';

  const signIn = async (email: string, password: string) => {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (!result) {
      return { error: new Error('Unable to sign in right now.') };
    }

    if (result.error) {
      const message = result.error === 'CredentialsSignin' ? 'Invalid email or password.' : result.error;
      return { error: new Error(message) };
    }

    return { error: null };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    nextRole: Extract<AppRole, 'buyer' | 'artisan'>,
    details?: SignUpDetails,
  ) => {
    try {
      await registerUser({
        email,
        password,
        full_name: fullName,
        role: nextRole,
        location: details?.location,
        craft_specialty: details?.craft_specialty,
      });

      return signIn(email, password);
    } catch (error) {
      return { error: toError(error) };
    }
  };

  const signOut = async () => {
    await nextAuthSignOut({ redirect: false });
  };

  const updateProfile = async (updates: UpdateProfileInput) => {
    if (!session?.accessToken) {
      return { error: new Error('You must be signed in to update your profile.') };
    }

    try {
      const updatedProfile = await updateMyProfile(session.accessToken, updates);
      await update({
        user: {
          ...session.user,
          name: updatedProfile.full_name,
          role: updatedProfile.role,
          profile: updatedProfile,
        },
      });
      return { error: null };
    } catch (error) {
      return { error: toError(error) };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: session ?? null,
        profile,
        role,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
