"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

type OwnedPreview = {
  itemId: string;
  slug: string;
  title: string;
  licenseType: string;
  price: number;
};

export default function CheckoutPage() {
  const { data: session } = useSession();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.price), 0),
    [items]
  );
  const isFree = total <= 0;
  const [email, setEmail] = useState(session?.user?.email || "");
  const [name, setName] = useState(session?.user?.name || "");
  const [method, setMethod] = useState<"free" | "manual" | "stripe">(
    isFree ? "free" : "manual"
  );
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderItems, setOrderItems] = useState<OwnedPreview[]>([]);
  const [orderId, setOrderId] = useState("");

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
          {isFree ? "Download ready" : "Order saved"}
        </h1>
        <p className="mt-2 text-slate-600">
          Saved to the database{orderId ? ` (order ${orderId.slice(0, 8)}…)` : ""}. Use the same
          email on any device to open Downloads and Purchases.
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
      setError("Email is required so your purchases sync on every device");
      return;
    }
    setLoading(true);
    try {
      const payloadItems = items.map((i) => ({
        itemId: i.itemId,
        slug: i.slug,
        title: i.title,
        thumbnailUrl: i.thumbnailUrl,
        licenseType: i.licenseType,
        price: Number(i.price),
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          method: isFree ? "free" : method,
          items: payloadItems,
          total,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.permanent) {
        setError(
          data.error ||
            "Could not save order to the database. Check DATABASE_URL on Vercel."
        );
        return;
      }
      setOrderId(String(data.orderId || ""));
      setOrderItems(
        (data.items || payloadItems).map(
          (i: {
            itemId: string;
            slug?: string;
            title?: string;
            licenseType?: string;
            price?: number;
          }) => ({
            itemId: i.itemId,
            slug: i.slug || "",
            title: i.title || "Item",
            licenseType: i.licenseType || "REGULAR",
            price: Number(i.price) || 0,
          })
        )
      );
      clearCart();
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error saving order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
      <p className="text-sm text-slate-500">
        Purchases are stored in the database for any device.
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
                <label className="text-sm font-medium">Email (required for multi-device access)</label>
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
              ? "Saving to database…"
              : isFree
                ? "Get free items"
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
        </div>
      </div>
    </div>
  );
}
