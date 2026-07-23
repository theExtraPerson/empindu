'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Gift, Loader2, PackagePlus, Search, Send, ShoppingBag, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/stores/cartStore';
import { createGiftOrder, getProducts, type GiftOrder, type GiftOrderCreateInput, type ProductList } from '@/lib/api';

const occasions = ['Birthday', 'Wedding', 'Graduation', 'Thank You', 'Cultural Celebration', 'Team Appreciation'];

type Recipient = {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  personal_message: string;
};

export function GiftingExperience() {
  const { session } = useAuth();
  const cart = useCartStore();
  const [mode, setMode] = useState<'personal' | 'corporate'>('personal');
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ProductList[]>([]);
  const [selected, setSelected] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState<GiftOrder | null>(null);
  const [form, setForm] = useState({
    customer_name: session?.user?.name || '',
    customer_email: session?.user?.email || '',
    contact_phone: '',
    company: '',
    occasion: occasions[0],
    gift_message: 'A meaningful gift from Empindu.',
    branding_notes: '',
    delivery_date: '',
  });
  const [recipients, setRecipients] = useState<Recipient[]>([
    { name: '', email: '', phone: '', city: '', address: '', personal_message: '' },
  ]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      customer_name: prev.customer_name || session?.user?.name || '',
      customer_email: prev.customer_email || session?.user?.email || '',
    }));
  }, [session?.user?.email, session?.user?.name]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const results = await getProducts({ occasion: query || form.occasion, page_size: 12 });
        setProducts(results);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load gift products.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [query, form.occasion]);

  const cartProducts = cart.items.map((item) => item.product);

  const giftItems = useMemo(() => {
    const source = selected.length > 0 ? selected : cartProducts;
    return source.map((product) => ({
      product_id: product.id,
      quantity: 1,
      personalization: 'Gift-ready packaging and artisan story card',
    }));
  }, [cartProducts, selected]);

  const total = useMemo(() => {
    const source = selected.length > 0 ? selected : cartProducts;
    return source.reduce((sum, product) => sum + product.price_ugx, 0);
  }, [cartProducts, selected]);

  const submit = async () => {
    setError('');
    if (!form.customer_name || !form.customer_email) {
      setError('Sender name and email are required.');
      return;
    }
    if (giftItems.length === 0) {
      setError('Choose at least one product or add items to your cart.');
      return;
    }
    const usableRecipients = recipients.filter((recipient) => recipient.name.trim());
    if (usableRecipients.length === 0) {
      setError('Add at least one recipient name.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: GiftOrderCreateInput = {
        ...form,
        company: mode === 'corporate' ? form.company : '',
        branding_notes: mode === 'corporate' ? form.branding_notes : '',
        items: giftItems,
        recipients: usableRecipients,
        notes: mode === 'corporate' ? 'Corporate gifting request' : 'Personal gift request',
      };
      const order = await createGiftOrder(payload, session?.accessToken);
      setComplete(order);
      if (selected.length === 0) cart.clearCart();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Gift order could not be created.');
    } finally {
      setSubmitting(false);
    }
  };

  if (complete) {
    return (
      <main className="min-h-screen bg-background px-4 py-24 text-foreground">
        <div className="mx-auto max-w-3xl border-2 border-foreground bg-card p-10 shadow-brutal">
          <span className="brutal-eyebrow">Gift Order Captured</span>
          <h1 className="brutal-h2 mt-6">Gift order #{complete.id}</h1>
          <p className="mt-4 font-body leading-8 text-muted-foreground">
            {complete.total_items} item(s), {complete.recipient_count} recipient(s), UGX {Math.round(complete.total_amount_ugx).toLocaleString()}.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="earth">
              <Link href="/marketplace">Continue shopping</Link>
            </Button>
            <Button asChild variant="outline">
              <a href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(`Empindu gift order #${complete.id} is in motion.`)}`} target="_blank" rel="noreferrer">
                <Send className="h-4 w-4" />
                Share update
              </a>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b-2 border-foreground bg-bark-brown text-warm-cream">
        <div
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent 0 22px, hsl(var(--kente-gold) / 0.55) 22px 24px), repeating-linear-gradient(90deg, transparent 0 22px, hsl(var(--copper) / 0.4) 22px 24px)',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 lg:px-8">
          <span className="brutal-eyebrow-light">Empindu Gifting</span>
          <h1 className="brutal-h1 mt-6 max-w-4xl">
            Send artisan <span className="text-accent italic">stories</span> as gifts, from one person or a whole team.
          </h1>
          <p className="mt-6 max-w-2xl font-body text-lg leading-8 text-warm-cream/80">
            Personal gifts and corporate bundles use the same product catalogue, cart, recipient data, and gift order database.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <section className="rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-clay">
            <div className="grid grid-cols-2 rounded-2xl bg-muted p-1">
              <button type="button" onClick={() => setMode('personal')} className={`min-h-11 rounded-xl text-sm font-semibold ${mode === 'personal' ? 'bg-card shadow-medium' : 'text-muted-foreground'}`}>
                Personal
              </button>
              <button type="button" onClick={() => setMode('corporate')} className={`min-h-11 rounded-xl text-sm font-semibold ${mode === 'corporate' ? 'bg-card shadow-medium' : 'text-muted-foreground'}`}>
                Corporate
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <Field label="Sender name">
                <Input value={form.customer_name} onChange={(event) => setForm({ ...form, customer_name: event.target.value })} />
              </Field>
              <Field label="Sender email">
                <Input type="email" value={form.customer_email} onChange={(event) => setForm({ ...form, customer_email: event.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={form.contact_phone} onChange={(event) => setForm({ ...form, contact_phone: event.target.value })} placeholder="+256..." />
              </Field>
              {mode === 'corporate' ? (
                <Field label="Company">
                  <Input value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
                </Field>
              ) : null}
              <Field label="Occasion">
                <select value={form.occasion} onChange={(event) => setForm({ ...form, occasion: event.target.value })} className="min-h-11 rounded-md border border-input bg-background px-3 text-sm">
                  {occasions.map((occasion) => <option key={occasion}>{occasion}</option>)}
                </select>
              </Field>
              <Field label="Gift message">
                <Textarea value={form.gift_message} onChange={(event) => setForm({ ...form, gift_message: event.target.value })} />
              </Field>
              {mode === 'corporate' ? (
                <Field label="Branding and packaging notes">
                  <Textarea value={form.branding_notes} onChange={(event) => setForm({ ...form, branding_notes: event.target.value })} />
                </Field>
              ) : null}
            </div>
          </section>

          <section className="grid gap-5">
            <div className="rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-clay">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-accent" />
                <h2 className="text-2xl font-bold">Gift product search</h2>
              </div>
              <Input className="mt-4" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by occasion, material, craft, place..." />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {loading ? <Loader2 className="h-6 w-6 animate-spin text-accent" /> : null}
                {products.map((product) => {
                  const picked = selected.some((item) => item.id === product.id);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setSelected((current) => picked ? current.filter((item) => item.id !== product.id) : [...current, product])}
                      className={`rounded-2xl border p-3 text-left text-sm transition ${picked ? 'border-accent bg-accent/10' : 'border-foreground/10 bg-muted/30 hover:bg-muted'}`}
                    >
                      <span className="font-bold">{product.name}</span>
                      <span className="mt-1 block text-muted-foreground">UGX {Math.round(product.price_ugx).toLocaleString()} by {product.artisan.full_name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-clay">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-accent" />
                <h2 className="text-2xl font-bold">Recipients</h2>
              </div>
              <div className="mt-4 grid gap-4">
                {recipients.map((recipient, index) => (
                  <div key={index} className="grid gap-3 rounded-2xl bg-muted/40 p-4 sm:grid-cols-2">
                    <Input placeholder="Recipient name" value={recipient.name} onChange={(event) => updateRecipient(index, 'name', event.target.value, recipients, setRecipients)} />
                    <Input placeholder="Email" value={recipient.email} onChange={(event) => updateRecipient(index, 'email', event.target.value, recipients, setRecipients)} />
                    <Input placeholder="Phone" value={recipient.phone} onChange={(event) => updateRecipient(index, 'phone', event.target.value, recipients, setRecipients)} />
                    <Input placeholder="City" value={recipient.city} onChange={(event) => updateRecipient(index, 'city', event.target.value, recipients, setRecipients)} />
                    <Textarea className="sm:col-span-2" placeholder="Personal message" value={recipient.personal_message} onChange={(event) => updateRecipient(index, 'personal_message', event.target.value, recipients, setRecipients)} />
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" className="mt-4" onClick={() => setRecipients([...recipients, { name: '', email: '', phone: '', city: '', address: '', personal_message: '' }])}>
                <PackagePlus className="h-4 w-4" />
                Add recipient
              </Button>
            </div>

            <div className="rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-clay">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{giftItems.length || cart.items.length} selected item(s)</p>
                  <p className="text-2xl font-bold">UGX {Math.round(total).toLocaleString()}</p>
                </div>
                <Button type="button" variant="earth" onClick={submit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                  Create gift order
                </Button>
              </div>
              {cart.items.length > 0 && selected.length === 0 ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" />
                  Using your current cart. Select products above to override.
                </p>
              ) : null}
              {error ? <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

function updateRecipient(
  index: number,
  field: keyof Recipient,
  value: string,
  recipients: Recipient[],
  setRecipients: (recipients: Recipient[]) => void,
) {
  setRecipients(recipients.map((recipient, current) => (current === index ? { ...recipient, [field]: value } : recipient)));
}
