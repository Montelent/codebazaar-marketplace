"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, formatCompact, getEffectivePrice } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import type { ItemCardData } from "@/types";
import { useState, useEffect } from "react";

interface ItemCardProps {
  item: ItemCardData;
  showAddToCart?: boolean;
}

export function ItemCard({ item, showAddToCart = true }: ItemCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const hasWish = useWishlistStore((s) => s.has);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setWishlisted(hasWish(item.id) || hasWish(item.slug));
  }, [item.id, item.slug, hasWish]);

  const { price, original } = getEffectivePrice(
    item.regularPrice,
    item.extendedPrice,
    item.salePriceRegular,
    item.salePriceExtended
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      itemId: item.id,
      slug: item.slug,
      title: item.title,
      thumbnailUrl: item.thumbnailUrl,
      licenseType: "REGULAR",
      price,
      originalPrice: original,
      authorUsername: item.author.username,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWish({
      id: item.id,
      slug: item.slug,
      title: item.title,
      thumbnailUrl: item.thumbnailUrl,
      regularPrice: Number(item.regularPrice),
      extendedPrice: Number(item.extendedPrice),
      salePriceRegular: item.salePriceRegular,
      salePriceExtended: item.salePriceExtended,
      authorUsername: item.author?.username,
      categorySlug: item.category?.slug,
      categoryName: item.category?.name,
      ratingAvg: item.ratingAvg,
      ratingCount: item.ratingCount,
      salesCount: item.salesCount,
    });
    setWishlisted((w) => !w);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Link href={`/item/${item.slug}/${item.id}`}>
          <Image
            src={item.thumbnailUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>
        <button
          type="button"
          onClick={handleWishlist}
          className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 shadow-sm backdrop-blur transition hover:bg-white"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-slate-600"}`}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link
          href={`/item/${item.slug}/${item.id}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 hover:text-emerald-700"
        >
          {item.title}
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>
            by{" "}
            <Link
              href={`/author/${item.author.username}`}
              className="font-medium text-slate-700 hover:text-emerald-600"
            >
              {item.author.username}
            </Link>
          </span>
          <span>·</span>
          <Link href={`/category/${item.category.slug}`} className="hover:text-emerald-600">
            {item.category.name}
          </Link>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-medium text-slate-800">{(item.ratingAvg || 0).toFixed(1)}</span>
            <span className="text-slate-400">({item.ratingCount || 0})</span>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {formatCompact(item.salesCount || 0)} Sales
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900">
              {Number(item.regularPrice) <= 0 ? "Free" : formatPrice(price)}
            </span>
            {original != null && Number(item.regularPrice) > 0 && (
              <span className="text-xs text-slate-400 line-through">{formatPrice(original)}</span>
            )}
          </div>
          {showAddToCart && (
            <Button
              size="sm"
              variant={added ? "secondary" : "default"}
              onClick={handleAddToCart}
              className="shrink-0"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {added ? "Added" : "Add"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
