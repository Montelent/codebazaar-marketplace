"use client";

import Link from "next/link";
import { ItemGrid } from "@/components/items/item-grid";
import { useWishlistStore, wishlistToCard } from "@/lib/wishlist-store";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const cards = items.map(wishlistToCard);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Wishlist</h2>
        <p className="mt-1 text-sm text-slate-500">
          Items you saved for later. Click the heart on any product to add or remove it.
        </p>
      </div>
      {cards.length > 0 ? (
        <ItemGrid items={cards} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
          Your wishlist is empty. Browse the marketplace and tap the heart icon to save items.
        </div>
      )}
      <Link href="/search" className="inline-block text-sm text-emerald-600 hover:underline">
        Find more items →
      </Link>
    </div>
  );
}
