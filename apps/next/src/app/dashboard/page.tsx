'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Archive,
  BadgeCheck,
  Banknote,
  Boxes,
  Edit3,
  ExternalLink,
  Loader2,
  PackagePlus,
  ReceiptText,
  Save,
  Store,
  Truck,
  UserRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import {
  archiveMyArtisanProduct,
  createMyArtisanProduct,
  getMyArtisanDashboard,
  updateMyArtisanProduct,
  updateMyArtisanProfile,
  updateOrderStatus,
  type ArtisanDashboard,
  type ArtisanDashboardProduct,
  type ArtisanProductInput,
  type ArtisanProfileInput,
} from '@/lib/api';
import { cn } from '@/lib/utils';

type View = 'overview' | 'profile' | 'products' | 'orders';

const tabs: Array<{ id: View; label: string; icon: typeof Store }> = [
  { id: 'overview', label: 'Overview', icon: Store },
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'products', label: 'Products', icon: Boxes },
  { id: 'orders', label: 'Orders', icon: ReceiptText },
];

const orderStatuses = ['pending_payment', 'paid', 'confirmed', 'dispatched', 'in_transit', 'delivered', 'disputed', 'refunded'];

const blankProduct: ArtisanProductInput = {
  name: '',
  story: '',
  material: '',
  technique: '',
  days_to_make: 1,
  price_ugx: 0,
  stock: 1,
  status: 'draft',
  is_customisable: false,
  weight_grams: 0,
};

