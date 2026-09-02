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
    const row = await queryOne<{ value: unknown }>(
      `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1`,
      [OVERRIDES_KEY]
    );
    if (row?.value && typeof row.value === "object") {
      return row.value as Record<string, ProductOverride>;
    }
    if (typeof row?.value === "string") {
      try {
        return JSON.parse(row.value);
      } catch {
        return {};
      }
    }
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

type DbItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  features: unknown;
  tags: unknown;
  regularPrice: number | string;
  extendedPrice: number | string;
  salePriceRegular: number | string | null;
  salePriceExtended: number | string | null;
  thumbnailUrl: string;
  demoUrl: string | null;
  updatedAt: Date;
  createdAt: Date;
  category_name?: string;
  category_slug?: string;
  author_username?: string;
  author_name?: string | null;
};

export async function getProductDetail(id: string, slug?: string): Promise<ProductDetail> {
  const overrides = await getOverrides();
  const card =
    MOCK_ITEMS.find((i) => i.id === id || i.slug === slug) ?? MOCK_ITEMS[0];
  let detail = PRODUCT_DETAILS[card.id] ?? detailFromCard(card);

  try {
    const db = await queryOne<DbItem>(
      `
      SELECT i.*, c.name AS category_name, c.slug AS category_slug,
             u.username AS author_username, u.name AS author_name
      FROM "Item" i
      LEFT JOIN "Category" c ON c.id = i."categoryId"
      LEFT JOIN "User" u ON u.id = i."authorId"
      WHERE i.id = $1 OR i.slug = $2 OR i.slug = $3
      LIMIT 1
      `,
      [id, card.slug, slug || card.slug]
    );
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
        lastUpdate: new Date(db.updatedAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        createdAt: new Date(db.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        category: {
          name: db.category_name || detail.category.name,
          slug: db.category_slug || detail.category.slug,
          parentName: "Code",
          parentSlug: "code",
        },
        author: {
          username: db.author_username || detail.author.username,
          displayName: db.author_name || db.author_username || detail.author.displayName,
          isElite: true,
        },
      };
    }
  } catch {
    /* mock */
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
  const dbBySlug: Record<
    string,
    { regularPrice: number; title: string; thumbnailUrl: string }
  > = {};
  try {
    const { rows } = await query<{
      slug: string;
      title: string;
      thumbnailUrl: string;
      regularPrice: number | string;
    }>(`SELECT slug, title, "thumbnailUrl", "regularPrice" FROM "Item" LIMIT 200`);
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
      extendedPrice: isFree ? 0 : Number(o?.extendedPrice ?? item.extendedPrice),
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
