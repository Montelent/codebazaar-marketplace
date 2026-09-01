import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { z } from "zod";
import { saveOverride } from "@/lib/product-store";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const items = await prisma.item.findMany({
      orderBy: { updatedAt: "desc" },
      include: { category: true, author: { select: { username: true } } },
      take: 200,
    });
    if (items.length === 0) return NextResponse.json({ source: "mock", items: MOCK_ITEMS });
    return NextResponse.json({ source: "db", items });
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
  licenseFeatures: z.array(z.string()).optional(),
  requirements: z.union([z.array(z.string()), z.string()]).optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  changelog: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = { ...parsed.data };
  if (data.isFree) {
    data.regularPrice = 0;
    data.extendedPrice = 0;
  }
  const putBody = { id: data.slug, ...data };
  const fakeReq = { json: async () => putBody } as Request;
  return PUT(fakeReq);
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const isFree = Boolean(body.isFree) || Number(body.regularPrice) === 0;
  const regularPrice = isFree ? 0 : Number(body.regularPrice ?? 0);
  const extendedPrice = isFree ? 0 : Number(body.extendedPrice ?? 0);
  const salePriceRegular =
    isFree ? null : body.salePriceRegular != null ? Number(body.salePriceRegular) : null;
  const slug = String(body.slug || body.id);
  const title = String(body.title || "Untitled");
  const description = String(body.description || "");
  const thumbnailUrl = body.thumbnailUrl || `https://picsum.photos/seed/${slug}/640/400`;
  const demoUrl = body.demoUrl ? String(body.demoUrl) : null;
  const featuresJson = JSON.stringify(body.features ?? []);
  const tagsJson = JSON.stringify(body.tags ?? []);

  try {
    await saveOverride(String(body.id), {
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
      features: body.features,
      tags: body.tags,
      attributes: body.attributes,
      categorySlug: body.categorySlug,
    });
  } catch {
    /* optional */
  }

  try {
    await prisma.$executeRawUnsafe(`
      INSERT INTO "User" ("id", "email", "username", "name", "role", "createdAt", "updatedAt")
      SELECT gen_random_uuid()::text, '${(process.env.ADMIN_EMAIL ?? "admin@codebazaar.com").replace(/'/g, "")}', 'codebazaar', 'CodeBazaar', 'ADMIN', NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE "role" = 'ADMIN')
    `);

    const catSlug = String(body.categorySlug || "javascript").replace(/'/g, "");
    await prisma.$executeRawUnsafe(`
      INSERT INTO "Category" ("id", "name", "slug")
      SELECT gen_random_uuid()::text, '${catSlug}', '${catSlug}'
      WHERE NOT EXISTS (SELECT 1 FROM "Category" WHERE "slug" = '${catSlug}')
    `);

    const authors = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM "User" WHERE role = 'ADMIN' LIMIT 1`
    );
    const cats = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      `SELECT id FROM "Category" WHERE slug = $1 LIMIT 1`,
      catSlug
    );
    const authorId = authors[0]?.id;
    const categoryId = cats[0]?.id;
    if (!authorId || !categoryId) {
      throw new Error("Missing admin user or category — check DATABASE_URL on Vercel matches Neon");
    }

    const rows = await prisma.$queryRawUnsafe<Array<{ id: string; slug: string }>>(
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
      categoryId
    );

    return NextResponse.json({
      ok: true,
      permanent: true,
      item: {
        id: rows[0]?.id || body.id,
        slug: rows[0]?.slug || slug,
        title,
        regularPrice,
        isFree,
      },
      message: "Product saved permanently to database",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    console.error("Product save DB error:", message);
    return NextResponse.json({
      ok: true,
      permanent: false,
      clientFallback: true,
      item: { id: body.id, slug, title, regularPrice, isFree },
      error: message,
      message:
        "Could not write to database yet. Changes kept in this browser. Error: " + message,
    });
  }
}