export default function ArtisanDashboardPage() {
  const { session, loading } = useAuth();
  const [view, setView] = useState<View>('overview');
  const [dashboard, setDashboard] = useState<ArtisanDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    if (!session?.accessToken) return;
    setIsLoading(true);
    setError('');
    try {
      setDashboard(await getMyArtisanDashboard(session.accessToken));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load artisan dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && session?.accessToken) {
      loadDashboard();
    } else if (!loading) {
      setIsLoading(false);
    }
  }, [loading, session?.accessToken]);

  const saveProfile = async (payload: ArtisanProfileInput) => {
    if (!session?.accessToken || !dashboard) return;
    setIsSaving(true);
    setMessage('');
    setError('');
    try {
      const artisan = await updateMyArtisanProfile(payload, session.accessToken);
      setDashboard({ ...dashboard, artisan });
      setMessage('Profile updated.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Profile update failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveProduct = async (payload: ArtisanProductInput, productId?: number) => {
    if (!session?.accessToken) return;
    setIsSaving(true);
    setMessage('');
    setError('');
    try {
      if (productId) {
        await updateMyArtisanProduct(productId, payload, session.accessToken);
        setMessage('Product updated.');
      } else {
        await createMyArtisanProduct(payload, session.accessToken);
        setMessage('Product created as a managed listing.');
      }
      await loadDashboard();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Product save failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const archiveProduct = async (productId: number) => {
    if (!session?.accessToken) return;
    setIsSaving(true);
    try {
      await archiveMyArtisanProduct(productId, session.accessToken);
      setMessage('Product archived.');
      await loadDashboard();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : 'Product archive failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const changeOrderStatus = async (orderId: number, status: string) => {
    if (!session?.accessToken) return;
    setIsSaving(true);
    try {
      await updateOrderStatus(orderId, status, session.accessToken);
      setMessage('Order status updated.');
      await loadDashboard();
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Order update failed.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-background px-4 py-16">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-foreground/10 bg-card p-8 text-center shadow-clay">
          <h1 className="text-3xl font-bold">Artisan sign-in required</h1>
          <p className="mt-3 text-muted-foreground">Sign in to manage your profile, products, orders, and payout details.</p>
          <Button asChild variant="earth" className="mt-6">
            <Link href="/auth?intent=artisan-publish&callbackUrl=/dashboard">Sign in</Link>
          </Button>
        </div>
      </main>
    );
  }

  if (!dashboard) {
    return (
      <main className="min-h-screen bg-background px-4 py-16">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-foreground/10 bg-card p-8 text-center shadow-clay">
          <h1 className="text-3xl font-bold">No artisan profile yet</h1>
          <p className="mt-3 text-muted-foreground">Complete onboarding first so the dashboard has a profile and public URL to manage.</p>
          <Button asChild variant="earth" className="mt-6">
            <Link href="/onboarding">Start onboarding</Link>
          </Button>
          {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 rounded-[2rem] bg-mud p-5 text-primary shadow-clay sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/70">Artisan dashboard</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">{dashboard.artisan.full_name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-primary/75">
                {dashboard.artisan.craft_tradition.name} from {dashboard.artisan.community}, {dashboard.artisan.district}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline-light">
                <Link href={dashboard.artisan.profile_url}>
                  Public profile
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="gold">
                <Link href="/onboarding">Refine onboarding</Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1 md:grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setView(tab.id)}
                className={cn(
                  'flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition',
                  view === tab.id ? 'bg-card shadow-medium' : 'text-muted-foreground hover:bg-card/50',
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {message ? <p className="mb-4 rounded-xl bg-gold/15 px-4 py-3 text-sm">{message}</p> : null}
        {error ? <p className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

        {view === 'overview' ? <Overview dashboard={dashboard} /> : null}
        {view === 'profile' ? <ProfileEditor artisan={dashboard.artisan} onSave={saveProfile} isSaving={isSaving} /> : null}
        {view === 'products' ? (
          <ProductsManager products={dashboard.products} onSave={saveProduct} onArchive={archiveProduct} isSaving={isSaving} />
        ) : null}
        {view === 'orders' ? <OrdersManager orders={dashboard.orders} onChangeStatus={changeOrderStatus} isSaving={isSaving} /> : null}
      </div>
    </main>
  );
}

function Overview({ dashboard }: { dashboard: ArtisanDashboard }) {
  const stats = [
    { label: 'Products', value: dashboard.stats.products, icon: Boxes },
    { label: 'Open orders', value: dashboard.stats.open_orders, icon: Truck },
    { label: 'Paid earnings', value: money(dashboard.stats.total_earnings_ugx), icon: Banknote },
    { label: 'Pending payout', value: money(dashboard.stats.pending_payout_ugx), icon: ReceiptText },
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-clay">
              <Icon className="h-5 w-5 text-accent" />
              <p className="mt-4 text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-clay">
          <h2 className="text-xl font-bold">Profile readiness</h2>
          <div className="mt-4 grid gap-3">
            <Readiness done={Boolean(dashboard.artisan.bio)} label="Story written" />
            <Readiness done={dashboard.stats.products > 0} label="At least one product listed" />
            <Readiness done={Boolean(dashboard.artisan.momo_number || dashboard.artisan.airtel_number)} label="Payout number connected" />
            <Readiness done={dashboard.artisan.is_certified} label="Empindu certification" />
          </div>
        </section>

        <section className="rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-clay">
          <h2 className="text-xl font-bold">Recent orders</h2>
          <div className="mt-4 grid gap-3">
            {dashboard.orders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm">
                <span>{order.product_name}</span>
                <span className="font-semibold">{order.status.replaceAll('_', ' ')}</span>
              </div>
            ))}
            {dashboard.orders.length === 0 ? <p className="text-sm text-muted-foreground">Orders will appear here after checkout.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileEditor({
  artisan,
  onSave,
  isSaving,
}: {
  artisan: ArtisanDashboard['artisan'];
  onSave: (payload: ArtisanProfileInput) => Promise<void>;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ArtisanProfileInput>({
    bio: artisan.bio,
    bio_luganda: artisan.bio_luganda,
    bio_swahili: artisan.bio_swahili,
    community: artisan.community,
    district: artisan.district,
    phone: artisan.phone,
    momo_number: artisan.momo_number,
    airtel_number: artisan.airtel_number,
    years_experience: artisan.years_experience,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
      className="grid gap-5 rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-clay"
    >
      <div className="flex items-center gap-3">
        <UserRound className="h-5 w-5 text-accent" />
        <h2 className="text-2xl font-bold">Profile management</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Community">
          <Input value={form.community || ''} onChange={(event) => setForm({ ...form, community: event.target.value })} />
        </Field>
        <Field label="District">
          <Input value={form.district || ''} onChange={(event) => setForm({ ...form, district: event.target.value })} />
        </Field>
        <Field label="Phone">
          <Input value={form.phone || ''} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        </Field>
        <Field label="Years experience">
          <Input
            type="number"
            min={0}
            value={form.years_experience || 0}
            onChange={(event) => setForm({ ...form, years_experience: Number(event.target.value) || 0 })}
          />
        </Field>
        <Field label="MTN MoMo">
          <Input value={form.momo_number || ''} onChange={(event) => setForm({ ...form, momo_number: event.target.value })} />
        </Field>
        <Field label="Airtel Money">
          <Input value={form.airtel_number || ''} onChange={(event) => setForm({ ...form, airtel_number: event.target.value })} />
        </Field>
      </div>
      <Field label="English story">
        <Textarea value={form.bio || ''} onChange={(event) => setForm({ ...form, bio: event.target.value })} className="min-h-32" />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Luganda story">
          <Textarea value={form.bio_luganda || ''} onChange={(event) => setForm({ ...form, bio_luganda: event.target.value })} />
        </Field>
        <Field label="Swahili story">
          <Textarea value={form.bio_swahili || ''} onChange={(event) => setForm({ ...form, bio_swahili: event.target.value })} />
        </Field>
      </div>
      <Button type="submit" variant="earth" disabled={isSaving} className="w-fit">
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save profile
      </Button>
    </form>
  );
}

function ProductsManager({
  products,
  onSave,
  onArchive,
  isSaving,
}: {
  products: ArtisanDashboardProduct[];
  onSave: (payload: ArtisanProductInput, productId?: number) => Promise<void>;
  onArchive: (productId: number) => Promise<void>;
  isSaving: boolean;
}) {
  const [editing, setEditing] = useState<ArtisanDashboardProduct | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Product listings</h2>
        <Button
          type="button"
          variant="accent"
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
        >
          <PackagePlus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      {showForm ? (
        <ProductEditor
          product={editing}
          isSaving={isSaving}
          onCancel={() => setShowForm(false)}
          onSave={async (payload, id) => {
            await onSave(payload, id);
            setShowForm(false);
          }}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="rounded-[2rem] border border-foreground/10 bg-card p-4 shadow-clay">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
              {product.hero_photo_url ? (
                <img src={product.hero_photo_url} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image yet</div>
              )}
            </div>
            <div className="mt-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.status.replaceAll('_', ' ')}</p>
              </div>
              <p className="shrink-0 text-sm font-bold">{money(product.price_ugx)}</p>
            </div>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{product.story}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(product);
                  setShowForm(true);
                }}
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onArchive(product.id)} disabled={isSaving}>
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            </div>
          </article>
        ))}
      </div>
      {products.length === 0 ? <p className="rounded-2xl border border-dashed border-foreground/20 p-8 text-center text-muted-foreground">No products yet. Add a draft listing to start shaping your shop.</p> : null}
    </div>
  );
}

function ProductEditor({
  product,
  onSave,
  onCancel,
  isSaving,
}: {
  product: ArtisanDashboardProduct | null;
  onSave: (payload: ArtisanProductInput, productId?: number) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ArtisanProductInput>(
    product
      ? {
          name: product.name,
          story: product.story,
          material: product.material,
          technique: product.technique,
          days_to_make: product.days_to_make,
          price_ugx: product.price_ugx,
          stock: product.stock,
          status: product.status,
          is_customisable: product.is_customisable,
          weight_grams: product.weight_grams,
        }
      : blankProduct,
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form, product?.id);
      }}
      className="grid gap-4 rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-clay"
    >
      <h3 className="text-xl font-bold">{product ? 'Edit product' : 'New product'}</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        </Field>
        <Field label="Status">
          <select
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value as ArtisanProductInput['status'] })}
            className="min-h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="sold_out">Sold out</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Field label="Price UGX">
          <Input type="number" min={0} value={form.price_ugx} onChange={(event) => setForm({ ...form, price_ugx: Number(event.target.value) || 0 })} required />
        </Field>
        <Field label="Stock">
          <Input type="number" min={0} value={form.stock} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) || 0 })} required />
        </Field>
        <Field label="Material">
          <Input value={form.material} onChange={(event) => setForm({ ...form, material: event.target.value })} required />
        </Field>
        <Field label="Technique">
          <Input value={form.technique} onChange={(event) => setForm({ ...form, technique: event.target.value })} required />
        </Field>
        <Field label="Days to make">
          <Input type="number" min={1} value={form.days_to_make} onChange={(event) => setForm({ ...form, days_to_make: Number(event.target.value) || 1 })} />
        </Field>
        <Field label="Weight grams">
          <Input type="number" min={0} value={form.weight_grams} onChange={(event) => setForm({ ...form, weight_grams: Number(event.target.value) || 0 })} />
        </Field>
      </div>
      <Field label="Story">
        <Textarea value={form.story} onChange={(event) => setForm({ ...form, story: event.target.value })} className="min-h-32" required />
      </Field>
      <button
        type="button"
        onClick={() => setForm({ ...form, is_customisable: !form.is_customisable })}
        className="flex min-h-12 items-center justify-between rounded-2xl border border-foreground/10 bg-muted/40 px-4 text-left text-sm"
      >
        <span>Accept custom requests</span>
        <span className={cn('h-6 w-11 rounded-full p-1 transition', form.is_customisable ? 'bg-accent' : 'bg-muted-foreground/25')}>
          <span className={cn('block h-4 w-4 rounded-full bg-card transition', form.is_customisable ? 'translate-x-5' : 'translate-x-0')} />
        </span>
      </button>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" variant="earth" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save product
        </Button>
      </div>
    </form>
  );
}

