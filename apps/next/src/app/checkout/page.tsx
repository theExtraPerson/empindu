"use client";

import { useEffect, useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { Link, useNavigate } from '@/lib/router-compat';
import { useAuth } from '@/hooks/useAuth';
import { checkoutCart, initiatePayment } from '@/lib/api';

export default function Page() {
  const { items, getTotalPrice, clearCart, setItemGiftDetails, setBuyerInfo } = useCartStore();
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [shippingName, setShippingName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [country, setCountry] = useState('Uganda');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');

  const buyerEmail = user?.email || '';

  useEffect(() => {
    setShippingName(buyerEmail || '');
  }, [buyerEmail]);

  return (
    <section className="min-h-screen bg-background text-foreground px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="border-2 border-foreground bg-card p-8 shadow-brutal">
          <h1 className="font-display text-4xl text-foreground tracking-tight mb-4">Checkout</h1>
          <p className="text-muted-foreground font-body leading-7">
            Review your selections, add a gift note if needed, and complete your purchase with confidence.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="border-2 border-foreground bg-background p-8 text-center">
            <p className="font-display text-xl text-secondary mb-4">Your cart is empty</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 rounded-none border-2 border-foreground bg-secondary px-6 py-3 text-sm font-display uppercase tracking-[0.35em] text-secondary-foreground hover:bg-secondary/90"
            >
              Shop the marketplace
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="grid gap-4">
                {items.map((item) => (
                  <div key={item.product.id} className="border-2 border-foreground bg-background p-6">
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

              <div className="border-2 border-foreground bg-muted p-6">
                <p className="font-display text-sm tracking-[0.25em] uppercase text-muted-foreground mb-2">Order total</p>
                <p className="font-display text-3xl text-foreground">UGX {getTotalPrice().toLocaleString()}</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Your purchase supports artisan earnings and the heritage fund while keeping the experience simple and gift-ready.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-2 border-foreground bg-background p-6">
                <h2 className="font-display text-xl text-foreground">Gift details</h2>
                <div className="mt-4 space-y-3">
                  <input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient name"
                    className="w-full border-2 border-foreground bg-background px-3 py-3 text-sm outline-none"
                  />
                  <input
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    placeholder="Occasion (birthday, wedding, thanking, etc.)"
                    className="w-full border-2 border-foreground bg-background px-3 py-3 text-sm outline-none"
                  />
                  <textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="Personal message for the recipient"
                    rows={4}
                    className="w-full border-2 border-foreground bg-background px-3 py-3 text-sm outline-none"
                  />
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} />
                    Include gift wrap and a handwritten note
                  </label>
                </div>
              </div>

              <div className="border-2 border-foreground bg-background p-6">
                <h2 className="font-display text-xl text-foreground">Delivery</h2>
                <div className="mt-4 space-y-3">
                  <input
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    placeholder="Shipping name"
                    className="w-full border-2 border-foreground bg-background px-3 py-3 text-sm outline-none"
                  />
                  <input
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="Phone number"
                    className="w-full border-2 border-foreground bg-background px-3 py-3 text-sm outline-none"
                  />
                  <input
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="Address line"
                    className="w-full border-2 border-foreground bg-background px-3 py-3 text-sm outline-none"
                  />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full border-2 border-foreground bg-background px-3 py-3 text-sm outline-none"
                  />
                  <input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="w-full border-2 border-foreground bg-background px-3 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                onClick={async () => {
                  if (!items.length) return;
                  setLoading(true);
                  try {
                    const giftDetails = recipientName || occasion || personalMessage || giftWrap
                      ? {
                          recipient_name: recipientName,
                          recipient_relationship: 'Friend or loved one',
                          occasion,
                          personal_message: personalMessage,
                          gift_wrap: giftWrap,
                        }
                      : null;

                    items.forEach((item) => {
                      setItemGiftDetails(item.product.id, giftDetails);
                    });
                    setBuyerInfo(buyerEmail, buyerPhone || null);

                    const payload = {
                      items: items.map((it) => ({ product_id: it.product.id, quantity: it.quantity })),
                      payment_method: 'momo',
                      shipping_name: shippingName || buyerEmail || 'Guest',
                      buyer_email: buyerEmail,
                      buyer_phone: buyerPhone,
                      shipping_country: country || 'Uganda',
                      shipping_address: { line1: addressLine, city, country: country || 'Uganda' },
                      gift_details: giftDetails,
                    };

                    const res = await checkoutCart(payload as any, session?.accessToken);
                    if (res.order_ids && res.order_ids.length) {
                      const intent = await initiatePayment(res.order_ids[0]);
                      if (intent.checkout_url) {
                        window.location.href = intent.checkout_url;
                        return;
                      }
                    }
                    clearCart();
                    navigate('/profile');
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full rounded-none border-2 border-foreground bg-secondary px-8 py-4 font-display uppercase tracking-[0.35em] text-secondary-foreground hover:bg-secondary/90"
              >
                {loading ? 'Processing…' : 'Proceed to payment'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
