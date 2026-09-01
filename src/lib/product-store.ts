import { prisma } from "@/lib/prisma";
import { MOCK_ITEMS } from "@/lib/mock-data";
import {
  PRODUCT_DETAILS,
  detailFromCard,
  type ProductDetail,
} from "@/lib/product-detail";
import type { ItemCardData } from "@/types";

export type ProductOverride = {
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  regularPrice?: number;
  extendedPrice?: number;
  salePriceRegular?: number | null;
  salePriceExtended?: number | null;
  isFree?: boolean;
  thumbnailUrl?: string;
  demoUrl?: string;
  features?: string[];
  licenseFeatures?: string[];
  requirements?: string | string[];
  tags?: string[];
  attributes?: { label: string; value: string }[];
  changelog?: string;
  categorySlug?: string;
  updatedAt?: string;
  createdAt?: string;
};

const OVERRIDES_KEY = "products.overrides";

export async function getOverrides(): Promise<Record<string, ProductOverride>> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: OVERRIDES_KEY } });
    if (row?.value && typeof row.value === "object") {
      return row.value as Record<string, ProductOverride>;
    }
  } catch {
    /* DB unavailable */
  }
  return {};
}

export async function saveOverride(id: string, data: ProductOverride) {
  const all = await getOverrides();
  const prev = all[id] || { id };
  all[id] = {
    ...prev,
    ...data,
    id,
    updatedAt: new Date().toISOString(),
    createdAt: prev.createdAt || new Date().toISOString(),
  };
  if (data.isFree || Number(data.regularPrice) === 0) {
    all[id].regularPrice = 0;
    all[id].extendedPrice = 0;
    all[id].salePriceRegular = null;
    all[id].isFree = true;
  }
  if (data.slug) {
    all[data.slug] = { ...all[id], id: data.slug };
  }
  try {
    const jsonValue = JSON.parse(JSON.stringify(all));
    await prisma.siteSetting.upsert({
      where: { key: OVERRIDES_KEY },
      update: { value: jsonValue, group: "products" },
      create: { key: OVERRIDES_KEY, value: jsonValue, group: "products" },
    });
  } catch (e) {
    console.error("saveOverride DB error:", e);
    return { ...all[id], _dbUnavailable: true } as ProductOverride & {
      _dbUnavailable?: boolean;
    };
  }
  return all[id];
}

