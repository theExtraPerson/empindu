import Link from 'next/link';
import { ArrowRight, Compass, HeartHandshake, Leaf, Sparkles, Users } from 'lucide-react';
import {
  Section,
  SectionHeader,
  PageHero,
  BrutalCard,
  Eyebrow,
  Heading,
  Lead,
} from '@/components/layout/PageShell';

const values = [
  { n: '01', title: 'Provenance First', body: 'Every product carries a visible maker, a place, and a story. No anonymous SKUs, no faceless supply chains.', icon: Compass },
  { n: '02', title: 'Transparent Earnings', body: 'Artisans see their share of every sale. We publish payout timelines and a heritage fund allocation on every order.', icon: HeartHandshake },
  { n: '03', title: 'Craft Preservation', body: 'A percentage of every purchase funds apprenticeship, tools, and materials for the next generation of makers.', icon: Leaf },
  { n: '04', title: 'Modern Commerce', body: 'Mobile-first checkout, gift-ready flows, and honest logistics — heritage does not mean slow or complicated.', icon: Sparkles },
];

const journey = [
  { year: '2021', title: 'The First Basket', body: 'Empindu begins as a weekend market in Kampala with seven weavers and a shared table.' },
  { year: '2022', title: 'Story-First Platform', body: 'The first digital marketplace launches with provenance records and maker profiles baked in.' },
  { year: '2023', title: 'Heritage Fund', body: 'A dedicated fund is established, routing a share of every sale back into apprenticeship programs.' },
  { year: '2024', title: 'Corporate Gifting', body: 'Bulk gifting for companies who want their gifts to mean something — with per-recipient personalization.' },
  { year: '2025', title: 'Empindu Festival', body: 'The inaugural Empindu Festival takes 47+ artisans across three cities in a single season.' },
];

const pillars = [
  { label: 'For buyers', body: 'A calm, confident experience with visible stories, transparent pricing, and gift-ready options at every step.' },
  { label: 'For artisans', body: 'Onboarding and a workspace that let makers publish with pride, price fairly, and manage sales simply.' },
  { label: 'For communities', body: 'Every interaction is designed to preserve heritage, increase visibility, and support sustainable income.' },
];

export default function Page() {
  return (
    <div className="bg-background text-foreground">
      <PageHero
        eyebrow="About Empindu"
        title={<>Crafted for <span className="text-accent italic">heritage</span>.<br />Built for <span className="text-accent italic">modern</span> markets.</>}
        lead="Empindu is a story-first Ugandan artisan marketplace. Every product page, checkout flow, and gifting experience is designed to celebrate craft, strengthen trust, and make every purchase feel meaningful."
        aside={
          <BrutalCard tone="dark" padding="lg" shadow="lg">
            <p className="font-display text-xs tracking-[0.35em] uppercase text-accent">Est. 2021</p>
            <p className="mt-4 font-display text-2xl leading-tight">Kampala, Uganda — the Pearl of Africa.</p>
            <p className="mt-3 text-sm text-warm-cream/70 font-body">47+ artisans · 312+ orders shipped · 8 countries reached</p>
          </BrutalCard>
        }
      />

      {/* MISSION */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="font-display text-xs tracking-[0.35em] uppercase text-primary">Our mission</p>
          </div>
          <div className="lg:col-span-8">
            <Heading as="h2" size="lg" className="normal-case text-3xl md:text-4xl">
              We treat every listing as a <span className="text-primary italic">cultural narrative</span>, not just a SKU — with visible provenance, honest pricing, and a checkout worthy of the craft.
            </Heading>
          </div>
        </div>
      </Section>

      {/* VALUES */}
      <Section tone="muted">
        <SectionHeader eyebrow="What we stand for" title="Four commitments." />
        <div className="grid gap-0 md:grid-cols-2">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <BrutalCard key={v.n} as="article" tone="card" padding="lg" shadow="none" className="-mt-[2px] -ml-[2px] hover:shadow-brutal transition-shadow">
                <div className="flex items-start justify-between">
                  <span className="font-display text-5xl text-primary">{v.n}</span>
                  <Icon className="h-6 w-6 text-secondary" strokeWidth={1.5} />
                </div>
                <Heading as="h3" size="md" className="mt-6">{v.title}</Heading>
                <p className="mt-3 text-muted-foreground font-body leading-7">{v.body}</p>
              </BrutalCard>
            );
          })}
        </div>
      </Section>

      {/* JOURNEY */}
      <Section>
        <SectionHeader eyebrow="Our journey" title="From a market table to a global platform." />
        <ol className="grid grid-cols-1 md:grid-cols-5 gap-0 border-2 border-foreground shadow-brutal">
          {journey.map((j, i) => (
            <li key={j.year} className={`p-6 bg-card ${i > 0 ? 'md:border-l-2 border-t-2 md:border-t-0 border-foreground' : ''}`}>
              <p className="font-display text-3xl text-accent">{j.year}</p>
              <Heading as="h3" size="md" className="mt-3 text-lg">{j.title}</Heading>
              <p className="mt-2 text-sm text-muted-foreground font-body leading-6">{j.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* WHO WE SERVE */}
      <Section tone="primary-soft">
        <SectionHeader
          align="between"
          eyebrow="Who we serve"
          title="Three audiences. One promise."
          lead="Empindu is designed for the buyer who wants meaning, the maker who wants dignity, and the community that wants continuity — with one operating system for craft."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <BrutalCard key={p.label} padding="lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <p className="font-display text-xs tracking-[0.3em] uppercase text-primary">{p.label}</p>
              </div>
              <p className="mt-5 text-base leading-7 text-foreground font-body">{p.body}</p>
            </BrutalCard>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section tone="dark" bordered={false}>
        <BrutalCard tone="dark" padding="lg" shadow="lg" className="p-10 md:p-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <p className="font-display text-xs tracking-[0.35em] uppercase text-accent">Come closer</p>
              <Heading as="h2" size="lg" className="mt-4">Shop the collection or meet the makers behind it.</Heading>
            </div>
            <div className="flex flex-wrap gap-4 md:justify-end">
              <Link href="/marketplace" className="inline-flex items-center gap-3 border-2 border-warm-cream bg-accent px-6 py-3 font-display text-xs tracking-[0.35em] uppercase text-accent-foreground shadow-brutal transition hover:-translate-y-0.5">
                Browse Marketplace <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/artisans" className="inline-flex items-center gap-3 border-2 border-warm-cream bg-transparent px-6 py-3 font-display text-xs tracking-[0.35em] uppercase text-warm-cream transition hover:bg-warm-cream hover:text-bark-brown">
                Meet Artisans
              </Link>
            </div>
          </div>
        </BrutalCard>
      </Section>
    </div>
  );
}
