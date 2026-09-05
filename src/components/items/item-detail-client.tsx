"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Check,
  Minus,
  Plus,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import type { ProductDetail } from "@/lib/product-detail";
import type { ItemCardData } from "@/types";
import { formatPrice, getEffectivePrice, cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/items/item-card";
import { LicensePicker } from "@/components/items/license-picker";
import { AttributeRow } from "@/components/items/attribute-row";

export function ItemDetailClient({
  product,
  related = [],
}: {
  product: ProductDetail;
  related?: ItemCardData[];
}) {
  const addItem = useCartStore((s) => s.addItem);
  const [license, setLicense] = useState<"REGULAR" | "EXTENDED">("REGULAR");
  const [qty, setQty] = useState(1);
  const [extendSupport, setExtendSupport] = useState(false);
  const [showAllChangelog, setShowAllChangelog] = useState(false);
  const [showAllAttrs, setShowAllAttrs] = useState(false);
  const [added, setAdded] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);

  const { price, original } = getEffectivePrice(
    product.regularPrice,
    product.extendedPrice,
    product.salePriceRegular,
    product.salePriceExtended,
    license
  );
  const supportAddon = extendSupport
    ? Math.max(5, Math.round(Number(product.regularPrice || 0) * 0.3 * 100) / 100)
    : 0;
  const isFree =
    Number(product.regularPrice) <= 0 ||
    (product.salePriceRegular != null && Number(product.salePriceRegular) <= 0);

  const gallery =
    product.galleryUrls && product.galleryUrls.length
      ? product.galleryUrls
      : [product.thumbnailUrl].filter(Boolean);

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

  const changelogs = product.changelogs || [];
  const changelogVisible = showAllChangelog ? changelogs : changelogs.slice(0, 3);

  const mergedAttrs = (() => {
    const baseAttrs = [...(product.attributes || [])];
    const has = (lab: string) => baseAttrs.some((a) => a.label === lab);
    if (!has("Last Update") && product.lastUpdate && product.lastUpdate !== "—")
      baseAttrs.unshift({ label: "Last Update", value: product.lastUpdate });
    if (!has("Created") && product.createdAt && product.createdAt !== "—")
      baseAttrs.splice(1, 0, { label: "Created", value: product.createdAt });
    return baseAttrs;
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
              <Link href={`/category/${product.category?.slug || "code"}`} className="hover:text-emerald-600">
                {product.category?.name || "Code"}
              </Link>
            </nav>
            <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{product.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span>
                By{" "}
                <Link href={`/author/${product.author?.username || "codebazaar"}`} className="font-medium text-emerald-700 hover:underline">
                  {product.author?.displayName || "CodeBazaar"}
                </Link>
              </span>
              <span className="text-slate-400">·</span>
              <span>{Number(product.salesCount || 0).toLocaleString()} sales</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            <button
              type="button"
              className="relative aspect-[16/9] w-full cursor-zoom-in"
              onClick={() => {
                setGalleryIdx(0);
                setLightbox(gallery[0] || product.thumbnailUrl);
              }}
            >
              <Image
                src={gallery[galleryIdx] || product.thumbnailUrl}
                alt={product.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </button>
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-slate-200 bg-white p-3">
                {gallery.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    onClick={() => {
                      setGalleryIdx(i);
                      setLightbox(url);
                    }}
                    className={
                      "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border-2 " +
                      (galleryIdx === i ? "border-emerald-500" : "border-slate-200")
                    }
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-white p-3">
              {product.demoUrl && (
                <a href={product.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">
                  Live Preview <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  setGalleryIdx(0);
                  setLightbox(gallery[0] || product.thumbnailUrl);
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
              >
                <ImageIcon className="h-3.5 w-3.5" /> {gallery.length} screenshots
              </button>
            </div>
          </div>

          {lightbox && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
              <button type="button" className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-slate-900" onClick={() => setLightbox(null)}>
                Close
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightbox} alt="Screenshot" className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
            </div>
          )}

          <div className="prose prose-slate mt-6 max-w-none text-sm leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml || "" }} />
            {(product.features || []).length > 0 && (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-slate-700">
                {product.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
          </div>

          {(product.requirements || []).length > 0 && (
            <section className="mt-8">
              <h2 className="text-base font-bold text-slate-900">Requirements</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {product.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          {changelogs.length > 0 && (
            <section className="mt-8">
              <h2 className="text-base font-bold text-slate-900">ChangeLogs</h2>
              <div className="mt-3 space-y-4">
                {changelogVisible.map((log) => (
                  <div key={log.version}>
                    <p className="text-sm font-semibold text-slate-900">Version {log.version}</p>
                    <ul className="mt-1 space-y-0.5 text-sm text-slate-600">
                      {(log.items || []).map((line) => (
                        <li key={line}>- {line}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {changelogs.length > 3 && (
                <button type="button" onClick={() => setShowAllChangelog((v) => !v)} className="mt-3 text-sm font-medium text-emerald-700 hover:underline">
                  {showAllChangelog ? "Show Less" : "Show More"}
                </button>
              )}
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-12 border-t border-slate-100 pt-8">
              <h2 className="mb-4 text-lg font-bold text-slate-900">You may also like</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <ItemCard key={r.id} item={r} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-20 space-y-4 overflow-visible">
            <div className="relative z-20 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                {!isFree ? (
                  <LicensePicker
                    license={license}
                    onChange={setLicense}
                    regularPrice={Number(product.regularPrice)}
                    extendedPrice={Number(product.extendedPrice)}
                    saleRegular={product.salePriceRegular}
                    saleExtended={product.salePriceExtended}
                  />
                ) : (
                  <div className="text-sm font-semibold text-emerald-700">Free download</div>
                )}
                <div className="text-right">
                  {original != null && original > price && !isFree && (
                    <div className="text-sm text-slate-400 line-through">{formatPrice(original)}</div>
                  )}
                  <div className="text-2xl font-bold text-slate-900">
                    {isFree ? "Free" : formatPrice(price + supportAddon)}
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {(product.licenseFeatures || []).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{f}</span>
                  </li>
                ))}
                {!isFree && (
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <input type="checkbox" id="extend-support" checked={extendSupport} onChange={(e) => setExtendSupport(e.target.checked)} className="mt-1 accent-emerald-600" />
                    <label htmlFor="extend-support" className="cursor-pointer">
                      Extend support to 12 months{" "}
                      <span className="font-semibold text-slate-800">{formatPrice(supportAddon || 5)}</span>
                    </label>
                  </li>
                )}
              </ul>

              <div className="mt-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Quantity</p>
                <div className="inline-flex items-center rounded-md border border-slate-300">
                  <button type="button" className="px-3 py-2 text-slate-600 hover:bg-slate-50" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-semibold">{qty}</span>
                  <button type="button" className="px-3 py-2 text-slate-600 hover:bg-slate-50" onClick={() => setQty((q) => Math.min(99, q + 1))}>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <Button className={cn("mt-4 h-12 w-full text-base font-semibold", added && "bg-emerald-800")} onClick={handleAdd}>
                <ShoppingCart className="h-5 w-5" />
                {isFree ? (added ? "Added!" : "Get free download") : added ? "Added!" : "Add to Cart"}
              </Button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-lg font-bold text-white">
                  {(product.author?.displayName || "C").charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-slate-900">{product.author?.displayName || "CodeBazaar"}</p>
              </div>
              <Link href={`/author/${product.author?.username || "codebazaar"}`} className="mt-3 flex w-full items-center justify-center rounded-md border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                View portfolio
              </Link>
            </div>

            {mergedAttrs.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Attributes</h3>
                <div className="space-y-2">
                  {attrsVisible.map((a) => (
                    <AttributeRow key={a.label} label={a.label} value={a.value} />
                  ))}
                </div>
                {mergedAttrs.length > 6 && (
                  <button type="button" onClick={() => setShowAllAttrs((v) => !v)} className="mt-3 text-sm font-medium text-emerald-700 hover:underline">
                    {showAllAttrs ? "Show less" : "Show all"}
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
