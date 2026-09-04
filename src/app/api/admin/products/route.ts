import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { z } from "zod";
import { saveOverride } from "@/lib/product-store";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

async function ensureCategory(slug: string) {
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM "Category" WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  if (existing) return existing.id;
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const row = await queryOne<{ id: string }>(
    `INSERT INTO "Category" ("id", "name", "slug") VALUES (gen_random_uuid()::text, $1, $2) RETURNING id`,
    [name, slug]
  );
  return row!.id;
}

async function ensureAdminUser() {
  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1`
  );
  if (existing) return existing.id;
  const email = process.env.ADMIN_EMAIL ?? "admin@codebazaar.com";
  const row = await queryOne<{ id: string }>(
    `
    INSERT INTO "User" ("id", "email", "username", "name", "role", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, $1, 'codebazaar', 'CodeBazaar', 'ADMIN', NOW(), NOW())
    RETURNING id
    `,
    [email]
  );
  return row!.id;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { rows } = await query(
      `
      SELECT i.*, c.name AS "categoryName", c.slug AS "categorySlug",
             u.username AS "authorUsername"
      FROM "Item" i
      LEFT JOIN "Category" c ON c.id = i."categoryId"
      LEFT JOIN "User" u ON u.id = i."authorId"
      ORDER BY i."updatedAt" DESC
      LIMIT 200
      `
    );
    if (rows.length === 0) return NextResponse.json({ source: "mock", items: MOCK_ITEMS });
    return NextResponse.json({ source: "db", items: rows });
  } catch {
    return NextResponse.json({ source: "mock", items: MOCK_ITEMS });
  }
}

const productSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(1).max(120),
  description: z.string().optional().default(""),
  regularPrice: z.number().min(0),
  extendedPrice: z.number().min(0),
  salePriceRegular: z.number().min(0).nullable().optional(),
  categorySlug: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  isFree: z.boolean().optional(),
  features: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  return PUT(
    new Request(req.url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: body.slug || body.id, ...body }),
    })
  );
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const isFree = Boolean(body.isFree) || Number(body.regularPrice) === 0;
    const regularPrice = isFree ? 0 : Number(body.regularPrice ?? 0);
    const extendedPrice = isFree ? 0 : Number(body.extendedPrice ?? 0);
    const salePriceRegular = isFree
      ? null
      : body.salePriceRegular != null
        ? Number(body.salePriceRegular)
        : null;
    const slug = String(body.slug || body.id);
    const title = String(body.title || "Untitled");
    const description = String(body.description || "");
    const thumbnailUrl =
      body.thumbnailUrl || `https://picsum.photos/seed/${slug}/640/400`;
    const demoUrl = body.demoUrl ? String(body.demoUrl) : null;
    const featuresJson = JSON.stringify(body.features ?? []);
    const tagsJson = JSON.stringify(body.tags ?? []);

    const overridePayload = {
      id: String(body.id),
      title,
      slug,
      description,
      regularPrice,
      extendedPrice,
      salePriceRegular,
      isFree,
      thumbnailUrl,
      demoUrl: demoUrl || undefined,
      features: body.features as string[] | undefined,
      tags: body.tags as string[] | undefined,
      attributes: body.attributes as { label: string; value: string }[] | undefined,
      categorySlug: body.categorySlug as string | undefined,
      mainFileUrl: body.mainFileUrl as string | undefined,
      galleryUrls: body.galleryUrls as string[] | undefined,
    };

    try {
      await saveOverride(String(body.id), overridePayload);
      await saveOverride(slug, { ...overridePayload, id: slug });
    } catch (e) {
      console.error("override save:", e);
    }

    // Always push prices to Item by slug (even if INSERT path fails later)
    try {
      await query(
        `UPDATE "Item" SET "regularPrice" = $1, "extendedPrice" = $2, "salePriceRegular" = $3, "updatedAt" = NOW() WHERE "slug" = $4`,
        [regularPrice, extendedPrice, salePriceRegular, slug]
      );
    } catch (e) {
      console.error("price update:", e);
    }

    const categoryId = await ensureCategory(String(body.categorySlug || "javascript"));
    const authorId = await ensureAdminUser();

    const row = await queryOne<{ id: string; slug: string }>(
      `
      INSERT INTO "Item" (
        "id", "title", "slug", "description", "features", "tags",
        "regularPrice", "extendedPrice", "salePriceRegular",
        "thumbnailUrl", "demoUrl", "status", "isFeatured",
        "authorId", "categoryId", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, $1, $2, $3, $4::jsonb, $5::jsonb,
        $6, $7, $8,
        $9, $10, 'APPROVED', false,
        $11, $12, NOW(), NOW()
      )
      ON CONFLICT ("slug") DO UPDATE SET
        "title" = EXCLUDED."title",
        "description" = EXCLUDED."description",
        "features" = EXCLUDED."features",
        "tags" = EXCLUDED."tags",
        "regularPrice" = EXCLUDED."regularPrice",
        "extendedPrice" = EXCLUDED."extendedPrice",
        "salePriceRegular" = EXCLUDED."salePriceRegular",
        "thumbnailUrl" = EXCLUDED."thumbnailUrl",
        "demoUrl" = EXCLUDED."demoUrl",
        "updatedAt" = NOW()
      RETURNING id, slug
      `,
      [
        title,
        slug,
        description,
        featuresJson,
        tagsJson,
        regularPrice,
        extendedPrice,
        salePriceRegular,
        thumbnailUrl,
        demoUrl,
        authorId,
        categoryId,
      ]
    );

    return NextResponse.json({
      ok: true,
      permanent: true,
      item: {
        id: row?.id || body.id,
        slug: row?.slug || slug,
        title,
        regularPrice,
        extendedPrice,
        isFree,
      },
      message: "Product saved to Postgres",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    console.error("Product PUT failed:", message);
    return NextResponse.json(
      {
        ok: false,
        permanent: false,
        error: message,
        message: "Postgres save failed: " + message,
      },
      { status: 500 }
    );
  }
}
