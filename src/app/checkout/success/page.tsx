"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";

function SuccessInner() {
  const search = useSearchParams();
  const sessionId = search.get("session_id") || "";
  const clearCart = useCartStore((s) => s.clearCart);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Confirming payment…");
  const [orderId, setOrderId] = useState("");
  const [items, setItems] = useState<
    { title: string; licenseType: string; price: number }[]
  >([]);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("Missing Stripe session. If you paid, contact support with your receipt.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/checkout/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Could not confirm payment");
          return;
        }
        setOrderId(String(data.orderId || ""));
        setItems(
          (data.items || []).map(
            (i: { title?: string; licenseType?: string; price?: number }) => ({
              title: i.title || "Item",
              licenseType: i.licenseType || "REGULAR",
              price: Number(i.price) || 0,
            })
          )
        );
        clearCart();
        setStatus("ok");
        setMessage("Payment confirmed. Your downloads are ready.");
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "Network error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, clearCart]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      {status === "loading" && (
        <>
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-600" />
          <p className="mt-4 text-slate-600">{message}</p>
        </>
      )}
      {status === "ok" && (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Payment successful</h1>
          <p className="mt-2 text-slate-600">
            {message}
            {orderId ? ` Order ${orderId.slice(0, 8)}…` : ""}
          </p>
          <ul className="mx-auto mt-4 max-w-sm space-y-2 text-left text-sm">
            {items.map((i, idx) => (
              <li key={idx} className="rounded border bg-slate-50 px-3 py-2">
                {i.title} · {i.licenseType} · {formatPrice(i.price)}
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
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-2xl font-bold text-slate-900">Payment issue</h1>
          <p className="mt-2 text-amber-800">{message}</p>
          <Link href="/checkout" className="mt-6 inline-block text-emerald-600 hover:underline">
            Back to checkout
          </Link>
        </>
      )}
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 text-center text-slate-500">
          Loading…
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
