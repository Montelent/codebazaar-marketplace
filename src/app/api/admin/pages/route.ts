import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const pages = await prisma.cmsPage.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ pages });
  } catch {
    return NextResponse.json({ pages: [] });
  }
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  try {
    const page = await prisma.cmsPage.create({
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        status: body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        showInFooter: Boolean(body.showInFooter),
      },
    });
    return NextResponse.json({ page }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error", hint: "Run npx prisma db push for CmsPage table" },
      { status: 503 }
    );
  }
}
