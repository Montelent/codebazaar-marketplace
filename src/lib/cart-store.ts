"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, LicenseType } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string, licenseType: LicenseType) => void;
  updateLicense: (itemId: string, oldLicense: LicenseType, newLicense: LicenseType, newPrice: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.itemId === item.itemId && i.licenseType === item.licenseType
          );
          if (existing) return state;
          return { items: [...state.items, item] };
        }),
      removeItem: (itemId, licenseType) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.itemId === itemId && i.licenseType === licenseType)
          ),
        })),
      updateLicense: (itemId, oldLicense, newLicense, newPrice) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.itemId === itemId && i.licenseType === oldLicense
              ? { ...i, licenseType: newLicense, price: newPrice }
              : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      itemCount: () => get().items.length,
      subtotal: () => get().items.reduce((sum, i) => sum + i.price, 0),
    }),
    { name: "codebazaar-cart" }
  )
);
