'use client';

import Script from 'next/script';
import { signIn as providerSignIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Mail, Send, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

declare global {
  interface Window {
    onTelegramAuth?: (user: Record<string, string | number>) => void;
  }
}

type AuthMode = 'register' | 'signin';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const intent = searchParams.get('intent');
  const isPublishing = intent === 'artisan-publish';
  const telegramBot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  const title = isPublishing ? 'Sign in to publish your artisan profile' : 'Sign in to Empindu';
  const helper = isPublishing
    ? 'Your onboarding draft is saved. Authentication connects it to a real artisan account before it reaches the database.'
    : 'Use your artisan account to manage profiles, products, orders, and payout details.';

  useEffect(() => {
    window.onTelegramAuth = async (telegramUser) => {
      setIsSubmitting(true);
      setError('');

      const result = await providerSignIn('telegram', {
        telegram: JSON.stringify(telegramUser),
        role: isPublishing ? 'artisan' : 'buyer',
        redirect: false,
      });

      setIsSubmitting(false);
      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push(callbackUrl);
    };

    return () => {
      delete window.onTelegramAuth;
    };
  }, [callbackUrl, isPublishing, router]);

  const submitEmail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result =
      mode === 'register'
        ? await signUp(email, password, fullName, 'artisan', {
            craft_specialty: readDraftCrafts(),
            location: readDraftLocation(),
          })
        : await signIn(email, password);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    router.push(callbackUrl);
  };

  const continueWithGoogle = () => {
    providerSignIn('google', { callbackUrl });
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] bg-mud p-6 text-primary shadow-clay sm:p-8">
          <Button type="button" variant="ghost-light" onClick={() => router.push('/onboarding')} className="mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to onboarding
          </Button>

          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/70">Empindu secure entry</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-primary/75">{helper}</p>

          <div className="mt-8 grid gap-3 text-sm">
            <AuthPoint text="Creates or reuses a backend user profile with artisan role." />
            <AuthPoint text="Returns a Django JWT session for protected artisan APIs." />
            <AuthPoint text="Keeps onboarding, craft, payment, and order-readiness data tied together." />
          </div>
        </section>

        <section className="rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-clay sm:p-7">
          <div className="mb-5 grid grid-cols-2 rounded-2xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`min-h-11 rounded-xl text-sm font-semibold transition ${mode === 'register' ? 'bg-card shadow-medium' : 'text-muted-foreground'}`}
            >
              Create artisan account
            </button>
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`min-h-11 rounded-xl text-sm font-semibold transition ${mode === 'signin' ? 'bg-card shadow-medium' : 'text-muted-foreground'}`}
            >
              Sign in
            </button>
          </div>

          <form onSubmit={submitEmail} className="grid gap-4">
            {mode === 'register' ? (
              <label className="grid gap-2 text-sm font-semibold">
                Full name
                <Input value={fullName} onChange={(event) => setFullName(event.target.value)} required placeholder="Nakato Sarah" />
              </label>
            ) : null}
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="name@example.com" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Password
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
              />
            </label>

            {error ? <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

            <Button type="submit" variant="earth" className="min-h-12" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              {mode === 'register' ? 'Create and continue' : 'Sign in and continue'}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border/40" />
            Or continue with
            <span className="h-px flex-1 bg-border/40" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" variant="outline" onClick={continueWithGoogle} className="min-h-12" disabled={isSubmitting}>
              <ShieldCheck className="h-4 w-4" />
              Google
            </Button>

            <div className="min-h-12 rounded-lg border-2 border-primary bg-transparent px-4 py-2 text-center">
              {telegramBot ? (
                <>
                  <div id="telegram-login-empindu" className="flex justify-center" />
                  <Script
                    src="https://telegram.org/js/telegram-widget.js?22"
                    strategy="afterInteractive"
                    data-telegram-login={telegramBot}
                    data-size="medium"
                    data-userpic="false"
                    data-request-access="write"
                    data-onauth="onTelegramAuth(user)"
                  />
                </>
              ) : (
                <span className="inline-flex min-h-8 items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Send className="h-4 w-4" />
                  Telegram not configured
                </span>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function AuthPoint({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-3">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="text-primary/80">{text}</p>
    </div>
  );
}

function readDraftCrafts() {
  try {
    const raw = window.localStorage.getItem('empindu-artisan-onboarding-draft');
    const draft = raw ? JSON.parse(raw) : null;
    return Array.isArray(draft?.craft_traditions) ? draft.craft_traditions.join(', ') : undefined;
  } catch {
    return undefined;
  }
}

function readDraftLocation() {
  try {
    const raw = window.localStorage.getItem('empindu-artisan-onboarding-draft');
    const draft = raw ? JSON.parse(raw) : null;
    return [draft?.community, draft?.district].filter(Boolean).join(', ') || undefined;
  } catch {
    return undefined;
  }
}
