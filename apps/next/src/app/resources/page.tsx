import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight, BookOpen, Compass, Film, Mic, Newspaper, Sparkles } from 'lucide-react';
import {
  Section,
  SectionHeader,
  PageHero,
  BrutalCard,
  Heading,
} from '@/components/layout/PageShell';

export const metadata: Metadata = {
  title: 'Resources — Stories, Guides & Craft Journals',
  description:
    'Read maker journals, watch craft films, and browse buying guides from Empindu — a story-first Ugandan artisan marketplace.',
  alternates: { canonical: '/resources' },
};

const featured = {
  tag: 'Featured Journal',
  title: 'The Weavers of Bugisu: A Season Between the Rains',
  excerpt:
    'A field journal from Mbale, where a cooperative of thirty weavers time their harvests, dyes, and market days to the rhythm of the mountain rains.',
  meta: '12 min read · Field Journal',
};

const stories = [
  { tag: 'Maker Story', title: 'Nakato’s Loom', excerpt: 'How a third-generation weaver rebuilt her workshop after the floods.', meta: '6 min read' },
  { tag: 'Provenance', title: 'From Papyrus to Pattern', excerpt: 'The path a single reed travels from swamp to gallery-ready basket.', meta: '8 min read' },
  { tag: 'Heritage Fund', title: 'Where the Fund Went in 2024', excerpt: 'An honest breakdown of every shilling routed back into the craft economy.', meta: '4 min read' },
  { tag: 'Buying Guide', title: 'How to Read a Provenance Label', excerpt: 'The five signals that separate a heritage piece from a souvenir.', meta: '5 min read' },
];

const categories = [
  { icon: Newspaper, label: 'Journals', body: 'Long-form maker stories, workshop diaries, and reflections from the field.' },
  { icon: Film, label: 'Craft Films', body: 'Short documentary films following pieces from raw material to finished object.' },
  { icon: BookOpen, label: 'Guides', body: 'Practical buying, gifting, and care guides written for people new to craft.' },
  { icon: Mic, label: 'Conversations', body: 'Recorded talks with artisans, curators, and heritage practitioners.' },
];

const guides = [
  { n: '01', title: 'Care for handwoven baskets', body: 'Dust, dry, and rotate — the three habits that add decades of life.' },
  { n: '02', title: 'Gifting Empindu abroad', body: 'Customs, timelines, and how to include a personal note that lands.' },
  { n: '03', title: 'Corporate gifting checklist', body: 'The seven questions to answer before a bulk order goes into production.' },
];

