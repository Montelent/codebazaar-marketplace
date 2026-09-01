"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OwnedItem = {
  id: string;
  itemId: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  licenseType: "REGULAR" | "EXTENDED";
  price: number;
  purchasedAt: string;
  downloadUrl?: string;
};

interface PurchasesState {
  items: OwnedItem[];
  addPurchases: (items: OwnedItem[]) => void;
  clear: () => void;
}

export const usePurchasesStore = create<PurchasesState>()(
  persist(
    (set) => ({
      items: [],
      addPurchases: (newItems) =>
        set((state) => {
          const map = new Map(
            state.items.map((i) => [`${i.itemId}-${i.licenseType}`, i])
          );
          for (const it of newItems) {
            map.set(`${it.itemId}-${it.licenseType}`, it);
          }
          return { items: Array.from(map.values()) };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "codebazaar-purchases" }
  )
);
