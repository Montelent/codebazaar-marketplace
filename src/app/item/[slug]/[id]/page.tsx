"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Check, Minus, Plus, ExternalLink } from "lucide-react";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { detailFromCard, PRODUCT_DETAILS, type ProductDetail } from "@/lib/product-detail";
import { formatPrice, getEffectivePrice, cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { LicensePicker } from "@/components/items/license-picker";
import { AttributeRow } from "@/components/items/attribute-row";
import { applyClientOverride } from "@/lib/client-product-overrides";

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
  const card = MOCK_ITEMS.find((i) => i.id === id || i.slug === slug) ?? MOCK_ITEMS[0];
  const baseProduct: ProductDetail =
    PRODUCT_DETAILS[card.id] ?? detailFromCard(card);

  const [product, setProduct] = useState<ProductDetail>(baseProduct);
  const [loaded, setLoaded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const [license, setLicense] = useState<"REGULAR" | "EXTENDED">("REGULAR");
  const [qty, setQty] = useState(1);
  const [extendSupport, setExtendSupport] = useState(false);
  const [showAllChangelog, setShowAllChangelog] = useState(false);
  const [showAllAttrs, setShowAllAttrs] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProduct(applyClientOverride(baseProduct));
    fetch(`/api/products/${id}?slug=${encodeURIComponent(slug || "")}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.product) setProduct(applyClientOverride(data.product as ProductDetail));
        else setProduct(applyClientOverride(baseProduct));
      })
      .catch(() => {
        if (!cancelled) setProduct(applyClientOverride(baseProduct));
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id, slug]);

  const { price, original } = getEffectivePrice(
    product.regularPrice,
    product.extendedPrice,
    product.salePriceRegular,
    product.salePriceExtended,
    license
  );

  const supportAddon = extendSupport ? 14.5 : 0;
  const isFree =
    Number(product.regularPrice) <= 0 ||
    (product.salePriceRegular != null && Number(product.salePriceRegular) <= 0);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        itemId: product.id,
        slug: product.slug,
        title: product.title,
        thumbnailUrl: product.thumbnailUrl,
        licenseType: license,
        price: isFree ? 0 : price + (i === 0 ? supportAddon : 0),
        originalPrice: isFree ? undefined : original,
        authorUsername: product.author.username,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const related = MOCK_ITEMS.filter(
    (i) => i.category.slug === product.category.slug && i.id !== product.id
  ).slice(0, 4);
  const changelogVisible = showAllChangelog
    ? product.changelogs
    : product.changelogs.slice(0, 3);

  const mergedAttrs = (() => {
    const base = [...product.attributes];
    const has = (lab: string) => base.some((a) => a.label === lab);
    if (!has("Last Update"))
      base.unshift({ label: "Last Update", value: product.lastUpdate });
    if (!has("Created"))
      base.splice(1, 0, { label: "Created", value: product.createdAt });
    return base;
  })();
  const attrsVisible = showAllAttrs ? mergedAttrs : mergedAttrs.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-4 py-4">
          <div className="min-w-0 flex-1">
            <nav className="mb-1 flex flex-wrap items-center gap-1 text-xs text-slate-500">
              <Link href="/" className="hover:text-emerald-600">Home</Link>
              <span>›</span>
              <Link href={`/category/${product.category.slug}`} className="hover:text-emerald-600">
                {product.category.name}
              </Link>
            </nav>
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{product.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>
                By{" "}
                <Link href={`/author/${product.author.username}`} className="font-medium text-emerald-700 hover:underline">
                  {product.author.displayName}
                </Link>
              </span>
              <span className="text-slate-400">·</span>
              <span>{product.salesCount.toLocaleString()} sales</span>
              {!loaded && <span className="text-xs text-slate-400">Updating price…</span>}
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button type="button" className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
            </button>
            <Link href="/cart" className="relative flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-emerald-700">{isFree ? "Free" : formatPrice(price)}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <Image src={product.thumbnailUrl} alt={product.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" priority />
          </div>
          <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
          {product.features?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Features</h2>
              <ul className="mt-3 space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Item attributes</h2>
            <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {attrsVisible.map((a) => (
                <AttributeRow key={a.label} label={a.label} value={a.value} />
              ))}
            </div>
            {mergedAttrs.length > 6 && (
              <button type="button" className="mt-2 text-sm font-medium text-emerald-700 hover:underline" onClick={() => setShowAllAttrs((v) => !v)}>
                {showAllAttrs ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          {product.changelogs?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Change log</h2>
              <ul className="mt-3 space-y-3">
                {changelogVisible.map((c) => (
                  <li key={c.version} className="text-sm">
                    <div className="font-semibold text-slate-800">v{c.version}</div>
                    <ul className="mt-1 list-disc pl-5 text-slate-600">
                      {c.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <div>
                {original != null && !isFree && (
                  <div className="text-sm text-slate-400 line-through">{formatPrice(original)}</div>
                )}
                <div className="text-2xl font-bold text-slate-900">
                  {isFree ? "Free" : formatPrice(price + supportAddon)}
                </div>
              </div>
              {product.demoUrl && (
                <a href={product.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline">
                  Live preview <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {!isFree && (
              <div className="mb-3">
                <LicensePicker
                  license={license}
                  onChange={setLicense}
                  regularPrice={Number(product.regularPrice)}
                  extendedPrice={Number(product.extendedPrice)}
                  saleRegular={product.salePriceRegular}
                  saleExtended={product.salePriceExtended}
                />
              </div>
            )}

            {!isFree && (
              <label className="mb-3 flex cursor-pointer items-start gap-2 text-sm text-slate-700">
                <input type="checkbox" className="mt-1 accent-emerald-600" checked={extendSupport} onChange={(e) => setExtendSupport(e.target.checked)} />
                <span>
                  Extend support to 12 months
                  <span className="block text-xs text-slate-500">+ $14.50</span>
                </span>
              </label>
            )}

            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-slate-600">Qty</span>
              <button type="button" className="rounded border p-1" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">{qty}</span>
              <button type="button" className="rounded border p-1" onClick={() => setQty((q) => q + 1)}>
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {isFree ? (
              <Button className="w-full" size="lg" onClick={handleAdd}>
                {added ? "Added — go to checkout" : "Get free download"}
              </Button>
            ) : (
              <Button className="w-full" size="lg" onClick={handleAdd}>
                {added ? "Added to cart" : "Add to Cart"}
              </Button>
            )}

            <p className="mt-3 text-center text-xs text-slate-500">
              {isFree
                ? "Free item — complete checkout with your email to unlock downloads."
                : "Secure checkout · Instant download after payment"}
            </p>
          </div>

          {related.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Related items</h3>
              <ul className="mt-2 space-y-2">
                {related.slice(0, 3).map((it) => (
                  <li key={it.id}>
                    <Link href={`/item/${it.slug}/${it.id}`} className="text-sm text-emerald-700 hover:underline">
                      {it.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
