import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { rows } = await query(
      `SELECT id, name, slug, description FROM "Category" ORDER BY name ASC`
    );
    return NextResponse.json({ categories: rows, source: "db" });
  } catch (e) {
    return NextResponse.json({
      categories: [],
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
    let slug = String(body.slug || name)
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
    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });
    await query(`DELETE FROM "Category" WHERE slug = $1`, [slug]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error" },
      { status: 500 }
    );
  }
}
