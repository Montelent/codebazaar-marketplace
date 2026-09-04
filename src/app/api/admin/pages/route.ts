import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query, queryOne } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (id) {
      const row = await queryOne(`SELECT * FROM "CmsPage" WHERE id = $1 LIMIT 1`, [id]);
      return NextResponse.json({ page: row });
    }
    const { rows } = await query(
      `SELECT * FROM "CmsPage" ORDER BY "updatedAt" DESC LIMIT 100`
    );
    return NextResponse.json({ pages: rows });
  } catch {
    return NextResponse.json({ pages: [], note: "CmsPage table optional" });
  }
}

export async function POST(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const { rows } = await query(
      `
      INSERT INTO "CmsPage" ("id", "title", "slug", "content", "status", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW())
      RETURNING *
      `,
      [body.title, body.slug, body.content || "", status]
    );
    return NextResponse.json({ page: rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    if (!body.id)
      return NextResponse.json({ error: "id required" }, { status: 400 });
    const status = body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
    const { rows } = await query(
      `
      UPDATE "CmsPage"
      SET "title" = $1, "slug" = $2, "content" = $3, "status" = $4, "updatedAt" = NOW()
      WHERE "id" = $5
      RETURNING *
      `,
      [body.title, body.slug, body.content || "", status, body.id]
    );
    return NextResponse.json({ ok: true, page: rows[0] });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error" },
      { status: 500 }
    );
  }
}