export default function Page() {
  return (
    <div className="bg-background text-foreground">
      <PageHero
        eyebrow="Resources"
        title={<>Stories, guides, and field notes from the <span className="text-accent italic">craft</span> economy.</>}
        lead="A living archive of maker journals, buying guides, and short films — written for buyers, artisans, and anyone curious about how heritage commerce actually works."
      />

      {/* CATEGORY GRID */}
      <Section size="sm">
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4 border-2 border-foreground shadow-brutal">
          {categories.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className={`bg-card p-6 transition-colors hover:bg-primary-soft ${
                  i > 0 ? 'sm:border-l-2 border-t-2 sm:border-t-0 lg:border-t-0 border-foreground' : ''
                } ${i === 2 ? 'lg:border-l-2 lg:border-t-0 border-t-2' : ''}`}
              >
                <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                <Heading as="h3" size="md" className="mt-4 text-lg">{c.label}</Heading>
                <p className="mt-2 text-sm text-muted-foreground font-body leading-6">{c.body}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* FEATURED + LATEST */}
      <Section tone="muted">
        <div className="mb-10 flex items-end justify-between gap-6">
          <SectionHeader eyebrow="Latest" title="From the journal." className="mb-0" />
          <Link href="#" className="hidden md:inline-flex items-center gap-2 font-display text-xs tracking-[0.3em] uppercase text-secondary hover:text-primary">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <BrutalCard as="article" padding="sm" shadow="lg" className="lg:col-span-7 p-0 overflow-hidden">
            <div className="aspect-[16/10] bg-gradient-to-br from-primary via-accent to-secondary border-b-2 border-foreground relative overflow-hidden">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 12px, rgba(13,12,12,0.25) 12px 14px)' }} />
            </div>
            <div className="p-8">
              <p className="font-display text-[11px] tracking-[0.35em] uppercase text-primary">{featured.tag}</p>
              <Heading as="h3" size="lg" className="mt-4 text-3xl md:text-4xl">{featured.title}</Heading>
              <p className="mt-4 text-muted-foreground font-body leading-8">{featured.excerpt}</p>
              <div className="mt-6 flex items-center justify-between">
                <p className="font-display text-xs tracking-[0.3em] uppercase text-muted-foreground">{featured.meta}</p>
                <Link href="#" className="inline-flex items-center gap-2 border-2 border-foreground bg-secondary px-4 py-2 font-display text-xs tracking-[0.3em] uppercase text-secondary-foreground shadow-brutal-sm hover:-translate-y-0.5 transition-transform">
                  Read <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </BrutalCard>

          <div className="lg:col-span-5 grid grid-cols-1 gap-6">
            {stories.slice(0, 3).map((s) => (
              <BrutalCard as="article" key={s.title} padding="md" hover>
                <p className="font-display text-[11px] tracking-[0.35em] uppercase text-accent">{s.tag}</p>
                <Heading as="h3" size="md" className="mt-3 text-xl">{s.title}</Heading>
                <p className="mt-2 text-sm text-muted-foreground font-body leading-6">{s.excerpt}</p>
                <p className="mt-4 font-display text-[11px] tracking-[0.3em] uppercase text-muted-foreground">{s.meta}</p>
              </BrutalCard>
            ))}
          </div>
        </div>
      </Section>

      {/* GUIDES */}
      <Section tone="primary-soft">
        <SectionHeader
          align="between"
          eyebrow="Practical"
          title="Buying & care guides."
          lead="Short, honest guides written with our artisan partners — the details that make a piece last, and the questions worth asking before you buy."
        />
        <div className="grid gap-0 md:grid-cols-3">
          {guides.map((g, i) => (
            <BrutalCard as="article" key={g.n} padding="lg" className={i > 0 ? 'md:-ml-[2px] -mt-[2px] md:mt-0' : ''}>
              <span className="font-display text-5xl text-primary">{g.n}</span>
              <Heading as="h3" size="md" className="mt-6 text-xl">{g.title}</Heading>
              <p className="mt-3 text-sm text-muted-foreground font-body leading-7">{g.body}</p>
              <Link href="#" className="mt-6 inline-flex items-center gap-2 font-display text-[11px] tracking-[0.35em] uppercase text-secondary hover:text-primary">
                Read guide <ArrowRight className="h-4 w-4" />
              </Link>
            </BrutalCard>
          ))}
        </div>
      </Section>

      {/* NEWSLETTER CTA */}
      <Section tone="dark" bordered={false}>
        <BrutalCard tone="dark" shadow="lg" className="p-10 md:p-16">
          <div className="grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-7">
              <div className="flex items-center gap-3 text-accent">
                <Sparkles className="h-5 w-5" />
                <p className="font-display text-xs tracking-[0.35em] uppercase">The Field Notes</p>
              </div>
              <Heading as="h2" size="lg" className="mt-4">A monthly letter from the workshop.</Heading>
              <p className="mt-4 max-w-xl text-warm-cream/80 font-body leading-8">One story, one guide, one new artisan — delivered on the first Sunday of every month. No noise.</p>
            </div>
            <div className="md:col-span-5 flex flex-wrap gap-4 md:justify-end">
              <Link href="#" className="inline-flex items-center gap-3 border-2 border-warm-cream bg-accent px-6 py-3 font-display text-xs tracking-[0.35em] uppercase text-accent-foreground shadow-brutal transition hover:-translate-y-0.5">
                Subscribe <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/marketplace" className="inline-flex items-center gap-3 border-2 border-warm-cream bg-transparent px-6 py-3 font-display text-xs tracking-[0.35em] uppercase text-warm-cream transition hover:bg-warm-cream hover:text-bark-brown">
                <Compass className="h-4 w-4" /> Explore Craft
              </Link>
            </div>
          </div>
        </BrutalCard>
      </Section>
    </div>
  );
}