function OrdersManager({
  orders,
  onChangeStatus,
  isSaving,
}: {
  orders: ArtisanDashboard['orders'];
  onChangeStatus: (orderId: number, status: string) => Promise<void>;
  isSaving: boolean;
}) {
  return (
    <div className="grid gap-4">
      <h2 className="text-2xl font-bold">Order management</h2>
      {orders.map((order) => (
        <article key={order.id} className="rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-clay">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Order #{order.id}</p>
              <h3 className="mt-1 text-xl font-bold">{order.product_name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {order.quantity} item, {money(order.price_ugx)} total, {money(order.artisan_earnings_ugx)} artisan earnings
              </p>
            </div>
            <select
              value={order.status}
              disabled={isSaving}
              onChange={(event) => onChangeStatus(order.id, event.target.value)}
              className="min-h-11 rounded-md border border-input bg-background px-3 text-sm"
            >
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
            <span>{order.shipping_name}</span>
            <span>{order.buyer_email}</span>
            <span>{order.payment_method} / payout {order.payout_status}</span>
          </div>
        </article>
      ))}
      {orders.length === 0 ? <p className="rounded-2xl border border-dashed border-foreground/20 p-8 text-center text-muted-foreground">No orders yet.</p> : null}
    </div>
  );
}

function Readiness({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 text-sm">
      <BadgeCheck className={cn('h-4 w-4', done ? 'text-accent' : 'text-muted-foreground')} />
      <span className={done ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

function money(value: number) {
  return `UGX ${Math.round(value || 0).toLocaleString()}`;
}
