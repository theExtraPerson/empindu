import type { Metadata } from 'next';
import { Suspense } from 'react';

import './globals.css';
import { Providers } from './providers';
import { Layout } from '@/components/layout/Layout';

export const metadata: Metadata = {
  title: 'Empindu | Thrive With Nature',
  description: 'Story-first Ugandan artisan marketplace powered by Django commerce and a Next.js storefront.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div className="min-h-screen bg-background text-foreground" />}>
          <Providers>
            <Layout>{children}</Layout>
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}