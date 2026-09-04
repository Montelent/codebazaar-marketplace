import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { setSettings } from "@/lib/settings";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

async function ensureBlogColumns() {
  try {
    await query(`ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "excerpt" text`);
    await query(`ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "seoTitle" text`);
    await query(`ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "seoDescription" text`);
    await query(`ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "seoKeywords" text`);
    await query(`ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "categorySlug" text`);
    await query(`ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "coverImageUrl" text`);
  } catch {
    /* ignore */
  }
}

export async function GET(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureBlogColumns();
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (id) {
      const row = await queryOne(`SELECT * FROM "BlogPost" WHERE id = $1 LIMIT 1`, [id]);
      return NextResponse.json({ post: row });
    }
    const { rows } = await query(`SELECT * FROM "BlogPost" ORDER BY "updatedAt" DESC LIMIT 100`);
    return NextResponse.json({ posts: rows });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  try {
    await ensureBlogColumns();
    const { rows } = await query(
      `INSERT INTO "BlogPost" (
        "id", "title", "slug", "content", "status",
        "excerpt", "seoTitle", "seoDescription", "seoKeywords",
        "categorySlug", "coverImageUrl", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
      ) RETURNING *`,
      [
        body.title, body.slug, body.content || "", status,
        body.excerpt || null, body.seoTitle || null, body.seoDescription || null,
        body.seoKeywords || null, body.categorySlug || null, body.coverImageUrl || null,
      ]
    );
    return NextResponse.json({ post: rows[0] }, { status: 201 });
  } catch (e) {
    try {
      const { rows } = await query(
        `INSERT INTO "BlogPost" ("id", "title", "slug", "content", "status", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
        [body.title, body.slug, body.content || "", status]
      );
      if (rows[0]?.id) {
        await setSettings({
          [`blog.meta.${rows[0].id}`]: {
            excerpt: body.excerpt, seoTitle: body.seoTitle, seoDescription: body.seoDescription,
            seoKeywords: body.seoKeywords, categorySlug: body.categorySlug, coverImageUrl: body.coverImageUrl,
          },
        }).catch(() => {});
      }
      return NextResponse.json({ post: rows[0] }, { status: 201 });
    } catch (e2) {
      return NextResponse.json(
        { error: e2 instanceof Error ? e2.message : "DB error" },
        { status: 500 }
      );
    }
  }
}

export async function PUT(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
  try {
    await ensureBlogColumns();
    const { rows } = await query(
      `UPDATE "BlogPost" SET
        "title"=$1, "slug"=$2, "content"=$3, "status"=$4,
        "excerpt"=$5, "seoTitle"=$6, "seoDescription"=$7, "seoKeywords"=$8,
        "categorySlug"=$9, "coverImageUrl"=$10, "updatedAt"=NOW()
       WHERE "id"=$11 RETURNING *`,
      [
        body.title, body.slug, body.content || "", status,
        body.excerpt || null, body.seoTitle || null, body.seoDescription || null,
        body.seoKeywords || null, body.categorySlug || null, body.coverImageUrl || null,
        body.id,
      ]
    );
    return NextResponse.json({ ok: true, post: rows[0] });
  } catch (e) {
    try {
      const { rows } = await query(
        `UPDATE "BlogPost" SET "title"=$1, "slug"=$2, "content"=$3, "status"=$4, "updatedAt"=NOW()
         WHERE "id"=$5 RETURNING *`,
        [body.title, body.slug, body.content || "", status, body.id]
      );
      await setSettings({
        [`blog.meta.${body.id}`]: {
          excerpt: body.excerpt, seoTitle: body.seoTitle, seoDescription: body.seoDescription,
          seoKeywords: body.seoKeywords, categorySlug: body.categorySlug, coverImageUrl: body.coverImageUrl,
        },
      }).catch(() => {});
      return NextResponse.json({ ok: true, post: rows[0] });
    } catch (e2) {
      return NextResponse.json(
        { error: e2 instanceof Error ? e2.message : "DB error" },
        { status: 500 }
      );
    }
  }
}
