import { query, queryOne } from "@/lib/db";
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
  mainFileUrl?: string;
  galleryUrls?: string[];
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

function coerceOverrides(raw: unknown): Record<string, ProductOverride> {
  let v: unknown = raw;
  for (let i = 0; i < 4; i++) {
    if (typeof v === "string") {
      try {
        v = JSON.parse(v);
      } catch {
        return {};
      }
    } else break;
  }
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, ProductOverride>;
  }
  return {};
}

export async function getOverrides(): Promise<Record<string, ProductOverride>> {
  try {
    const row = await queryOne<{ value: unknown }>(
      `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1`,
      [OVERRIDES_KEY]
    );
    if (row?.value != null) return coerceOverrides(row.value);
  } catch {
    /* ignore */
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

  const payload = JSON.stringify(all);
  await query(
    `
    INSERT INTO "SiteSetting" ("id", "key", "value", "group", "updatedAt")
    VALUES (gen_random_uuid()::text, $1, $2::jsonb, 'products', NOW())
    ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()
    `,
    [OVERRIDES_KEY, payload]
  );
  return all[id];
}

function applyOverride(detail: ProductDetail, o?: ProductOverride): ProductDetail {
  if (!o) return detail;
  const isFree = o.isFree === true || Number(o.regularPrice) === 0;
  const attrs = (o.attributes || detail.attributes || []).filter(
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
    descriptionHtml: o.description !== undefined ? o.description : detail.descriptionHtml,
    regularPrice: isFree ? 0 : (o.regularPrice ?? detail.regularPrice),
    extendedPrice: isFree
      ? 0
      : o.extendedPrice != null
        ? Number(o.extendedPrice)
        : o.regularPrice != null
          ? Number(o.regularPrice)
          : detail.extendedPrice,
    salePriceRegular: isFree ? null : (o.salePriceRegular ?? detail.salePriceRegular),
    salePriceExtended: isFree ? null : (o.salePriceExtended ?? detail.salePriceExtended),
    thumbnailUrl: o.thumbnailUrl ?? detail.thumbnailUrl,
    demoUrl: o.demoUrl ?? detail.demoUrl,
    galleryUrls: o.galleryUrls != null && o.galleryUrls.length ? o.galleryUrls : detail.galleryUrls,
    features: o.features != null ? o.features : detail.features,
    tags: o.tags != null ? o.tags : detail.tags,
    attributes: o.attributes != null ? attrs : detail.attributes,
    lastUpdate,
    createdAt,
  };
}

export async function getProductDetail(
  id: string,
  slug?: string
): Promise<ProductDetail | null> {
  const overrides = await getOverrides();
  const card =
    MOCK_ITEMS.find((i) => i.id === id || i.slug === slug || i.slug === id) ??
    MOCK_ITEMS[0];
  let detail: ProductDetail =
    PRODUCT_DETAILS[card.id] ?? detailFromCard(card);

  try {
    const db = await queryOne<{
      id: string;
      slug: string;
      title: string;
      description: string | null;
      regularPrice: number | string;
      extendedPrice: number | string;
      salePriceRegular: number | string | null;
      thumbnailUrl: string | null;
      demoUrl: string | null;
      features: unknown;
      tags: unknown;
      category_slug: string | null;
      category_name: string | null;
      author_username: string | null;
      author_name: string | null;
      createdAt: Date | string;
      updatedAt: Date | string;
    }>(
      `
      SELECT i.*, c.slug AS category_slug, c.name AS category_name,
             u.username AS author_username, u.name AS author_name
      FROM "Item" i
      LEFT JOIN "Category" c ON c.id = i."categoryId"
      LEFT JOIN "User" u ON u.id = i."authorId"
      WHERE i.slug = $1 OR i.id = $2
      LIMIT 1
      `,
      [slug || id, id]
    );
    if (db) {
      const fmt = (d: Date | string) =>
        new Date(d).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      detail = {
        ...detail,
        id: db.id,
        slug: db.slug,
        title: db.title,
        descriptionHtml: db.description || detail.descriptionHtml,
        regularPrice: Number(db.regularPrice),
        extendedPrice: Number(db.extendedPrice),
        salePriceRegular:
          db.salePriceRegular != null ? Number(db.salePriceRegular) : null,
        thumbnailUrl: db.thumbnailUrl || detail.thumbnailUrl,
        demoUrl: db.demoUrl || detail.demoUrl,
        features: Array.isArray(db.features)
          ? (db.features as string[])
          : detail.features,
        tags: Array.isArray(db.tags) ? (db.tags as string[]) : detail.tags,
        category: {
          name: db.category_name || detail.category.name,
          slug: db.category_slug || detail.category.slug,
          parentName: detail.category.parentName,
          parentSlug: detail.category.parentSlug,
        },
        author: {
          username: db.author_username || detail.author.username,
          displayName:
            db.author_name || db.author_username || detail.author.displayName,
          isElite: true,
        },
        lastUpdate: fmt(db.updatedAt),
        createdAt: fmt(db.createdAt),
      };
    }
  } catch {
    /* fall through */
  }

  const wantSlug = slug || detail.slug || card.slug;
  const fromMap =
    overrides[id] ||
    overrides[card.id] ||
    overrides[card.slug] ||
    (slug ? overrides[slug] : undefined) ||
    overrides[detail.slug];
  const fromValues = Object.values(overrides).find(
    (x) =>
      !!x &&
      (x.slug === wantSlug ||
        x.id === id ||
        x.id === card.id ||
        String(x.id) === String(id))
  );
  const o: ProductOverride | undefined = fromMap || fromValues;
  return applyOverride(detail, o);
}

export async function listProductCards(): Promise<ItemCardData[]> {
  const overrides = await getOverrides();
  const dbBySlug: Record<
    string,
    {
      regularPrice: number;
      extendedPrice: number;
      title: string;
      thumbnailUrl: string;
      id: string;
    }
  > = {};

  try {
    const { rows } = await query<{
      id: string;
      slug: string;
      title: string;
      regularPrice: number | string;
      extendedPrice: number | string;
      thumbnailUrl: string | null;
    }>(
      `SELECT id, slug, title, "regularPrice", "extendedPrice", "thumbnailUrl" FROM "Item" LIMIT 300`
    );
    for (const r of rows) {
      dbBySlug[r.slug] = {
        id: r.id,
        title: r.title,
        regularPrice: Number(r.regularPrice),
        extendedPrice: Number(r.extendedPrice),
        thumbnailUrl: r.thumbnailUrl || "",
      };
    }
  } catch {
    /* mock only */
  }

  return MOCK_ITEMS.map((item) => {
    const o = overrides[item.id] || overrides[item.slug];
    const db = dbBySlug[item.slug];
    let regularPrice = Number(item.regularPrice);
    let extendedPrice = Number(item.extendedPrice);
    let title = item.title;
    let thumbnailUrl = item.thumbnailUrl;
    let id = item.id;
    if (db) {
      regularPrice = db.regularPrice;
      extendedPrice = db.extendedPrice;
      title = db.title;
      if (db.thumbnailUrl) thumbnailUrl = db.thumbnailUrl;
      id = db.id;
    }
    if (o) {
      if (o.isFree || Number(o.regularPrice) === 0) {
        regularPrice = 0;
        extendedPrice = 0;
      } else {
        if (o.regularPrice != null) regularPrice = Number(o.regularPrice);
        if (o.extendedPrice != null) extendedPrice = Number(o.extendedPrice);
      }
      if (o.title) title = o.title;
      if (o.thumbnailUrl) thumbnailUrl = o.thumbnailUrl;
    }
    return {
      ...item,
      id,
      title,
      thumbnailUrl,
      regularPrice,
      extendedPrice,
      salePriceRegular:
        o?.isFree || regularPrice === 0
          ? undefined
          : o?.salePriceRegular != null
            ? Number(o.salePriceRegular)
            : item.salePriceRegular,
    };
  });
}
