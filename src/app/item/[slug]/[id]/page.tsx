"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart } from "lucide-react";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { formatPrice, getEffectivePrice } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/items/item-card";
import { useState } from "react";

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const item = MOCK_ITEMS.find((i) => i.id === id || i.slug === slug) ?? MOCK_ITEMS[0];
  const addItem = useCartStore((s) => s.addItem);
  const [license, setLicense] = useState<"REGULAR" | "EXTENDED">("REGULAR");
  const [tab, setTab] = useState("overview");

  const { price, original } = getEffectivePrice(
    item.regularPrice,
    item.extendedPrice,
    item.salePriceRegular,
    item.salePriceExtended,
    license
  );

  const handleAdd = () => {
    addItem({
      itemId: item.id,
      slug: item.slug,
      title: item.title,
      thumbnailUrl: item.thumbnailUrl,
      licenseType: license,
      price,
      originalPrice: original,
      authorUsername: item.author.username,
    });
  };

  const related = MOCK_ITEMS.filter(
    (i) => i.category.slug === item.category.slug && i.id !== item.id
  ).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 text-sm text-slate-500">
        <Link href="/" className="hover:text-emerald-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${item.category.slug}`} className="hover:text-emerald-600">
          {item.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800 line-clamp-1">{item.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-100">
            <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover" priority />
          </div>
          <div className="mt-6">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{item.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="font-medium">by CodeBazaar</span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {item.ratingAvg.toFixed(1)} ({item.ratingCount} reviews)
              </span>
              <span>{item.salesCount.toLocaleString()} sales</span>
            </div>
          </div>

          <div className="mt-6 border-b border-slate-200">
            <div className="flex gap-4">
              {["overview", "support", "changelog"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`border-b-2 px-1 pb-3 text-sm font-medium capitalize ${
                    tab === t ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 text-sm text-slate-700">
            {tab === "overview" && (
              <>
                <p>
                  A production-ready {item.category.name.toLowerCase()} package designed for modern
                  workflows. Includes clean architecture, documentation, and updates.
                </p>
                <ul className="mt-4 list-disc space-y-1 pl-5">
                  <li>Fully responsive components</li>
                  <li>TypeScript support</li>
                  <li>Documentation & demo included</li>
                  <li>Regular updates</li>
                </ul>
              </>
            )}
            {tab === "support" && (
              <p>Support is handled by CodeBazaar. Average response under 24 hours.</p>
            )}
            {tab === "changelog" && (
              <div className="space-y-2">
                <div><strong>v1.2.0</strong> — Improvements and fixes</div>
                <div><strong>v1.0.0</strong> — Initial release</div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{formatPrice(price)}</span>
              {original != null && (
                <span className="text-sm text-slate-400 line-through">{formatPrice(original)}</span>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                <input
                  type="radio"
                  name="license"
                  checked={license === "REGULAR"}
                  onChange={() => setLicense("REGULAR")}
                  className="accent-emerald-600"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">Regular License</div>
                  <div className="text-xs text-slate-500">Single end product</div>
                </div>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                <input
                  type="radio"
                  name="license"
                  checked={license === "EXTENDED"}
                  onChange={() => setLicense("EXTENDED")}
                  className="accent-emerald-600"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">Extended License</div>
                  <div className="text-xs text-slate-500">Multiple / SaaS</div>
                </div>
              </label>
            </div>

            <Button className="mt-4 w-full" size="lg" onClick={handleAdd}>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </Button>
            <p className="mt-3 text-center text-xs text-slate-500">
              <Link href="/pricing/licenses" className="text-emerald-600 hover:underline">
                License details
              </Link>
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold">You may also like</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <ItemCard key={r.id} item={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
