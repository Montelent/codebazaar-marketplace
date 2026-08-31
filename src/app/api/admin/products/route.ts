import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MOCK_ITEMS } from "@/lib/mock-data";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await prisma.item.findMany({
      orderBy: { updatedAt: "desc" },
      include: { category: true, author: { select: { username: true } } },
      take: 200,
    });
    if (items.length === 0) {
      return NextResponse.json({ source: "mock", items: MOCK_ITEMS });
    }
    return NextResponse.json({ source: "db", items });
  } catch {
    return NextResponse.json({ source: "mock", items: MOCK_ITEMS });
  }
}

const productSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  regularPrice: z.number().positive(),
  extendedPrice: z.number().positive(),
  categorySlug: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    let category = await prisma.category.findFirst({
      where: { slug: parsed.data.categorySlug ?? "javascript" },
    });
    if (!category) {
      category = await prisma.category.create({
        data: {
          slug: parsed.data.categorySlug ?? "javascript",
          name: "JavaScript",
        },
      });
    }

    let author = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!author) {
      author = await prisma.user.create({
        data: {
          email: process.env.ADMIN_EMAIL ?? "admin@codebazaar.com",
          username: "codebazaar",
          name: "CodeBazaar",
          role: "ADMIN",
        },
      });
    }

    const item = await prisma.item.create({
      data: {
        title: parsed.data.title,
        slug: parsed.data.slug,
        description: parsed.data.description,
        features: [],
        tags: [],
        compatibleWith: [],
        filesIncluded: [],
        compatibleBrowsers: [],
        galleryUrls: [],
        regularPrice: parsed.data.regularPrice,
        extendedPrice: parsed.data.extendedPrice,
        thumbnailUrl:
          parsed.data.thumbnailUrl ??
          `https://picsum.photos/seed/${parsed.data.slug}/640/400`,
        status: parsed.data.status ?? "APPROVED",
        categoryId: category.id,
        authorId: author.id,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Database error";
    return NextResponse.json(
      {
        error: message,
        hint: "Run prisma db push and ensure DATABASE_URL is set. Until then, catalog uses mock data.",
      },
      { status: 503 }
    );
  }
}
