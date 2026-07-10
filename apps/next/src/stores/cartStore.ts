import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/hooks/useProducts';

export interface CartItem {
  product: Product;
  quantity: number;
  personalizationNote?: string;
  giftDetails?: {
    recipient_name?: string;
    recipient_relationship?: string;
    occasion?: string;
    personal_message?: string;
    gift_wrap?: boolean;
    scheduled_delivery_date?: string | null;
  } | null;
}

interface CartState {
  items: CartItem[];
  shipping_address?: ShippingAddressInput | null;
  buyer_email?: string | null;
  buyer_phone?: string | null;
  shipping_country?: string | null;
  payment_method?: string | null;
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, personalizationNote?: string) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updatePersonalization: (productId: number, note: string) => void;
  setItemGiftDetails: (productId: number, details: CartItem['giftDetails'] | null) => void;
  setShippingAddress: (address: ShippingAddressInput) => void;
  setBuyerInfo: (email?: string | null, phone?: string | null) => void;
  setPaymentMethod: (method: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, quantity = 1, personalizationNote) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && !item.personalizationNote && !personalizationNote
          );

          if (existingItem && !personalizationNote) {
            const newQuantity = Math.min(
              existingItem.quantity + quantity,
              product.stock_quantity
            );
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && !item.personalizationNote
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
              isOpen: true,
            };
          }

          return {
            items: [...state.items, { 
              product, 
              quantity: Math.min(quantity, product.stock_quantity),
              personalizationNote,
              giftDetails: null,
            }],
            isOpen: true,
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock_quantity)) }
              : item
          ),
        }));
      },

      updatePersonalization: (productId, note) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, personalizationNote: note }
              : item
          ),
        }));
      },

      setItemGiftDetails: (productId, details) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId
              ? { ...item, giftDetails: details }
              : item
          ),
        }));
      },

      setShippingAddress: (address) => set({ shipping_address: address }),

      setBuyerInfo: (email, phone) => set({ buyer_email: email || null, buyer_phone: phone || null }),

      setPaymentMethod: (method) => set({ payment_method: method }),

      clearCart: () => {
        set({ items: [] });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'crafted-uganda-cart',
      partialize: (state) => ({
        items: state.items,
        shipping_address: state.shipping_address,
        buyer_email: state.buyer_email,
        buyer_phone: state.buyer_phone,
        shipping_country: state.shipping_country,
        payment_method: state.payment_method,
      }),
    }
  )
);

// Shipping address input type used in store helper signatures
export interface ShippingAddressInput {
  line1: string;
  city: string;
  country: string;
  postcode?: string;
  notes?: string;
}
