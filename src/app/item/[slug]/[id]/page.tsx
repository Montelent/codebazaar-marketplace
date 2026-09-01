"use client";

import { use, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart, ShoppingCart, ChevronDown, Check, Minus, Plus, ExternalLink, Image as ImageIcon,
} from "lucide-react";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { detailFromCard, PRODUCT_DETAILS } from "@/lib/product-detail";
import { formatPrice, getEffectivePrice, cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/items/item-card";

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const card = MOCK_ITEMS.find((i) => i.id === id || i.slug === slug) ?? MOCK_ITEMS[0];
  const product = useMemo(() => PRODUCT_DETAILS[card.id] ?? detailFromCard(card), [card]);
  const addItem = useCartStore((s) => s.addItem);
  const [license, setLicense] = useState<"REGULAR" | "EXTENDED">("REGULAR");
  const [qty, setQty] = useState(1);
  const [extendSupport, setExtendSupport] = useState(false);
  const [showAllChangelog, setShowAllChangelog] = useState(false);
  const [showAllAttrs, setShowAllAttrs] = useState(false);
  const [added, setAdded] = useState(false);

  const { price, original } = getEffectivePrice(
    product.regularPrice, product.extendedPrice,
    product.salePriceRegular, product.salePriceExtended, license
  );
  const supportAddon = extendSupport ? 14.5 : 0;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        itemId: product.id, slug: product.slug, title: product.title,
        thumbnailUrl: product.thumbnailUrl, licenseType: license,
        price: price + (i === 0 ? supportAddon : 0),
        originalPrice: original, authorUsername: product.author.username,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const authorItems = MOCK_ITEMS.filter(
    (i) => i.author.username === product.author.username && i.id !== product.id
  ).slice(0, 4);
  const related = MOCK_ITEMS.filter(
    (i) => i.category.slug === product.category.slug && i.id !== product.id
  ).slice(0, 4);
  const changelogVisible = showAllChangelog ? product.changelogs : product.changelogs.slice(0, 3);
  const attrsVisible = showAllAttrs ? product.attributes : product.attributes.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-4 py-4">
          <div className="min-w-0 flex-1">
            <nav className="mb-1 flex flex-wrap items-center gap-1 text-xs text-slate-500">
              <Link href="/" className="hover:text-emerald-600">Home</Link>
              <span>›</span>
              {product.category.parentName && (
                <>
                  <Link href={`/category/${product.category.parentSlug}`} className="hover:text-emerald-600">{product.category.parentName}</Link>
                  <span>›</span>
                </>
              )}
              <Link href={`/category/${product.category.slug}`} className="hover:text-emerald-600">{product.category.name}</Link>
            </nav>
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{product.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>By <Link href={`/author/${product.author.username}`} className="font-medium text-emerald-700 hover:underline">{product.author.displayName}</Link></span>
              <span className="text-slate-400">·</span>
              <span>{product.salesCount.toLocaleString()} sales</span>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button type="button" className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="Wishlist"><Heart className="h-5 w-5" /></button>
            <Link href="/cart" className="relative flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-emerald-700">{formatPrice(price)}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-200">
            <button type="button" className="border-b-2 border-emerald-600 px-1 pb-2 text-sm font-semibold text-slate-900">
              Item Details <ChevronDown className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <div className="relative aspect-[16/9] w-full">
              <Image src={product.thumbnailUrl} alt={product.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 66vw" />
            </div>
            <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-white p-3">
              {product.demoUrl && (
                <a href={product.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">
                  Live Preview <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button type="button" className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <ImageIcon className="h-3.5 w-3.5" /> Screenshots
              </button>
            </div>
          </div>

          <div className="prose prose-slate mt-6 max-w-none text-sm leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            {product.features.length > 0 && (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-700">
                {product.features.map((f) => (<li key={f}>{f}</li>))}
              </ul>
            )}
            <div className="not-prose mt-4 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
              <div className="relative aspect-video w-full max-w-md">
                <Image src={product.thumbnailUrl} alt={`${product.title} preview`} fill className="object-cover" sizes="400px" />
              </div>
              <p className="border-t border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">{product.title}</p>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-base font-bold text-slate-900">Requirements</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {product.requirements.map((r) => (<li key={r}>{r}</li>))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-base font-bold text-slate-900">ChangeLogs</h2>
            <div className="mt-3 space-y-4">
              {changelogVisible.map((log) => (
                <div key={log.version}>
                  <p className="text-sm font-semibold text-slate-900">Version {log.version}</p>
                  <ul className="mt-1 space-y-0.5 text-sm text-slate-600">
                    {log.items.map((line) => (
                      <li key={line}>
                        {line.startsWith("[") ? (
                          <><span className="font-medium text-emerald-700">{line.match(/^\[[^\]]+\]/)?.[0]}</span>{line.replace(/^\[[^\]]+\]\s*/, " ")}</>
                        ) : (<>- {line}</>)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {product.changelogs.length > 3 && (
              <button type="button" onClick={() => setShowAllChangelog((v) => !v)} className="mt-3 text-sm font-medium text-emerald-700 hover:underline">
                {showAllChangelog ? "Show Less" : "Show More"}
              </button>
            )}
          </section>

          {authorItems.length > 0 && (
            <section className="mt-10 border-t border-slate-100 pt-8">
              <h2 className="text-base font-bold text-slate-900">More items by {product.author.displayName}</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {authorItems.map((it) => (
                  <Link key={it.id} href={`/item/${it.slug}/${it.id}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-emerald-300 hover:shadow-sm">
                    <div className="relative aspect-[4/3] bg-slate-100">
                      <Image src={it.thumbnailUrl} alt={it.title} fill className="object-cover" sizes="150px" />
                    </div>
                    <p className="line-clamp-2 p-2 text-xs font-medium text-slate-700 group-hover:text-emerald-700">{it.title}</p>
                  </Link>
                ))}
              </div>
              <Link href={`/author/${product.author.username}`} className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline">View author portfolio</Link>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-12 border-t border-slate-100 pt-8">
              <h2 className="mb-4 text-lg font-bold text-slate-900">You may also like</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {related.map((r) => (<ItemCard key={r.id} item={r} />))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-20 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="relative flex-1">
                  <select value={license} onChange={(e) => setLicense(e.target.value as "REGULAR" | "EXTENDED")} className="w-full appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-slate-800">
                    <option value="REGULAR">Regular License</option>
                    <option value="EXTENDED">Extended License</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
                <div className="text-right">
                  {original != null && original > price && (<div className="text-sm text-slate-400 line-through">{formatPrice(original)}</div>)}
                  <div className="text-2xl font-bold text-slate-900">{formatPrice(price)}</div>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {product.licenseFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{f}</span>
                  </li>
                ))}
                <li className="flex items-start gap-2 text-sm text-slate-700">
                  <input type="checkbox" id="extend-support" checked={extendSupport} onChange={(e) => setExtendSupport(e.target.checked)} className="mt-1 accent-emerald-600" />
                  <label htmlFor="extend-support" className="cursor-pointer">
                    Extend support to 12 months <span className="text-slate-400 line-through">$19.50</span> <span className="font-semibold text-slate-800">$14.50</span>
                  </label>
                </li>
              </ul>
              <div className="mt-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Quantity</p>
                <div className="inline-flex items-center rounded-md border border-slate-300">
                  <button type="button" className="px-3 py-2 text-slate-600 hover:bg-slate-50" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-3.5 w-3.5" /></button>
                  <span className="min-w-[2rem] text-center text-sm font-semibold">{qty}</span>
                  <button type="button" className="px-3 py-2 text-slate-600 hover:bg-slate-50" onClick={() => setQty((q) => Math.min(99, q + 1))}><Plus className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <Button className={cn("mt-4 h-12 w-full text-base font-semibold", added && "bg-emerald-800")} onClick={handleAdd}>
                <ShoppingCart className="h-5 w-5" />{added ? "Added!" : "Add to Cart"}
              </Button>
              <p className="mt-2 text-center text-[11px] text-slate-400">Price is in US dollars and excludes tax and handling fees</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">{product.author.displayName.charAt(0).toUpperCase()}</div>
                <div>
                  {product.author.isElite && (
                    <span className="mb-0.5 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">● Elite Author</span>
                  )}
                  <p className="font-semibold text-slate-900">{product.author.displayName}</p>
                </div>
              </div>
              <Link href={`/author/${product.author.username}`} className="mt-3 flex w-full items-center justify-center rounded-md border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">View Portfolio</Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <dl className="space-y-3 text-sm">
                {attrsVisible.map((a) => (
                  <div key={a.label} className="grid grid-cols-[130px_1fr] gap-2 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                    <dt className="text-slate-500">{a.label}</dt>
                    <dd className="font-medium text-slate-800">
                      {a.label === "Tags" ? (
                        <div className="flex flex-wrap gap-1">
                          {(a.value || product.tags.join(", ")).split(",").map((t) => t.trim()).filter(Boolean).map((t) => (
                            <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-700">{t}</span>
                          ))}
                        </div>
                      ) : a.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {product.attributes.length > 6 && (
                <button type="button" onClick={() => setShowAllAttrs((v) => !v)} className="mt-3 text-sm font-medium text-emerald-700 hover:underline">
                  {showAllAttrs ? "Fewer Attributes" : "More Attributes"}
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