function applyOverride(detail: ProductDetail, o?: ProductOverride): ProductDetail {
  if (!o) return detail;
  const isFree = o.isFree === true || Number(o.regularPrice) === 0;
  const attrs = (o.attributes || detail.attributes).filter(
    (a) => !["Last Update", "Created", "Published", "Updated"].includes(a.label)
  );
  const lastUpdate = o.updatedAt
    ? new Date(o.updatedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : detail.lastUpdate;
  const createdAt = o.createdAt
    ? new Date(o.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : detail.createdAt;

  return {
    ...detail,
    title: o.title ?? detail.title,
    slug: o.slug ?? detail.slug,
    descriptionHtml: o.description ?? detail.descriptionHtml,
    regularPrice: isFree ? 0 : Number(o.regularPrice ?? detail.regularPrice),
    extendedPrice: isFree ? 0 : Number(o.extendedPrice ?? detail.extendedPrice),
    salePriceRegular: isFree
      ? null
      : o.salePriceRegular !== undefined
        ? o.salePriceRegular
        : detail.salePriceRegular,
    thumbnailUrl: o.thumbnailUrl || detail.thumbnailUrl,
    demoUrl: o.demoUrl ?? detail.demoUrl,
    features: o.features ?? detail.features,
    licenseFeatures: o.licenseFeatures ?? detail.licenseFeatures,
    requirements: Array.isArray(o.requirements)
      ? o.requirements
      : typeof o.requirements === "string"
        ? o.requirements
            .replace(/<[^>]+>/g, "\n")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : detail.requirements,
    tags: o.tags ?? detail.tags,
    attributes: attrs,
    lastUpdate,
    createdAt,
  };
}

export async function getProductDetail(id: string, slug?: string): Promise<ProductDetail> {
  const overrides = await getOverrides();
  const card =
    MOCK_ITEMS.find((i) => i.id === id || i.slug === slug) ?? MOCK_ITEMS[0];
  let detail = PRODUCT_DETAILS[card.id] ?? detailFromCard(card);

  try {
    // Mock ids ("1","2") differ from Neon cuids — always match by slug
    const db = await prisma.item.findFirst({
      where: {
        OR: [
          { id },
          { slug: card.slug },
          ...(slug ? [{ slug }] : []),
        ],
      },
      include: { category: true, author: true },
    });
    if (db) {
      const feat = Array.isArray(db.features) ? (db.features as string[]) : [];
      const tags = Array.isArray(db.tags) ? (db.tags as string[]) : [];
      const price = Number(db.regularPrice);
      detail = {
        ...detail,
        id: db.id,
        slug: db.slug,
        title: db.title,
        descriptionHtml: db.description,
        regularPrice: price,
        extendedPrice: Number(db.extendedPrice),
        salePriceRegular:
          db.salePriceRegular != null ? Number(db.salePriceRegular) : null,
        salePriceExtended:
          db.salePriceExtended != null ? Number(db.salePriceExtended) : null,
        thumbnailUrl: db.thumbnailUrl,
        demoUrl: db.demoUrl || undefined,
        features: feat.length ? feat : detail.features,
        tags: tags.length ? tags : detail.tags,
        lastUpdate: db.updatedAt.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        createdAt: db.createdAt.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        category: {
          name: db.category.name,
          slug: db.category.slug,
          parentName: "Code",
          parentSlug: "code",
        },
        author: {
          username: db.author.username,
          displayName: db.author.name || db.author.username,
          isElite: true,
        },
      };
    }
  } catch {
    /* use mock */
  }

  const o =
    overrides[id] ||
    overrides[card.id] ||
    overrides[card.slug] ||
    (slug ? overrides[slug] : undefined);
  return applyOverride(detail, o);
}

export async function listProductCards(): Promise<ItemCardData[]> {
  const overrides = await getOverrides();
  let dbBySlug: Record<string, { regularPrice: number; title: string; thumbnailUrl: string }> = {};
  try {
    const rows = await prisma.item.findMany({ take: 200 });
    for (const r of rows) {
      dbBySlug[r.slug] = {
        regularPrice: Number(r.regularPrice),
        title: r.title,
        thumbnailUrl: r.thumbnailUrl,
      };
    }
  } catch {
    /* ignore */
  }

  return MOCK_ITEMS.map((item) => {
    const db = dbBySlug[item.slug];
    const o = overrides[item.id] || overrides[item.slug];
    const isFree =
      (o && (o.isFree === true || Number(o.regularPrice) === 0)) ||
      (db && Number(db.regularPrice) === 0);
    return {
      ...item,
      title: o?.title || db?.title || item.title,
      slug: o?.slug || item.slug,
      thumbnailUrl: o?.thumbnailUrl || db?.thumbnailUrl || item.thumbnailUrl,
      regularPrice: isFree
        ? 0
        : Number(o?.regularPrice ?? db?.regularPrice ?? item.regularPrice),
      extendedPrice: isFree
        ? 0
        : Number(o?.extendedPrice ?? item.extendedPrice),
      salePriceRegular: isFree
        ? null
        : o?.salePriceRegular !== undefined
          ? o.salePriceRegular
          : item.salePriceRegular,
    };
  });
}

export function isProductFree(detail: {
  regularPrice: number;
  salePriceRegular?: number | null;
}): boolean {
  const p =
    detail.salePriceRegular != null
      ? Number(detail.salePriceRegular)
      : Number(detail.regularPrice);
  return p <= 0;
}
