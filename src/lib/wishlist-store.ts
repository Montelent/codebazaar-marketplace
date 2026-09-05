"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ItemCardData } from "@/types";

export type WishlistItem = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  regularPrice: number;
  extendedPrice: number;
  salePriceRegular?: number | null;
  salePriceExtended?: number | null;
  authorUsername?: string;
  categorySlug?: string;
  categoryName?: string;
  ratingAvg?: number;
  ratingCount?: number;
  salesCount?: number;
};

interface WishlistState {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (id: string) => void;
  toggle: (item: WishlistItem) => void;
  has: (id: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          if (s.items.some((x) => x.id === item.id || x.slug === item.slug)) return s;
          return { items: [item, ...s.items] };
        }),
      remove: (id) =>
        set((s) => ({
          items: s.items.filter((x) => x.id !== id && x.slug !== id),
        })),
      toggle: (item) => {
        const exists = get().items.some((x) => x.id === item.id || x.slug === item.slug);
        if (exists) get().remove(item.id);
        else get().add(item);
      },
      has: (id) => get().items.some((x) => x.id === id || x.slug === id),
      clear: () => set({ items: [] }),
    }),
    { name: "codebazaar-wishlist" }
  )
);

export function wishlistToCard(w: WishlistItem): ItemCardData {
  return {
    id: w.id,
    slug: w.slug,
    title: w.title,
    thumbnailUrl: w.thumbnailUrl,
    regularPrice: w.regularPrice,
    extendedPrice: w.extendedPrice,
    salePriceRegular: w.salePriceRegular ?? undefined,
    salePriceExtended: w.salePriceExtended ?? undefined,
    ratingAvg: w.ratingAvg ?? 0,
    ratingCount: w.ratingCount ?? 0,
    salesCount: w.salesCount ?? 0,
    author: { username: w.authorUsername || "codebazaar", avatarUrl: null },
    category: {
      name: w.categoryName || "Code",
      slug: w.categorySlug || "code",
    },
  };
}
