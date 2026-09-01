/** Browser-side product overrides so Free / edits work even before SiteSetting exists */

export type ClientProductOverride = {
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  regularPrice?: number;
  extendedPrice?: number;
  salePriceRegular?: number | null;
  isFree?: boolean;
  thumbnailUrl?: string;
  demoUrl?: string;
  features?: string[];
  licenseFeatures?: string[];
  tags?: string[];
  attributes?: { label: string; value: string }[];
  updatedAt?: string;
  createdAt?: string;
};

const KEY = "cb_product_overrides";

export function getClientOverrides(): Record<string, ClientProductOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ClientProductOverride>;
  } catch {
    return {};
  }
}

export function saveClientOverride(id: string, data: ClientProductOverride) {
  if (typeof window === "undefined") return;
  const all = getClientOverrides();
  const prev = all[id] || { id };
  const isFree = data.isFree === true || Number(data.regularPrice) === 0;
  all[id] = {
    ...prev,
    ...data,
    id,
    isFree,
    regularPrice: isFree ? 0 : Number(data.regularPrice ?? prev.regularPrice ?? 0),
    extendedPrice: isFree ? 0 : Number(data.extendedPrice ?? prev.extendedPrice ?? 0),
    salePriceRegular: isFree ? null : data.salePriceRegular ?? prev.salePriceRegular ?? null,
    updatedAt: new Date().toISOString(),
    createdAt: prev.createdAt || new Date().toISOString(),
  };
  if (data.slug) all[data.slug] = { ...all[id], id: data.slug };
  localStorage.setItem(KEY, JSON.stringify(all));
  return all[id];
}

export function applyClientOverride<T extends {
  id: string;
  regularPrice: number;
  extendedPrice: number;
  salePriceRegular?: number | null;
  title?: string;
  descriptionHtml?: string;
  features?: string[];
  tags?: string[];
  attributes?: { label: string; value: string }[];
  lastUpdate?: string;
  createdAt?: string;
  thumbnailUrl?: string;
  demoUrl?: string;
}>(product: T): T {
  const all = getClientOverrides();
  const o = all[product.id] || all[(product as { slug?: string }).slug || ""];
  if (!o) return product;
  const isFree = o.isFree === true || Number(o.regularPrice) === 0;
  const attrs = (o.attributes || product.attributes || []).filter(
    (a) => !["Last Update", "Created", "Published", "Updated"].includes(a.label)
  );
  return {
    ...product,
    title: o.title ?? product.title,
    descriptionHtml: o.description ?? product.descriptionHtml,
    regularPrice: isFree ? 0 : Number(o.regularPrice ?? product.regularPrice),
    extendedPrice: isFree ? 0 : Number(o.extendedPrice ?? product.extendedPrice),
    salePriceRegular: isFree
      ? null
      : o.salePriceRegular !== undefined
        ? o.salePriceRegular
        : product.salePriceRegular,
    features: o.features ?? product.features,
    tags: o.tags ?? product.tags,
    attributes: attrs,
    thumbnailUrl: o.thumbnailUrl || product.thumbnailUrl,
    demoUrl: o.demoUrl ?? product.demoUrl,
    lastUpdate: o.updatedAt
      ? new Date(o.updatedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : product.lastUpdate,
    createdAt: o.createdAt
      ? new Date(o.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : product.createdAt,
  };
}
