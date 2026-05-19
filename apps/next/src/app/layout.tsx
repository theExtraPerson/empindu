import type { Metadata } from 'next';
import { DM_Sans, Lekton } from 'next/font/google';
import { Suspense } from 'react';

import './globals.css';
import { Providers } from './providers';
import { Layout } from '@/components/layout/Layout';

const displayFont = Lekton({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Empindu | Thrive With Nature',
  description: 'Story-first Ugandan artisan marketplace powered by Django commerce and a Next.js storefront.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <Suspense fallback={<div className="min-h-screen bg-background text-foreground" />}>
          <Providers>
            <Layout>{children}</Layout>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
