import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

async function ensureSeeded() {
  const count = await queryOne<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM "Category"`
  );
  if (Number(count?.n || 0) > 0) return;
  for (const c of DEFAULT_CATEGORIES) {
    await query(
      `
      INSERT INTO "Category" ("id", "name", "slug", "description")
      VALUES (gen_random_uuid()::text, $1, $2, $3)
      ON CONFLICT ("slug") DO NOTHING
      `,
      [c.name, c.slug, c.description]
    );
  }
}

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureSeeded();
    const { rows } = await query(
      `SELECT id, name, slug, description FROM "Category" ORDER BY name ASC`
    );
    // If only a couple exist, merge defaults missing by slug
    if (rows.length < DEFAULT_CATEGORIES.length) {
      for (const c of DEFAULT_CATEGORIES) {
        await query(
          `
          INSERT INTO "Category" ("id", "name", "slug", "description")
          VALUES (gen_random_uuid()::text, $1, $2, $3)
          ON CONFLICT ("slug") DO NOTHING
          `,
          [c.name, c.slug, c.description]
        );
      }
      const again = await query(
        `SELECT id, name, slug, description FROM "Category" ORDER BY name ASC`
      );
      return NextResponse.json({ categories: again.rows });
    }
    return NextResponse.json({ categories: rows });
  } catch (e) {
    return NextResponse.json({
      categories: DEFAULT_CATEGORIES,
      error: e instanceof Error ? e.message : "DB error",
    });
  }
}

export async function POST(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const slug = String(body.slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!name || !slug)
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    const row = await queryOne(
      `
      INSERT INTO "Category" ("id", "name", "slug", "description")
      VALUES (gen_random_uuid()::text, $1, $2, $3)
      ON CONFLICT ("slug") DO UPDATE SET
        "name" = EXCLUDED."name",
        "description" = EXCLUDED."description"
      RETURNING *
      `,
      [name, slug, body.description || null]
    );
    return NextResponse.json({ ok: true, category: row }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    if (!slug)
      return NextResponse.json({ error: "slug required" }, { status: 400 });
    await query(`DELETE FROM "Category" WHERE slug = $1`, [slug]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error" },
      { status: 500 }
    );
  }
}
