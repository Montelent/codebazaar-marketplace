"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, removeItem, subtotal, clearCart } = useCartStore();
  const total = subtotal();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Browse the marketplace and add items to get started.</p>
        <Link href="/" className="mt-6">
          <Button>Continue shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div
              key={`${item.itemId}-${item.licenseType}`}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <Link
                  href={`/item/${item.slug}/${item.itemId}`}
                  className="line-clamp-1 font-medium text-slate-900 hover:text-emerald-700"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-slate-500">{item.licenseType} License</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-semibold">{formatPrice(item.price)}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.itemId, item.licenseType)}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={clearCart} className="text-sm text-slate-500 hover:text-red-600">
            Clear cart
          </button>
        </div>
        <div className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Link href="/checkout">
            <Button className="mt-6 w-full" size="lg">
              Proceed to checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
