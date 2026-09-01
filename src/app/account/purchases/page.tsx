"use client";

import Link from "next/link";
import Image from "next/image";
import { usePurchasesStore } from "@/lib/purchases-store";
import { formatPrice } from "@/lib/utils";

export default function PurchasesPage() {
  const items = usePurchasesStore((s) => s.items);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Purchases</h2>
      <p className="mt-1 text-sm text-slate-500">
        Items you have licensed. After checkout, licenses appear here.
      </p>

      {items.length === 0 ? (
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
                <Image src={item.thumbnailUrl} alt="" fill className="object-cover" />
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
