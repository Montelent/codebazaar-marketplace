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
    const posts = await prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, take: 100 });
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  try {
    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt || null,
        status: body.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        publishedAt: body.status === "PUBLISHED" ? new Date() : null,
      },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error", hint: "Run npx prisma db push for BlogPost table" },
      { status: 503 }
    );
  }
}
