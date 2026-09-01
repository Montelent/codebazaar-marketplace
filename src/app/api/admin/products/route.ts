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
  const features = data.features ?? [];
  const tags = data.tags ?? [];
  const requirements = Array.isArray(data.requirements)
    ? data.requirements
    : typeof data.requirements === "string"
      ? data.requirements.split("\n").map((s) => s.trim()).filter(Boolean)
      : [];

  const overrideId = data.slug;
  try {
    await saveOverride(overrideId, {
      id: overrideId,
      title: data.title,
      slug: data.slug,
      description: data.description,
      regularPrice: data.regularPrice,
      extendedPrice: data.extendedPrice,
      salePriceRegular: data.salePriceRegular ?? null,
      isFree: data.isFree || data.regularPrice === 0,
      thumbnailUrl: data.thumbnailUrl,
      demoUrl: data.demoUrl,
      features,
      licenseFeatures: data.licenseFeatures,
      requirements,
      tags,
      attributes: data.attributes,
      changelog: data.changelog,
      categorySlug: data.categorySlug,
    });
  } catch (e) {
    console.error("saveOverride", e);
  }

  try {
    let category = await prisma.category.findFirst({
      where: { slug: data.categorySlug ?? "javascript" },
    });
    if (!category) {
      category = await prisma.category.create({
        data: {
          slug: data.categorySlug ?? "javascript",
          name: (data.categorySlug ?? "javascript")
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
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
        title: data.title,
        slug: data.slug,
        description: data.description || data.title,
        features,
        tags,
        regularPrice: data.regularPrice,
        extendedPrice: data.extendedPrice,
        salePriceRegular: data.salePriceRegular ?? null,
        thumbnailUrl:
          data.thumbnailUrl || `https://picsum.photos/seed/${data.slug}/640/400`,
        demoUrl: data.demoUrl || null,
        status: data.status ?? "APPROVED",
        authorId: author.id,
        categoryId: category.id,
      },
    });

    // Also key override by DB id
    try {
      await saveOverride(item.id, { id: item.id, slug: item.slug, isFree: data.isFree || data.regularPrice === 0, regularPrice: data.regularPrice, extendedPrice: data.extendedPrice, title: data.title });
    } catch { /* ignore */ }

    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "DB error";
    return NextResponse.json(
      {
        ok: true,
        simulated: true,
        override: true,
        message: "Product override saved (Item table may need prisma db push)",
        error: message,
        item: { id: overrideId, title: data.title, slug: data.slug },
      },
      { status: 200 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const isFree = Boolean(body.isFree) || Number(body.regularPrice) === 0;
  const overridePayload = {
    id: String(body.id),
    title: body.title,
    slug: body.slug,
    description: body.description,
    regularPrice: isFree ? 0 : Number(body.regularPrice ?? 0),
    extendedPrice: isFree ? 0 : Number(body.extendedPrice ?? 0),
    salePriceRegular: isFree
      ? null
      : body.salePriceRegular != null
        ? Number(body.salePriceRegular)
        : null,
    isFree,
    thumbnailUrl: body.thumbnailUrl,
    demoUrl: body.demoUrl,
    features: body.features,
    licenseFeatures: body.licenseFeatures,
    requirements: body.requirements,
    tags: body.tags,
    attributes: Array.isArray(body.attributes)
      ? body.attributes.filter(
          (a: { label: string }) =>
            !["Last Update", "Created", "Published", "Updated"].includes(a.label)
        )
      : undefined,
    changelog: body.changelog,
    categorySlug: body.categorySlug,
  };

  try {
    await saveOverride(String(body.id), overridePayload);
    if (body.slug) await saveOverride(String(body.slug), { ...overridePayload, id: String(body.slug) });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Could not save product",
        hint: "Run prisma db push so SiteSetting can store product overrides",
      },
      { status: 503 }
    );
  }

  try {
    const item = await prisma.item.update({
      where: { id: String(body.id) },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description || "",
        regularPrice: overridePayload.regularPrice,
        extendedPrice: overridePayload.extendedPrice,
        salePriceRegular: overridePayload.salePriceRegular,
        thumbnailUrl: body.thumbnailUrl || undefined,
        demoUrl: body.demoUrl || undefined,
        features: body.features ?? [],
        tags: body.tags ?? [],
        status:
          body.status === "APPROVED"
            ? "APPROVED"
            : body.status === "REJECTED"
              ? "REJECTED"
              : "PENDING",
      },
    });
    return NextResponse.json({ item, override: true });
  } catch {
    return NextResponse.json({
      ok: true,
      override: true,
      item: { id: body.id, ...overridePayload },
      message: "Saved product override — storefront will show Free / updated fields",
    });
  }
}
