import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { rows } = await query(`SELECT * FROM "CmsPage" ORDER BY "updatedAt" DESC LIMIT 100`);
    return NextResponse.json({ pages: rows });
  } catch {
    return NextResponse.json({ pages: [], note: "CmsPage table optional" });
  }
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { rows } = await query(
      `
      INSERT INTO "CmsPage" ("id", "title", "slug", "content", "status", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3, 'DRAFT', NOW(), NOW())
      RETURNING *
      `,
      [body.title, body.slug, body.content || ""]
    );
    return NextResponse.json({ page: rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error" },
      { status: 500 }
    );
  }
}
