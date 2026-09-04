import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { getSetting, setSettings } from "@/lib/settings";
import {
  DEFAULT_ATTRS_BY_CATEGORY,
  mergeCategoryAttrs,
  type AttrMap,
  type AttrsByCategory,
} from "@/lib/category-attributes";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

const DEFAULT_TAGS = [
  "react", "nextjs", "wordpress", "php", "laravel", "typescript", "admin", "dashboard", "ecommerce",
];

const DEFAULT_BLOG_CATEGORIES = [
  { name: "News", slug: "news" },
  { name: "Tutorials", slug: "tutorials" },
  { name: "Product updates", slug: "product-updates" },
  { name: "Tips", slug: "tips" },
];

export async function GET(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const categorySlug = url.searchParams.get("category") || "";

  const tags = (await getSetting("taxonomy.tags")) as string[] | undefined;
  const byCat = (await getSetting("taxonomy.attributesByCategory")) as
    | AttrsByCategory
    | undefined;
  const blogCats = (await getSetting("blog.categories")) as
    | { name: string; slug: string }[]
    | undefined;

  const catMap: AttrsByCategory = {
    ...DEFAULT_ATTRS_BY_CATEGORY,
    ...(byCat && typeof byCat === "object" ? byCat : {}),
  };

  let attributes: AttrMap = {
    "Compatible Browsers": ["Chrome", "Firefox", "Safari", "Edge"],
  };
  if (categorySlug) {
    attributes = mergeCategoryAttrs(byCat, categorySlug);
  }

  return NextResponse.json({
    tags: Array.isArray(tags) && tags.length ? tags : DEFAULT_TAGS,
    attributes,
    attributesByCategory: catMap,
    defaultAttributesByCategory: DEFAULT_ATTRS_BY_CATEGORY,
    blogCategories:
      Array.isArray(blogCats) && blogCats.length ? blogCats : DEFAULT_BLOG_CATEGORIES,
  });
}

export async function PUT(req: Request) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const payload: Record<string, unknown> = {};
    if (body.tags) payload["taxonomy.tags"] = body.tags;
    if (body.attributes) payload["taxonomy.attributes"] = body.attributes;
    if (body.attributesByCategory)
      payload["taxonomy.attributesByCategory"] = body.attributesByCategory;
    if (body.blogCategories) payload["blog.categories"] = body.blogCategories;

    // Partial update: one category's attribute map
    if (body.categorySlug && body.categoryAttributes) {
      const existing =
        ((await getSetting("taxonomy.attributesByCategory")) as AttrsByCategory) ||
        {};
      const next = {
        ...DEFAULT_ATTRS_BY_CATEGORY,
        ...existing,
        [body.categorySlug]: body.categoryAttributes as AttrMap,
      };
      payload["taxonomy.attributesByCategory"] = next;
    }

    await setSettings(payload);
    return NextResponse.json({ ok: true, permanent: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "DB error" },
      { status: 500 }
    );
  }
}
