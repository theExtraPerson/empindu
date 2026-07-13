import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { fetchArtisanSSR } from '@/lib/server-api';
import { ArtisanProfileView } from './ArtisanProfileView';

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artisan = await fetchArtisanSSR(params.slug);
  if (!artisan) {
    return { title: 'Artisan not found | Empindu' };
  }
  const title = `${artisan.full_name} — ${artisan.craft_tradition?.name || 'Artisan'} | Empindu`;
  const description = (artisan.bio || `Shop authentic ${artisan.craft_tradition?.name || 'heritage'} craft made by ${artisan.full_name} in ${artisan.community || 'Uganda'}.`).slice(0, 155);
  return {
    title,
    description,
    alternates: { canonical: `/artisans/${artisan.slug}` },
    openGraph: {
      title,
      description,
      type: 'profile',
      images: artisan.profile_photo_url ? [{ url: artisan.profile_photo_url }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function Page({ params }: Props) {
  const artisan = await fetchArtisanSSR(params.slug);
  if (!artisan) return notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: artisan.full_name,
    description: artisan.bio,
    image: artisan.profile_photo_url || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: artisan.community,
      addressRegion: artisan.district,
      addressCountry: 'UG',
    },
    knowsAbout: artisan.craft_tradition?.name,
    url: `/artisans/${artisan.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="border-b-2 border-foreground bg-background px-4 py-3 text-xs sm:px-6 lg:px-8">
        <ol className="mx-auto flex max-w-7xl gap-2 font-display uppercase tracking-[0.3em] text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground">Home</Link></li>
          <li>/</li>
          <li><Link href="/artisans" className="hover:text-foreground">Artisans</Link></li>
          <li>/</li>
          <li className="text-foreground">{artisan.full_name}</li>
        </ol>
      </nav>
      <ArtisanProfileView params={params} />
    </>
  );
}
