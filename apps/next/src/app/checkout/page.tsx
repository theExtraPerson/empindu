'use client';

import { useCartStore } from '@/stores/cartStore';
import { Link } from '@/lib/router-compat';

export default function Page() {
  const { items, getTotalPrice } = useCartStore();

  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-organic border-2 border-foreground bg-card p-8 shadow-brutal">
          <h1 className="font-display text-4xl text-foreground tracking-tight mb-4">Checkout</h1>
          <p className="text-muted-foreground font-body leading-7">
            Review your gift selections and complete your purchase with confidence.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-organic border-2 border-foreground bg-background p-8 text-center">
            <p className="font-display text-xl text-secondary mb-4">Your cart is empty</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-secondary px-6 py-3 text-sm font-display uppercase tracking-[0.35em] text-secondary-foreground hover:bg-secondary/90"
            >
              Shop the marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4">
              {items.map((item) => (
                <div key={item.product.id} className="rounded-organic border-2 border-foreground bg-background p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-display text-lg text-foreground">{item.product.name}</p>
                      <p className="text-muted-foreground text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-display text-xl text-secondary">UGX {(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-organic border-2 border-foreground bg-muted p-6 text-right">
              <p className="font-display text-sm tracking-[0.25em] uppercase text-muted-foreground mb-2">Order total</p>
              <p className="font-display text-3xl text-foreground">UGX {getTotalPrice().toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-none border-2 border-foreground bg-secondary px-8 py-4 font-display uppercase tracking-[0.35em] text-secondary-foreground hover:bg-secondary/90">
                Proceed to payment
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
