"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { usePurchasesStore } from "@/lib/purchases-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const addPurchases = usePurchasesStore((s) => s.addPurchases);
  const total = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.price), 0),
    [items]
  );
  const isFree = total <= 0;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [method, setMethod] = useState<"free" | "manual" | "stripe">(
    isFree ? "free" : "manual"
  );
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderItems, setOrderItems] = useState(items);

  if (items.length === 0 && !done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        <p className="mt-2 text-slate-500">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block text-emerald-600 hover:underline">
          Browse marketplace
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          {isFree ? "Download ready" : "Order placed"}
        </h1>
        <p className="mt-2 text-slate-600">
          {isFree
            ? "Your free item(s) are in Downloads and Purchases."
            : "Your licenses are ready. Open Downloads to get your files."}
        </p>
        <ul className="mx-auto mt-4 max-w-sm space-y-2 text-left text-sm text-slate-700">
          {orderItems.map((i) => (
            <li key={`${i.itemId}-${i.licenseType}`} className="rounded border bg-slate-50 px-3 py-2">
              {i.title} · {i.licenseType} ·{" "}
              {Number(i.price) <= 0 ? "Free" : formatPrice(i.price)}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/account/downloads">
            <Button>Go to downloads</Button>
          </Link>
          <Link href="/account/purchases">
            <Button variant="outline">View purchases</Button>
          </Link>
        </div>
      </div>
    );
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    try {
      const owned = items.map((i) => ({
        id: `${i.itemId}-${i.licenseType}-${Date.now()}`,
        itemId: i.itemId,
        slug: i.slug,
        title: i.title,
        thumbnailUrl: i.thumbnailUrl,
        licenseType: i.licenseType,
        price: Number(i.price),
        purchasedAt: new Date().toISOString(),
        downloadUrl: `/api/download/${i.itemId}`,
      }));
      addPurchases(owned);
      setOrderItems([...items]);
      try {
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            name: name.trim(),
            method: isFree ? "free" : method,
            items: owned,
            total,
          }),
        });
      } catch {
        /* client store is enough */
      }
      clearCart();
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
      <p className="text-sm text-slate-500">
        {isFree ? "Free items — no payment required" : "Complete your purchase"}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <form onSubmit={placeOrder} className="space-y-4 lg:col-span-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Contact</h2>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-sm font-medium">Full name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" required />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </div>

          {!isFree && (
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Payment method</h2>
              <div className="mt-3 space-y-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                  <input
                    type="radio"
                    name="pay"
                    checked={method === "manual"}
                    onChange={() => setMethod("manual")}
                    className="accent-emerald-600"
                  />
                  <span className="text-sm">
                    <strong>Manual / bank transfer</strong>
                    <span className="block text-xs text-slate-500">
                      We confirm payment then unlock downloads
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                  <input
                    type="radio"
                    name="pay"
                    checked={method === "stripe"}
                    onChange={() => setMethod("stripe")}
                    className="accent-emerald-600"
                  />
                  <span className="text-sm">
                    <strong>Card (Stripe)</strong>
                    <span className="block text-xs text-slate-500">
                      Requires Stripe keys in Admin → Payments
                    </span>
                  </span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading
              ? "Processing…"
              : isFree
                ? "Get free items"
                : method === "stripe"
                  ? `Pay ${formatPrice(total)} with Stripe`
                  : `Place order · ${formatPrice(total)}`}
          </Button>
        </form>

        <div className="h-fit rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((i) => (
              <li key={`${i.itemId}-${i.licenseType}`} className="flex justify-between gap-2">
                <span className="line-clamp-1 text-slate-700">{i.title}</span>
                <span className="shrink-0 font-medium">
                  {Number(i.price) <= 0 ? "Free" : formatPrice(i.price)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-3 font-bold">
            <span>Total</span>
            <span>{isFree ? "Free" : formatPrice(total)}</span>
          </div>
          <Link href="/cart" className="mt-3 inline-block text-xs text-emerald-600 hover:underline">
            ← Edit cart
          </Link>
        </div>
      </div>
    </div>
  );
}
