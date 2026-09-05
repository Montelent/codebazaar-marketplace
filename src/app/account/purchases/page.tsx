"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type OwnedItem = {
  id: string;
  itemId: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  licenseType: string;
  price: number;
  purchasedAt: string;
  status?: string;
};

export default function PurchasesPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<OwnedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emailLookup, setEmailLookup] = useState("");

  async function load(email?: string) {
    setLoading(true);
    setError("");
    try {
      const q = email ? `?email=${encodeURIComponent(email)}` : "";
      const res = await fetch(`/api/orders${q}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not load purchases");
        setItems([]);
        return;
      }
      setItems(data.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user?.email) load();
    else setLoading(false);
  }, [session, status]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Purchases</h2>
      <p className="mt-1 text-sm text-slate-500">
        Your completed orders. Sign in with the same email used at checkout to see them on any device.
      </p>

      {!session?.user && (
        <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            <Link href="/sign-in" className="font-medium text-emerald-700 hover:underline">
              Sign in
            </Link>{" "}
            or look up by checkout email:
          </p>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (emailLookup.trim()) load(emailLookup.trim());
            }}
          >
            <Input
              type="email"
              placeholder="you@email.com"
              value={emailLookup}
              onChange={(e) => setEmailLookup(e.target.value)}
            />
            <Button type="submit" variant="outline">
              Load
            </Button>
          </form>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">{error}</p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
          <p className="text-sm text-slate-600">No purchases yet.</p>
          <Link href="/" className="mt-3 inline-block text-sm font-medium text-emerald-600 hover:underline">
            Browse marketplace
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-slate-100">
                <Image src={item.thumbnailUrl || "https://picsum.photos/seed/item/160/100"} alt="" fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/item/${item.slug}/${item.itemId}`}
                  className="font-medium text-slate-900 hover:text-emerald-700"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {item.licenseType} · {new Date(item.purchasedAt).toLocaleString()}
                </p>
              </div>
              <div className="text-sm font-semibold text-slate-800">
                {item.price <= 0 ? "Free" : formatPrice(item.price)}
              </div>
              <Link
                href="/account/downloads"
                className="text-sm font-medium text-emerald-600 hover:underline"
              >
                Download
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
